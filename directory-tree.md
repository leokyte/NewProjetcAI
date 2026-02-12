# Project Directory Tree

> Last updated: 2026-02-04 09:30 (UTC-3)
>
> This is the SINGLE SOURCE OF TRUTH for project structure.
> All documentation files should reference this file instead of duplicating the tree.

## Structure

```
kyte-pos/
├── .bundle/                  # Ruby bundler configuration
├── .claude/                  # Claude Code orchestrator configuration
│   ├── agents/               # Subagent definitions
│   │   ├── subagent-backend-architect.md
│   │   ├── subagent-crashlytics-documenter.md
│   │   ├── subagent-crashlytics-investigator.md
│   │   ├── subagent-docs-analyst.md
│   │   ├── subagent-frontend-architect.md
│   │   ├── subagent-mobile-architect.md
│   │   ├── subagent-qa-backend.md
│   │   ├── subagent-qa-frontend.md
│   │   ├── subagent-qa-mobile.md
│   │   └── subagent-security-analyst.md
│   ├── commands/             # Custom commands
│   ├── CLAUDE.md             # Orchestrator configuration
│   ├── settings.json         # Claude settings
│   └── settings.local.json   # Local overrides
├── agents/                   # Legacy agent definitions
│   ├── documentation-specialist.md
│   ├── task-rules.md
│   └── ui-developer.md
├── android/                  # Android native project
│   ├── app/                  # Main Android application
│   │   └── src/              # Android source code
│   ├── codegen/              # React Native codegen output
│   └── gradle/               # Gradle wrapper
├── assets/                   # Static assets
│   ├── animations/           # Lottie animations
│   ├── fonts/                # Custom fonts
│   └── images/               # Image assets
│       ├── app-services/
│       ├── catalog/
│       ├── common/
│       ├── coupons/
│       ├── customer_account/
│       ├── gateways/
│       ├── institutional-pix-layer/
│       ├── messages/
│       ├── migration-notice/
│       ├── onboarding_carousel/
│       ├── payment-brands/
│       ├── payment-methods-helper/
│       ├── receipt/
│       ├── shipping-fees/
│       ├── social-media/
│       ├── sounds/
│       └── variants/
├── docs/                     # Project documentation
│   ├── _@examples/           # Documentation examples
│   ├── _features/            # Feature-specific documentation
│   │   └── customer-account/
│   ├── api/                  # API documentation
│   ├── changelog/            # Change logs
│   │   └── crashlytics-fixes/
│   ├── common/               # Common component docs
│   ├── plans/                # Implementation plans
│   ├── prompts/              # AI prompt templates
│   ├── services/             # Service documentation
│   ├── subscription/         # Subscription feature docs
│   ├── architecture.md       # System architecture
│   ├── crashlytics-v3.0.0-fix-plan.md
│   ├── crashlytics-workflow-guide.md
│   ├── developer-guide.md    # Developer guide
│   ├── ios-dependency-audit.md
│   ├── quick-start.md        # Quick start guide
│   ├── react-native-android-upgrade-notes.md
│   ├── rn-update-test-id.md
│   └── troubleshooting.md    # Troubleshooting guide
├── hermes-engine/            # Hermes JavaScript engine
│   └── destroot/
│       ├── bin/
│       ├── include/
│       └── Library/
├── ios/                      # iOS native project
│   ├── ar.lproj/             # Arabic localization
│   ├── en.lproj/             # English localization
│   ├── es.lproj/             # Spanish localization
│   ├── hi-IN.lproj/          # Hindi localization
│   ├── id.lproj/             # Indonesian localization
│   ├── ko.lproj/             # Korean localization
│   ├── pt-BR.lproj/          # Portuguese (Brazil) localization
│   ├── kyte/                 # Main iOS app target (POS)
│   │   ├── Base.lproj/
│   │   └── Images.xcassets/
│   ├── KyteCatalog/          # Catalog app target
│   │   ├── en.lproj/
│   │   ├── es.lproj/
│   │   ├── pt-BR.lproj/
│   │   └── Images.xcassets/
│   ├── kyte.xcodeproj/       # Xcode project
│   │   ├── xcshareddata/
│   │   └── xcuserdata/
│   ├── OneSignalNotificationServiceExtension/
│   ├── Localization.bundle/
│   └── patches/              # iOS-specific patches
├── patches/                  # NPM package patches
├── scripts/                  # Build and utility scripts
├── src/                      # Application source code
│   ├── components/           # React components
│   │   ├── account/
│   │   ├── analytics/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── config/
│   │   ├── coupons/
│   │   ├── current-sale/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── help-center/
│   │   ├── onboarding/
│   │   ├── permissions/
│   │   ├── plans/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── smart-assistant/
│   │   ├── statistics/
│   │   ├── subscription/
│   │   └── users/
│   ├── constants/            # Application constants
│   ├── enums/                # Enumerations
│   ├── hooks/                # Custom React hooks
│   ├── i18n/                 # Internationalization
│   │   └── langs/            # Language files
│   ├── integrations/         # Third-party integrations
│   │   ├── AppsFlyer/
│   │   ├── Facebook/
│   │   └── Print/
│   ├── messages/             # User messages and translations
│   ├── navigation/           # Navigation configuration
│   ├── polyfills/            # JavaScript polyfills
│   ├── repository/           # Data repository layer (Realm)
│   │   └── models/           # Realm data models
│   ├── screens/              # Screen components
│   │   ├── checkout/
│   │   ├── coupons/
│   │   ├── current-sale/
│   │   ├── customers/
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── receipt/
│   │   └── sales/
│   ├── services/             # API service modules
│   ├── stores/               # Redux store
│   │   ├── _business/        # Business logic
│   │   ├── actions/          # Redux actions
│   │   ├── middleware/       # Redux middleware
│   │   ├── reducers/         # Redux reducers
│   │   └── variants/         # State variants
│   ├── styles/               # Style helpers and theming
│   ├── sync/                 # Data synchronization
│   │   └── server-manager/   # Server sync managers
│   ├── types/                # TypeScript type definitions
│   │   └── state/            # State types
│   ├── util/                 # Utility functions
│   │   ├── navigation/
│   │   ├── pix/
│   │   ├── products/
│   │   ├── qa/
│   │   ├── subscription/
│   │   └── tracker/
│   └── utils/                # Additional utilities
├── vendor/                   # Vendored dependencies
│   ├── bundle/               # Ruby gems
│   └── kyte-ui-components/   # Kyte UI library
├── .env.prod                 # Production environment variables
├── .env.stage                # Staging environment variables
├── AGENTS.md                 # Agent guide (Portuguese)
├── app.json                  # React Native app configuration
├── directory-tree.md         # This file
├── index.android.js          # Android entry point
├── index.js                  # Main entry point
├── jsconfig.json             # JavaScript configuration
├── package.json              # NPM dependencies and scripts
├── react-native.config.js    # React Native configuration
├── README.md                 # Project overview
├── SMART_ASSISTANT_AUDIO.md  # Smart Assistant audio regression notes
└── stuck-at-splashscreen.md  # RN 0.81 splash hang notes
```

