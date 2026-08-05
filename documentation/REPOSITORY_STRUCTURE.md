# Repository Structure

## Purpose

This document defines the organizational structure of the Pokémon Companion repository.

Its purpose is to describe how the project is organized at the filesystem level, establish the responsibilities of each top-level directory, and provide a consistent foundation for future development.

The repository structure is designed to support long-term maintainability, scalability, and clear separation of responsibilities while remaining independent of implementation details.

---

# Scope

This document defines:

- Repository organization
- Top-level directories
- Root-level files
- Directory responsibilities
- Repository design principles
- Ownership boundaries
- Repository growth strategy

This document does not define the internal architecture of the backend, frontend, database, scripts, or documentation. Those responsibilities are documented separately within their respective project documents.

---

# Responsibilities

The Repository Structure is responsible for:

- Defining the overall filesystem organization.
- Establishing responsibilities for top-level directories.
- Preventing overlapping directory responsibilities.
- Supporting scalable project growth.
- Maintaining a predictable repository layout.
- Separating implementation concerns across project areas.

The Repository Structure should remain independent of implementation-specific technologies whenever practical.

---

# Design Goals

The repository should:

- Be easy to navigate.
- Scale without major reorganization.
- Separate responsibilities clearly.
- Minimize coupling between project areas.
- Support independent development of major systems.
- Remain understandable for new contributors.
- Reflect the project's documented architecture.

---

# Core Principles

## One Responsibility Per Directory

Every top-level directory should have one clearly defined responsibility.

Responsibilities should not overlap.

---

## Documentation First

Repository organization should be documented before structural changes are introduced whenever practical.

---

## Predictable Organization

Similar project areas should follow consistent organizational patterns.

Developers should be able to locate functionality without relying on project-specific knowledge.

---

## Separation of Responsibilities

Documentation, source code, generated data, configuration, assets, tooling, reports, and tests should remain clearly separated.

No directory should become a miscellaneous collection of unrelated files.

---

## Scalable Growth

New directories should be introduced only when they represent a distinct architectural responsibility.

Repository growth should extend the existing organization rather than requiring restructuring.

---

# Repository Layout

Pokémon Companion is organized into a collection of top-level directories, each representing a distinct architectural responsibility.

The repository is intentionally organized by project responsibility rather than programming language, framework, or implementation technology.

Every top-level directory owns one area of the project and should remain independent whenever practical.

The repository currently consists of the following top-level areas:

- documentation/
- database/
- scripts/
- backend/
- frontend/
- config/
- assets/
- reports/
- tests/
- tools/
- .github/

The responsibilities of each directory are defined in the following sections.

---

# Root-Level Files

Root-level files contain project-wide configuration, metadata, licensing, and entry points.

Only files that affect the repository as a whole should exist at the repository root.

Feature-specific files belong within their owning directories.

---

# Directory Responsibilities

Each top-level directory owns a specific area of the project.

No directory should duplicate the responsibility of another.

The responsibilities of individual directories are documented within this document.

---

# Repository Evolution

The repository is expected to grow alongside Pokémon Companion.

Future directories should extend the existing organizational principles rather than introducing alternative organizational strategies.

Significant structural changes should be documented before implementation and, where appropriate, recorded through an Architectural Decision Record (ADR).

---

# Relationship to Other Documentation

This document defines repository organization.

It complements, but does not replace:

- SYSTEM_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- SCRIPTS_ARCHITECTURE.md
- BACKEND_ARCHITECTURE.md
- API_DOCUMENTATION.md
- COLLABORATION_CONTRACT.md

---

# Design Philosophy

The repository should be organized so that contributors can understand where information belongs before they understand how the project is implemented.

A clear repository structure improves maintainability, reduces architectural drift, and allows Pokémon Companion to scale without sacrificing consistency.

---

# documentation/

## Purpose

The `documentation/` directory contains the official project documentation for Pokémon Companion.

Documentation serves as the project's primary source of truth, defining the architecture, standards, design decisions, and long-term vision that guide every aspect of development.

---

## Responsibilities

The `documentation/` directory is responsible for:

