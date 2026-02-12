# Prompt: Investigar, Documentar e Corrigir Crash do Crashlytics

> **⚠️ INSTRUÇÃO PARA O AGENTE:** Quando este arquivo for mencionado ou referenciado, você DEVE EXECUTAR as instruções abaixo imediatamente, não revisar ou editar este arquivo. Este é um prompt de execução, não um documento para análise.

Use este prompt para investigar crashes frequentes do Crashlytics, seguir as instruções do kyte-agent-mcp, criar/documentar um card no Azure DevOps **E IMPLEMENTAR A CORREÇÃO NO PROJETO kyte-app**. A correção é parte obrigatória deste workflow.

## Prompt Completo

```
**EXECUTE ESTAS INSTRUÇÕES AGORA:**

Preciso que você faça o seguinte:

1. **Consultar Crashes Frequentes no Crashlytics:**
   - Use o Firebase Crashlytics MCP para listar os top crashes FATAL que ainda estão abertos (OPEN)
   - Filtre por `issueErrorTypes: ['FATAL']` para focar em crashes críticos
   - Apresente os crashes com suas estatísticas (eventos, usuários afetados, versões, sinais)
   - Se eu não especificar qual crash, escolha o mais crítico baseado em:
     * Alto número de eventos
     * Muitos usuários afetados
     * Stack traces claros apontando para código do app
     * Issues fixáveis (não problemas de SDKs de terceiros)

1.5. **⚠️ VERIFICAR SE O CRASH JÁ FOI RESOLVIDO (ANTES DE PROSSEGUIR):**
   - **IMPORTANTE:** Antes de investigar ou corrigir um crash, verifique se ele já foi resolvido anteriormente:
     * Liste todos os arquivos em `docs/changelog/` usando `list_dir` ou `glob_file_search`
     * Para cada arquivo `.md` no diretório `docs/changelog/`, leia o conteúdo e extraia o **Issue ID** do Crashlytics
     * O Issue ID geralmente aparece na seção "Link do Problema no Crashlytics" com o formato: `**Issue ID:** \`{issue_id}\``
     * Compare o Issue ID do crash selecionado com os Issue IDs encontrados nos changelogs
     * Se encontrar correspondência:
       - Informe ao usuário que este crash já foi resolvido anteriormente
       - Mostre o link para o changelog existente
       - Pergunte se deseja:
         a) Escolher outro crash da lista
         b) Revisar a correção anterior (caso o crash ainda esteja ocorrendo)
         c) Prosseguir mesmo assim (caso seja uma nova ocorrência ou correção adicional)
     * Se NÃO encontrar correspondência, prossiga normalmente com a investigação
   - **Esta verificação evita trabalho duplicado e garante que crashes já resolvidos não sejam tratados novamente.**

2. **Consultar Instruções do kyte-agent-mcp:**
   - Acesse o kyte-agent-mcp e obtenha:
     * A task `fix-crashlytics-issue.yaml` para entender o workflow de correção
     * A task `azure-devops-create-crash-card-task.yaml` para entender o formato dos campos do Azure DevOps
     * O template `crashlytics-fix-changelog.md` para entender o formato de documentação
     * Qualquer checklist ou guia relacionado a correção de crashes
   - Siga essas instruções durante a investigação e correção

3. **Investigar o Crash:**
   - Use `mcp_firebase_crashlytics_get_issue` para obter detalhes completos do crash selecionado
   - Use `mcp_firebase_crashlytics_list_events` ou `mcp_firebase_crashlytics_batch_get_events` para obter stack traces completos
   - Mapeie o crash para o código-fonte usando `codebase_search` e `grep`
   - Identifique a causa raiz:
     * Qual linha/função causa o crash?
     * Quando ocorre? (inicialização, ação específica, etc.)
     * Quais condições o disparam? (dispositivo, OS, estado do app)
     * Há padrões similares em outros lugares?

