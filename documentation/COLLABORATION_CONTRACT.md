# Collaboration Contract

## Purpose

The Collaboration Contract defines the standards, principles, and working practices that govern all contributions to Pokémon Companion.

Its purpose is to ensure that every contributor—whether human or AI—works consistently, transparently, and in alignment with the project's documented architecture and long-term vision.

Rather than defining the platform itself, this document defines how contributors collaborate to design, develop, document, and maintain Pokémon Companion.

Every contribution should prioritize correctness, consistency, maintainability, and traceability over speed or convenience.

---

## Scope

This document applies to every contribution made to Pokémon Companion, including:

- Documentation
- Architecture
- Data Models
- Source Code
- APIs
- User Interface
- Testing
- Tooling
- Planning
- Design Discussions

The Collaboration Contract governs how contributors make decisions, propose changes, resolve uncertainty, and maintain consistency throughout the project.

Repository-specific workflows, such as branching strategies, pull requests, commit conventions, and code reviews, are documented separately in `CONTRIBUTING.md`.

---

# Core Principles

The following principles govern every contribution to Pokémon Companion.

They establish the expectations for decision-making, collaboration, documentation, and implementation throughout the project's lifecycle.

Every contributor should understand and follow these principles before making changes to the project.

---

## Documentation First

Project documentation is the primary source of truth.

Significant architectural, data model, or feature changes should be documented before implementation whenever practical.

When documentation and implementation diverge, the discrepancy should be identified and resolved rather than ignored.

---

## Source of Truth

Project-specific statements should be based on verified project documentation or the current implementation.

Contributors should avoid relying solely on memory, assumptions, or previous discussions when making project decisions.

If authoritative information is unavailable, clarification should be requested before proceeding.

---

## Truthfulness

Correctness takes priority over completeness.

When information is unknown or cannot be verified, contributors should explicitly acknowledge the uncertainty rather than introducing undocumented assumptions.

Project decisions should always distinguish between established facts and proposed ideas.

---

## Consistency

Contributors should maintain consistency across documentation, architecture, terminology, naming, and implementation.

Existing patterns should be extended where appropriate instead of introducing unnecessary variation.

Consistency improves maintainability and reduces ambiguity throughout the project.

---

## Minimal Necessary Change

Contributors should avoid modifying documentation, architecture, or implementation without clear justification.

Existing project decisions should remain unchanged unless a modification materially improves correctness, consistency, maintainability, or long-term scalability.

Stylistic preferences alone are not sufficient justification for changing established project content.

When no meaningful improvement exists, preserving the current design is the preferred decision.

---

## Prefer Extension

Contributors should extend existing architecture, documentation, and implementation whenever practical.

Existing structures should be reused before introducing new patterns, abstractions, or terminology.

Architectural redesign should occur only when the existing design no longer satisfies the project's documented goals.

---

## Separation of Responsibilities

Each document, module, component, and feature should have a clearly defined responsibility.

Information should be documented in its most appropriate location and referenced where necessary rather than duplicated.

Contributors should avoid introducing overlapping responsibilities or conflicting sources of truth.

# Collaboration Contract

## Purpose

The Collaboration Contract defines the standards, principles, and working practices that govern all contributions to Pokémon Companion.

Its purpose is to ensure that every contributor—whether human or AI—works consistently, transparently, and in alignment with the project's documented architecture and long-term vision.

Rather than defining the platform itself, this document defines how contributors collaborate to design, develop, document, and maintain Pokémon Companion.

Every contribution should prioritize correctness, consistency, maintainability, and traceability over speed or convenience.

---

## Scope

This document applies to every contribution made to Pokémon Companion, including:

- Documentation
- Architecture
- Data Models
- Source Code
- APIs
- User Interface
- Testing
- Tooling
- Planning
- Design Discussions

The Collaboration Contract governs how contributors make decisions, propose changes, resolve uncertainty, and maintain consistency throughout the project.

Repository-specific workflows, such as branching strategies, pull requests, commit conventions, and code reviews, are documented separately in `CONTRIBUTING.md`.

---

# Collaboration Workflow

The Collaboration Workflow defines the expected process for making changes to Pokémon Companion.

Its purpose is to encourage thoughtful decision-making, maintain documentation quality, and preserve consistency across the project.

Every contribution should follow these stages whenever practical.

---

## Before Starting Work

Before beginning any task, contributors should:

- Understand the objective of the change.
- Identify the relevant documentation.
- Review existing architecture and design decisions.
- Determine whether sufficient information is available.
- Request clarification when important information is missing.

Contributors should avoid making project-specific decisions based on assumptions or incomplete context.

---

## During Work

While working on the project, contributors should:

- Follow existing documentation and established patterns.
- Preserve the responsibilities of existing documents and components.
- Clearly distinguish facts, observations, proposals, and unknowns.
- Keep changes focused on the intended scope.
- Document significant design decisions when appropriate.

