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