4. **⚠️ CORRIGIR O CRASH (OBRIGATÓRIO - ANTES DE CRIAR O CARD):**
   - **IMPORTANTE:** Esta etapa é OBRIGATÓRIA e deve ser executada ANTES de criar o card no Azure DevOps.
   - Siga o workflow de correção do kyte-agent-mcp (`fix-crashlytics-issue.yaml`):
     * Revise os padrões do projeto kyte-app (agents/task-rules.md e AGENTS.md)
     * Projete uma correção segura e mínima:
       - Considere: null checks, initialization checks, error handling
       - Planeje fallbacks para degradação graciosa
       - Garanta que a correção não quebre funcionalidades existentes
     * Implemente a correção seguindo os padrões do projeto:
       - Modifique apenas os arquivos necessários
       - Adicione verificações defensivas (null checks, initialization)
       - Use blocos try-catch onde apropriado
       - Adicione logging de erros adequado usando logError da Firebase Integration
       - Siga o estilo de código do projeto
     * Valide a correção:
       - Verifique erros de linting
       - Verifique se o código compila
       - Revise funcionalidades relacionadas para garantir que nada quebrou
   - **NÃO pare apenas na investigação e documentação. A correção é parte essencial deste workflow.**

5. **Gerar Changelog (ANTES DE CRIAR O CARD):**
   - **IMPORTANTE:** O changelog deve ser gerado ANTES de criar o card no Azure DevOps, para que o card possa referenciá-lo.
   - Crie um arquivo em `docs/changelog/` seguindo o formato `crashlytics-{issue-title-slug}-fix.md`
   - Use o template `crashlytics-fix-changelog.md` do kyte-agent-mcp como referência
   - Inclua:
     * Issue ID e URL do Firebase Console
     * Estatísticas (eventos, usuários, versões, sinais)
     * Análise da causa raiz
     * Solução implementada (código antes/depois)
     * Arquivos modificados
     * Instruções de teste
     * Benefícios da correção
   - **Este changelog será referenciado no card do Azure DevOps.**

6. **Criar Card no Azure DevOps:**
   - **IMPORTANTE:** Antes de criar o card, pergunte ao usuário:
     * Qual time deve receber este card? (ex: "Horizon Lab", "Frontline", etc.)
     * Qual área do projeto? (ex: "Kyte\\Horizon Lab", etc.)
   - Use o Azure DevOps MCP para criar um card do tipo "Bug"
   - Configure os campos básicos:
     * Título: `[Crash FATAL] {Título Descritivo} - {Resumo do Problema}`
     * Projeto: `Kyte`
     * Área: Use a área informada pelo usuário (formato: `Kyte\{Time}`)
     * Prioridade: `2` (FATAL) ou `3` (não-FATAL)
     * Severidade: `3 - Medium`
     * Tags: `crashlytics`, `fatal`, plataforma (android/ios), módulo afetado
     * Build Fields:
       - `FoundIn`: Versões afetadas
       - `IntegrationBuild`: Versão onde será corrigido (ou "A corrigir")

7. **Preencher Descrição do Card (System.Description):**
   - Use Markdown formatado
   - Inclua:
     * Link do Crashlytics (Issue ID + URL do Firebase Console)
     * Estatísticas do problema (eventos, usuários, versões, sinais)
     * Descrição detalhada do problema (causa raiz, impacto)
     * Quando ocorre o crash
     * Dispositivos e áreas afetadas
     * Stack trace completo
     * **Link para o changelog gerado** (referência ao arquivo em `docs/changelog/`)
     * Referências e links relevantes

8. **Preencher Repro Steps (Microsoft.VSTS.TCM.ReproSteps):**
   - Use HTML formatado com quebras de linha (`\n`)
   - Inclua:
     * Passos para reproduzir (lista ordenada)
     * Quando ocorre (momento, frequência, timing)
     * Dispositivos afetados (plataforma, versões, usuários)
     * Área do app (módulo, funções, inicialização)
   - Use estrutura HTML: `<h2>`, `<ol>`, `<ul>`, `<code>`, `<strong>`

9. **Preencher System Info (Microsoft.VSTS.TCM.SystemInfo):**
   - Use HTML formatado com hierarquia
   - Inclua:
     * Ambiente e dispositivos afetados
     * Versões do app afetadas
     * Dispositivos
     * Condições de ocorrência
     * Área do app afetada
     * Stack trace completo (use `<pre><code>`)

