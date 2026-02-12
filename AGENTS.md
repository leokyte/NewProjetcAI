# Kyte POS Agent Guide

## Visão geral do repositório
- **App container:** `src/App.js` instancia provedores globais (Redux, Realm, sincronização) e inicializa integrações como Firebase.
- **Configuração principal:**
  - `src/configureStore.js` cria a store Redux com `redux-offline`, middlewares internos e integração com Reactotron.
  - `src/ReactotronConfig.js` concentra o debug remoto quando `__DEV__` está ativo.
- **Estrutura de módulos:** o código de UI vive em `src/components` (blocos reutilizáveis) e `src/screens` (stacks de navegação). Fluxos específicos (ex.: venda atual, onboarding) possuem subpastas próprias dentro destes diretórios.

## Componentes e UI
- **Componentes reutilizáveis:** organize novos componentes em `src/components/<domínio>` seguindo o padrão existente; subpastas como `common`, `auth`, `products`, etc. agrupam widgets, containers e formulários relacionados.
- **Screens:** `src/screens` contém funções que exportam stacks do React Navigation (ver seção “Navegação”). Ao criar novas telas, mantenha a separação entre UI de baixo nível (`components`) e stacks/rotas (`screens`).
- **Estilos e utilitários de UI:** estilos base vivem em `src/styles`, enquanto helpers visuais e wrappers ficam em `src/components/common` ou `src/util` dependendo do escopo.

## Controle de estado (Redux)
- A store é configurada em `src/configureStore.js` utilizando `redux-offline` para persistência offline.
- **Reducers e Actions:**
  - Reducers vivem em `src/stores/reducers` (combine-os em `index.js`).
  - Actions e action creators estão em `src/stores/actions` (incluindo side effects e chamadas assíncronas).
  - Middlewares customizados residem em `src/stores/middleware` e variantes de estado especializado ficam em `src/stores/variants`.
- **Tipagem do estado:** use `src/types/state` (ex.: `RootState.ts`) para manter as definições de tipo compartilhadas quando trabalhar com TypeScript.

## Formulários
- **Redux Form:** a maior parte dos formulários classifica-se em containers com HOCs `reduxForm`. Siga exemplos em `src/components/config/...` ou `src/components/auth/...` para padrões de validação, campos (`Field`) e helpers (`getFormValues`, `change`).
- **React Hook Form:** alguns formulários modernos usam `react-hook-form` (ex.: `src/components/config/payments/PixDataConfig.tsx`, `src/components/products/variants/VariantEditForm.tsx`). Prefira esta abordagem para novos fluxos que demandem melhor performance ou componentes controlados. Garanta a consistência com os wrappers existentes (`Controller`, mapeamento de erros, etc.).
- **Boas práticas:** evite misturar Redux Form e React Hook Form no mesmo fluxo; mantenha cada stack consistente. Armazene validações compartilhadas em utilitários específicos para o domínio.

## Banco local (Realm)
- A camada de persistência local está centralizada em `src/repository`.
  - `src/repository/models.js` inicializa e expõe a instância global do Realm.
  - Modelos individuais ficam em `src/repository/models/*.js` (clientes, produtos, vendas, etc.).
  - `src/repository/repository.js` e helpers relacionados encapsulam queries/comandos.
- Quando adicionar novos modelos ou atributos, mantenha os schemas sincronizados entre `models.js` e os arquivos de domínio correspondentes.

## Sincronização com Firebase
- As integrações Firebase estão em `src/integrations/Firebase-Integration.js` (analytics, remote config, firestore, storage, crashlytics).
- A sincronização de dados acontece via `src/sync`:
  - `syncDataManager.js` orquestra ciclos de sincronização.
  - `server-manager/` contém os managers de upload/download com Firestore (`documentUpServerManager.js`, `documentDownServerManager.js`, `storageServerManager.js`).
  - `notificationHub.js` coordena eventos e listeners.
- Use as helpers de `src/integrations` para logging, analytics e configuração padrão antes de criar novas integrações.

## Services (APIs)
- Serviços REST/gateway residem em `src/services`.
  - `kyte-api.js`, `kyte-api-gateway.js`, `kyte-api-web.ts` encapsulam clientes HTTP e interceptadores.
  - Módulos específicos (`kyte-account.js`, `kyte-products.js`, etc.) expõem funções de alto nível usadas pelas actions Redux.
- Centralize novas chamadas de API aqui para manter consistência de autenticação, headers, tratamento de erros e métricas.

## Navegação (React Navigation)
- O ponto de entrada da navegação é `src/Router.js`, que monta o `DrawerNavigator` principal e associa cada item às stacks exportadas em `src/screens`.
- Stacks com `createStackNavigator` e outras navegações aninhadas devem ser definidos em seus módulos de domínio dentro de `src/screens`.
- Ao adicionar rotas, atualize o drawer e mantenha traduções em `src/i18n` sincronizadas com as labels.

## Types / Models
- Tipos TypeScript globais ou específicos de domínio vivem em `src/types` e dentro de subpastas de componentes/stores quando necessário.
- Interfaces de dados persistidos devem refletir os schemas Realm e as respostas de API, mantendo adaptação/coerência via `src/repository/model.adapter.js` e serviços correspondentes.

## Outros diretórios relevantes
- `src/hooks` contém hooks reutilizáveis.
- `src/constants`, `src/enums` e `src/messages` centralizam valores constantes, enumeradores e mensagens/traduções.
- `src/util` expõe utilidades puras e helpers de plataforma.
- `src/integrations` agrega integrações de terceiros (Firebase, Intercom, etc.).

## Guia MCP (Context7)
Sempre que uma tarefa exigir compreensão ampliada do contexto do projeto (ex.: dependências externas, padrões arquiteturais ou decisões históricas) utilize o MCP do **Context7**:
1. **Identifique a necessidade:** se as informações disponíveis localmente forem insuficientes (por exemplo, falta de documentação sobre um serviço, fluxo de sincronização complexo ou convenções internas), planeje uma consulta MCP.
2. **Solicite o recurso:** descreva claramente o que precisa ser pesquisado e peça explicitamente pelo acesso via Context7. Ex.: “Requisitar histórico MCP Context7 para decisões de sincronização Firebase”.
3. **Consuma as respostas:** integre os insights MCP ao plano de trabalho e documente nos PRs/commits quando decisões forem baseadas em informações extraídas via Context7.
4. **Mantenha rastreabilidade:** salve links ou resumos relevantes na descrição do PR ou em documentação apropriada para que outros agentes possam revisitar a fonte MCP futuramente.
5. **Reutilize antes de repetir:** verifique se há registros anteriores de consultas MCP relacionadas antes de abrir novas requisições, evitando redundância.

> Este arquivo é de escopo global. Qualquer alteração em áreas mencionadas deve respeitar as diretrizes acima e manter esta documentação atualizada sempre que novas convenções surgirem.