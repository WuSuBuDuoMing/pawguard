# Changelog

All notable changes to PawGuard (AI 宠物管家) will be documented in this file.

## [2.6.0] - 2026-06-16

### Changed
- Added CODE_OF_CONDUCT.md, FUNDING.yml, CODEOWNERS, enhanced Issue/PR templates

## [2.4.0] - 2026-06-14

### Changed
- Security policy, documentation enhancements, open-source best practices

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