10. **Adicionar Comentário Inicial:**
   - Adicione um comentário no card descrevendo:
     * Resumo da investigação realizada
     * Causa raiz identificada
     * **Solução já implementada** (com referência ao changelog)
     * Arquivos modificados
     * Como a correção resolve o problema
     * Validação realizada
     * Referências (links para Crashlytics, changelog, código-fonte, etc.)
   - Use Markdown formatado
   - **Nota:** Como a correção já foi implementada antes de criar o card, este comentário deve incluir informações completas sobre a solução.

11. **Atualizar Card com Informações da Correção (se necessário):**
    - Se houver informações adicionais após a criação do card, atualize o comentário ou adicione um novo comentário
    - Atualize o campo `Microsoft.VSTS.Build.IntegrationBuild` com a versão onde a correção será incluída (ou mantenha "A corrigir" se ainda não definido)

12. **Fornecer Resumo Final:**
    - Ao final, forneça:
      * ID do card criado no Azure DevOps
      * URL do card
      * Resumo do crash investigado
      * Correção implementada (arquivos modificados, mudanças realizadas)
      * Próximos passos recomendados (testes, validação, monitoramento)

Siga as instruções do kyte-agent-mcp e use a task `azure-devops-create-crash-card-task.yaml` do kyte-agent-mcp como referência para formatação dos campos do card. 

**⚠️ ORDEM OBRIGATÓRIA DAS ETAPAS:**
1. Listar crashes do Crashlytics (passo 1)
2. **VERIFICAR se o crash já foi resolvido** (passo 1.5) - Consultar `docs/changelog/` antes de prosseguir
3. Investigar o crash (passo 3) - Apenas se não foi resolvido anteriormente
4. **CORRIGIR o crash** (passo 4) - OBRIGATÓRIO antes de criar o card
5. **GERAR CHANGELOG** (passo 5) - OBRIGATÓRIO antes de criar o card
6. Criar e preencher card no Azure DevOps (passos 6-10) - Agora com referência ao changelog
7. Resumo final (passo 12)

**Lembre-se: investigar, CORRIGIR, gerar changelog E documentar no Azure DevOps são todas partes obrigatórias deste workflow, nesta ordem.**
```

### Variações

**Para investigar um crash específico:**
Adicione ao final do prompt:
```
Crash específico para investigar:
- Issue ID: {issue_id}
- Ou: Escolha o crash #X da lista
```

**Para especificar time/área antecipadamente:**
Adicione ao final do prompt:
```
Time: Horizon Lab
Área: Kyte\Horizon Lab
```

**Nota:** Se não especificar, o prompt perguntará qual time/área usar antes de criar o card.

**⚠️ IMPORTANTE:** Este prompt inclui a correção como parte obrigatória. O agente DEVE seguir esta ordem:

1. Listar crashes do Crashlytics (passo 1)
2. **VERIFICAR se o crash já foi resolvido** (passo 1.5) - Consultar `docs/changelog/` e comparar Issue IDs
3. Investigar o crash (passo 3) - Apenas se não foi resolvido anteriormente
4. **IMPLEMENTAR A CORREÇÃO NO PROJETO kyte-app** (passo 4) - OBRIGATÓRIO, antes de criar o card
5. **GERAR CHANGELOG** (passo 5) - OBRIGATÓRIO, antes de criar o card
6. Criar e preencher o card no Azure DevOps (passos 6-10) - Com referência ao changelog já gerado
7. Resumo final (passo 12)

- Este prompt segue o workflow definido em `tasks/fix-crashlytics-issue.yaml` do kyte-agent-mcp
- A formatação dos campos do Azure DevOps segue a task `azure-devops-create-crash-card-task.yaml` do kyte-agent-mcp
- **A correção e o changelog são partes obrigatórias do workflow e devem ser implementados ANTES de criar o card no Azure DevOps**
- O agente não deve parar apenas na investigação/documentação - deve prosseguir automaticamente para a correção, depois gerar o changelog, e só então criar o card
