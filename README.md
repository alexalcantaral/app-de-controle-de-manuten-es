# Sistema de Controle de Manutenções — App (Front-end)

Aplicativo **React Native + TypeScript (Expo)** para o sistema de controle de manutenções de laboratórios do IFPB, integrado à API `sistema-controle-manutencoes-back`.

## Como rodar

### 1. Suba a API

```bash
cd "../sistema-controle-manutencoes-back /sistema-controle-manutencoes-back/server"
docker compose up -d          # banco
npm install
npm run migrate
npm run seed                  # cria o usuário COORDENADOR (EMAIL_USER_COORD / SENHA_USER_COORD do .env)
npm start                     # API na porta definida em PORT (5000)
```

### 2. Configure o endereço da API no app

Edite `src/config/env.ts`:

- **Emulador Android:** `http://10.0.2.2:5000` (padrão)
- **Celular físico (Expo Go):** `http://<IP da sua máquina na rede>:5000`
- **iOS simulator:** `http://localhost:5000`

### 3. Rode o app

```bash
npm install
npm start          # abre o Expo; escaneie o QR code com o Expo Go
```

Faça login com o usuário coordenador criado no seed e cadastre os demais usuários (professores e técnicos) pela tela **Usuários**.

## Perfis e permissões (autenticação por cargo)

| Ação | Coordenador | Professor | Técnico |
|---|---|---|---|
| Dashboard com gráficos | ✅ (todas) | ✅ (suas) | ✅ (atribuídas) |
| Solicitar manutenção | ✅ | ✅ | — |
| Editar/cancelar manutenção | ✅ | ✅ (as suas) | — |
| Concluir manutenção (com relato) | — | — | ✅ |
| Excluir manutenção | ✅ | — | — |
| Upload/remoção de imagens | ✅ | — | ✅ |
| Ver imagens das manutenções | ✅ | ✅ | ✅ |
| Gerenciar laboratórios | ✅ | ver | ver |
| Gerenciar instituições (mapa) | ✅ | ver | ver |
| Gerenciar usuários | ✅ | — | — |

## Requisitos da disciplina atendidos

- **React Native + TypeScript (Expo)** — todo o código em TS estrito.
- **Integração com API em todas as telas** — login, dashboard, manutenções (lista/detalhe/criar/editar/concluir/cancelar/excluir), laboratórios (CRUD), instituições (CRUD), usuários (CRUD), imagens (upload/listagem/remoção).
- **Autenticação com Context API** — `src/contexts/AuthContext.tsx`, com 3 cargos (COORDENADOR, PROFESSOR, TÉCNICO), JWT com refresh automático (interceptor axios).
- **Armazenamento interno** — sessão persistida com AsyncStorage (`src/services/storage.ts`).
- **Upload** — `expo-image-picker` + multipart para `POST /api/imagem/manutencao/:id`.
- **Visualização de mídias** — galeria de imagens da manutenção + visualizador em tela cheia.
- **Mapa** — `react-native-maps` com marcadores das instituições de ensino (lat/long da API); coordenador cadastra instituição segurando no mapa.
- **Validações com lib externa** — `react-hook-form` + `zod` em todos os formulários, espelhando as regras dos schemas da API.
- **Componentização** — `src/components/` (12+ componentes reutilizáveis com props/estado).
- **Navegação** — React Navigation (stack + bottom tabs), listas personalizadas (FlatList com pull-to-refresh, filtros e estados vazios).
- **Pontos extras** — animações (`react-native-reanimated`: FadeIn/ZoomIn) e relatórios em gráficos (`react-native-gifted-charts`: pizza e barras no dashboard).

## Estrutura

```
src/
├── components/     # componentes reutilizáveis (campos de formulário, cartões, badges...)
├── config/         # endereço da API
├── contexts/       # AuthContext (Context API)
├── navigation/     # stack raiz + abas
├── screens/        # telas por domínio (auth, inicio, manutencoes, laboratorios, instituicoes, usuarios, perfil)
├── services/       # axios + serviços por recurso da API + AsyncStorage
├── theme/          # cores, espaçamentos, temas de status/cargo
├── types/          # tipos das entidades da API
└── utils/          # formatadores de data/CNPJ etc.
```
