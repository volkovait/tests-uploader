-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('draft', 'parsing', 'published', 'failed_parse');

-- CreateTable
CREATE TABLE "Test" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" "TestStatus" NOT NULL DEFAULT 'draft',
    "sourceFilename" TEXT,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "parsedAt" TIMESTAMP(3),

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestSourceFile" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,

    CONSTRAINT "TestSourceFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestQuestion" (
    "id" TEXT NOT NULL,
    "testId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "clientKey" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "hint" JSONB,

    CONSTRAINT "TestQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestQuestionChoice" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TestQuestionChoice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TestSourceFile_testId_idx" ON "TestSourceFile"("testId");

-- CreateIndex
CREATE INDEX "TestQuestion_testId_idx" ON "TestQuestion"("testId");

-- CreateIndex
CREATE UNIQUE INDEX "TestQuestion_testId_clientKey_key" ON "TestQuestion"("testId", "clientKey");

-- CreateIndex
CREATE INDEX "TestQuestionChoice_questionId_idx" ON "TestQuestionChoice"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "TestQuestionChoice_questionId_key_key" ON "TestQuestionChoice"("questionId", "key");

-- AddForeignKey
ALTER TABLE "TestSourceFile" ADD CONSTRAINT "TestSourceFile_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TestQuestion" ADD CONSTRAINT "TestQuestion_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TestQuestionChoice" ADD CONSTRAINT "TestQuestionChoice_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "TestQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
