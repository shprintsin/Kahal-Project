-- AlterEnum
BEGIN;
CREATE TYPE "app_language_new" AS ENUM ('HE', 'EN');
ALTER TABLE "public"."pages" ALTER COLUMN "language" DROP DEFAULT;
ALTER TABLE "public"."posts" ALTER COLUMN "language" DROP DEFAULT;
ALTER TABLE "pages" ALTER COLUMN "language" TYPE "app_language_new" USING ("language"::text::"app_language_new");
ALTER TABLE "posts" ALTER COLUMN "language" TYPE "app_language_new" USING ("language"::text::"app_language_new");
ALTER TABLE "page_texts" ALTER COLUMN "language" TYPE "app_language_new" USING ("language"::text::"app_language_new");
ALTER TYPE "app_language" RENAME TO "app_language_old";
ALTER TYPE "app_language_new" RENAME TO "app_language";
DROP TYPE "public"."app_language_old";
ALTER TABLE "pages" ALTER COLUMN "language" SET DEFAULT 'HE';
ALTER TABLE "posts" ALTER COLUMN "language" SET DEFAULT 'HE';
COMMIT;