## Quick Reference

| Path | Description |
|------|-------------|
| `.claude/` | Claude Code orchestrator configuration and subagents |
| `.claude/agents/` | Subagent definitions for architecture, QA, security, docs |
| `agents/` | Legacy agent definitions |
| `android/` | Android native project (Gradle, Kotlin) |
| `assets/` | Static assets (images, fonts, animations) |
| `docs/` | Project documentation |
| `ios/` | iOS native project (Xcode, Swift, Objective-C) |
| `patches/` | NPM package patches (patch-package) |
| `src/` | Application source code (React Native) |
| `src/components/` | React components organized by feature |
| `src/screens/` | Screen-level components |
| `src/stores/` | Redux store (actions, reducers, middleware) |
| `src/services/` | API service modules |
| `src/repository/` | Data persistence layer (Realm) |
| `src/integrations/` | Third-party integrations (Firebase, OneSignal, etc.) |
| `src/i18n/` | Internationalization and translations |
| `vendor/` | Vendored dependencies |

## Key Files

| File | Purpose |
|------|---------|
| `index.js` | Main React Native entry point |
| `src/App.js` | App initialization and providers |
| `src/components/AppContainer.js` | Global app container and initialization |
| `src/Router.js` | Navigation routing configuration |
| `src/configureStore.js` | Redux store configuration |
| `.env.prod` | Production environment variables |
| `.env.stage` | Staging environment variables |
| `package.json` | NPM dependencies and build scripts |
| `react-native.config.js` | React Native CLI configuration |
| `AGENTS.md` | Agent guide for AI assistants (Portuguese) |
| `README.md` | Project overview and getting started |

## Important Notes

- **Target Apps**: This project builds two apps - Kyte POS and Kyte Catalog
- **Build Flavors**: Each app has dev, stage, and prod variants controlled by ENVFILE
- **React Native Version**: 0.81.5 with new architecture enabled
- **State Management**: Redux with redux-offline for offline support
- **Database**: Realm for local persistence
- **Navigation**: React Navigation 5 with drawer and stack navigators
- **Forms**: Mixed usage of redux-form (legacy) and react-hook-form (modern)
