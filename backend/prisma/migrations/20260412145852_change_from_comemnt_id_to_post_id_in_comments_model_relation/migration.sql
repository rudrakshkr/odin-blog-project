/*
  Warnings:

  - You are about to drop the column `commentId` on the `Comments` table. All the data in the column will be lost.
  - Added the required column `postId` to the `Comments` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_commentId_fkey";

-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "commentId",
ADD COLUMN     "postId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
