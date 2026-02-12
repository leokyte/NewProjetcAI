# Kyte-App Development Guidelines

## 🎯 Primary Directive

**Before implementing ANY feature or task in this project, you MUST:**

1. **Access the `kyte-agent-mcp` MCP server** to retrieve relevant guidelines, patterns, and checklists
2. **Follow the established patterns** documented in the MCP resources
3. **Validate your implementation** against the project-specific checklists

## 📡 MCP Integration

This project relies on the **kyte-agent-mcp** Model Context Protocol server for:

- **Development patterns** and best practices
- **Architecture guidelines** specific to kyte-app
- **Quality checklists** for validation
- **Templates** for common tasks
- **Agent workflows** for feature delivery

### How to Use the MCP

```
1. List available resources:
   Use the MCP to discover agents, checklists, templates, and data

2. Retrieve specific guidelines:
   - For React Native patterns: Get 'data/react-native.md'
   - For development rules: Get 'checklists/kyte-app-development-rules.yaml'
   - For native delivery: Get 'checklists/native-delivery-checklist.yaml'
   - For core quality: Get 'checklists/core-delivery-checklist.yaml'

3. Follow agent workflows:
   - Planner Agent: For feature planning
   - Developer Agent: For implementation
   - QA Agent: For validation
```

## ⚠️ Critical kyte-app Rules

### 🔴 ALWAYS (Non-negotiable)

- **File Extension**: Create ALL new components as `.tsx` (TypeScript), NEVER `.js`
- **Redux Pattern**: Use `connect()` with `mapStateToProps`/`mapDispatchToProps` - NEVER `useDispatch()`/`useSelector()`
- **Internationalization**: Use `I18n.t()` for all user-facing strings - NEVER hardcode text
- **Test IDs**: Use `generateTestID()` for all interactive elements (Detox E2E)
- **Analytics**: Track screen views and key actions with `logEvent()`
- **UI Components**: Import directly from `@kyteapp/kyte-ui-components`

### 🔴 NEVER

- Create `.js` files for new components (TypeScript migration in progress)
- Use Redux hooks (`useDispatch`, `useSelector`) - this is a web pattern, not kyte-app
- Hardcode user-facing strings in JSX
- Skip test IDs on buttons, inputs, or touchables
- Ignore analytics tracking for user actions

## 🚀 Feature Development Workflow

### Step 1: Planning (Use MCP)
```
1. Access 'agents/planner.md' via MCP
2. Follow the context gathering checklist
3. Review kyte-app specific considerations
4. Create acceptance criteria using the template
```

### Step 2: Implementation (Use MCP)
```
1. Access 'agents/developer.md' via MCP
2. Review 'data/react-native.md' for code patterns
3. Implement following kyte-app conventions:
   - Traditional Redux (connect)
   - TypeScript (.tsx)
   - generateTestID()
   - I18n.t()
   - logEvent()
4. Validate against 'checklists/kyte-app-development-rules.yaml'
```

### Step 3: Quality Validation (Use MCP)
```
1. Access 'agents/qa.md' via MCP
2. Run 'checklists/core-delivery-checklist.yaml'
3. Run 'checklists/native-delivery-checklist.yaml'
4. Verify iOS and Android compatibility
5. Confirm Detox E2E tests pass
```

## 📋 Quick Validation Checklist

Before committing, verify:

- [ ] ✓ File is `.tsx` (not `.js`)
- [ ] ✓ Uses `connect(mapStateToProps, mapDispatchToProps)`
- [ ] ✓ No `useDispatch()` or `useSelector()` hooks
- [ ] ✓ All strings use `I18n.t()`
- [ ] ✓ All interactive elements have `generateTestID()`
- [ ] ✓ Screen view tracked with `logEvent()`
- [ ] ✓ Key actions tracked with `logEvent()`
- [ ] ✓ TypeScript types explicitly defined
- [ ] ✓ No TypeScript errors
- [ ] ✓ No ESLint errors (max 7 warnings)

## 🔗 Key MCP Resources

| Resource | Purpose | When to Use |
|----------|---------|-------------|
| `data/react-native.md` | Complete React Native patterns | Before writing any component |
| `checklists/kyte-app-development-rules.yaml` | Critical rules & validation | During and after development |
| `checklists/native-delivery-checklist.yaml` | Native-specific quality gate | Before committing |
| `checklists/core-delivery-checklist.yaml` | Universal quality standards | Final validation |
| `agents/developer.md` | Implementation guidelines | During feature development |
| `agents/qa.md` | Testing and validation | After implementation |
| `templates/developer-qa-handover.md` | Handover documentation | When completing features |

## 🎓 Learning from Mistakes

Common mistakes agents make in kyte-app:

1. **Creating `.js` files** → Always use `.tsx`
2. **Using Redux hooks** → Use `connect()` instead
3. **Hardcoding strings** → Use `I18n.t()`
4. **Missing test IDs** → Add `generateTestID()` everywhere
5. **No analytics** → Track with `logEvent()`

## 📞 When in Doubt

1. **Check the MCP first** - it has the answers
2. **Follow existing patterns** - consistency is key
3. **Ask for clarification** - better than guessing

---

**Remember**: The `kyte-agent-mcp` is your source of truth. Always consult it before making assumptions about patterns, architecture, or quality standards.

