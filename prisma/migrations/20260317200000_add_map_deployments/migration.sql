-- CreateTable
CREATE TABLE "map_deployments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "map_id" UUID NOT NULL,
    "version" TEXT NOT NULL,
    "change_log" TEXT,
    "git_sha" TEXT,
    "cli_version" TEXT,
    "deployed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "map_deployments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "map_deployments_map_id_idx" ON "map_deployments"("map_id");

-- AddForeignKey
ALTER TABLE "map_deployments" ADD CONSTRAINT "map_deployments_map_id_fkey" FOREIGN KEY ("map_id") REFERENCES "maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;
