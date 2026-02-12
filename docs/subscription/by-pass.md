# Lógica de ByPass de Assinatura

Este documento explica como funciona a lógica de bypass de assinatura no app Kyte, detalhando os critérios e o fluxo de navegação relacionados ao processo de assinatura.

## Critérios para ByPass

O comportamento de bypass (pular a página de planos e ir diretamente ao checkout externo) é avaliado da seguinte forma:

### Sempre habilita o ByPass
- **Usuário possui referral code e assinatura é free ou trial:** Se o usuário possui um referral code e o billing está como free ou trial, o bypass **sempre** é permitido, independentemente dos outros critérios.

### Critérios de avaliação do ByPass
Para que o bypass seja permitido (além do caso de referral code acima), **todas** as condições abaixo devem ser atendidas:

1. Email **não** está na lista de bloqueio (testadores/revisores)
2. Tempo de instalação é **maior** que 60 minutos
3. Usuário **realizou** pelo menos uma ação essencial do app
4. **E** a configuração remota (`isByPassEnabled`) está habilitada (true)

Se **qualquer** uma dessas condições não for atendida, o usuário será direcionado para a tela de planos ("Plans"). Caso todas sejam atendidas, o usuário será direcionado diretamente ao checkout externo.

> **Importante:** Para testadores/revisores (emails bloqueados), o bypass nunca é permitido, exceto se possuírem referral code válido e assinatura free/trial.

## Funções Principais

### Arquivo: `util-subscription-by-pass.ts`
- **isBlackListedTestEmail(email):** Verifica se o email está na lista de bloqueio de testadores/revisores.
- **getInstallTime():** Retorna o tempo (em minutos) desde a instalação do app.
- **hasDoneAnyCoreActions(coreActionsPref):** Verifica se o usuário realizou alguma ação principal no app.
- **hasReferralCode(billingInfo, referralCode):** Verifica se o usuário possui referral code e o billing está como free ou trial.
- **getByPassRemoteKey():** Busca o valor remoto de configuração para habilitar/desabilitar o bypass globalmente.
- **evaluateSubscriptionByPass(email, billing, referralCode, coreActionsPref):** Função principal que retorna um objeto `{ safetyRules: boolean; isByPassEnabled?: boolean }`. Quando `safetyRules` é `true`, o bypass **não** deve ser permitido.

> Observação: `isByPassEnabled` reflete o valor da configuração remota e pode ser usado para telemetria/experimentos (ex.: Mixpanel).

### Arquivo: `subscription-navigate.ts`
- **navigateToSubscription(email, aid, billing, referralCode?, coreActionsPref?):** Função que decide se o usuário será direcionado para a tela de planos ou diretamente ao checkout externo, utilizando a função `evaluateSubscriptionByPass`.

## Experimento e Mixpanel

O valor do experimento de bypass de assinatura (ByPassSubscription) é enviado para o Mixpanel nas propriedades do usuário, através da propriedade `ByPass Subscription` em `userProperties`. Essa propriedade indica se o usuário está no grupo com bypass habilitado (`ByPassEnabled`) ou desabilitado (`ByPassDisabled`), conforme o valor do remote config ou das condições de referral code.

## Onde a função `navigateToSubscription` é utilizada

A função `navigateToSubscription` é utilizada nos seguintes arquivos:
- `Account.js`
- `DrawerContent.js`
- `BillingActions.js`

Esses arquivos utilizam a função para controlar o fluxo de navegação do usuário em relação à assinatura, garantindo que os critérios de bypass sejam respeitados.

---

**Resumo:**
A lógica de bypass garante que apenas usuários legítimos, que já interagiram com o app e não são testadores/revisores, possam ir diretamente ao checkout externo, pulando a página de planos. O bypass é **sempre** habilitado para usuários com referral code válido. Para os demais usuários, todas as condições devem ser atendidas: email não bloqueado, instalação há mais de 5 minutos, pelo menos uma ação essencial realizada E configuração remota habilitada. Se qualquer condição falhar, o usuário será direcionado para a tela de planos. O experimento é rastreado via Mixpanel para análise.
