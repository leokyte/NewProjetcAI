# Crashlytics Fix Workflow Guide

## Overview

The Crashlytics fix workflow has been split into two specialized subagents for better focus and maintainability:

1. **`subagent-crashlytics-investigator`** - Investigation Phase
2. **`subagent-crashlytics-documenter`** - Documentation Phase (Changelog + Azure DevOps Card)

**Note:** Pull Request creation is currently done manually in Azure DevOps UI (azdo-mcp integration pending).

## Workflow

```
User Request
    │
    ▼
subagent-crashlytics-investigator
    │ (Lists crashes, verifies duplicates, investigates, returns blueprint)
    ▼
Orchestrator
    │ (Implements the code fix based on blueprint)
    ▼
subagent-crashlytics-documenter
    │ (Creates changelog + Azure DevOps card)
    ▼
Complete
```

## Phase 1: Investigation

### subagent-crashlytics-investigator

**What it does:**
1. Lists top FATAL crashes from Firebase Crashlytics
2. Verifies if crash was already resolved (checks `docs/changelog/`)
3. Investigates root cause (stack traces, code analysis)
4. Designs a fix blueprint with exact code changes
5. Returns blueprint to orchestrator

**What it returns:**
- Exact file paths to modify
- Exact line numbers
- Complete BEFORE/AFTER code snippets
- Step-by-step implementation instructions
- Validation checklist

**What it does NOT do:**
- Does NOT write code
- Does NOT create changelog
- Does NOT create Azure DevOps card
- Does NOT create PR

### How to Use

Call the investigator subagent:
```
@subagent-crashlytics-investigator

Investigate the top FATAL crash from Crashlytics and provide a fix blueprint.
```

Or specify a crash:
```
@subagent-crashlytics-investigator

Investigate crash with Issue ID: abc123def456 and provide a fix blueprint.
```

### What Orchestrator Does After

After receiving the blueprint from the investigator:

1. **Implement the fix** following the blueprint exactly:
   - Open the specified files
   - Navigate to specified line numbers
   - Replace code with provided AFTER snippets
   - Add error logging as specified

2. **Validate the implementation:**
   - Run linting: `npm run lint`
   - Test affected areas
   - Verify no compilation errors

3. **Commit changes:**
   - Commit to current branch
   - Use descriptive commit message

4. **Confirm completion:**
   - Inform the documenter subagent that implementation is complete

## Phase 2: Documentation

### subagent-crashlytics-documenter

**What it does:**
1. Verifies orchestrator completed implementation
2. Creates changelog in `docs/changelog/`
3. Asks user for team/area information
4. Creates Azure DevOps Bug card
5. Populates all card fields (Description, ReproSteps, SystemInfo)
6. Adds initial comment to card
7. Provides final summary with instructions to create PR manually

**What it creates:**
- Changelog file in `docs/changelog/`
- Azure DevOps Bug card (via azure-devops-official MCP)
- Complete documentation and links

### How to Use

Call the documenter subagent after orchestrator implements the fix:
```
@subagent-crashlytics-documenter

The fix has been implemented and committed. Please create the changelog, Azure DevOps card, and pull request.
```

The documenter will ask you:
- Which team should receive the card?
- Which project area?

Then it will handle everything else automatically.

## Complete Example

### Step 1: Start Investigation

```
User: @subagent-crashlytics-investigator
      Investigate the top FATAL crash and provide fix blueprint.

Investigator: [Lists crashes]
              [Verifies no duplicates in docs/changelog/]
              [Investigates Issue ID: abc123]
              [Provides blueprint with exact code changes]

              ## Fix Blueprint for "Null pointer in UserProfile"

              ### Files to Modify
              #### File: src/screens/UserProfile.js:45

              BEFORE:
              ```javascript
              const userName = user.profile.name;
              ```

              AFTER:
              ```javascript
              const userName = user?.profile?.name || 'Unknown User';
              ```

              ### Implementation Steps
              1. Open src/screens/UserProfile.js
              2. Navigate to line 45
              3. Replace code as shown
              4. Run linting
              5. Test profile screen
```

### Step 2: Orchestrator Implements

```
Orchestrator: [Opens src/screens/UserProfile.js]
              [Edits line 45 with the new code]
              [Runs npm run lint]
              [Tests the profile screen]
              [Commits changes: "fix(crashlytics): Add null check for user.profile.name"]

              Implementation complete. Fix has been committed.
```

### Step 3: Create Documentation

```
User: @subagent-crashlytics-documenter
      The fix has been implemented and committed. Create changelog and Azure DevOps card.

Documenter: Which team should receive this card?
            (Options: Horizon Lab, Frontline, etc.)

User: Horizon Lab

Documenter: Which project area?

User: Kyte\Horizon Lab

Documenter: [Creates changelog: docs/changelog/crashlytics-null-pointer-userprofile-fix.md]
            [Creates Azure DevOps Bug card AB#12345]
            [Populates all fields with crash details]

            ## Crashlytics Fix Documentation Complete

            ### Azure DevOps Card
            - ID: AB#12345
            - URL: https://dev.azure.com/kyte/Kyte/_workitems/edit/12345

```

## Benefits of Two-Subagent Approach

### Separation of Concerns
- **Investigator** focuses on crash analysis and fix design
- **Documenter** focuses on changelog, cards, and PRs
- Each subagent has a clear, focused responsibility

### Better Context Management
- Investigator doesn't carry heavy documentation templates
- Documenter doesn't carry heavy investigation details
- More efficient token usage

### Clear Handoff Points
- Investigator → Orchestrator: Blueprint
- Orchestrator → Documenter: Implementation confirmation
- No ambiguity about who does what

### Easier Maintenance
- Each subagent is simpler (~200 lines vs 375 lines)
- Easier to update documentation workflows independently
- Easier to update investigation workflows independently

### Reusability
- Investigator can be used for crash analysis without documentation
- Documenter can be used for any implemented fix (not just crashes)

## MCP Servers Used

### subagent-crashlytics-investigator
- **Firebase Crashlytics MCP**: Query crashes, get stack traces
- **kyte-agent-mcp**: Read tasks and templates for best practices
- **Code analysis tools**: Grep, Glob, Read

### subagent-crashlytics-documenter
- **azure-devops-official MCP**: Create and update Azure DevOps cards
- **kyte-agent-mcp**: Read changelog templates
- **File operations**: Write, Edit (for .md files only)


## Troubleshooting

### Investigator says crash was already resolved
- Check `docs/changelog/` for existing fix
- Decide: choose another crash, review previous fix, or proceed anyway

### Orchestrator didn't implement the fix correctly
- Review blueprint again
- Check validation steps
- Run linting and tests
- Don't call documenter until fix is complete

### Documenter asks for confirmation
- Ensure you ran linting: `npm run lint`
- Ensure you tested affected areas
- Ensure you committed changes to the branch
- Confirm explicitly that implementation is complete



## Reference Files

- **Investigation workflow**: `tasks/fix-crashlytics-issue.yaml` in kyte-agent-mcp
- **Azure DevOps fields**: `tasks/azure-devops-create-crash-card-task.yaml` in kyte-agent-mcp
- **Changelog template**: `templates/crashlytics-fix-changelog.md` in kyte-agent-mcp
- **Original prompt**: `docs/prompts/investigate-and-document-crashlytics-crash.md`
