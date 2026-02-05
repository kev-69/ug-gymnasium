/*
  Warnings:

  - The values [PAYSTACK] on the enum `PaymentMethod` will be removed. If these variants are still used in the database, this will fail.
  - The values [REFUNDED] on the enum `PaymentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `autoRenew` on the `subscriptions` table. All the data in the column will be lost.
  - You are about to drop the column `currency` on the `transactions` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PaymentMethod_new" AS ENUM ('CARD', 'MOBILE_MONEY');
ALTER TABLE "transactions" ALTER COLUMN "paymentMethod" TYPE "PaymentMethod_new" USING ("paymentMethod"::text::"PaymentMethod_new");
ALTER TYPE "PaymentMethod" RENAME TO "PaymentMethod_old";
ALTER TYPE "PaymentMethod_new" RENAME TO "PaymentMethod";
DROP TYPE "public"."PaymentMethod_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PaymentStatus_new" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');
ALTER TABLE "public"."subscriptions" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "public"."transactions" ALTER COLUMN "paymentStatus" DROP DEFAULT;
ALTER TABLE "subscriptions" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TABLE "transactions" ALTER COLUMN "paymentStatus" TYPE "PaymentStatus_new" USING ("paymentStatus"::text::"PaymentStatus_new");
ALTER TYPE "PaymentStatus" RENAME TO "PaymentStatus_old";
ALTER TYPE "PaymentStatus_new" RENAME TO "PaymentStatus";
DROP TYPE "public"."PaymentStatus_old";
ALTER TABLE "subscriptions" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';
ALTER TABLE "transactions" ALTER COLUMN "paymentStatus" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "subscriptions" DROP COLUMN "autoRenew";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "currency";
