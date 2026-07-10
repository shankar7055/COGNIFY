-- DropForeignKey
ALTER TABLE "AIRequest" DROP CONSTRAINT "AIRequest_workspace_id_fkey";

-- AlterTable
ALTER TABLE "AIRequest" ADD COLUMN     "agent_type" TEXT,
ADD COLUMN     "cost_usd" DOUBLE PRECISION,
ALTER COLUMN "workspace_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "File" ADD COLUMN     "parsed_text" TEXT,
ADD COLUMN     "s3_key" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "current_period_end" TIMESTAMP(3),
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_sub_id" TEXT,
ADD COLUMN     "tokens_used" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "token_limit" SET DEFAULT 10000;

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamWorkspace" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "team_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,

    CONSTRAINT "TeamWorkspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_versions" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "diff" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    CONSTRAINT "prompt_versions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamWorkspace_team_id_workspace_id_key" ON "TeamWorkspace"("team_id", "workspace_id");

-- CreateIndex
CREATE UNIQUE INDEX "prompt_versions_workspace_id_version_key" ON "prompt_versions"("workspace_id", "version");

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AIRequest" ADD CONSTRAINT "AIRequest_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamWorkspace" ADD CONSTRAINT "TeamWorkspace_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamWorkspace" ADD CONSTRAINT "TeamWorkspace_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_versions" ADD CONSTRAINT "prompt_versions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
