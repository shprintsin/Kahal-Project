-- AlterTable
ALTER TABLE "pages" ADD COLUMN     "content_i18n" JSONB DEFAULT '{}',
ADD COLUMN     "title_i18n" JSONB DEFAULT '{}';

-- AlterTable
ALTER TABLE "posts" ADD COLUMN     "content_i18n" JSONB DEFAULT '{}',
ADD COLUMN     "excerpt_i18n" JSONB DEFAULT '{}',
ADD COLUMN     "title_i18n" JSONB DEFAULT '{}';