- Project architecture
- Database documentation
- System documentation
- API documentation
- User interface documentation
- Development standards
- Collaboration standards
- Architectural Decision Records (ADRs)
- Project planning documents
- Reference documentation

Documentation should describe the project rather than implement it.

---

## Ownership

The `documentation/` directory owns all project documentation.

Architectural, design, and project decisions should be documented here before implementation whenever practical.

Other directories may reference documentation but should not duplicate it.

---

## Design Principles

Documentation should:

- Act as the project's primary source of truth.
- Remain organized by responsibility.
- Avoid unnecessary duplication.
- Clearly distinguish approved decisions from proposals.
- Evolve alongside the project while preserving historical context.
- Prioritize clarity and maintainability over excessive detail.

---

## Must Contain

Examples include:

- Architecture documents
- Database documentation
- API documentation
- UI documentation
- Project standards
- ADRs
- Planning documents
- Reference material

---

## Must Not Contain

The `documentation/` directory should not contain:

- Source code
- Generated datasets
- Runtime configuration
- Build artifacts
- Executable scripts
- Application assets

---

## Relationship to Other Directories

The `documentation/` directory defines the architecture implemented by:

- `database/`
- `scripts/`
- `backend/`
- `frontend/`
- `config/`
- `tests/`
- `tools/`

Documentation guides implementation but remains independent of implementation details.

---

## Related Documentation

Examples include:

- COLLABORATION_CONTRACT.md
- PROJECT_CONSTITUTION.md
- SYSTEM_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md

---

# database/

## Purpose

The `database/` directory contains every dataset managed by Pokémon Companion throughout its data pipeline.

It stores the project's official Pokémon knowledge as it progresses from extracted source data to canonical representations, generated application datasets, and user-specific data.

The database is organized according to the architectural layers defined by the project's data architecture rather than by implementation technology.

---

## Responsibilities

The `database/` directory is responsible for:

- Storing extracted source data.
- Storing canonical Pokémon knowledge.
- Storing relationship datasets.
- Storing generated application datasets.
- Storing user datasets where applicable.
- Preserving dataset versioning and integrity.
- Supporting reproducible database generation.

The `database/` directory stores data only.

Generation, validation, and transformation are performed by the Scripts system.

---

## Ownership

The `database/` directory owns every dataset used by Pokémon Companion.

Each architectural layer owns its respective datasets as defined by `DATA_ARCHITECTURE.md`.

Other project areas may consume database contents but should not redefine or duplicate canonical knowledge.

---

## Design Principles

The database should:

- Follow the project's multi-layer architecture.
- Preserve canonical Pokémon knowledge.
- Separate authoritative data from generated data.
- Support deterministic regeneration.
- Minimize unnecessary duplication.
- Remain independent of frontend presentation and backend implementation.

---

## Must Contain

Examples include:

- Raw datasets
- Canonical datasets
- Relationship datasets
- Generated datasets
- User datasets
- Build metadata
- Validation metadata

---

## Must Not Contain

The `database/` directory should not contain:

- Source code
- Build scripts
- Application logic
- User interface assets
- Project documentation
- Temporary build workspaces

---

## Relationship to Other Directories

The `database/` directory is produced by:

- `scripts/`

It is consumed by:

- `backend/`
- `frontend/` (through the backend)
- `tests/`
- `tools/`

The database remains independent of application implementation while serving as the authoritative data source for the platform.

---

## Related Documentation

Examples include:

- DATABASE_SCHEMA.md
- DATA_ARCHITECTURE.md
- DATASETS.md
- LEARNSET_SCHEMA.md
- KNOWLEDGE_MODEL.md

---

# scripts/

## Purpose

The `scripts/` directory contains the data pipeline responsible for acquiring, transforming, validating, and generating the Pokémon Companion database.

It implements the documented data architecture by converting external Pokémon data into the canonical and generated datasets consumed by the remainder of the platform.

The Scripts system remains independent of the backend, frontend, and user interface while serving as the project's primary data generation pipeline.

---

## Responsibilities

The `scripts/` directory is responsible for:

- Downloading external Pokémon data.
- Extracting official game data.
- Building canonical datasets.
- Generating application datasets.
- Validating generated data.
- Producing build reports.
- Providing developer inspection tools.
- Supporting reproducible database generation.

