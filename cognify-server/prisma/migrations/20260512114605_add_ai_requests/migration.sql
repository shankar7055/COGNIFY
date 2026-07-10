-- CreateTable
CREATE TABLE "AIRequest" (
    "id" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "latency_ms" INTEGER NOT NULL,
    "tokens_used" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "AIRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AIRequest" ADD CONSTRAINT "AIRequest_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRequest" ADD CONSTRAINT "AIRequest_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
