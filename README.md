# PawGuard - AI Pet Butler

[![CI](https://github.com/WuSuBuDuoMing/pawguard/actions/workflows/ci.yml/badge.svg)](https://github.com/WuSuBuDuoMing/pawguard/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-2.12.0-green.svg)](./CHANGELOG.md)

> An intelligent pet care management WeChat Mini Program for multi-pet households.
>
> Manage feeding, hydration, health, training, expenses, and growth diaries for cats, dogs, rabbits, hamsters, birds, and reptiles -- all in one app.

[English](./README.md) | [中文](./README.zh-CN.md)

---

## Features

| Module | Highlights |
|--------|-----------|
| **Dashboard** | Today's tasks, progress ring, feeding/watering summary, AI tips, quick actions, pull-to-refresh |
| **Pet Profiles** | Multi-pet management (cat/dog/rabbit/hamster/bird/reptile), weight trend chart, personality tags, species-themed backgrounds |
| **Daily Care** | 9 care types, check-in animations, completion celebration, weekly bar chart |
| **Feeding Management** | Detailed feeding logs, appetite status, food type tracking, statistics, quick-entry |
| **Water Tracking** | Water change logs, intake monitoring, anomaly detection, quick-entry |
| **Health Records** | Timeline view, vaccine/deworming/visit/medication tracking, overdue alerts, color-coded filters |
| **AI Pet Assistant** | Symptom analysis, urgent symptom detection, 6-species advice, care knowledge base, quick questions |
| **Training Tracker** | Skill badges (5 levels), streak tracking, AI training suggestions, training log form |
| **Inventory** | Stock list + shopping list mode, check-to-restock, low-stock alerts, add-item form |
| **Expense Ledger** | Monthly budget tracking, category breakdown chart, multi-pet cost allocation |
| **Growth Diary** | Mood calendar, AI-generated copy, diary entry form, monthly summary |
| **Pet Album** | Time-grouped photos, tag filtering, photo detail modal |
| **Global Search** | Cross-module search (pets, diary, health, feeding, inventory, expenses), search history, trending terms |
| **Reminder Center** | Multi-dimensional reminders (health, care, feeding, water, inventory), 3-tier urgency (urgent/soon/normal) |
| **Pet Detail** | Unified view (health, feeding, water, training, timeline), weight line chart |
| **Data Statistics** | Care trends, feeding trends, water trends, expense trends, inventory health score |
| **Profile** | Achievement badges, data health check, data export |
| **Onboarding** | 5-step first-launch walkthrough |

## AI Pet Assistant

A local rule-based intelligent Q&A engine supporting:

- **Urgent Symptom Detection**: Blood in stool, breathing difficulty, seizures, prolonged appetite loss -- immediate vet alert
- **Symptom Analysis**: Vomiting, diarrhea, skin issues, eye/ear/oral problems with categorized advice
- **Care Knowledge**: Vaccines, deworming, bathing, neutering, weight management
- **Feeding Guidance**: Portions, frequency, food safety
- **Data Queries**: Today's tasks, weight records, care status
- **6 Species Support**: Cat, dog, rabbit, hamster, bird, reptile -- each with tailored advice

> **Disclaimer**: The AI assistant provides reference suggestions only and does not offer medical diagnoses. For serious symptoms, consult a veterinarian immediately.

## Architecture

```text
Pages(20) -> Services(15) -> Storage(wx.setStorageSync)
    |
Components(14) <- Utils(10)
    |
Custom TabBar + Canvas Charts
```

### Key Technical Decisions

- **Custom TabBar**: Emoji-based icons, zero image dependencies
- **Behavior Theme System**: Dark mode with one-click toggle
- **Canvas 2D Charts**: Ring progress + line charts without third-party libraries
- **Service Layer**: Modular data layer, easily swappable to a real backend
- **Data Validation**: Integrity checks with automatic anomaly detection
- **Local AI Engine**: Rule-based NLP with API integration stubs for OpenAI/Claude/DeepSeek

## Getting Started

### Prerequisites

- [WeChat DevTools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) (latest stable)
- Node.js >= 16.x (for running tests)

### Installation

```bash
# Clone the repository
git clone https://github.com/WuSuBuDuoMing/pawguard.git
cd pawguard

# Install dependencies
npm install

# Run tests
npm test
```

### Running in WeChat DevTools

1. Open WeChat DevTools
2. **File > Open Project** and select the `pawguard` directory
3. Replace `appid` in `project.config.json` with your own WeChat Mini Program AppID
4. Click **Compile** -- the app will launch with the onboarding flow on first run

## Development Environment Setup

### macOS

1. Download [WeChat DevTools (macOS)](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. Open the installer and drag **WeChatDevTools** to the Applications folder
3. Clone the repository and open the project:
4. Launch WeChat DevTools, click **Import Project** (+ button), and select the cloned folder
5. Enter your Mini Program **AppID** in `project.config.json` (or use the test AppID for preview)
6. Click **Compile** -- the app launches with the onboarding flow on first run

```bash
git clone https://github.com/WuSuBuDuoMing/pawguard.git
cd pawguard
npm install
```

### Windows

1. Download [WeChat DevTools (Windows)](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. Run the installer and follow the setup wizard
3. Clone the repository and open the project:
4. Launch WeChat DevTools, click **Import Project** (+ button), and select the cloned folder
5. Enter your Mini Program **AppID** in `project.config.json` (or use the test AppID for preview)
6. Click **Compile** -- the app launches with the onboarding flow on first run

```powershell
git clone https://github.com/WuSuBuDuoMing/pawguard.git
cd pawguard
npm install
```

### Linux

WeChat DevTools is not available on Linux. Use [miniprogram-ci](https://www.npmjs.com/package/miniprogram-ci) for CI/CD workflows:

```bash
# 1. Install miniprogram-ci
npm install -g miniprogram-ci

# 2. Clone the repository
git clone https://github.com/WuSuBuDuoMing/pawguard.git
cd pawguard

# 3. Generate a CI private key from the WeChat Official Account backend
#    (MP Backend > Development > Development Settings > Upload Key)
#    Save it as ci-private.key in the project root

# 4. Preview the mini program on a real device
miniprogram-ci preview \
  --appid YOUR_APPID \
  --pk-version 1 \
  --pk-branch main \
  --private-key-path ci-private.key \
  --desc "Preview from CLI"

# 5. Upload a new version (for review / release)
miniprogram-ci upload \
  --appid YOUR_APPID \
  --pk-version 1 \
  --pk-branch main \
  --private-key-path ci-private.key \
  --desc "Version uploaded via miniprogram-ci"
```

> **Note:** `miniprogram-ci` supports preview (generates QR code for scanning) and upload (submit for review), but does not provide a simulator. For full debugging, use the WeChat DevTools on macOS or Windows.

### Docker

Use the [miniprogram-ci Docker image](https://github.com/nicepkg/miniprogram-ci) for containerized CI/CD pipelines:

```dockerfile
# Dockerfile
FROM node:20-alpine
RUN npm install -g miniprogram-ci
WORKDIR /app
COPY . .
CMD ["miniprogram-ci", "preview", \
     "--appid", "YOUR_APPID", \
     "--pk-version", "1", \
     "--private-key-path", "ci-private.key"]
```

```bash
# Build and run
docker build -t pawguard-ci .
docker run --rm -v $(pwd)/ci-private.key:/app/ci-private.key pawguard-ci

# Or use docker compose
docker compose up ci
```

### Step-by-Step Workflow

```bash
# 1. Clone the repository
git clone https://github.com/WuSuBuDuoMing/pawguard.git
cd pawguard

# 2. Install dependencies (if running tests)
npm install

# 3. Open the project in WeChat DevTools (macOS/Windows)
#    or configure miniprogram-ci (Linux/Docker)

# 4. Configure your AppID
#    Edit project.config.json → "appid": "your-app-id-here"

# 5. Compile and preview in the simulator

# 6. Use Preview / 真机调试 for on-device testing

# 7. When ready, Upload to submit for WeChat review
```

## Project Structure

```text
pawguard/
├── app.js / app.json / app.wxss   # Entry files
├── pages/          (20)  # Mini program pages
├── services/       (15)  # Data layer (mock, swappable to backend)
├── components/     (14)  # Reusable UI components
├── utils/          (10)  # Utility functions and constants
├── custom-tab-bar/        # Custom bottom navigation
├── assets/                # Static images and icons
├── styles/                # Global stylesheets
├── tests/                 # Jest unit tests
├── docs/                  # Technical documentation
├── scripts/               # Build scripts
├── .github/               # CI, issue/PR templates, funding
├── CONTRIBUTING.md        # Contribution guidelines
├── CODE_OF_CONDUCT.md     # Community code of conduct
├── SECURITY.md            # Vulnerability reporting policy
└── LICENSE                # MIT License
```

## Testing

```bash
npm test
```

Tests cover core utility modules:

| Module | Coverage |
|--------|----------|
| `date-utils` | Date formatting, relative time, days-until calculations |
| `validators` | Input validation for pet data, expenses, and user input |
| `health-utils` | Health record categorization, overdue detection |
| `pet-utils` | Species detection, age calculation, breed lookup |
| `money-utils` | Currency formatting, budget calculations |
| `storage-utils` | Local storage read/write with error handling |

## Contributing

We welcome contributions of all kinds. Please read our [Contributing Guide](./CONTRIBUTING.md) before submitting a Pull Request.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes and add tests
4. Run `npm test` to ensure everything passes
5. Submit a Pull Request

For bug reports and feature requests, please use the [issue templates](https://github.com/WuSuBuDuoMing/pawguard/issues/new/choose).

## Security

For security vulnerability reports, please see [SECURITY.md](./SECURITY.md). Do **not** open public issues for security concerns.

## Mock Data

The app ships with comprehensive mock data for demonstration:

| Type | Count |
|------|-------|
| Pets | 8 (4 cats, 4 dogs) |
| Care records | ~400 |
| Feeding records | ~300 |
| Water records | ~200 |
| Health records | 43 |
| Training records | 48 |
| Inventory items | 25 |
| Expense records | 48 |
| Diary entries | 18 |
| Photos | 45 |

## License

This project is licensed under the [MIT License](./LICENSE).

Copyright (c) 2026 WuSuBuDuoMing