The Scripts system should not contain application business logic or user interface functionality.

---

## Ownership

The `scripts/` directory owns the project's data generation pipeline.

It is responsible for producing the contents of the `database/` directory while remaining independent of application-specific implementation.

Other project areas may invoke scripts but should not duplicate generation logic.

---

## Design Principles

The Scripts system should:

- Follow the documented generation pipeline.
- Produce deterministic builds.
- Maintain a clear separation of responsibilities.
- Organize scripts by domain.
- Encourage reusable shared utilities.
- Support independent script execution.
- Remain scalable without architectural redesign.

---

## Must Contain

Examples include:

- Download scripts
- Extraction scripts
- Build scripts
- Validation scripts
- Inspection tools
- Shared utilities
- Build orchestration
- Script templates

---

## Must Not Contain

The `scripts/` directory should not contain:

- Canonical datasets
- Generated datasets
- Backend application logic
- Frontend code
- User interface assets
- Project documentation

---

## Relationship to Other Directories

The `scripts/` directory consumes:

- `config/`
- Official source data

It produces:

- `database/`
- `reports/`

It may be used by:

- `tools/`
- `tests/`
- Continuous integration workflows

The Scripts system acts as the bridge between official Pokémon sources and the project's database.

---

## Related Documentation

Examples include:

- SCRIPTS_ARCHITECTURE.md
- DATA_ARCHITECTURE.md
- DATABASE_SCHEMA.md
- DATASETS.md
- API_DOCUMENTATION.md

---

# backend/

## Purpose

The `backend/` directory contains the server-side application responsible for exposing Pokémon Companion's functionality through well-defined application services and APIs.

It acts as the bridge between the generated database and all client applications by retrieving, processing, and delivering data while enforcing the project's business rules.

The backend remains independent of the frontend while consuming the generated datasets produced by the Scripts system.

---

## Responsibilities

The `backend/` directory is responsible for:

- Exposing application APIs.
- Implementing business logic.
- Managing application services.
- Retrieving and serving generated datasets.
- Validating application requests.
- Managing authentication and authorization where applicable.
- Coordinating interactions between application components.

The backend should consume generated datasets rather than performing database generation or transformation.

---

## Ownership

The `backend/` directory owns the server-side application.

It is responsible for application behavior, request processing, and data delivery, while remaining independent of frontend implementation and data generation.

---

## Design Principles

The backend should:

- Remain independent of frontend implementation.
- Consume generated datasets rather than canonical datasets whenever practical.
- Separate business logic from infrastructure.
- Expose stable APIs.
- Minimize unnecessary runtime transformation.
- Scale without requiring architectural redesign.

---

## Must Contain

Examples include:

- API implementation
- Application services
- Business logic
- Authentication
- Authorization
- Request validation
- Response serialization
- Infrastructure integration

---

## Must Not Contain

The `backend/` directory should not contain:

- Database generation scripts
- Canonical datasets
- Frontend code
- User interface assets
- Project documentation
- Build reports

---

## Relationship to Other Directories

The `backend/` directory:

Consumes:

- `database/`
- `config/`

Exposes services to:

- `frontend/`
- External clients
- Future SDKs

It may also interact with:

- `tests/`
- `tools/`

The backend serves as the application's service layer between the generated database and consuming clients.

---

## Related Documentation

Examples include:

- BACKEND_ARCHITECTURE.md
- API_DOCUMENTATION.md
- DATABASE_SCHEMA.md
- SYSTEM_ARCHITECTURE.md
- DATASETS.md

---

# frontend/

## Purpose

The `frontend/` directory contains the user-facing applications of Pokémon Companion.

It is responsible for presenting Pokémon Companion's features through intuitive, responsive, and accessible user interfaces while remaining independent of backend implementation details.

The frontend consumes application services exposed by the backend and presents Pokémon knowledge in a trainer-friendly experience.

---

## Responsibilities

The `frontend/` directory is responsible for:

- Rendering the user interface.
- Managing client-side application state.
- Presenting Pokémon data.
- Handling user interaction.
- Providing navigation throughout the application.
- Implementing responsive layouts.
- Supporting accessibility.
- Delivering a consistent user experience.

