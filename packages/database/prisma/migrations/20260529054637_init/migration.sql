-- CreateTable
CREATE TABLE "monsters" (
    "name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "source_url" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "number" INTEGER NOT NULL,

    CONSTRAINT "monsters_pkey" PRIMARY KEY ("number")
);
