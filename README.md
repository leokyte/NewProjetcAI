# Kyte App POS/Catalog

Kyte is the main codebase for both the **Kyte POS** point‑of‑sale app and the **Kyte Catalog**. The project is built with React Native and provides product management, sales and online catalog features.

## Features

- Create, view, edit and delete products
- Save and finalize orders
- Manage stock
- Create and edit the online catalog

## Getting Started

### Requirements

 - Node.js 18 or newer
 - [Yarn](https://yarnpkg.com/) package manager

### Installation

```bash
yarn install
```

### Development

Start the Metro server:

```bash
yarn start:legacy
```

### Building

```bash
yarn run clean:ios
yarn run build:android:jsbundle
```

Follow the usual Xcode or Android Studio steps to run the project on emulators.

## Repository Structure

For the complete project structure, see [directory-tree.md](./directory-tree.md).

**Key directories:**
- `src/` - Application source code (React Native)
- `android/` - Android native project and Gradle files
- `ios/` - Xcode project and iOS specific files
- `docs/` - Project documentation
- `assets/` - Fonts and images
- `patches/` - Patch files for dependencies

The `docs` folder contains Markdown documentation for common components, features and service APIs. Fonts and images used by the app live inside `assets`. The repository also includes patch files in `patches/` that are applied after installing node modules.

---

## Documentation

- Quick Start: `docs/quick-start.md`
- Architecture: `docs/architecture.md`
- Developer Guide: `docs/developer-guide.md`
- API Reference: `docs/api/README.md` and `docs/api/services.md`
- Troubleshooting: `docs/troubleshooting.md`

Additional, feature-level notes live under `docs/_features/` and service notes under `docs/services/`.
