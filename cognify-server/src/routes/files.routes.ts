import { Router } from "express";
import multer from "multer";
import path from "path";
import { authMiddleware } from "../middleware/auth.middleware";
import { workspaceAccess, hasWorkspaceAccess } from "../middleware/workspaceAccess.middleware";
import { prisma } from "../config/db";
import { s3Service } from "../services/storage/s3.service";
import { fileParserService } from "../services/storage/fileParser.service";
import { vectorMemoryService } from "../services/ai/vectorMemory.service";
import { embeddingService } from "../services/ai/embedding.service";
import { env } from "../config/env";
import { logger } from "../config/logger";

const router = Router();

// Store to disk first, then decide S3 vs local
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "text/csv",
      "text/plain",
      "text/markdown",
      "application/json",
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

/**
 * POST /api/files/upload
 * Uploads a file, parses its content, and stores embeddings in the workspace.
 */
router.post(
  "/upload",
  authMiddleware,
  workspaceAccess,
  upload.single("file"),
  async (req, res) => {
    try {
      const file         = req.file;
      const { workspace_id } = req.body;
      const userId       = (req as any).userId;

      if (!file)         return res.status(400).json({ message: "No file uploaded" });
      if (!workspace_id) return res.status(400).json({ message: "workspace_id is required" });

      let s3Key: string | undefined;
      let filePath = file.path;

      // Upload to S3 if configured
      if (env.AWS_S3_BUCKET && env.AWS_ACCESS_KEY_ID) {
        try {
          s3Key    = await s3Service.uploadFile(file.path, file.originalname, file.mimetype, userId);
          filePath = file.path; // s3Service cleans local file, but parse before that
        } catch (s3Err) {
          logger.warn("S3 upload failed, keeping local file", { s3Err });
        }
      }

      // Parse file content
      const parsedText = await fileParserService.parse(filePath, file.mimetype);

      // Embed parsed content chunks into workspace memory
      if (parsedText) {
        const chunks = fileParserService.chunkText(parsedText);
        for (const chunk of chunks.slice(0, 20)) { // cap at 20 chunks
          const vector = await embeddingService.generateEmbedding(chunk);
          await vectorMemoryService.addMemory(workspace_id, chunk, vector);
        }
        logger.info(`Embedded ${Math.min(chunks.length, 20)} chunks from ${file.originalname}`);
      }

      // Save file record to DB
      const savedFile = await prisma.file.create({
        data: {
          filename:     file.filename,
          original_name: file.originalname,
          mimetype:     file.mimetype,
          size:         file.size,
          path:         s3Key ? `s3://${env.AWS_S3_BUCKET}/${s3Key}` : file.path,
          s3_key:       s3Key,
          parsed_text:  parsedText.slice(0, 10000), // store first 10k chars
          workspace_id,
          user_id: userId,
        },
      });

      res.status(201).json({
        ...savedFile,
        chunks_embedded: parsedText ? Math.min(fileParserService.chunkText(parsedText).length, 20) : 0,
      });
    } catch (err: any) {
      logger.error("File upload error", { err });
      res.status(500).json({ message: err.message });
    }
  }
);

/** GET /api/files/:workspaceId — list files for a workspace */
router.get("/:workspaceId", authMiddleware, workspaceAccess, async (req, res) => {
  try {
    const files = await prisma.file.findMany({
      where: {
        workspace_id: req.params.workspaceId as string,
      },
      select: {
        id:            true,
        original_name: true,
        mimetype:      true,
        size:          true,
        s3_key:        true,
        created_at:    true,
      },
      orderBy: { created_at: "desc" },
    });

    res.json(files);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/files/download/:fileId — get presigned S3 URL */
router.get("/download/:fileId", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId as string },
    });

    if (!file) return res.status(404).json({ message: "File not found" });

    // Validate workspace permissions
    const hasAccess = await hasWorkspaceAccess(file.workspace_id, userId);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this workspace" });
    }

    if (file.s3_key && env.AWS_S3_BUCKET) {
      const url = await s3Service.getPresignedUrl(file.s3_key);
      return res.json({ url });
    }

    res.json({ path: file.path });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** DELETE /api/files/:fileId */
router.delete("/:fileId", authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).userId as string;
    const file = await prisma.file.findUnique({
      where: { id: req.params.fileId as string },
    });

    if (!file) return res.status(404).json({ message: "File not found" });

    // Validate workspace permissions
    const hasAccess = await hasWorkspaceAccess(file.workspace_id, userId);
    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied to this workspace" });
    }

    if (file.s3_key) {
      await s3Service.deleteFile(file.s3_key).catch(() => {});
    }

    await prisma.file.delete({ where: { id: file.id } });
    res.json({ message: "File deleted" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;