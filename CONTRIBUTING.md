# Contributing to Pokémon Companion

## Purpose

First of all, thank you for your interest in contributing to Pokémon Companion! 🎉

The goal of this project is to build the ultimate companion application for Pokémon trainers. Whether you're fixing bugs, improving documentation, expanding the database, or adding new features, every contribution is appreciated.

---

## Scope

This document applies to all repository contributions, including:

- Source code
- Documentation
- Datasets
- Scripts
- Frontend
- Backend
- Testing
- Tooling

Project collaboration principles and engineering standards are defined separately within `documentation/COLLABORATION_CONTRACT.md`.

---

# Before You Start

Before contributing, contributors should:

- Read `README.md`.
- Review `documentation/COLLABORATION_CONTRACT.md`.
- Read the documentation relevant to the area being modified.
- Understand the existing project architecture.
- Keep contributions focused on a single objective whenever practical.

---

# Types of Contributions

Contributions may include:

- Documentation
- Features
- Bug Fixes
- User Interface
- Data
- APIs
- Tooling
- Testing
- Performance Improvements

---

# Repository Structure

Contributors should preserve the existing repository organization.

Significant structural changes should only be introduced when they improve maintainability and are consistent with the project's documented architecture.

---

# Development Guidelines

## JavaScript

- Use descriptive variable names.
- Keep functions focused.
- Avoid unnecessary nesting.
- Reuse shared utilities whenever possible.
- Follow the existing formatting style.

---

## CSS

- Use CSS variables from `global.css`.
- Reuse shared components.
- Avoid duplicate styles.
- Keep page-specific styles inside page stylesheets.

---

## HTML

- Use semantic HTML.
- Keep layouts responsive.
- Follow the UI Guidelines document.
- Avoid inline JavaScript.

---

# Database Changes

If you modify database generation scripts:

1. Regenerate the affected dataset.
2. Run the database validator.

```bash
node scripts/validate/validate-database.js
```

Database changes should never be committed without passing validation.

---

# Documentation

Documentation is considered part of every significant contribution.

When changes affect architecture, features, APIs, data models, or user experience, the relevant documentation should be reviewed and updated accordingly.

Collaboration standards are defined within `documentation/COLLABORATION_CONTRACT.md`.

---

# Pull Requests

When opening a pull request:

- Clearly describe the change.
- Keep changes focused.
- Include screenshots when updating the UI.
- Update documentation if necessary.

---

# Review Checklist

Before submitting a contribution, verify that:

- Documentation has been updated where necessary.
- Existing project terminology has been preserved.
- Shared components and utilities have been reused where appropriate.
- No duplicate functionality has been introduced.
- Code follows the established project conventions.
- The contribution remains consistent with the documented architecture.

---

# Reporting Issues

When reporting a bug, include:

- Expected behavior
- Actual behavior
- Steps to reproduce
- Screenshots (if applicable)
- Browser / operating system

---

# Questions

If you're unsure about an implementation, please open an issue before beginning large changes.

This helps keep the project architecture consistent.

---

Thank you for helping improve Pokémon Companion!