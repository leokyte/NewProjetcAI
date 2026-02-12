# Serviços HTTP

Os serviços utilizam Axios e URLs configuradas via `.env*`. As bases mais usadas ficam em `src/services/kyte-api-gateway.js`:

```js
export const apiGatewayDefaultURL = Config.API_GATEWAY_DEFAULT_URL
export const apiGatewayBaseURL = Config.API_GATEWAY_BASE_URL
export const apiIntegrationsGateway = axios.create({ baseURL: `${apiGatewayBaseURL}/integrations`, ... })
export const apiGateway = axios.create({ baseURL: apiGatewayDefaultURL, ... })
```

## kyte-account.js

Conta/usuário/loja, preferências e impostos.

Exemplos:

```js
// Login
export const kyteAccountSignIn = (uid, lang) => apiGateway.get(`/sign-in/${uid}/${lang}`)

// Preferências do usuário
export const kyteAccountGetPreference = (uid) => apiGateway.get(`/preferences/${uid}`)
export const kyteAccountSetPreference = async (uid, key, value) => apiGateway.post(`/preferences/${uid}`, { key, value })

// Loja e imagens
export const kyteAccountSetStore = ({ store }) => apiGateway.post('/store', { store })
export const kyteAccountSetStoreImage = ({ store }, storeImage) => { /* upload multipart */ }

// Multiusuários
export const kyteAccountGetMultiUsers = (aid) => apiGateway.get(`/account/${aid}`)
```

## kyte-data.js

Sincronização, estoque, relatórios e utilidades.

```js
// Sync completo
export const kyteDataSync = (aid) => apiGateway.get(`/export-sync/${aid}`)

// Histórico de estoque
export const kyteDataGetStockHistory = (productId) => apiGateway.post(`/stock/${productId}`)

// Lançar movimentação de estoque
export const kyteDataSetStockEntry = (stock) => apiGateway.post('/stock-add', { ...stock })
```

## kyte-api.js (Integrações)

Integrações externas como TikTok e Facebook Pixel, e geração de Payment Link.

```js
export const kyteGeneratePaymentLink = (sale, store, gatewayKey) => apiGateway.post('/plink/generate-payment-link', { sale, store, gatewayKey })
export const kyteTikTokIntegration = (aid, timezone) => apiIntegrationsGateway.post('/tiktok-generate-uri/integration', { aid, timezone })
```

## kyte-api-web.ts (App Web)

Operações para produto/categoria e IA para descrição.

```ts
export const kyteApiWebUpdateProduct = (product: IProduct) => apiWebGateway.post('/product', product)
export const kyteApiWebQueryAISuggestDescription = (params: TGenerateDescriptionParams) => apiWebGateway.post('/ai/product-description', params)
```

## kyte-backend.ts

Variações e SKUs para produtos.

```ts
export const kyteApiCreateVariation = (variant: IVariant) => apiVariantsGateway.post('/variant', variant)
export const kyteApiGenerateSKUs = (aid: string, body: IGenerateSKUsBody) => apiVariantsGateway.post(`/skus/${aid}`, body)
```

## kyte-auth.js

Fluxos auxiliares de autenticação.

```js
export const getUserByToken = async (token, cancelToken) => {
  // chama endpoints protegidos para recuperar usuário
}
```

## kyte-sender.js

Envio de recibos por e-mail.

```js
export const sendReceipt = (saleData) => apiGateway.post('/email/sendReceipt', saleData)
```

## Tratamento de Erros e Timeouts

- Utilize `try/catch` no consumo dos serviços e exponha mensagens amigáveis
- Em chamadas críticas, considere `CancelToken` do Axios para evitar corridas
- Padronize logs via `src/integrations/ErrorHandler` quando aplicável

---
