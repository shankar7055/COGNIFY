import { slackService } from "../integrations/slack.service";
import { sheetsService } from "../integrations/sheets.service";
import { notionService } from "../integrations/notion.service";
import { autonomousAgent } from "../ai/agents/autonomous.agent";
import { logger } from "../../config/logger";

export interface WorkflowNode {
  id: string;
  name: string;
  type: "trigger" | "ai" | "action";
  config: {
    agentType?: "code" | "research" | "business" | "analytics" | "general";
    prompt?: string;
    actionType?: "slack" | "notion" | "sheets";
    channel?: string;
    message?: string;
    databaseId?: string;
    title?: string;
    content?: string;
    spreadsheetId?: string;
    range?: string;
    values?: any[];
    [key: string]: any;
  };
}

/** Expand variables like {{input}} inside string configurations */
function expandVariables(text: string, inputContext: string): string {
  if (!text) return "";
  return text.replace(/\{\{input\}\}/g, inputContext).replace(/\{\{context\}\}/g, inputContext);
}

export const stepExecutor = {
  async executeStep(
    node: WorkflowNode,
    inputContext: string,
    userId: string,
    workspaceId: string
  ): Promise<string> {
    logger.info(`Executing step node ${node.id} (${node.name}) of type ${node.type}`);

    switch (node.type) {
      case "trigger":
        // Trigger nodes just pass forward the initial trigger input
        return inputContext;

      case "ai": {
        const { prompt, agentType } = node.config;
        const expandedPrompt = expandVariables(prompt || "{{input}}", inputContext);

        logger.info(`Running AI agent step: ${agentType || "autonomous"} with prompt: ${expandedPrompt.slice(0, 100)}...`);

        const result = await autonomousAgent.run(expandedPrompt, userId, workspaceId);
        return result.response;
      }

      case "action": {
        const { actionType } = node.config;

        switch (actionType) {
          case "slack": {
            const channel = node.config.channel || "general";
            const messageTemplate = node.config.message || "Workflow notification: {{input}}";
            const expandedMessage = expandVariables(messageTemplate, inputContext);

            logger.info(`Sending Slack message to ${channel}`);
            await slackService.sendMessage(channel, expandedMessage);
            return `Message sent to Slack channel ${channel}: "${expandedMessage.slice(0, 50)}..."`;
          }

          case "notion": {
            const databaseId = node.config.databaseId || "";
            const titleTemplate = node.config.title || "New Workflow Task";
            const contentTemplate = node.config.content || "Content: {{input}}";

            const expandedTitle = expandVariables(titleTemplate, inputContext);
            const expandedContent = expandVariables(contentTemplate, inputContext);

            logger.info(`Creating page in Notion database ${databaseId}`);
            const pageId = await notionService.createPage(databaseId, expandedTitle, expandedContent);
            return `Created Notion page with ID ${pageId} and title: "${expandedTitle}"`;
          }

          case "sheets": {
            const spreadsheetId = node.config.spreadsheetId || "";
            const range = node.config.range || "A1";
            const valuesTemplate = node.config.values || ["{{input}}"];

            const expandedValues = valuesTemplate.map((v) => {
              if (typeof v === "string") return expandVariables(v, inputContext);
              return v;
            });

            logger.info(`Appending values to Google Sheet ${spreadsheetId}`);
            await sheetsService.appendRows(spreadsheetId, range, [expandedValues]);
            return `Appended row of values to Google Sheet range ${range}: ${JSON.stringify(expandedValues)}`;
          }

          default:
            throw new Error(`Unsupported action type: ${actionType}`);
        }
      }

      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  },
};
