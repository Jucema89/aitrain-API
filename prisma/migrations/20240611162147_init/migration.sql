-- CreateEnum
CREATE TYPE "TypeFileTrain" AS ENUM ('base', 'final');

-- CreateEnum
CREATE TYPE "StatusFileTrain" AS ENUM ('start', 'running', 'finish', 'cancel', 'cancel_with_error');

-- CreateEnum
CREATE TYPE "TypeAnswer" AS ENUM ('alls', 'short', 'long_explained');

-- CreateEnum
CREATE TYPE "TypeFile" AS ENUM ('excel', 'application', 'pdf', 'word', 'image', 'video', 'audio', 'presentation', 'other');

-- CreateTable
CREATE TABLE "TrainDocs" (
    "id" TEXT NOT NULL,
    "tokens_usage" INTEGER NOT NULL DEFAULT 0,
    "name" TEXT NOT NULL,
    "status" "StatusFileTrain" NOT NULL DEFAULT 'start',
    "role_system" TEXT NOT NULL DEFAULT '',
    "modelGeneratorData" TEXT NOT NULL DEFAULT '',
    "openAiKey" TEXT NOT NULL,
    "type_answer" "TypeAnswer" NOT NULL,
    "observations" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainDocs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainQuestions" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,

    CONSTRAINT "TrainQuestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionAnswer" (
    "id" TEXT NOT NULL,
    "trainQuestionId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "QuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" TEXT NOT NULL,
    "trainId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "extension" TEXT NOT NULL,
    "typeFileInTrain" "TypeFileTrain" NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrainQuestions" ADD CONSTRAINT "TrainQuestions_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "TrainDocs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionAnswer" ADD CONSTRAINT "QuestionAnswer_trainQuestionId_fkey" FOREIGN KEY ("trainQuestionId") REFERENCES "TrainQuestions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_trainId_fkey" FOREIGN KEY ("trainId") REFERENCES "TrainDocs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
