# Setup Project

Analyze the repository and configure CLAUDE.md and subagents according to the project's technology stack.

## Instructions

This command studies the repository structure, detects technologies, and customizes the orchestrator and **existing subagents** while **preserving all immutable premises**.

---

## IMMUTABLE PREMISES - NEVER MODIFY

These rules are **absolute and cannot be changed** regardless of technology stack:

1. **ORCHESTRATOR IS THE ONLY CODE WRITER**
   - Subagents CANNOT write, edit, or create code files
   - Subagents CANNOT use Write, Edit, or Bash tools
   - Only exception: `subagent-docs-analyst` can write .md, swagger, and storybook files

2. **SUBAGENTS ARE CONSULTIVE ONLY**
   - They analyze, research, plan, and recommend
   - They provide blueprints with exact file paths, line numbers, and code examples
   - The orchestrator executes their recommendations

3. **CONTEXT WINDOW EFFICIENCY**
   - Subagents exist to keep the main context window clean
   - Research and analysis happen in subagent context
   - Orchestrator receives only actionable recommendations

4. **MANDATORY SUBAGENT FLOW (Orchestrator Mode)**
   - Architect → Security → QA → Documentation
   - This sequence is always required for production code

---

## CRITICAL PRINCIPLE: Balance Between Analysis and Execution

### The Equilibrium Rule

```
┌─────────────────────────────────────────────────────────────────────┐
│                    SUBAGENT ECONOMY PRINCIPLE                        │
│                                                                      │
│   More subagents = More analysis time + More context switches        │
│   Fewer subagents = Faster execution + Simpler workflow              │
│                                                                      │
│   GOAL: Minimum subagents needed for maximum quality                 │
└─────────────────────────────────────────────────────────────────────┘
```

### When to CUSTOMIZE existing subagents (PREFERRED)
- Technology-specific best practices → Add to `subagent-solutions-architect`
- Framework security concerns → Add to `subagent-security-analyst`
- Testing patterns for the stack → Add to `subagent-qa`
- Implementation patterns → Add to `subagent-developer`

### When to CREATE new subagents (RARE)
Only create a new subagent when ALL conditions are met:
1. **Domain is vast and complex** (e.g., ML/AI, Mobile platforms, Game engines)
2. **Requires specialized knowledge** that would bloat existing subagents
3. **Will be used frequently** in the project (not one-off tasks)
4. **Cannot be reasonably absorbed** by architect, developer, or security analysts

### Examples

| Scenario | Action | Reasoning |
|----------|--------|-----------|
| Next.js project | Customize architect + developer | RSC patterns fit in existing roles |
| GraphQL API | Customize architect | Schema design is architecture |
| Kubernetes deployment | Customize architect | Infrastructure is architecture |
| AWS services | Customize architect + security | Cloud is arch + security concern |
| ML/AI heavy project | **CREATE** subagent-ml-engineer | Vast domain: models, training, RAG, embeddings |
| React Native + iOS + Android | **CREATE** subagent-mobile-specialist | Platform-specific complexity |
| Game development (Unity/Unreal) | **CREATE** subagent-game-developer | Specialized domain |

---

## Workflow

### Step 1: Detect Project Technologies

Scan the repository for technology indicators:

#### Package Managers & Dependencies
| File | Technology |
|------|------------|
| `package.json` | Node.js / JavaScript / TypeScript |
| `requirements.txt`, `pyproject.toml`, `setup.py` | Python |
| `go.mod` | Go |
| `Cargo.toml` | Rust |
| `pom.xml`, `build.gradle` | Java |
| `Gemfile` | Ruby |
| `composer.json` | PHP |
| `*.csproj`, `*.sln` | .NET / C# |
| `pubspec.yaml` | Dart / Flutter |
| `mix.exs` | Elixir |

#### Frameworks & Libraries (from dependencies)
| Dependency | Framework |
|------------|-----------|
| `react`, `next` | React / Next.js |
| `vue`, `nuxt` | Vue / Nuxt |
| `angular` | Angular |
| `svelte`, `sveltekit` | Svelte |
| `express`, `fastify`, `nest` | Node.js Backend |
| `django`, `flask`, `fastapi` | Python Backend |
| `rails` | Ruby on Rails |
| `laravel` | Laravel PHP |
| `spring` | Spring Boot |
| `gin`, `echo`, `fiber` | Go Backend |
| `prisma`, `drizzle`, `typeorm` | ORM |
| `tailwind` | Tailwind CSS |
| `playwright`, `cypress`, `jest` | Testing |
| `tensorflow`, `pytorch`, `langchain`, `openai` | ML/AI |
| `react-native`, `expo` | Mobile (React Native) |
| `flutter` | Mobile (Flutter) |

