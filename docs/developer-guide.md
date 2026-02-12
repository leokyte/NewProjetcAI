# Guia do Desenvolvedor

Diretrizes para contribuir, desenvolver e manter o Kyte App.

## Setup de Desenvolvimento

- Node 18+, Yarn, Xcode/CocoaPods (iOS) e Android Studio (Android)
- Configure `.env` apropriado (veja `docs/quick-start.md`)
- Instale dependências: `yarn install`
- Inicie o bundler: `yarn start:legacy`

## Scripts úteis (`package.json`)

- Lint: `yarn lint` / `yarn lint:fix`
- Prettier: `yarn prettier:check` / `yarn prettier:fix`
- Testes: `yarn test`
- iOS: `yarn ios` | Android: `yarn android`
- Limpeza iOS: `yarn clean:ios` (inclui cache Metro, Pods, DerivedData)
- Limpeza Android: `yarn clean:android`
- Builds Android por produto/ambiente: `build:pos:*` e `build:catalog:*` com `ENVFILE=.env*`

## Padrões de Código

- ESLint/Prettier já configurados via `@kyteapp/*`
- Evite estados locais complexos sem necessidade; utilize Redux quando o estado for global
- Nomeie actions e reducers de forma descritiva, mantendo side effects em thunks/sagas (quando aplicável)
- Componentes: prefira function components + hooks
- Tipagem TypeScript onde já adotado (ex.: serviços `.ts`)

## Estrutura de Pastas (resumo)

- `src/components`: componentes e containers (ex.: `AppContainer`)
- `src/screens`: telas de feature
- `src/stores`: actions, reducers, middlewares
- `src/services`: serviços HTTP e clientes Axios
- `src/integrations`: Firebase, OneSignal, Intercom, Mixpanel, AppsFlyer, Clarity
- `src/util`, `src/hooks`, `src/constants`, `src/styles`

## Testes

- Jest preset React Native (`jest.preset`)
- Escreva testes de unidade para utilitários e lógica de serviços
- Para componentes, foque em testes de renderização/props e lógica crítica

## Commits e PRs

- Branches curtas focadas na tarefa
- Commits atômicos e mensagens descritivas
- Abra PR com descrição do problema, solução e impactos
- Inclua screenshots ou vídeos para mudanças visuais

## Feature Flags e Config Remota

- Utilize Remote Config (Firebase) quando apropriado para ativar/desativar fluxos
- Centralize chaves e toggles em um módulo e documente no PR

## Lançamento e Deploy

- Android: use os scripts `build:*` (bundle/apk) com o `ENVFILE` correto
- iOS: gere bundle JS (`yarn build:ios:jsbundle`) e utilize Xcode para arquivar/assinar
- Valide analytics, push e sincronização em stage antes de promover para prod

## Segurança e Dados Sensíveis

- Nunca commitar segredos reais; use placeholders locais
- Chaves atuais em `.env*` existem para facilitar desenvolvimento, não as replique publicamente
- Revise logs para não incluir dados pessoais identificáveis

---