Contributors should extend the existing architecture rather than introducing unnecessary alternatives.

---

## Before Completion

Before considering a contribution complete, contributors should verify that:

- The change satisfies its intended objective.
- Documentation remains accurate and consistent.
- Existing terminology has been preserved.
- Related documents have been updated where necessary.
- No conflicting or duplicate sources of information have been introduced.

Every completed contribution should improve the project without reducing its overall consistency or maintainability.

---

## Implementation Workflow

To maintain consistency and reduce implementation errors, contributors should follow a structured implementation workflow.

Unless there is a clear reason to do otherwise, implementation should proceed using the following sequence.

### Create Before Implementing

When introducing a new file or directory:

- Create the required file or directory first.
- Confirm its creation before implementation begins.
- Avoid combining creation and implementation into a single step.

### Review Before Modification

Before modifying an existing file:

- Review the current contents of the file.
- Base all modifications on the latest implementation rather than assumptions or previous versions.
- Prefer updating the complete file rather than providing isolated code fragments.
- When implementation depends on the repository structure, verify the relevant file or directory locations before providing project-specific paths.

### One Step at a Time

Implementation should progress incrementally.

Each step should have a single objective that can be completed, reviewed, and verified before continuing.

Large features should be divided into small, independently verifiable tasks.

### Testing Workflow

When implementation requires verification:

- Clearly identify that a test should be run.
- Provide the exact command required to execute the test.
- Request the complete output rather than a summary.
- Use the output as the basis for further decisions before continuing implementation.

### Temporary Files

When temporary files are created for development or verification purposes:

- Clearly identify their temporary purpose.
- Explicitly indicate when they are no longer required.
- Remove temporary artifacts once they have served their intended purpose.

---

# Decision Rules

The following rules govern how contributors make decisions when information is incomplete, documentation conflicts, or new ideas are introduced.

These rules help preserve consistency while preventing undocumented assumptions from becoming part of the project.

---

## Missing Information

When required information is unavailable or cannot be verified, contributors should seek clarification before proceeding.

Contributors should avoid introducing project-specific assumptions to fill missing information.

If clarification is not immediately available, the contribution should clearly identify the missing information rather than presenting assumptions as facts.

---

## Conflicting Documentation

When multiple project documents provide conflicting information, contributors should not choose one source arbitrarily.

Instead, the conflict should be identified, documented, and resolved before additional work continues.

Only one authoritative interpretation should remain after the conflict has been resolved.

---

## Facts

Facts are statements that are directly supported by approved project documentation or the current implementation.

Facts should be presented without speculation or personal interpretation.

Whenever practical, contributors should identify the document or implementation that supports the statement.

---

## Observations

Observations are conclusions drawn directly from the current state of the project.

Unlike facts, observations describe what currently exists rather than defining intended project behavior.

Observations should remain objective and should not be interpreted as project requirements.

---

## Proposals

Proposals are suggested improvements that have not yet been accepted into the project.

Every proposal should be clearly identified as a recommendation rather than an established project decision.

A proposal does not become part of Pokémon Companion until it has been reviewed, approved, and documented appropriately.

---

## Unknowns

Unknowns represent information that cannot currently be verified.

Contributors should explicitly acknowledge unknowns instead of attempting to resolve them through assumptions or speculation.

Identifying uncertainty is preferable to introducing incorrect project information.

---

# Documentation Standards

Documentation is the long-term source of knowledge for Pokémon Companion.

Every contribution should strengthen the documentation by improving its accuracy, consistency, and maintainability while avoiding unnecessary duplication.

---

## Single Source of Truth

Every piece of project information should have one authoritative location.

Contributors should update the appropriate document rather than duplicating information across multiple documents.

When documentation references information maintained elsewhere, it should refer to the authoritative source instead of copying its contents.

---

## Respect Document Responsibilities

Each document has a clearly defined responsibility.

Contributors should extend the document that owns a concept rather than duplicating the same information elsewhere.

When information already exists in an authoritative document, contributors should prefer cross references over repeated explanations.

Documents should complement one another rather than compete as independent sources of truth.

---

## Cross References

Related documents should complement one another rather than repeat the same information.

When multiple documents are connected, contributors should establish clear references between them while preserving the responsibility of each document.

Cross references should improve navigation without creating duplicate sources of truth.

---

## Terminology

Project terminology should remain consistent throughout the documentation.

Contributors should use established names, abbreviations, and definitions unless an approved project change introduces new terminology.

Existing terminology should not be replaced with alternative wording that changes the intended meaning.

---

## Naming Conventions

Names should follow the project's established conventions.

This includes, but is not limited to:

- Documents
- Features
- Datasets
- APIs
- Components
- Database entities
- Variables
- Identifiers

