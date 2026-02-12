# Correção: Crash FATAL - LayoutShadowNode.setOverflow - Invalid overflow: auto

## 📋 Resumo

Crash causado por valor inválido `overflow: 'auto'` no Android. O componente `Container` do `kyte-ui-components` tinha `overflow: 'auto'` como default, que não é suportado pelo React Native Android (apenas `'visible'`, `'hidden'`, `'scroll'` são válidos). O crash foi ativado após migração para `getComponentProps()` na v4.0.3, que tornou o valor efetivamente aplicado durante render.

## 🔗 Link do Problema no Crashlytics

**Issue ID:** `1e0c2cacdf05f9d6884d6a4ac0363c33`

**URL do Firebase Console:**
```
https://console.firebase.google.com/project/kyte-7c484/crashlytics/app/android:com.kyte/issues/1e0c2cacdf05f9d6884d6a4ac0363c33
```

## 📊 Estatísticas do Problema

- **Total de eventos:** 149 crashes
- **Usuários afetados:** 149 usuários
- **Primeira versão afetada:** 2.5.1
- **Última versão afetada:** 2.5.1
- **Tipo:** FATAL (crash que encerra o app)
- **Estado:** OPEN
- **Sinal:** SIGNAL_FRESH - Apareceu pela primeira vez em 2026-01-09

## 🔍 Análise do Problema

### Erro

```
com.facebook.react.bridge.JSApplicationIllegalArgumentException: invalid value for overflow: auto
```

**Stack Trace:**
```
com.facebook.react.bridge.JSApplicationIllegalArgumentException: Error while updating property 'overflow' in shadow node of type: RCTView
at com.facebook.react.uimanager.ViewManagersPropertyCache$PropSetter.updateShadowNodeProp (ViewManagersPropertyCache.java:125)
at com.facebook.react.uimanager.ViewManagerPropertyUpdater$FallbackShadowNodeSetter.setProperty (ViewManagerPropertyUpdater.java:161)
at com.facebook.react.uimanager.ViewManagerPropertyUpdater.updateProps (ViewManagerPropertyUpdater.java:65)
at com.facebook.react.uimanager.ReactShadowNodeImpl.updateProperties (ReactShadowNodeImpl.java:320)
at com.facebook.react.uimanager.UIImplementation.createView (UIImplementation.java:261)

Caused by: com.facebook.react.bridge.JSApplicationIllegalArgumentException: invalid value for overflow: auto
at com.facebook.react.uimanager.LayoutShadowNode.setOverflow (LayoutShadowNode.java:596)
```

**Localização:** `LayoutShadowNode.java:596`

### Causa Raiz

O crash foi causado por uma mudança no comportamento do `kyte-ui-components` v4.0.3:

1. **Estado Anterior (≤ v4.0.2):**
   - `Container.js` sempre teve `overflow: 'auto'` como valor default
   - O valor **não era efetivamente aplicado** durante o render (bug silencioso)
   - Nenhum crash ocorria

2. **Commit Crítico (a022fc97):**
   - Migração para `getComponentProps()` (React 19 safe)
   - Sistema de props passou a aplicar **efetivamente** todos os defaults
   - `overflow: 'auto'` agora **é realmente aplicado** aos componentes

3. **Problema no Android:**
   - React Native Android 0.67.5 **NÃO suporta** `overflow: 'auto'`
   - Valores válidos: `'visible'`, `'hidden'`, `'scroll'`
   - Android lança `JSApplicationIllegalArgumentException` quando recebe `'auto'`

4. **Resultado:**
   - Container renderiza → overflow: 'auto' aplicado → Android rejeita → **CRASH FATAL**
   - Componente usado em 137 arquivos (341 ocorrências) no kyte-app

### Quando Ocorria

O crash ocorria quando:
1. **App atualizado para kyte-app v2.5.1** com kyte-ui-components v4.0.3
2. **Qualquer tela renderiza um componente `Container`** sem especificar explicitamente o prop `overflow`
3. **Sistema Android tenta aplicar overflow: 'auto'** na shadow node do React Native
4. **LayoutShadowNode.setOverflow() valida o valor** e lança exceção

