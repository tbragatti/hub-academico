-- CreateTable
CREATE TABLE "disciplinas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "ano" INTEGER NOT NULL,
    "periodo" INTEGER NOT NULL,
    "docente" TEXT NOT NULL,
    "total_aulas" INTEGER NOT NULL,

    CONSTRAINT "disciplinas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faltas" (
    "id" SERIAL NOT NULL,
    "disciplina_id" INTEGER NOT NULL,
    "data_falta" TIMESTAMP(3) NOT NULL,
    "quantidade_faltas" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "faltas_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faltas_disciplina_id_idx" ON "faltas"("disciplina_id");

-- AddForeignKey
ALTER TABLE "faltas" ADD CONSTRAINT "faltas_disciplina_id_fkey" FOREIGN KEY ("disciplina_id") REFERENCES "disciplinas"("id") ON DELETE CASCADE ON UPDATE CASCADE;
