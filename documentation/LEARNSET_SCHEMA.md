# Learnset Schema

This document defines the architecture of the Pokémon Companion Learnset system.

Unlike PokéAPI, Pokémon Companion is designed around the trainer experience rather than the API structure.

The frontend presents learnset information in a way that is intuitive for trainers, while the backend stores normalized data that is easy to maintain and extend.

---

# Scope

This document defines the conceptual architecture of the Pokémon Companion Learnset system.

Its purpose is to describe how learnsets are modeled, organized, stored, and exposed throughout the platform while remaining independent of presentation details and implementation-specific technologies.

This document does not define user interface layouts, API endpoints, or database implementation details. Those responsibilities are documented separately within the appropriate project documentation.

---

# Responsibilities

The Learnset Schema is responsible for:

- Defining the conceptual learnset model.
- Defining learnset relationships.
- Defining learning methods.
- Supporting historical learnset changes.
- Supporting version-specific learnsets.
- Supporting future Pokémon games.
- Defining frontend and backend responsibilities.

The Learnset Schema should remain independent of user interface implementation and API design while providing the foundation upon which both systems operate.

---

# Design Goals

The Learnset system should:

- Support every main-series Pokémon game.
- Support version-specific learnsets.
- Support historical changes.
- Support future Pokémon games without redesigning the schema.
- Separate data storage from frontend presentation.
- Avoid duplicated move entries whenever possible.

---

# Core Principles

## Version-Aware

Learnsets are stored by **Version Group**, not by Generation.

Example:

Generation VI

- X
- Y
- Omega Ruby
- Alpha Sapphire

These games have different move tutors and move availability.

Generation alone is not sufficient.

---

## Method-Based

Every move has a learning method.

Supported learning methods include:

- Level Up
- TM
- HM
- TR
- Tutor
- Egg
- Reminder
- Evolution
- Pre-Evolution
- Event
- Transfer
- Special
- Purification
- Shadow
- Partner
- Sketch

Future learning methods should be supported without redesigning the database.

---

## Normalized Data

The backend stores moves only once.

Each learn entry contains:

- Move
- Version Group
- Learn Method
- Requirements

The frontend is responsible for grouping data into tabs.

---

# Dependencies

The Learnset Schema depends on several canonical project models.

These include:

- Pokémon Species
- Moves
- Version Groups
- Learning Methods
- Forms
- Game Context

The Learnset Schema references these models but does not redefine them.

Changes to these models should be reflected within the Learnset Schema where appropriate.

---

# Learn Methods

Every Learn Entry is associated with a single learning method that defines how a Pokémon obtains a move within a specific Version Group.

The Learnset Schema currently supports the following learning methods:

---

## Level Up

Moves learned automatically by reaching a specific level.

---

## TM / HM / TR

Moves taught using Technical Machines (TM), Hidden Machines (HM), or Technical Records (TR), depending on the supported game.

---

## Tutor

Moves taught by Move Tutors.

---

## Egg

Moves inherited through breeding.

---

## Reminder

Moves relearned through the Move Reminder or equivalent mechanics.

---

## Evolution

Moves learned immediately upon evolution.

---

## Pre-Evolution

Moves obtainable only before evolving into the current species.

These moves remain important for breeding, competitive play, and historical learnsets.

---

## Event

Moves distributed through official events or special distributions.

---

## Transfer

Moves obtainable only by transferring Pokémon from previous games or external services.

---

## Special

Moves obtained through game-specific mechanics that do not fit the standard learning methods.

Examples include:

- Shadow Pokémon
- Purification
- Partner Moves
- Ride Pokémon

The Learnset Schema is designed to support additional learning methods without requiring structural redesign.

---

# Learn Entry Model

A Learn Entry represents one official method through which a Pokémon may learn a move within a specific Version Group.

Each Learn Entry is conceptually composed of:

- Species
- Move
- Version Group
- Learning Method
- Requirements

Every Learn Entry represents exactly one learning method within one Version Group.

Additional requirements may further qualify how the move is obtained.

---

# Backend Responsibilities

The backend stores normalized learn entries.

Each Learn Entry represents a single learning method for a specific Pokémon within a Version Group.

The backend should not store frontend tabs or presentation-specific structures.

Frontend groupings should be generated dynamically from the normalized learn entries.

---

# Frontend Responsibilities

The frontend is responsible for presenting learnset information in a trainer-friendly format.

Presentation responsibilities include:

- Grouping moves by learning method.
- Organizing learnsets by Version Group.
- Supporting searching and filtering.
- Displaying only relevant learning methods.

Presentation details are defined separately within UI_GUIDELINES.md.

---

# API Responsibilities

The API is responsible for exposing learnset information while preserving the normalized backend model.

API implementations may provide trainer-friendly groupings without duplicating canonical learnset data.

Endpoint definitions are documented separately within API_DOCUMENTATION.md.

---

# Future Expansion

The Learnset system should eventually support:

- Legends: Arceus
- Pokémon HOME
- Event distributions
- Regional variants
- Form-specific learnsets
- Alpha Pokémon
- Gigantamax forms
- Mega Evolutions
- DLC version changes

without requiring structural redesign.

---

# Design Philosophy

The backend stores data efficiently.

The frontend presents data beautifully.

The user should never need to understand how PokéAPI stores learnsets.

Instead, Pokémon Companion should present learnsets exactly how trainers naturally search for them.