### Impacto

- **Crash FATAL:** O app fechava completamente ao renderizar telas com Container
- **149 usuários afetados** com 149 crashes no total (1 crash por usuário)
- **SIGNAL_FRESH:** Problema novo, apareceu apenas 4 dias atrás
- **Taxa de impacto:** 100% dos crashes resultaram em fechamento do app
- **Versão:** Apenas v2.5.1 afetada (regressão introduzida nesta versão)
- **Telas afetadas:** Qualquer tela usando Container (Coupons, Dashboard, Product variants, etc.)

## ✅ Solução Implementada

A correção foi aplicada no repositório `kyte-ui-components` substituindo valores incompatíveis com Android por valores válidos do React Native.

### Código Antes

**Container.js (linha 44):**
```javascript
export const containerDefaultProps = {
  // ... outros props
  overflow: 'auto',  // ❌ Inválido no Android
  // ...
};
```

**KyteInput.js (linha 152):**
```javascript
input: {
  // ... outros estilos
  overflowY: resize ? 'hidden' : 'auto',  // ❌ overflowY é web-only, 'auto' inválido
}
```

### Código Depois

**Container.js (linha 44):**
```javascript
export const containerDefaultProps = {
  // ... outros props
  overflow: 'visible',  // ✅ Valor padrão do React Native
  // ...
};
```

**KyteInput.js (linha 152):**
```javascript
input: {
  // ... outros estilos
  overflow: 'hidden',  // ✅ Sempre hidden (TextInput já está em ScrollView)
}
```

### Explicação da Correção

1. **Container.js - `overflow: 'visible'`:**
   - `'visible'` é o **valor padrão do React Native**
   - Permite que children sejam renderizados fora dos bounds do container
   - Comportamento esperado para layout scaffolding
   - **Compatível com iOS e Android**

2. **KyteInput.js - `overflow: 'hidden'`:**
   - Corrige **dois problemas** simultaneamente:
     - `overflowY` é propriedade **web-only** (não existe no React Native)
     - `'auto'` é inválido no Android
   - Usa `'hidden'` sempre porque o TextInput já está dentro de um `<ScrollView>`
   - O ScrollView gerencia o scroll, não precisa de overflow
   - **Simplifica lógica:** remove lógica condicional desnecessária

## 📝 Arquivos Modificados

- `kyte-ui-components/src/packages/scaffolding/container/Container.js:44` - Substituído `overflow: 'auto'` por `overflow: 'visible'`
- `kyte-ui-components/src/packages/form/kyte-input/KyteInput.js:152` - Substituído `overflowY: resize ? 'hidden' : 'auto'` por `overflow: 'hidden'`

**Repositório:** kyte-ui-components
**Branch:** `fix/android-overflow-auto-crash`
**Commit:** `4d51a7bd`
**Versão:** v4.0.3 → v4.0.4 (bump necessário após publicação)

**Repositório:** kyte-app
**Arquivo:** `package.json:60`
**Mudança:** `"@kyteapp/kyte-ui-components": "^4.0.3-stage.3"` → `"^4.0.4"`

## 🎯 Benefícios da Correção

1. **Eliminação do Crash FATAL:**
   - Remove 100% dos crashes causados por `overflow: 'auto'`
   - Impacto imediato: 149 usuários não sofrerão mais este crash
   - Previne crashes futuros em todas as telas usando Container

2. **Melhor Experiência do Usuário:**
   - App não fecha inesperadamente ao navegar para telas com Container
   - Usuários conseguem usar funcionalidades críticas (Coupons, Dashboard, etc.)
   - Reduz frustração e potencial churn de usuários

3. **Resiliência:**
   - Código agora usa apenas valores **oficialmente suportados** pelo React Native
   - Compatibilidade garantida com iOS e Android
   - Remove dependência de comportamento não documentado
   - Facilita futuras atualizações do React Native

