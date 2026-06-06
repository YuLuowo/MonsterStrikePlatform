-- AlterTable
ALTER TABLE "Monsters" ADD COLUMN     "category" TEXT,
ADD COLUMN     "evolution" TEXT,
ADD COLUMN     "info" TEXT[],
ADD COLUMN     "obtain_method" TEXT,
ADD COLUMN     "passive" TEXT[],
ADD COLUMN     "ss" TEXT,
ADD COLUMN     "star" INTEGER,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "image_url" DROP NOT NULL,
ALTER COLUMN "source_url" DROP NOT NULL,
ALTER COLUMN "element" DROP NOT NULL;
