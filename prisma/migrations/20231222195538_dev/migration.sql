-- CreateEnum
CREATE TYPE "Role" AS ENUM ('NOTACTIVE', 'GROUPMOD', 'HELPER', 'ADMIN', 'MOD');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "roles" "Role"[] DEFAULT ARRAY['HELPER']::"Role"[],
    "username" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "salt" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" SERIAL NOT NULL,
    "isActivated" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "authToken" TEXT,
    "secret" TEXT,
    "activationLink" TEXT,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" SERIAL NOT NULL,
    "chars" TEXT NOT NULL,
    "groupId" INTEGER,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Group" (
    "id" SERIAL NOT NULL,
    "group" INTEGER NOT NULL,
    "leadId" INTEGER,
    "leadChars" TEXT,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Place" (
    "id" SERIAL NOT NULL,
    "isOnHands" BOOLEAN NOT NULL DEFAULT false,
    "number" INTEGER NOT NULL,
    "takeAt" INTEGER,
    "doneAt" INTEGER,
    "friendId" INTEGER,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Email_userId_key" ON "Email"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_email_key" ON "Email"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Email_authToken_key" ON "Email"("authToken");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_chars_key" ON "Friend"("chars");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_id_chars_key" ON "Friend"("id", "chars");

-- CreateIndex
CREATE UNIQUE INDEX "Group_group_key" ON "Group"("group");

-- CreateIndex
CREATE UNIQUE INDEX "Place_number_key" ON "Place"("number");

-- CreateIndex
CREATE UNIQUE INDEX "Option_name_key" ON "Option"("name");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Group" ADD CONSTRAINT "Group_leadId_leadChars_fkey" FOREIGN KEY ("leadId", "leadChars") REFERENCES "Friend"("id", "chars") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Place" ADD CONSTRAINT "Place_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "Friend"("id") ON DELETE SET NULL ON UPDATE CASCADE;
