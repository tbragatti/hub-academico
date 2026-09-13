-- CreateTable
CREATE TABLE "usuarios" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "usuarios"("email");

-- Create a technical owner for the existing test data.
INSERT INTO "usuarios" ("email")
VALUES ('teste@hub-academico.local');

-- Add the owner relation without losing existing test records.
ALTER TABLE "disciplinas" ADD COLUMN "usuario_id" INTEGER;

UPDATE "disciplinas"
SET "usuario_id" = (SELECT "id" FROM "usuarios" WHERE "email" = 'teste@hub-academico.local');

ALTER TABLE "disciplinas" ALTER COLUMN "usuario_id" SET NOT NULL;
ALTER TABLE "disciplinas" ALTER COLUMN "docente" DROP NOT NULL;

-- A missing record time is not relevant for an absence; keep only its date.
ALTER TABLE "faltas"
  ALTER COLUMN "data_falta" TYPE DATE
  USING "data_falta"::date;

-- CreateIndex
CREATE UNIQUE INDEX "disciplinas_usuario_id_codigo_ano_periodo_key"
  ON "disciplinas"("usuario_id", "codigo", "ano", "periodo");
CREATE INDEX "disciplinas_usuario_id_idx" ON "disciplinas"("usuario_id");
CREATE UNIQUE INDEX "faltas_disciplina_id_data_falta_key"
  ON "faltas"("disciplina_id", "data_falta");

-- AddForeignKey
ALTER TABLE "disciplinas"
  ADD CONSTRAINT "disciplinas_usuario_id_fkey"
  FOREIGN KEY ("usuario_id") REFERENCES "usuarios"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

-- Enforce positive quantities at the database level.
ALTER TABLE "disciplinas"
  ADD CONSTRAINT "disciplinas_total_aulas_positive"
  CHECK ("total_aulas" > 0);
ALTER TABLE "faltas"
  ADD CONSTRAINT "faltas_quantidade_faltas_positive"
  CHECK ("quantidade_faltas" > 0);
