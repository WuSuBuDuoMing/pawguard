# Changelog

All notable changes to PawGuard (AI Pet Butler) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.9.0] - 2026-06-18

### Added
- **CONTRIBUTING.md**: Comprehensive contribution guidelines with development setup, coding standards, and commit convention
- **.gitignore**: Expanded to cover IDE files, OS artifacts, coverage output, and build directories
- **CI test job**: GitHub Actions workflow now runs `npm test` and validates `package.json` metadata on every push/PR

### Changed
- **README.md**: Complete overhaul -- English-first with CI badge, MIT badge, full feature table, architecture docs, installation guide, project structure, testing section, and links to community docs
- **JSDoc improvements**: Enhanced documentation across all 15 service files and `app.js` with proper `@file`, `@module`, `@param`, `@returns`, `@async`, and `@example` annotations
- **app.js**: Full JSDoc with `@file` header, `@type` annotations on all `globalData` properties, and method-level documentation

### Fixed
- **Version alignment**: Synchronized version to 2.9.0 across `package.json`, `project.config.json`, `settings-service.js` export, and `app.js`

## [2.10.0] - 2026-06-20

### Added
- **Weight trend analysis** (`health-service.js`): New `getWeightTrend()` function analyzes pet weight change direction, monthly rate, and provides intelligent suggestions based on species
- **Vaccine smart reminders** (`health-service.js`): New `getVaccineSmartReminders()` generates priority-based (urgent/warning/attention/normal) vaccine reminder list with human-readable messages
- **Weight trend utilities** (`health-utils.js`): New `analyzeWeightTrend()` calculates direction, delta, and monthly rate from weight history; `checkWeightInRange()` validates weight against species normal ranges

### Changed
- Enhanced health service exports to include new weight and vaccine analysis functions
- Improved JSDoc documentation for `health-utils.js` with detailed `@returns` type descriptions

## [2.11.0] - 2026-06-21

### Added
- **Smart feeding plan** (`feeding-service.js`): New `getSmartFeedingPlan()` recommends daily grams, meal count, food type, and appetite score based on 7-day historical data with actionable tips
- **Feeding regularity scoring** (`feeding-service.js`): New `getFeedingRegularity()` evaluates time consistency of feeding habits, tracks missed meals, and provides regularity grade (excellent/good/fair/poor)
- **Training statistics report** (`training-service.js`): New `getTrainingStatsReport()` provides comprehensive analysis including total sessions/hours, overall success rate, strongest/weakest commands, and per-command breakdown
- **Training milestones** (`training-service.js`): New `getTrainingMilestones()` tracks 9 unlockable achievements (first training, streaks, badges, hours, success rate) with unlock status and dates

### Changed
- Expanded feeding service exports with intelligent plan and regularity scoring functions
- Expanded training service exports with stats report and milestone tracking functions

## [2.12.0] - 2026-06-22

### Added
- **Version bump to 2.12.0**: Synchronized across `project.config.json`, `package.json`, `app.js`, `settings-service.js`, and `README.md` badge

### Changed
- **JSDoc enhancements**: Added `@type` and `@default` annotations to `MAX_PETS` and `CACHE_EXPIRY` constants in `constants.js`
- **CHANGELOG.md**: Added comprehensive changelog entries for v2.10.0, v2.11.0, and v2.12.0 documenting all new features across health, feeding, and training modules

## [2.8.0] - 2026-06-18

### Added
- **Behavior tracking service**: `behavior-service.js` with 8 behavior types (eating, drinking, sleeping, playing, grooming, toilet, social, movement)
- **Behavior stats**: Normal/abnormal ratio tracking and health score calculation
- **Daily summary service**: `daily-summary-service.js` aggregating tasks, reminders, expenses, and highlights

### Changed
- Enhanced `data-integrity-service.js` with feeding and water anomaly checks
- Improved cross-service data aggregation for dashboard

## [2.7.0] - 2026-06-17

### Added
- **Reptile species support**: AI assistant now handles reptile-specific care questions (temperature, UVB, diet)
- **Bird species support**: Tailored advice for avian care (environment, diet, toxic foods)
- **Rabbit and hamster expansion**: More comprehensive species-specific advice in AI assistant
- **Species-specific quick questions**: Quick question chips adapt based on current pet's species

### Changed
- Expanded `SPECIES_INFO` in ai-service.js with lifespan, weight range, diet, and notes fields
- Improved keyword matching priority (urgent > symptom > general > data query)
- Enhanced mock data with richer diary entries and behavioral observations

## [2.6.0] - 2026-06-16

### Added
- CODE_OF_CONDUCT.md (Contributor Covenant v2.1)
- FUNDING.yml for GitHub sponsor configuration
- CODEOWNERS for automatic PR review assignment
- Enhanced Issue templates (bug report, feature request)
- Pull Request template with checklist

## [2.4.0] - 2026-06-14

### Added
- SECURITY.md with vulnerability reporting policy and response time SLA

### Changed
- Documentation enhancements across README and Chinese README
- Open-source best practices alignment

## [2.2.0] - 2026-06-14

### Changed
- Local optimization and performance improvements
- CHANGELOG sync and version alignment
- Documentation updates across project

## [2.1.0] - 2026-06-11

### Fixed
- **feeding-service**: `deleteFeedingRecord` was saving the unfiltered array instead of the filtered result, causing deleted records to persist
- **ai-service**: Species-specific entries (rabbit, hamster, bird, reptile) were dangling outside `GENERAL_KEYWORDS` due to premature object closure

### Added
- **Unit tests**: Jest test suite covering `date-utils`, `validators`, `health-utils`, `pet-utils`, `money-utils`, and `storage-utils`
- **README.zh-CN.md**: Chinese README with full feature documentation, architecture overview, and project structure
- **docs/pet-data-model.md**: Pet data model and health tracking system documentation
- **CHANGELOG.md**: Version history tracking
- **package.json**: Project metadata with Jest test framework

### Improved
- Added JSDoc documentation to all public service functions across 15 service files
- Standardized `@param` / `@returns` / `@example` annotations in `services/` and `utils/`

## [2.0.0] - 2026-06-01

### Added
- Complete mini program with 20 pages, 15 services, 14 components
- AI pet assistant with local rule-based engine (6 species support)
- Feeding management with appetite tracking and food type distribution
- Water intake monitoring with anomaly detection
- Health records with vaccine/deworming tracking and overdue alerts
- Training system with 5-level skill badges and streak tracking
- Inventory management with shopping list generation
- Expense tracking with monthly budget and category breakdown
- Growth diary with mood calendar and AI-generated copy
- Pet album with tag filtering
- Global search across all modules
- Multi-level reminder center
- Data statistics with trend charts
- 5-step onboarding flow
- Dark mode support
- Data integrity health check
- Data export functionality
- 8 mock pets (4 cats, 4 dogs) with comprehensive sample data

## [1.0.0] - 2026-03-01

### Added
- Initial project setup
- Basic pet profile management
- Simple care task tracking
