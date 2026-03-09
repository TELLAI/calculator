-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "organization_id" TEXT,
    "role" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "recoltes" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recolte_date" DATE,
    "organization_id" TEXT NOT NULL,
    "billet_100" INTEGER NOT NULL DEFAULT 0,
    "billet_50" INTEGER NOT NULL DEFAULT 0,
    "billet_20" INTEGER NOT NULL DEFAULT 0,
    "billet_10" INTEGER NOT NULL DEFAULT 0,
    "billet_5" INTEGER NOT NULL DEFAULT 0,
    "piece_2" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "piece_1" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "piece_050" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "piece_020" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "piece_010" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "piece_005" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "piece_002" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "piece_001" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cotisation_adherents" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cheques" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carte_bancaire" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "autres" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "personnes_presentes" TEXT,
    "observations" TEXT,

    CONSTRAINT "recoltes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "recoltes" ADD CONSTRAINT "recoltes_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