Contributors should extend existing naming patterns instead of creating inconsistent alternatives.

---

## Documentation Updates

Documentation should evolve together with the project.

When a contribution changes the project's behavior, architecture, data model, or public interface, the affected documentation should be reviewed and updated where appropriate.

Documentation should accurately reflect the current state of the project rather than future intentions, unless content is explicitly identified as planned or proposed.

---

# AI Collaboration Standards

AI assistants should assume that approved project documentation is intentional.

Existing documentation should not be rewritten unless a clear inconsistency, architectural issue, or documented improvement has been identified.

When no meaningful improvement exists, the assistant should recommend leaving the documentation unchanged.

---

## Verified Information

AI assistants should base project-specific statements on verified project documentation, approved implementation, or information explicitly provided during the current collaboration.

When documentation is unavailable or incomplete, AI assistants should request clarification rather than introducing undocumented project details.

---

## No Hallucinations

AI assistants must not present generated assumptions, inferred project details, or fabricated information as established project facts.

If sufficient information is unavailable, the assistant should explicitly acknowledge the limitation instead of attempting to complete the response through speculation.

---

## Facts and Proposals

AI assistants should clearly distinguish between:

- Established project facts
- Current observations
- Recommendations and proposals
- Unknown or unverified information

Recommendations should never be presented as existing project decisions unless they have been approved and documented.

---

## Preserve Existing Documentation

AI assistants should extend existing documentation rather than rewriting established project decisions without justification.

Contributors should respect the responsibilities of individual documents and avoid introducing unnecessary duplication or architectural drift.

---

## Respect Project Terminology

AI assistants should use the terminology, naming conventions, and definitions established within the project's documentation.

Alternative terminology should only be introduced when explicitly proposed and approved as a project change.

---

## Explain Uncertainty

When uncertainty exists, AI assistants should communicate it clearly.

Rather than making assumptions, contributors should identify the missing information and request the documentation or clarification required to continue accurately.

Acknowledging uncertainty is preferable to introducing incorrect project information.

---

# Contributor Responsibilities

Every contributor shares responsibility for preserving the quality, consistency, and long-term maintainability of Pokémon Companion.

Contributors should work collaboratively while respecting the project's documentation, architecture, and established design decisions.

---

## Human Contributors

Human contributors are responsible for:

- Understanding the relevant project documentation before making significant changes.
- Following the established collaboration principles and documentation standards.
- Reviewing the impact of changes across related documents and components.
- Clearly communicating proposed architectural or functional changes.
- Maintaining consistency with existing project terminology and design patterns.
- Reviewing AI-assisted contributions before accepting them into the project.

Human contributors remain responsible for the final accuracy and quality of accepted project changes.

---

## AI Contributors

AI assistants are responsible for:

- Assisting with documentation, implementation, analysis, planning, and technical discussion.
- Following the collaboration principles defined within this contract.
- Basing project-specific statements on verified documentation or information provided during the current collaboration.
- Clearly distinguishing facts, observations, proposals, and unknown information.
- Requesting clarification when required information is unavailable.
- Supporting contributors without introducing undocumented project decisions.

AI assistants provide guidance and recommendations but do not independently define project direction.

---

## Shared Responsibility

All contributors share responsibility for:

- Preserving documentation quality.
- Maintaining architectural consistency.
- Respecting established project terminology.
- Identifying inconsistencies and ambiguities.
- Improving the project without introducing unnecessary complexity.
- Supporting constructive and transparent collaboration.

Every accepted contribution should leave Pokémon Companion more consistent, more maintainable, and better documented than before.

---

# Contract Maintenance

The Collaboration Contract is a living document that evolves alongside Pokémon Companion.

Its purpose is to preserve consistent collaboration practices while adapting to the project's growth, new contributors, and evolving development processes.

Changes to this document should be made thoughtfully and only when they improve the clarity, consistency, or effectiveness of the collaboration standards.

---

## Contract Updates

Updates to this contract should:

- Preserve the document's purpose and scope.
- Maintain consistency with the rest of the project documentation.
- Improve collaboration without introducing unnecessary complexity.
- Clearly document significant changes to established collaboration practices.

Contributors should avoid modifying the contract for isolated situations that are better addressed within project-specific documentation.

---

## Review

The Collaboration Contract should be reviewed periodically to ensure that it continues to reflect the project's current collaboration practices.

Reviews should consider:

- New contributor workflows.
- Documentation quality.
- Development practices.
- Lessons learned during project development.
- Opportunities to improve collaboration.

The contract should remain stable while continuing to support the long-term evolution of Pokémon Companion.

---

## Guiding Principle

This contract exists to help contributors work together effectively while preserving the quality, consistency, and long-term maintainability of Pokémon Companion.

Whenever uncertainty exists, contributors should prioritize collaboration, clarification, and documented decisions over assumptions or undocumented changes.