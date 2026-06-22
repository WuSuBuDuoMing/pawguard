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

## Deployment to WeChat Developer Tools

### Step 1: Download & Install WeChat DevTools

| Platform | Download Link | Notes |
|----------|--------------|-------|
| macOS (Intel) | [Download](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) | Drag to Applications |
| macOS (Apple Silicon) | [Download](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) | Native M1/M2/M3 support |
| Windows 64-bit | [Download](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) | Run installer |
| Windows 32-bit | [Download](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html) | For older systems |

> **Warning:** WeChat DevTools >= 1.06.2301010

### Step 2: Clone the Repository

**macOS / Linux:**
```bash
git clone https://github.com/WuSuBuDuoMing/pawguard.git
cd pawguard
npm install   # required for running tests
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/WuSuBuDuoMing/pawguard.git
cd pawguard
npm install
```

> **Note:** `npm install` is required for running unit tests (`npm test`). The mini program itself can compile without npm dependencies.

### Step 3: Import Project into WeChat DevTools

1. Open **WeChat Developer Tools**
2. On the welcome screen, click the **+** (Import Project) button
3. In the import dialog:
   - **Project Directory:** Browse to the cloned repository folder
   - **AppID:** Enter your Mini Program AppID (get it from [MP Backend](https://mp.weixin.qq.com/))
     - Or use the **Test AppID** (测试号) for quick preview
   - **Project Name:** Auto-filled from the folder name
4. Click **Import** (确定)

> **Tip:** If you don't have an AppID yet, click "Test Account" (测试号) to use a sandbox environment.

### Step 4: Compile & Preview

1. After import, the simulator panel opens automatically on the left
2. The app compiles and renders in the simulator
3. On first run, the onboarding flow (5-step walkthrough) will appear
4. Use the simulator toolbar to:
   - Switch phone models (iPhone 14, Pixel 7, etc.)
   - Toggle dark mode
   - Adjust network speed (WiFi, 4G, Offline)
   - Rotate screen orientation

### Step 5: Test on Real Device

**Method A: Preview (预览)**
1. Click the **Preview** (预览) button in the toolbar
2. A QR code appears -- scan it with your phone's WeChat
3. The mini program loads on your real device

**Method B: Real-time Debug (真机调试)**
1. Click **Real-time Debug** (真机调试) in the toolbar
2. Scan the QR code with your phone
3. A debug panel opens in DevTools showing console logs, network requests, and storage

### Step 6: Upload for Review (提交审核)

1. Click **Upload** (上传) in the toolbar
2. Fill in:
   - **Version:** e.g., `1.0.0`
   - **Description:** What changed in this version
3. Click **Upload**
4. Go to [MP Backend](https://mp.weixin.qq.com/) -> **Management** -> **Version Management**
5. Click **Submit for Review** (提交审核)
6. Wait for WeChat's review (usually 1-7 days)

### Step 7: Release (发布)

1. After review approval, go to **Version Management** in MP Backend
2. Click **Release** (全量发布)
3. The mini program is now live for all users!

---

### Alternative: Linux CLI Deployment (miniprogram-ci)

For Linux servers or CI/CD pipelines, use [miniprogram-ci](https://www.npmjs.com/package/miniprogram-ci):

```bash
# Install
npm install -g miniprogram-ci

# Generate CI private key from MP Backend > Development > Upload Key
# Save as ci-private.key

# Preview (QR code for scanning)
miniprogram-ci preview \
  --appid YOUR_APPID \
  --pk-version 1 \
  --pk-branch main \
  --private-key-path ci-private.key \
  --desc "Preview"

# Upload (submit for review)
miniprogram-ci upload \
  --appid YOUR_APPID \
  --pk-version 1 \
  --pk-branch main \
  --private-key-path ci-private.key \
  --desc "Release v1.0.0"
```

### Docker CI/CD

```yaml
# docker-compose.yml
version: '3'
services:
  miniprogram-ci:
    image: nicepkg/miniprogram-ci:latest
    volumes:
      - .:/app
      - ./ci-private.key:/app/ci-private.key
    command: miniprogram-ci upload --appid YOUR_APPID --pk-version 1 --private-key-path ci-private.key
```

---

### Troubleshooting

| Problem | Solution |
|---------|----------|
| "AppID does not exist" | Verify your AppID in MP Backend, or use test AppID |
| Simulator shows blank page | Check `app.json` pages array, ensure all files exist |
| npm packages not working | Run `npm install` then click "Compile" in DevTools |
| Upload fails with "version exists" | Increment the version number in project.config.json |
| Real device shows different layout | Enable "Remote Debug" to check CSS/rendering differences |
| Canvas charts not rendering | Ensure base library version >= 3.3.4 in project settings |

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