#### Infrastructure
| File/Directory | Technology |
|----------------|------------|
| `Dockerfile`, `docker-compose.yml` | Docker |
| `kubernetes/`, `k8s/` | Kubernetes |
| `terraform/`, `*.tf` | Terraform |
| `.github/workflows/` | GitHub Actions |

### Step 2: Ask User for Confirmation

After detecting technologies, use AskUserQuestion to confirm:

```
"I detected the following technologies in your project:

[List detected technologies]

Is this correct? Should I add or remove any technologies from this list?"

Options:
- Correct, proceed
- Let me add/remove technologies
```

### Step 3: Update CLAUDE.md with Technology Context

Add a technology section to CLAUDE.md with framework-specific guidelines.

#### 3.1 Add Technology Stack Section

After the `## Context Isolation` section, add:

```markdown
---

## Project Technology Stack

### Detected Technologies
- [Primary language]: [version if detectable]
- [Framework]: [version if detectable]
- [Database/ORM]: [type]
- [Testing]: [tools]
- [Infrastructure]: [tools]

### Build & Development Commands
| Command | Purpose |
|---------|---------|
| `[cmd]` | [purpose] |

### Directory Structure
| Directory | Purpose |
|-----------|---------|
| `[dir]` | [purpose] |
```

#### 3.2 Add Framework-Specific Guidelines

Based on detected framework, add relevant guidelines (see Technology Templates section below).

### Step 4: Customize EXISTING Subagents

**This is the primary action.** Update existing subagent files to include technology-specific knowledge.

#### 4.1 Update `subagent-solutions-architect.md`

Add a section for the detected stack:

```markdown
## [Framework] Architecture Guidelines

### Patterns to Follow
- [Pattern 1]
- [Pattern 2]

### Anti-patterns to Avoid
- [Anti-pattern 1]
- [Anti-pattern 2]

### Key Architectural Decisions for [Framework]
- [Decision point 1]: [recommended approach]
- [Decision point 2]: [recommended approach]
```

#### 4.2 Update `subagent-security-analyst.md`

Add security concerns for the stack:

```markdown
## [Framework] Security Considerations

### Common Vulnerabilities
- [Vulnerability 1]: [mitigation]
- [Vulnerability 2]: [mitigation]

### Security Best Practices
- [Practice 1]
- [Practice 2]
```

#### 4.3 Update `subagent-qa.md`

Add testing patterns for the stack:

```markdown
## [Framework] Testing Guidelines

### Unit Testing
- Tool: [tool name]
- Patterns: [patterns]

### Integration Testing
- Approach: [approach]

### E2E Testing
- Tool: [tool name]
- Key scenarios: [scenarios]
```

#### 4.4 Update `subagent-developer.md`

Add implementation patterns:

```markdown
## [Framework] Implementation Patterns

### Code Organization
- [Pattern]

### Common Tasks
- [Task 1]: [approach]
- [Task 2]: [approach]
```

### Step 5: Evaluate Need for NEW Subagents (Rare)

Check if the project requires a specialized subagent based on the criteria above.

#### Domains that MAY warrant new subagents:

| Domain | Subagent | Create if... |
|--------|----------|--------------|
| ML/AI | `subagent-ml-engineer` | Project has model training, RAG, embeddings, or heavy LLM integration |
| Mobile | `subagent-mobile-specialist` | Project targets iOS + Android with platform-specific needs |
| Game Dev | `subagent-game-developer` | Unity, Unreal, or custom game engine |
| Blockchain | `subagent-blockchain-analyst` | Smart contracts, DeFi, Web3 |

#### If a new subagent is warranted:

1. **Confirm with user:**
   ```
   "Your project has significant [domain] complexity.

   I recommend creating a specialized `subagent-[name]` because:
   - [Specific reason 1]
   - [Specific reason 2]

   This subagent would handle: [specific responsibilities]

   Without it, the existing subagents would need to cover this vast domain,
   potentially reducing analysis quality.

   Should I create it?"
   ```

2. **If confirmed, call:**
   ```
   /create-subagent [name]
   ```

3. **If declined:** Add basic guidance to `subagent-solutions-architect` instead.

---

## Technology-Specific Templates

### Next.js / React Project

**Add to CLAUDE.md:**
```markdown
## Next.js Guidelines

### App Router Patterns
- Server Components by default
- 'use client' only when necessary
- Server Actions for mutations
- Proper caching (revalidate, tags)

### Commands
| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm test` | Run tests |
| `npm run lint` | ESLint |
```

**Add to `subagent-solutions-architect.md`:**
```markdown
## Next.js Architecture