The frontend should focus on presentation rather than implementing business logic or data generation.

---

## Ownership

The `frontend/` directory owns the application's presentation layer.

It is responsible for how information is displayed and interacted with while remaining independent of backend implementation and database architecture.

---

## Design Principles

The frontend should:

- Consume backend APIs rather than accessing the database directly.
- Separate presentation from business logic.
- Prioritize usability and accessibility.
- Present Pokémon information naturally for trainers.
- Minimize unnecessary client-side processing.
- Support scalable feature growth without major restructuring.

---

## Must Contain

Examples include:

- Application pages
- UI components
- Layouts
- Navigation
- Client-side state management
- Styling
- Assets specific to the frontend
- User interaction logic

---

## Must Not Contain

The `frontend/` directory should not contain:

- Database generation scripts
- Canonical datasets
- Backend business logic
- Server-side infrastructure
- Project documentation
- Build reports

---

## Relationship to Other Directories

The `frontend/` directory:

Consumes:

- `backend/`

Uses:

- `assets/`
- `config/` (where applicable)

May be tested by:

- `tests/`

The frontend presents information provided by the backend and should never become a source of canonical Pokémon knowledge.

---

## Related Documentation

Examples include:

- UI_GUIDELINES.md
- API_DOCUMENTATION.md
- BACKEND_ARCHITECTURE.md
- FEATURES.md
- SYSTEM_ARCHITECTURE.md

---

# config/

## Purpose

The `config/` directory contains the centralized configuration used throughout Pokémon Companion.

It defines project-wide settings that control the behavior of the Scripts system, backend, frontend, tooling, and development environment while remaining separate from application logic and source code.

Configuration provides a single, organized location for adjustable project settings without becoming part of the project's implementation.

---

## Responsibilities

The `config/` directory is responsible for:

- Managing project-wide configuration.
- Defining build settings.
- Defining data source configuration.
- Defining validation settings.
- Defining environment-specific configuration.
- Supporting reproducible builds.
- Providing shared configuration across project systems.

Configuration should define behavior rather than implement it.

---

## Ownership

The `config/` directory owns the project's configuration.

Individual project systems may consume configuration but should not duplicate or redefine shared configuration values.

Configuration files should remain organized according to their responsibility rather than the systems that consume them.

---

## Design Principles

Configuration should:

- Be centralized.
- Be organized by responsibility.
- Be easy to understand.
- Avoid unnecessary duplication.
- Support reproducible builds.
- Separate configuration from implementation.
- Scale without requiring major reorganization.

---

## Must Contain

Examples include:

- Build configuration
- Path configuration
- Download configuration
- Validation configuration
- Environment configuration
- Logging configuration
- Terminal output configuration
- Project constants

---

## Must Not Contain

The `config/` directory should not contain:

- Source code
- Generated datasets
- Build reports
- Project documentation
- Runtime user data
- Application business logic

---

## Relationship to Other Directories

The `config/` directory is consumed by:

- `scripts/`
- `backend/`
- `frontend/`
- `tests/`
- `tools/`

Configuration provides shared project settings while remaining independent of the systems that consume it.

---

## Related Documentation

Examples include:

- SCRIPTS_ARCHITECTURE.md
- BACKEND_ARCHITECTURE.md
- API_DOCUMENTATION.md
- COLLABORATION_CONTRACT.md
- REPOSITORY_STRUCTURE.md

---

# assets/

## Purpose

The `assets/` directory contains static resources used throughout Pokémon Companion.

Assets provide the visual, audio, and other non-executable resources required by the project while remaining independent of application logic, generated datasets, and project documentation.

The `assets/` directory serves as the centralized location for shared project resources.

---

## Responsibilities

The `assets/` directory is responsible for:

- Storing static project assets.
- Organizing visual resources.
- Organizing audio resources.
- Providing shared resources for applications.
- Supporting consistent asset management.
- Preserving project branding and visual identity.

Assets should remain independent of application implementation whenever practical.

---

## Ownership

The `assets/` directory owns project-wide static resources.

Individual applications may consume these assets but should not duplicate shared resources within their own directories unless application-specific assets are required.

---

## Design Principles

Assets should:

