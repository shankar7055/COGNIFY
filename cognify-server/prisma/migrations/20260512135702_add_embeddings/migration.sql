-- CreateTable
CREATE TABLE "Embedding" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "vector" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "Embedding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Embedding" ADD CONSTRAINT "Embedding_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
