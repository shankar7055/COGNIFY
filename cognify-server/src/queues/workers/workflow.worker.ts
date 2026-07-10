import { Worker } from "bullmq";
import { redis } from "../../config/redis";
import { prisma } from "../../config/db";
import { stepExecutor, WorkflowNode } from "../../services/automation/stepExecutor.service";
import { logger } from "../../config/logger";

const worker = new Worker(
  "workflow-execution",
  async (job) => {
    const { workflowId, runId, inputVariables, userId, workspaceId } = job.data;
    logger.info(`Starting background workflow run. Run ID: ${runId}`);

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const definition = workflow.definition as {
      nodes?: WorkflowNode[];
      edges?: { source: string; target: string }[];
    };

    const nodes = definition.nodes || [];
    const edges = definition.edges || [];

    const runLogs: any[] = [];
    const start = Date.now();

    try {
      // Find the start trigger node
      const triggerNode = nodes.find((n) => n.type === "trigger");
      if (!triggerNode) {
        throw new Error("No trigger node found in workflow definition");
      }

      runLogs.push({
        stepName: triggerNode.name,
        status: "SUCCESS",
        output: `Workflow triggered via ${job.data.trigger}`,
      });

      let currentNode = triggerNode;
      // Get initial input text
      let currentInput =
        inputVariables.message ||
        inputVariables.webhookPayload?.message ||
        "Triggered workflow execution context";

      // Traverse edges sequentially
      while (true) {
        const edge = edges.find((e) => e.source === currentNode.id);
        if (!edge) break; // reached end of workflow chain

        const nextNode = nodes.find((n) => n.id === edge.target);
        if (!nextNode) {
          logger.warn(`Edge reference target node ${edge.target} was not found`);
          break;
        }

        try {
          const stepOutput = await stepExecutor.executeStep(
            nextNode,
            currentInput,
            userId,
            workspaceId
          );

          runLogs.push({
            stepName: nextNode.name,
            status: "SUCCESS",
            output: stepOutput,
          });

          currentNode = nextNode;
          currentInput = stepOutput; // pass output to next step
        } catch (stepErr: any) {
          runLogs.push({
            stepName: nextNode.name,
            status: "FAILED",
            error: stepErr.message || "Execution error",
          });
          throw stepErr; // trigger outer catch
        }
      }

      const latency = Date.now() - start;
      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: "SUCCESS",
          latency_ms: latency,
          logs: runLogs as any,
        },
      });

      logger.info(`Workflow run ${runId} completed successfully`);
    } catch (err: any) {
      const latency = Date.now() - start;
      await prisma.workflowRun.update({
        where: { id: runId },
        data: {
          status: "FAILED",
          latency_ms: latency,
          logs: runLogs as any,
        },
      });

      logger.error(`Workflow run ${runId} failed: ${err.message}`);
      throw err;
    }
  },
  {
    connection: redis,
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  logger.info(`Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  logger.error(`Job ${job?.id} failed with error: ${err.message}`);
});

export default worker;
