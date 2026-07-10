import { Worker } from "bullmq";
import { redis } from "../../config/redis";
import { resolve } from "node:dns";
import { success } from "zod";

const worker = new Worker(
    "ai-processing",

    async (job) => {
        console.log(
            "Processing AI job:",
            job.data
        );

        await new Promise((resolve) => 
        setTimeout(resolve, 2000)
    );

    return {
        success: true,
    };
    },

    {
        connection: redis,
    }
);

worker.on("completed", (job) => {
    console.log(
        `Job ${job.id} completed`
    );
});

worker.on("failed", (job, err) => {
    console.error(
        `Job ${job?.id} failed`,
        err
    );
});