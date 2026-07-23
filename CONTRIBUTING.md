# Contributing to Pokémon Companion

First of all, thank you for your interest in contributing to Pokémon Companion! 🎉

The goal of this project is to build the ultimate companion application for Pokémon trainers. Whether you're fixing bugs, improving documentation, expanding the database, or adding new features, every contribution is appreciated.

---

# Before You Start

Please:

- Read the project documentation.
- Review the project roadmap.
- Follow the existing project architecture.
- Keep commits focused and descriptive.

---

# Development Philosophy

Pokémon Companion follows a few important principles:

- Accuracy over shortcuts.
- Maintainability over complexity.
- Consistency across the entire project.
- Reusable components whenever possible.
- Database-first development.

Every contribution should support these principles.

---

# Project Structure

```
database/
scripts/
frontend/
docs/
```

Please avoid changing the project structure unless absolutely necessary.

---

# Coding Guidelines

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

Please update documentation whenever:

- Adding a feature
- Changing architecture
- Adding datasets
- Updating APIs
- Modifying project structure

Documentation is considered part of the implementation.

---

# Pull Requests

When opening a pull request:

- Clearly describe the change.
- Keep changes focused.
- Include screenshots when updating the UI.
- Update documentation if necessary.

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