- Be organized by responsibility.
- Be reusable across the project.
- Avoid unnecessary duplication.
- Remain independent of implementation.
- Support scalable organization.
- Preserve original quality whenever practical.

---

## Must Contain

Examples include:

- Project logos
- Icons
- Fonts
- Shared images
- Audio resources
- Branding assets
- Design resources
- Static reference media

---

## Must Not Contain

The `assets/` directory should not contain:

- Source code
- Generated datasets
- Project documentation
- Runtime-generated files
- Build reports
- Application business logic

---

## Relationship to Other Directories

The `assets/` directory may be consumed by:

- `frontend/`
- `backend/` (where applicable)
- `documentation/`
- `tools/`
- `tests/`

Project assets remain independent of the systems that consume them and should not become coupled to a specific application or implementation.

---

## Related Documentation

Examples include:

- UI_GUIDELINES.md
- SYSTEM_ARCHITECTURE.md
- REPOSITORY_STRUCTURE.md

---

# reports/

## Purpose

The `reports/` directory contains reports generated throughout the development, build, validation, and testing processes.

Reports provide a historical record of project activity, enabling developers to review execution results, diagnose failures, compare builds, and verify project health without becoming part of the project's canonical data.

The `reports/` directory serves as the centralized location for all generated project reports.

---

## Responsibilities

The `reports/` directory is responsible for:

- Storing build reports.
- Storing validation reports.
- Storing test reports.
- Storing execution summaries.
- Preserving report history.
- Supporting debugging and auditing.
- Providing historical execution records.

Reports document project activity but should never become sources of project data.

---

## Ownership

The `reports/` directory owns all generated reports.

Reports are produced automatically by project systems and should not require manual maintenance except where explicitly documented.

---

## Design Principles

Reports should:

- Be human-readable.
- Be consistently structured.
- Clearly distinguish successes, warnings, and failures.
- Preserve useful historical information.
- Support debugging and auditing.
- Remain independent of implementation details.

---

## Must Contain

Examples include:

- Build reports
- Validation reports
- Test reports
- Execution summaries
- Database change reports
- Performance reports
- Diagnostic reports

---

## Must Not Contain

The `reports/` directory should not contain:

- Source code
- Generated datasets
- Runtime configuration
- Project documentation
- Application assets
- Canonical project data

---

## Relationship to Other Directories

The `reports/` directory is primarily produced by:

- `scripts/`
- `tests/`
- `tools/`

Reports may be reviewed by developers but should not be consumed as application data.

---

## Related Documentation

Examples include:

- SCRIPTS_ARCHITECTURE.md
- REPOSITORY_STRUCTURE.md
- COLLABORATION_CONTRACT.md
- DEVELOPMENT_ROADMAP.md

---

# tests/

## Purpose

The `tests/` directory contains the automated and manual testing resources used to verify the correctness, consistency, reliability, and stability of Pokémon Companion.

Testing validates that the project's implementation conforms to its documented architecture and behaves correctly as the project evolves.

The `tests/` directory remains independent of implementation while providing confidence in every major project system.

---

## Responsibilities

The `tests/` directory is responsible for:

- Verifying application behavior.
- Verifying database integrity.
- Verifying generated datasets.
- Verifying API behavior.
- Verifying script execution.
- Supporting regression testing.
- Supporting integration testing.
- Supporting future automated quality assurance.

Testing should verify project behavior rather than define it.

---

## Ownership

The `tests/` directory owns the project's testing resources.

Every major project area may contribute tests, but all testing assets should remain centralized within this directory whenever practical.

---

## Design Principles

Testing should:

- Be reproducible.
- Be deterministic whenever practical.
- Validate documented behavior.
- Detect regressions early.
- Remain independent of implementation details.
- Scale alongside the project.

---

## Must Contain

Examples include:

- Unit tests
- Integration tests
- End-to-end tests
- Validation tests
- Test fixtures
- Mock data
- Test utilities
- Test configuration

---

## Must Not Contain

The `tests/` directory should not contain:

- Production source code
- Generated datasets
- Project documentation
- Runtime application data
- Build reports
- Application assets unrelated to testing

---

## Relationship to Other Directories

The `tests/` directory may validate:

