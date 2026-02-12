# Quick Start

Este guia ajuda você a instalar, configurar e rodar o Kyte App (POS/Catalog) em um ambiente de desenvolvimento local.

## Requisitos

- Node.js 18+
- Yarn
- Xcode (iOS) e CocoaPods
- Android Studio (SDK, emulador e JDK 11+)
- Watchman (macOS) recomendado

## Configuração do Ambiente

1) Instale dependências JS

```bash
yarn install
```

2) Defina variáveis de ambiente

- Copie um dos arquivos `.env*` conforme o alvo: `.env` (dev), `.env.stage` (stage) ou `.env.prod` (prod).
- Ajuste valores sensíveis localmente, sem commitar segredos. Variáveis importantes:
  - `API_GATEWAY_DEFAULT_URL`, `API_GATEWAY_BASE_URL`, `API_WEB_GATEWAY_URL`
  - `API_INTEGRATIONS_GATEWAY_DEFAULT_URL`, `API_ANALYTICS_KYTE_APP_URL`
  - `ONESIGNAL_*_APP_ID`, `MIXPANEL_TOKEN`, `APIM_SUBSCRIPTION_KEY`

3) iOS: instale pods

```bash
cd ios && pod install && cd ..
```

4) Verifique ferramentas nativas

- iOS: abra `ios/kyte.xcworkspace` no Xcode e selecione um simulador válido
- Android: verifique `adb devices` e aceite permissões do emulador

## Rodando o projeto

- Metro bundler:

```bash
yarn start:legacy
```

- iOS (simulador):

```bash
yarn ios
```

- Android (emulador):

```bash
yarn android
```

## Builds rápidas

- Gerar bundle JS iOS:

```bash
yarn build:ios:jsbundle
```

- Gerar bundle/apk Android por produto (POS/Catalog) e ambiente:

```bash
# POS
ENVFILE=.env       yarn build:pos:apk:dev
ENVFILE=.env.stage yarn build:pos:apk:stage
ENVFILE=.env.prod  yarn build:pos:apk:prod

# Catalog
ENVFILE=.env       yarn build:catalog:apk:dev
ENVFILE=.env.stage yarn build:catalog:apk:stage
ENVFILE=.env.prod  yarn build:catalog:apk:prod
```

## Verificação

- Abra o app e conclua o fluxo de login
- Confirme recebimento de push (OneSignal) e tracking (Mixpanel/AppsFlyer) em ambiente de teste
- Valide sincronização inicial de produtos/estoque e navegação básica

---
