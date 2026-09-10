# Hub Acadêmico

Painel acadêmico desenvolvido em React para centralizar informações de estudo. A aplicação permite entrar com uma conta Google, organizar cadeiras e faltas e criar as rotinas de aula no Google Agenda.

## Funcionalidades

- Autenticação com Google OAuth 2.0.
- Leitura dos próximos oito eventos da agenda principal do Google.
- Cadastro de cadeiras com aulas recorrentes criadas no Google Agenda.
- Controle de faltas por cadeira e resumo automático do semestre.
- Proteção da página inicial para usuários autenticados.
- Persistência local de cadeiras, faltas e data de término do semestre.
- Tema claro/escuro de acordo com a preferência do sistema.

> Os dados acadêmicos são salvos apenas no navegador atual. A importação e o resumo de PDFs ainda serão disponibilizados em uma próxima etapa.

## Tecnologias

- React 19 e TypeScript
- Vite
- React Router
- Google Identity Services e Google Calendar API
- CSS Modules
- Lucide React

## Pré-requisitos

- Node.js 20 ou superior
- npm 10 ou superior
- Uma conta Google e um projeto no Google Cloud

## Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/tbragatti/hub-academico.git
cd hub-academico
npm install
```

Depois crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Preencha a variável com o ID do cliente OAuth criado no Google Cloud:

```env
VITE_GOOGLE_CLIENT_ID=seu-client-id.apps.googleusercontent.com
```

O ID do cliente é público no navegador; ainda assim, não versione o arquivo `.env`. Ele pode conter outras configurações locais no futuro.

## Configuração do Google Cloud

1. Acesse o [Google Cloud Console](https://console.cloud.google.com/) e crie ou selecione um projeto.
2. Em **APIs e serviços**, ative a **Google Calendar API**.
3. Em **Tela de consentimento OAuth**, configure os dados básicos do aplicativo e adicione os usuários de teste enquanto o app estiver em modo de teste.
4. Em **Credenciais**, crie um **ID do cliente OAuth** do tipo **Aplicativo da Web**.
5. Em **Origens JavaScript autorizadas**, adicione `http://localhost:5173` para desenvolvimento. Adicione também o domínio HTTPS usado em produção quando houver deploy.
6. Copie o ID do cliente criado para `VITE_GOOGLE_CLIENT_ID` no arquivo `.env`.

O app solicita identidade básica (`openid`, `email` e `profile`) e a permissão `https://www.googleapis.com/auth/calendar.events`. Essa permissão permite consultar e criar os eventos de aula na agenda principal do usuário.

## Executando o projeto

```bash
npm run dev
```

O Vite exibirá a URL local, normalmente `http://localhost:5173`. Abra-a no navegador e entre com a conta Google configurada.

### Outros comandos

| Comando | Descrição |
| --- | --- |
| `npm run dev` | Inicia o servidor de desenvolvimento. |
| `npm run lint` | Verifica problemas de lint no código. |
| `npm run build` | Faz a checagem de tipos e gera a build de produção em `dist/`. |
| `npm run preview` | Serve localmente a última build de produção. |

## Como usar

1. Entre usando a conta Google autorizada.
2. Consulte os próximos compromissos exibidos na seção **Google Agenda**.
3. Defina a data de fim do semestre.
4. Cadastre uma cadeira, seus dias, horário e duração para criar a rotina de aula no Google Agenda.
5. Atualize as faltas de cada cadeira no resumo acadêmico.

## Estrutura do projeto

```text
src/
├── components/  # componentes do painel, modal e proteção de rota
├── contexts/    # estado global de autenticação
├── pages/       # telas de login e página inicial
├── routes/      # rotas públicas e protegidas
├── services/    # integração OAuth e Google Calendar
├── types/       # catálogo e tipos dos widgets
├── main.tsx     # ponto de entrada da aplicação
└── index.css    # estilos globais
```

## Autenticação e dados

Após o login, a aplicação armazena no `localStorage` um token de acesso, sua expiração e os dados básicos do perfil. As cadeiras, faltas e data de encerramento do semestre também são guardadas localmente. A sessão é removida ao sair ou quando o token expira. Não há backend nem banco de dados nesta versão.

Se a agenda não carregar, saia e entre novamente para solicitar um token novo. Verifique também se a Calendar API está ativada, se a origem atual está autorizada no cliente OAuth e se sua conta está cadastrada como usuária de teste, quando aplicável.

## Verificação antes de enviar alterações

```bash
npm run lint
npm run build
```

## Licença

Este repositório ainda não possui uma licença definida.
