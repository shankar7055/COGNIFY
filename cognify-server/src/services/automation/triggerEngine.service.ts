import { prisma } from "../../config/db";
import { workflowQueue } from "../../queues/workflowQueue";
import { logger } from "../../config/logger";

export const triggerEngine = {
  /** Trigger a workflow run by queuing it to BullMQ */
  async triggerWorkflow(
    workflowId: string,
    trigger: "MANUAL" | "WEBHOOK" | "CRON",
    inputVariables?: Record<string, any>
  ) {
    logger.info(`Triggering workflow ${workflowId} via ${trigger}`);

    const workflow = await prisma.workflow.findUnique({
      where: { id: workflowId },
    });

    if (!workflow) {
      throw new Error(`Workflow with ID ${workflowId} not found`);
    }

    // Create the workflow run tracking record in db
    const run = await prisma.workflowRun.create({
      data: {
        workflow_id: workflowId,
        status: "RUNNING",
        trigger,
        latency_ms: 0,
        logs: [],
      },
    });

    // Queue the job to BullMQ for background processing
    await workflowQueue.add(
      "run-workflow",
      {
        workflowId,
        runId: run.id,
        trigger,
        inputVariables: inputVariables || {},
        userId: workflow.user_id,
        workspaceId: workflow.workspace_id,
      },
      {
        removeOnComplete: true,
        removeOnFail: true,
      }
    );

    logger.info(`Queued workflow execution job. Run ID: ${run.id}`);
    return run;
  },
};
