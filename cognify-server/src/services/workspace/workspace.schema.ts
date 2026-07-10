import z from "zod";
import { describe } from "zod/v4/core";

export const createWorkspaceSchema = z.object({
    name: z.string().min(1),
    description: z.string().optional(),
});

export type CreateWorkspaceInput = z.infer<
typeof createWorkspaceSchema
>;