import axios from "axios";
import { env } from "../../config/env";
import { logger } from "../../config/logger";

const SLACK_API = "https://slack.com/api";

export const slackService = {
  /** Post a message to a Slack channel */
  async sendMessage(channel: string, text: string): Promise<void> {
    if (!env.SLACK_BOT_TOKEN) {
      throw new Error("SLACK_BOT_TOKEN is not configured");
    }

    const res = await axios.post(
      `${SLACK_API}/chat.postMessage`,
      { channel, text },
      {
        headers: {
          Authorization: `Bearer ${env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.data.ok) {
      throw new Error(`Slack API error: ${res.data.error}`);
    }

    logger.info(`Slack message sent to ${channel}`);
  },

  /** List channels the bot has access to */
  async listChannels(): Promise<{ id: string; name: string }[]> {
    if (!env.SLACK_BOT_TOKEN) {
      throw new Error("SLACK_BOT_TOKEN is not configured");
    }

    const res = await axios.get(`${SLACK_API}/conversations.list`, {
      headers: { Authorization: `Bearer ${env.SLACK_BOT_TOKEN}` },
      params:  { types: "public_channel,private_channel" },
    });

    if (!res.data.ok) {
      throw new Error(`Slack API error: ${res.data.error}`);
    }

    return res.data.channels.map((c: any) => ({
      id:   c.id,
      name: c.name,
    }));
  },

  /** Send a formatted AI insight to Slack */
  async sendAIInsight(
    channel: string,
    title: string,
    content: string
  ): Promise<void> {
    const text = `*${title}*\n\n${content}`;
    await this.sendMessage(channel, text);
  },
};
