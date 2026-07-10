import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { prisma } from "../config/db";


import {
    generateApiKey,
    hashApiKey,
} from "../utils/crypto";
import { hash } from "node:crypto";
import { id } from "zod/v4/locales";
import { apiKeyMiddleware } from "../middleware/apiKey.middleware";

const router = Router();

router.post("/generate",
    authMiddleware,
    async(req, res) => {
        try {
            const { name } = req.body;

            const rawKey = generateApiKey();

            const hashedKey = hashApiKey(rawKey);

            const apiKey = await prisma.aPIKey.create({
                data: {
                    name,
                    key_hash: hashedKey,
                    user_id: (req as any).userId,
                },
            }); 
            res.status(201).json({
                message: "Save this API key securely. You won't be able to see it again.",
                api_key: rawKey,

                metadata: {
                    id: apiKey.id,
                    name: apiKey.name,
                    created_at: apiKey.created_at,
                },
            });
        }catch(err: any) {
            res.status(500).json({
                message: err.message,
            });
        }
    }
);

router.get("/", authMiddleware, async(req, res) => {
    try {
        const keys = await prisma.aPIKey.findMany({
            where: {
                user_id: (req as any).userId,
            },
            select: {
                id: true,
                name: true,
                created_at: true,
                last_used: true,
            }
        });
        res.json(keys);
    } catch(err: any){
        res.status(500).json({
            message: err.message,
        });
    }
});
router.get(
  "/test",
  apiKeyMiddleware,
  async (req, res) => {
    res.json({
      message: "API key auth working",
      user_id: (req as any).userId,
    });
  }
);

router.delete(
  "/:id",
  authMiddleware,
  async (req, res) => {
    try {
      const id = req.params.id as string;
      const result = await prisma.aPIKey.deleteMany({
        where: {
          id,
          user_id: (req as any).userId,
        },
      });
      if (result.count === 0) {
        return res.status(404).json({ message: "API key not found or unauthorized" });
      }
      res.json({ message: "API key revoked successfully" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  }
);

export default router;