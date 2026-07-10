import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { slackService } from "../services/integrations/slack.service";
import { sheetsService } from "../services/integrations/sheets.service";
import { notionService } from "../services/integrations/notion.service";
import { logger } from "../config/logger";

const router = Router();

// ─── SLACK ───────────────────────────────────────────────────────────────────

/** GET /api/integrations/slack/channels */
router.get("/slack/channels", authMiddleware, async (req, res) => {
  try {
    const channels = await slackService.listChannels();
    res.json(channels);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/integrations/slack/send — { channel, text } */
router.post("/slack/send", authMiddleware, async (req, res) => {
  try {
    const { channel, text } = req.body;
    if (!channel || !text)
      return res.status(400).json({ message: "channel and text are required" });

    await slackService.sendMessage(channel, text);
    res.json({ message: "Message sent to Slack" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ─── GOOGLE SHEETS ───────────────────────────────────────────────────────────

/** GET /api/integrations/sheets/read — { spreadsheetId, range } */
router.get("/sheets/read", authMiddleware, async (req, res) => {
  try {
    const { spreadsheetId, range } = req.query as {
      spreadsheetId?: string;
      range?: string;
    };

    if (!spreadsheetId || !range)
      return res.status(400).json({ message: "spreadsheetId and range are required" });

    const rows = await sheetsService.readRange(spreadsheetId as string, range as string);
    const text = sheetsService.rowsToText(rows);

    res.json({ rows, text });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** POST /api/integrations/sheets/append — { spreadsheetId, range, values } */
router.post("/sheets/append", authMiddleware, async (req, res) => {
  try {
    const { spreadsheetId, range, values } = req.body;

    if (!spreadsheetId || !range || !values)
      return res.status(400).json({ message: "spreadsheetId, range, and values are required" });

    await sheetsService.appendRows(spreadsheetId, range, values);
    res.json({ message: "Rows appended to Google Sheet" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// ─── NOTION ──────────────────────────────────────────────────────────────────

/** POST /api/integrations/notion/pages — { databaseId, title, content } */
router.post("/notion/pages", authMiddleware, async (req, res) => {
  try {
    const { databaseId, title, content } = req.body;

    if (!databaseId || !title || !content)
      return res.status(400).json({ message: "databaseId, title, and content are required" });

    const pageId = await notionService.createPage(databaseId, title, content);
    res.status(201).json({ pageId, message: "Notion page created" });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/integrations/notion/database/:databaseId — query a database */
router.get("/notion/database/:databaseId", authMiddleware, async (req, res) => {
  try {
    const pages = await notionService.queryDatabase(req.params.databaseId as string);
    res.json(pages);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

/** GET /api/integrations/notion/page/:pageId — get page text */
router.get("/notion/page/:pageId", authMiddleware, async (req, res) => {
  try {
    const text = await notionService.getPageText(req.params.pageId as string);
    res.json({ text });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
