import axios from "axios";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

const NOTION_API = "https://api.notion.com/v1";
const NOTION_VERSION = "2022-06-28";

function notionHeaders() {
  if (!env.NOTION_API_KEY) throw new Error("NOTION_API_KEY is not configured");

  return {
    Authorization:  `Bearer ${env.NOTION_API_KEY}`,
    "Notion-Version": NOTION_VERSION,
    "Content-Type": "application/json",
  };
}

export const notionService = {
  /** Create a new page inside a Notion database */
  async createPage(
    databaseId: string,
    title: string,
    content: string
  ): Promise<string> {
    const res = await axios.post(
      `${NOTION_API}/pages`,
      {
        parent: { database_id: databaseId },
        properties: {
          title: {
            title: [{ text: { content: title } }],
          },
        },
        children: [
          {
            object: "block",
            type:   "paragraph",
            paragraph: {
              rich_text: [{ text: { content: content.slice(0, 2000) } }],
            },
          },
        ],
      },
      { headers: notionHeaders() }
    );

    logger.info(`Notion page created: ${res.data.id}`);
    return res.data.id;
  },

  /** Query a Notion database and return pages */
  async queryDatabase(
    databaseId: string,
    filter?: object
  ): Promise<{ id: string; title: string; url: string }[]> {
    const body: any = {};
    if (filter) body.filter = filter;

    const res = await axios.post(
      `${NOTION_API}/databases/${databaseId}/query`,
      body,
      { headers: notionHeaders() }
    );

    return res.data.results.map((page: any) => ({
      id:    page.id,
      title: page.properties?.title?.title?.[0]?.text?.content ?? "Untitled",
      url:   page.url,
    }));
  },

  /** Get a page's content as plain text */
  async getPageText(pageId: string): Promise<string> {
    const res = await axios.get(
      `${NOTION_API}/blocks/${pageId}/children`,
      { headers: notionHeaders() }
    );

    const blocks = res.data.results as any[];

    return blocks
      .map((b) => {
        const type = b.type;
        const texts = b[type]?.rich_text ?? [];
        return texts.map((t: any) => t.plain_text).join("");
      })
      .filter(Boolean)
      .join("\n");
  },
};
