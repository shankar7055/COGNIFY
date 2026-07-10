import { Queue } from "bullmq";
import { redis } from "../config/redis";

export const aiQueue = new Queue(
    "ai-processing",
    {
        connection: redis,
    }
);