### Server vs Client Components
- Default to Server Components
- Use Client Components for: interactivity, browser APIs, state, effects

### Data Fetching
- Server Components: async/await directly
- Route Handlers for API endpoints
- Server Actions for mutations

### Caching Strategy
- `revalidate` for time-based
- `revalidateTag` for on-demand
- `no-store` for dynamic data
```

### Python / FastAPI Project

**Add to CLAUDE.md:**
```markdown
## Python/FastAPI Guidelines

### Commands
| Command | Purpose |
|---------|---------|
| `uvicorn app.main:app --reload` | Dev server |
| `pytest` | Run tests |
| `ruff check .` | Linting |
| `mypy .` | Type checking |
```

**Add to `subagent-solutions-architect.md`:**
```markdown
## FastAPI Architecture

### Project Structure
- `app/api/` - Route handlers
- `app/models/` - Pydantic models
- `app/services/` - Business logic
- `app/repositories/` - Data access

### Patterns
- Dependency injection via `Depends()`
- Pydantic for validation
- Async by default for I/O
```

### Go Project

**Add to CLAUDE.md:**
```markdown
## Go Guidelines

### Commands
| Command | Purpose |
|---------|---------|
| `go run ./cmd/...` | Run application |
| `go test ./...` | Run tests |
| `golangci-lint run` | Linting |
| `go mod tidy` | Clean deps |
```

**Add to `subagent-solutions-architect.md`:**
```markdown
## Go Architecture

### Standard Layout
- `cmd/` - Main applications
- `internal/` - Private code
- `pkg/` - Public libraries

### Patterns
- Accept interfaces, return structs
- Table-driven tests
- Error wrapping with context
```

---

## Final Checklist

- [ ] Repository scanned for technologies
- [ ] Technologies confirmed with user
- [ ] CLAUDE.md updated with technology context
- [ ] `subagent-solutions-architect.md` customized for stack
- [ ] `subagent-security-analyst.md` customized for stack
- [ ] `subagent-qa.md` customized for stack
- [ ] `subagent-developer.md` customized for stack
- [ ] Evaluated if new subagent truly needed (probably not)
- [ ] All immutable premises preserved
- [ ] Balance principle maintained (minimum subagents, maximum quality)

---

## Example Execution

```
User: /setup-project

Agent: [Scans repository]
       "I detected the following technologies:
        - TypeScript
        - Next.js 14 (App Router)
        - Prisma ORM
        - Tailwind CSS
        - Jest + Playwright
        - Docker

        Is this correct?"

User: Yes, correct

Agent: [Updates CLAUDE.md with Next.js guidelines and commands]
       [Updates subagent-solutions-architect.md with Next.js patterns]
       [Updates subagent-security-analyst.md with Next.js security concerns]
       [Updates subagent-qa.md with Next.js testing patterns]
       [Updates subagent-developer.md with Next.js implementation patterns]

       "Setup complete! I customized your existing subagents for Next.js:

        - solutions-architect: Added RSC patterns, caching strategies
        - security-analyst: Added Next.js security concerns
        - qa: Added Jest/Playwright patterns for Next.js
        - developer: Added implementation patterns

        No new subagents needed - the existing team can handle this stack."
```

### Example with ML Project

```
User: /setup-project

Agent: [Scans repository]
       "I detected the following technologies:
        - Python 3.11
        - FastAPI
        - LangChain + OpenAI
        - Pinecone (vector DB)
        - PyTorch
        - Docker

        Is this correct?"

User: Yes

Agent: "Your project has significant ML/AI complexity with:
        - LLM integration (LangChain + OpenAI)
        - Vector database (Pinecone)
        - Model framework (PyTorch)

        I recommend creating `subagent-ml-engineer` because:
        - RAG patterns require specialized knowledge
        - Embedding strategies are complex
        - Model optimization is a vast domain

        Without it, the architect would need to cover all this,
        reducing analysis depth.

        Should I create it?"

User: Yes

Agent: [Calls /create-subagent ml-engineer]
       [Updates CLAUDE.md]
       [Updates existing subagents with FastAPI patterns]

       "Setup complete! Created subagent-ml-engineer for ML domain.
        Existing subagents customized for FastAPI."
```

---

## Summary: The Equilibrium Principle

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                      │
│   CUSTOMIZE existing subagents  >>>  CREATE new subagents           │
│                                                                      │
│   The goal is NOT to have a subagent for every technology.          │
│   The goal IS to have well-informed subagents that can handle       │
│   the project's stack efficiently.                                   │
│                                                                      │
│   architect + security + qa + developer = enough for 90% of stacks  │
│                                                                      │
│   New subagent only when domain is VAST, COMPLEX, and FREQUENT      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```
