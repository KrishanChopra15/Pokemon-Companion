# Learnset Schema

This document defines the architecture of the Pokémon Companion Learnset system.

Unlike PokéAPI, Pokémon Companion is designed around the trainer experience rather than the API structure.

The frontend should organize moves in a way that is intuitive for players while the backend stores normalized data that is easy to maintain and extend.

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

# Frontend Design

The Learnset page should provide an intuitive trainer experience.

Workflow:

Generation

↓

Version

↓

Learning Method

↓

Moves

---

## Generation Selector

Examples:

Generation I

Generation II

Generation III

...

Generation IX

Changing generation updates the available Version Groups.

---

## Version Selector

Examples:

Red Blue

Yellow

Crystal

Emerald

Platinum

HeartGold SoulSilver

Ultra Sun Ultra Moon

Scarlet Violet

Changing Version updates every Learnset table.

---

## Learnset Tabs

The frontend groups moves into separate tabs.

Tabs include:

### Level Up

Moves learned by gaining levels.

Columns:

- Level
- Move
- Type
- Category
- Power
- Accuracy

---

### TM / HM / TR

Moves learned from technical machines.

Columns:

- Machine
- Move
- Type
- Category

---

### Tutor

Moves taught by Move Tutors.

---

### Egg

Egg Moves.

---

### Reminder

Moves available from the Move Reminder.

---

### Evolution

Moves learned immediately upon evolution.

---

### Pre-Evolution

Moves only obtainable before evolving.

Useful for competitive players.

---

### Event

Special distribution moves.

---

### Transfer

Moves available only through transfer from previous games.

---

### Special

Game-specific mechanics.

Examples:

- Shadow Pokémon
- Purification
- Partner Moves
- Ride Pokémon

---

# Backend Architecture

The backend stores normalized learn entries.

Each entry represents:

Species

↓

Move

↓

Version Group

↓

Learning Method

↓

Requirements

The backend should not store frontend tabs.

Tabs are generated dynamically.

---

# Frontend Responsibilities

The frontend should:

- Group moves by learning method.
- Display only tabs that contain moves.
- Allow Generation switching.
- Allow Version switching.
- Support searching within learnsets.
- Support sorting.
- Support future filtering.

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