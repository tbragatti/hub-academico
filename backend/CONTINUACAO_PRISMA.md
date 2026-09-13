# Continuação da configuração do Prisma

## Estado atual

- PostgreSQL está rodando pelo Docker Compose.
- A primeira migration foi criada e aplicada com sucesso.
- O banco está atualizado em relação ao `schema.prisma`.
- O schema foi validado pelo Prisma.
- O Prisma Client já foi gerado.
- Os modelos atuais são `Disciplina` e `Falta`.

## Próximos passos

1. Abrir o Prisma Studio com `npx prisma studio`.
2. Conferir visualmente as tabelas `disciplinas` e `faltas`.
3. Revisar as regras dos campos antes de criar novas migrations:
   - se `codigo` deve ser único;
   - se existe uma combinação única para disciplina, ano e período;
   - quais valores `periodo` pode receber;
   - se `quantidadeFaltas` pode ser zero;
   - se `dataFalta` precisa armazenar horário ou somente data.
4. Fazer alterações no `schema.prisma` somente depois dessa revisão.
5. Criar uma nova migration para cada mudança, usando `npx prisma migrate dev --name nome_da_mudanca`.
6. Depois, conectar o Prisma Client ao código do backend.
7. Criar testes simples de leitura e gravação no banco.

## Regras importantes

- Não editar manualmente migrations já aplicadas.
- Não apagar a migration inicial.
- Mudanças no modelo devem ser feitas no `schema.prisma` e gerar novas migrations.
- A relação `Disciplina` → `Falta` usa exclusão em cascata: apagar uma disciplina também apaga suas faltas.

## Conceitos

- **Prisma Client:** código usado pelo backend para consultar e alterar o banco.
- **Prisma Studio:** interface visual para visualizar e testar os dados.
