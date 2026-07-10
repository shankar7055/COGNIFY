import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const workflowQueue = new Queue(
  "workflow-execution",
  {
    connection: redis,
  }
);