## 🧪 Como Testar

### Teste 1: Navegação em Telas Principais

**Instruções:**
1. Instalar build com a correção em dispositivo Android físico
2. Navegar para as seguintes telas:
   - Dashboard principal
   - Tela de Cupons/Coupons
   - Product variants
   - Qualquer tela que use componente Container
3. Interagir com elementos da tela (scroll, toque em botões, etc.)

**O que verificar:**
- ✅ App não crasha ao entrar nas telas
- ✅ Containers renderizam corretamente
- ✅ Layout visual permanece inalterado
- ✅ Não aparecem erros no Logcat relacionados a overflow

### Teste 2: KyteInput com Resize

**Instruções:**
1. Abrir tela com campo de texto multiline (ex: notas, comentários)
2. Digitar texto longo que expanda o campo
3. Testar comportamento de resize

**O que verificar:**
- ✅ Campo de texto expande corretamente
- ✅ Scroll funciona dentro do campo
- ✅ Não há clipping visual do texto
- ✅ Não ocorrem crashes durante digitação

### Teste 3: Monitoramento no Crashlytics

**Instruções:**
1. Após release da correção, aguardar 24-48 horas
2. Acessar Firebase Crashlytics Console
3. Buscar Issue ID: `1e0c2cacdf05f9d6884d6a4ac0363c33`

**O que verificar:**
- ✅ **Nenhum novo evento** após o release da correção
- ✅ Gráfico de eventos mostra declínio para zero
- ✅ "Last seen version" permanece em 2.5.1 (não avança para versão corrigida)

## 📅 Data da Correção

**Data:** 2026-01-13

**Versão corrigida:** kyte-app v2.5.2+ (quando usar kyte-ui-components v4.0.4+)

**Versão do kyte-ui-components:** v4.0.4

## 👤 Autor

Correção realizada via análise do Firebase Crashlytics, investigação do código-fonte e validação com React Native documentation.

**Investigação assistida por:** subagent-crashlytics-investigator
**Execução:** Orquestrador (Claude Code)

## 🔗 Referências

- [Random JSApplicationIllegalArgumentException crashes on Android · Issue #21755](https://github.com/facebook/react-native/issues/21755)
- [Android4.4: error while updating property 'overflow' · Issue #26057](https://github.com/facebook/react-native/issues/26057)
- [LayoutShadowNode.java - React Native Source](https://github.com/chowdhary987/react-native/blob/master/ReactAndroid/src/main/java/com/facebook/react/uimanager/LayoutShadowNode.java)
- [Firebase Crashlytics Documentation](https://firebase.google.com/docs/crashlytics)
- [React Native Style Props - View](https://reactnative.dev/docs/view-style-props#overflow)

## 📊 Timeline do Problema

- **2025-12-XX:** kyte-ui-components v4.0.3 publicado com migração getComponentProps (commit a022fc97)
- **2026-01-XX:** kyte-app v2.5.1 atualizado para usar kyte-ui-components v4.0.3-stage.3
- **2026-01-09:** Primeiro crash reportado no Crashlytics (SIGNAL_FRESH)
- **2026-01-13:** Problema investigado e correção implementada
- **2026-01-13:** kyte-ui-components v4.0.3 corrigido (branch fix/android-overflow-auto-crash)
- **Pendente:** Publicação do kyte-ui-components e release do kyte-app v2.5.2

---

**Nota:** Esta correção resolve o problema na biblioteca `kyte-ui-components`, que é compartilhada por múltiplos projetos (kyte-app, kyte-web, etc.). A correção beneficia **todos os projetos** que usam esta biblioteca. Após publicação, recomenda-se atualizar todos os projetos dependentes para a versão corrigida.

**Limitação conhecida:** O valor `overflow: 'scroll'` é tecnicamente válido no React Native 0.67, mas optamos por usar apenas `'visible'` e `'hidden'` por serem os valores mais seguros e amplamente testados. Se necessário usar `'scroll'` no futuro, é seguro fazê-lo explicitamente em componentes específicos.