- `database/`
- `scripts/`
- `backend/`
- `frontend/`
- `tools/`

It may consume:

- `config/`

Testing remains independent of the systems it verifies and should not become part of the production application.

---

## Related Documentation

Examples include:

- COLLABORATION_CONTRACT.md
- DATABASE_SCHEMA.md
- SCRIPTS_ARCHITECTURE.md
- BACKEND_ARCHITECTURE.md
- API_DOCUMENTATION.md

---

# tools/

## Purpose

The `tools/` directory contains developer utilities that support the creation, maintenance, inspection, analysis, and management of Pokémon Companion.

Unlike the Scripts system, which is responsible for generating the project's database, tools provide auxiliary functionality that improves developer productivity without becoming part of the core data generation pipeline.

The `tools/` directory exists to support development rather than application runtime.

---

## Responsibilities

The `tools/` directory is responsible for:

- Providing developer utilities.
- Supporting project maintenance.
- Assisting data inspection.
- Assisting debugging.
- Supporting automation.
- Providing analysis utilities.
- Supporting migration tasks.
- Improving the overall developer experience.

Tools should assist project development without becoming dependencies of the application's normal operation.

---

## Ownership

The `tools/` directory owns project-wide developer utilities.

Individual project areas may provide tooling, but reusable utilities should remain centralized whenever practical.

---

## Design Principles

Tools should:

- Have a clearly defined responsibility.
- Be independent whenever practical.
- Improve developer productivity.
- Avoid duplicating functionality provided elsewhere.
- Be optional for application runtime.
- Scale alongside the project's development needs.

---

## Must Contain

Examples include:

- Developer utilities
- Inspection tools
- Analysis tools
- Migration tools
- Maintenance utilities
- Automation scripts
- Diagnostic utilities
- Productivity tools

---

## Must Not Contain

The `tools/` directory should not contain:

- Production application code
- Database generation scripts
- Canonical datasets
- Generated datasets
- Project documentation
- Runtime application assets

---

## Relationship to Other Directories

The `tools/` directory may interact with:

- `database/`
- `scripts/`
- `backend/`
- `frontend/`
- `config/`
- `reports/`
- `tests/`

Tools provide optional development support and should not become required components of the application's normal execution.

---

## Related Documentation

Examples include:

- SCRIPTS_ARCHITECTURE.md
- REPOSITORY_STRUCTURE.md
- COLLABORATION_CONTRACT.md
- DEVELOPMENT_ROADMAP.md

---

# .github/

## Purpose

The `.github/` directory contains repository management resources used by the project's hosting platform.

It defines workflows, issue templates, pull request templates, community guidelines, automation, and other repository-level resources that support collaboration and project maintenance.

The `.github/` directory manages repository operations rather than application functionality.

---

## Responsibilities

The `.github/` directory is responsible for:

- Repository workflows.
- Continuous integration and automation.
- Issue templates.
- Pull request templates.
- Community health files.
- Repository configuration.
- Contributor guidance supported by the hosting platform.

Repository management should remain separate from the project's implementation.

---

## Ownership

The `.github/` directory owns repository management resources.

It supports collaboration and automation while remaining independent of the project's application architecture.

---

## Design Principles

Repository management should:

- Support consistent collaboration.
- Encourage high-quality contributions.
- Automate repetitive maintenance tasks.
- Remain easy to understand.
- Avoid duplicating project documentation.
- Scale alongside project development.

---

## Must Contain

Examples include:

- Workflow definitions
- Issue templates
- Pull request templates
- Community health files
- Repository automation
- Repository configuration

---

## Must Not Contain

The `.github/` directory should not contain:

- Application source code
- Generated datasets
- Project documentation
- Runtime configuration
- Build artifacts
- Application assets

---

## Relationship to Other Directories

The `.github/` directory may interact with:

- `scripts/`
- `tests/`
- `reports/`
- `documentation/`

Repository workflows may execute project systems but should not redefine their responsibilities.

---

## Related Documentation

Examples include:

- COLLABORATION_CONTRACT.md
- CONTRIBUTING.md
- DEVELOPMENT_ROADMAP.md
- REPOSITORY_STRUCTURE.md