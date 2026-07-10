import { embeddingService  } from "./embedding.service";
import { prisma } from "../../config/db";

export const memoryService = {
    async storeMemory(
        workspaceId: string,
        content: string
    ) {
        const vector = await embeddingService.generateEmbedding(content);

        return prisma.embedding.create({
            data: {
                content,
                vector,
                workspace_id: workspaceId,
            },
        });
    },


    async getWorkspaceMemories(workspaceId: string){
        return prisma.embedding.findMany({
            where: {
                workspace_id: workspaceId,
            },
            orderBy: {
                created_at: "desc",
            },
            take: 5,
        });
    },
};