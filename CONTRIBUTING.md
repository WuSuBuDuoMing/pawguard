# Contributing to PawGuard

Thank you for considering contributing to PawGuard! Every contribution helps make this project better for pet owners everywhere.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How to Contribute](#how-to-contribute)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Coding Guidelines](#coding-guidelines)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Features](#suggesting-features)

## Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to WuSuBuDuoMing@users.noreply.github.com.

## How to Contribute

### Reporting Bugs

1. Check [existing issues](https://github.com/WuSuBuDuoMing/pawguard/issues) to avoid duplicates.
2. Open a new issue using the **Bug Report** template.
3. Include reproduction steps, expected behavior, and your environment (WeChat DevTools version, device, OS).

### Suggesting Features

1. Open a new issue using the **Feature Request** template.
2. Describe the problem you are solving and your proposed solution.

### Submitting Code

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes.
4. Run tests: `npm test`
5. Commit following the [commit convention](#commit-convention).
6. Push to your fork and open a Pull Request.

## Development Setup

### Prerequisites

- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (latest stable)
- Node.js >= 16.x
- npm >= 8.x

### Getting Started

```bash
# 1. Clone your fork
git clone https://github.com/YOUR_USERNAME/pawguard.git
cd pawguard

# 2. Install dependencies
npm install

# 3. Run tests
npm test

# 4. Open the project in WeChat DevTools
#    File -> Open Project -> Select the pawguard directory
```

### Configuration

- Replace `appid` in `project.config.json` with your own WeChat Mini Program AppID.
- Never commit real API keys or AppIDs to the repository.

## Project Structure

```
pawguard/
├── app.js / app.json / app.wxss   # Entry files
├── pages/          (20)  # Mini program pages
├── services/       (15)  # Data layer (mock, swappable to real backend)
├── components/     (14)  # Reusable UI components
├── utils/          (10)  # Utility functions and constants
├── custom-tab-bar/        # Custom bottom tab bar
├── assets/                # Static images and icons
├── styles/                # Global WXSS styles
├── tests/                 # Jest unit tests
├── docs/                  # Documentation
└── scripts/               # Build and utility scripts
```

## Coding Guidelines

### General

- **Language**: Write code and comments in English. User-facing strings can be in Chinese (the app is primarily for Chinese users).
- **Modules**: Use CommonJS (`require` / `module.exports`) -- the WeChat Mini Program runtime does not support ES modules.
- **Indentation**: 2 spaces (enforced by editor settings in `project.config.json`).

### Services

- Every public function **must** have JSDoc comments with `@param`, `@returns`, and `@example`.
- Services are async by default and use `wx.setStorageSync` for persistence.
- Mock data lives inside each service file. Do not put mock data in separate files.

### Components

- Each component lives in its own folder with the four required files: `.js`, `.json`, `.wxml`, `.wxss`.
- Components communicate upward via `triggerEvent`.

### Tests

- Tests are located in `tests/` and use Jest.
- Run `npm test` before submitting a PR.
- New features should include at least basic unit tests.

## Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process, dependencies, CI

**Examples:**
```
feat(water): add anomaly detection for consecutive low intake days
fix(health): correct overdue vaccine reminder calculation
docs(services): add JSDoc to all public functions in health-service
test(date-utils): add edge cases for getDaysUntil
```

## Pull Request Process

1. **Branch naming**: `feature/xxx`, `fix/xxx`, `docs/xxx`
2. **Title**: Follow the commit convention above.
3. **Description**: Explain what changed and why. Reference related issues (e.g., `Closes #42`).
4. **Checklist**:
   - [ ] `npm test` passes
   - [ ] No hardcoded AppIDs or API keys
   - [ ] New/changed functions have JSDoc
   - [ ] Page changes include all four files (`.js`, `.json`, `.wxml`, `.wxss`)

## Security

If you discover a security vulnerability, please **do not** open a public issue. Instead, see [SECURITY.md](./SECURITY.md) for responsible disclosure instructions.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](./LICENSE).
