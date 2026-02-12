# Arquitetura

Visão geral da arquitetura do Kyte App, seus módulos principais e fluxos de dados.

## Visão Geral

- Framework: React Native (`index.js` → `src/App.js`)
- Estado global: Redux (actions/reducers em `src/stores`)
- Navegação: React Navigation 5 (`src/components/AppContainer.js` + containers)
- Sincronização e offline: módulos em `src/sync` e actions de vendas/estoque
- Integrações: Firebase, OneSignal, Intercom, Mixpanel, AppsFlyer, Clarity (pasta `src/integrations`)
- Serviços HTTP: Axios instances e serviços em `src/services/*`
- Estilos/UI: `@kyteapp/kyte-ui-components`, `src/styles`, componentes em `src/components`

## Pontos de Entrada

- `index.js`: registra o app, configura tratamento de exceções e registra `App`
- `src/App.js`: inicializa integrações, locale, OneSignal, AppsFlyer, provê Redux e ViewportProvider, renderiza `AppContainer`
- `src/components/AppContainer.js`: orquestra inicialização (auth, sync, notificações), listeners (deep link, rede, Intercom), renderiza UI global e handlers

## Fluxo de Dados

1. Autenticação e inicialização
   - `authInitialize` → autentica/recupera usuário
   - Busca preferências/billing (ex.: `KyteAccountInitializer` documentado em `docs/services/KyteServices.md`)
2. Sincronização
   - `syncInitialize`, `syncDownRestore` e hooks de rede disparam fetch de produtos, categorias, estoque
3. UI e navegação
   - `AppContainer` ajusta visibilidade de mensagens, modais, listeners, e controla carregamento global
4. Integrações
   - OneSignal: `initializeOneSignal`, `registerOneSignalListeners`
   - Intercom: propriedades do usuário e contadores
   - Analytics: Mixpanel/AppsFlyer/Clarity via `src/integrations`

## Serviços (HTTP)

- Axios instances: `src/services/kyte-api-gateway.js` expõe clientes para `apiGateway`, `apiIntegrationsGateway`, `apiAnalyticsKyteApp`, etc., configurados via `.env`
- Principais módulos:
  - `kyte-account.js`: cadastro, login, preferências, loja, imagens, impostos e multiusuários
  - `kyte-data.js`: sincronização, estoque, relatórios, geração de Pix, produtos
  - `kyte-api.js`: integrações (TikTok, Facebook Pixel, Payment Link)
  - `kyte-api-web.ts`: operações de produto/categoria e IA (descrições)
  - `kyte-backend.ts`: variações e SKUs
  - `kyte-process.js`: limpeza de dados, atribuição
  - `kyte-auth.js`: fluxo de autenticação por token e clipboard
  - `kyte-sender.js`: envio de recibos por e-mail

## Estado Global (Redux)

- Actions em `src/stores/actions` (e.g., `syncInitialize`, `productsFetch`, `setViewport`)
- Reducers em `src/stores/reducers` (e.g., `SalesReducer`, `CustomersReducer`)
- Seletores e hooks: `src/hooks` (ex.: `useGetSyncResult`)

## Configuração e Ambiente

- `.env*` definem URLs do gateway e chaves de integrações
- Scripts de build separados por produto (POS/Catalog) e ambiente (`package.json`)
- iOS/Android possuem pastas nativas (`ios/`, `android/`)

## Considerações de Desempenho

- Uso de `react-native-screens` e `enableScreens(false)` conforme compatibilidade
- Lazy loading para modais pesados (ex.: `SaleQuickView`)
- Fetch paginado (ex.: produtos com `limit`)

## Extensibilidade

- Novas integrações: adicionar cliente em `kyte-api-gateway.js` e módulo de serviço dedicado
- Novos recursos: seguir padrão container + actions + reducers + componentes em `src/components`/`src/screens`
- Telemetria: padronizar eventos via `src/integrations/Mixpanel.js` e `logEvent`

---
