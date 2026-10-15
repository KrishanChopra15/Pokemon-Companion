# Pokémon Companion Product Vision

**Document Type:** Product Vision and Experience Specification  
**Status:** Living Document  
**Purpose:** Define the product vision, core user experience, confirmed product decisions, and future direction of Pokémon Companion.

---

## 1. Purpose

Pokémon Companion began as a project to build a Pokémon adventure tracker. Over time, the vision expanded into something much larger: an all-in-one companion that supports players throughout their Pokémon journeys.

The goal is to create a single application that brings together Pokémon knowledge, adventure tracking, interactive world maps, game guidance, battle simulation, collection management, and intelligent assistance.

Pokémon Companion should help players understand the game they are playing, discover what they can do, prepare for challenges, track their progress, and explore the Pokémon world in their own way.

It should not be merely a Pokédex, a map viewer, a walkthrough, or a tracker. It should connect these capabilities into one coherent experience.

**Core vision: Everything a player needs to explore, understand, track, and experience their Pokémon adventures in one companion.**

---

## 2. Product Goals

Pokémon Companion aims to:

- Support Pokémon players throughout their entire adventure, from starting a game to completing its major and optional objectives.
- Provide accurate, historically appropriate information for each supported Pokémon game.
- Help players discover where Pokémon can be found, how they can be obtained, and how they evolve.
- Provide interactive maps that make exploring and understanding game worlds easier.
- Guide players through game progression without forcing them to follow a fixed walkthrough.
- Reduce the effort required to maintain accurate adventure progress.
- Provide battle simulators for competitive play, NPC battles, and strategic preparation.
- Support ordinary playthroughs, challenge runs, collection goals, and multiple independent adventures.
- Make information and tools accessible through natural-language conversation.
- Support offline use wherever practical.
- Expand to additional official Pokémon games without requiring fundamental architectural redesigns.

---

## 3. Core Product Principles

### 3.1 One Companion, Many Connected Tools

Pokémon Companion should provide multiple tools that work together rather than behave like unrelated applications.

The Pokédex, world map, adventure tracker, progression guide, battle simulators, team tools, collections, and chat should share relevant knowledge and context.

For example, asking where a Pokémon can be found should be able to lead directly to its encounter information and map locations. Preparing for a trainer battle should connect to the selected game's trainer data and, when appropriate, the player's current team.

### 3.2 Player Freedom

Pokémon Companion should guide players, not control them.

The application may recommend a next objective, explain useful optional activities, and show possible routes. However, players remain free to explore, collect Pokémon, pursue side objectives, challenge available trainers, or ignore recommendations.

The system must not assume that every player follows the same route or completes objectives in a fixed order.

### 3.3 Accurate Game-Specific Information

Information must reflect the selected game's actual mechanics, available Pokémon, encounters, trainers, items, progression requirements, and other relevant differences.

Modern mechanics must not silently replace historical mechanics in older games.

### 3.4 Low-Friction Progress Tracking

Tracking should require as little effort as reasonably possible.

The application should automatically detect progress where technically feasible and use lightweight manual confirmation when automatic detection is unavailable or uncertain.

### 3.5 Separate Knowledge and Personal Progress

Canonical Pokémon knowledge and a player's personal adventure state must remain separate.

Personal progress may reference canonical game entities but must not modify the shared Pokémon knowledge database.

### 3.6 Offline-First Experience

The encyclopedia, available local datasets, maps, and local adventure tracking should remain usable without an internet connection after the necessary data has been obtained.

Online features such as authentication, cloud synchronization, community interactions, AI services, and dataset updates may require connectivity.

### 3.7 Extensibility

The product should support additional games, features, challenge types, battle formats, and tracking methods without requiring a separate application for each one.

---

## 4. Home and Navigation Experience

### 4.1 Resume an Active Adventure

When a logged-in user has an active adventure tracker, opening Pokémon Companion should take them directly back to that adventure rather than forcing them to navigate through the application every time.

The active adventure dashboard should provide a concise overview of the player's recorded progress and relevant next steps.

### 4.2 Users Without an Active Adventure

Users who do not have an active adventure should still be able to access the application's general tools.

Depending on the selected navigation design, they may browse the Pokédex, explore maps, use supported battle tools, ask general Pokémon questions, or start a new adventure.

Account creation should not be required for general reference features.

### 4.3 Feature-Oriented Navigation

The application must not make the world map the default home for every user.

The map is an important feature, but it is one part of a larger product.

Navigation should provide clear access to major tools such as:

- Pokédex and Pokémon research.
- Interactive world maps.
- Adventure tracker and adventure management.
- Game guide and progression information.
- Battle simulators and team tools.
- Collection and completion tracking.
- Pokémon Companion chat.
- Settings and account management.

The final navigation structure may evolve as the feature set becomes clearer.

---

## 5. Adventure Tracker

The Adventure Tracker represents a player's progress through a particular game context and playthrough.

A user may maintain multiple independent trackers, including multiple playthroughs of the same game.

Examples include:

- FireRed Normal Adventure.
- FireRed Nuzlocke.
- FireRed speedrun practice.
- Emerald Living Dex adventure.
- LeafGreen casual playthrough.

### 5.1 Tracker Independence

Every tracker must preserve its own progress and settings.

This includes, where applicable:

- Badges and progression milestones.
- Party and boxed Pokémon.
- Seen, caught, and owned Pokémon.
- Inventory and key items.
- Visited locations.
- Collected items.
- Defeated trainers.
- Completed events and objectives.
- Challenge rules and completion state.
- Notes and achievements.

Progress from one tracker must not automatically affect another. Explicit operations such as cloning, importing, exporting, or comparing trackers may be provided separately.

### 5.2 Adventure Dashboard

The dashboard should provide a useful overview without overwhelming the player.

It may show:

- Selected game and adventure name.
- Current or last known location.
- Recorded badges and important milestones.
- Current team.
- Collection progress.
- Available objectives.
- Recommended next step.
- Relevant upcoming battles.
- Challenge status, when applicable.

The dashboard must distinguish confirmed progress from inferred or unknown progress.

---

## 6. Progress Detection and Tracking

### 6.1 Core Problem

Pokémon Companion generally cannot assume it has direct access to the running Pokémon game.

It must therefore determine progress through available sources rather than relying on continuous direct communication with every game or requiring the player to record every action manually.

Repeatedly uploading save files or manually recording every caught Pokémon, trainer defeat, item, and location would create unnecessary friction.

### 6.2 Automatic Detection First

The preferred strategy is to detect progress automatically wherever technically feasible.

Potential mechanisms include:

- Supported emulator integrations.
- Save-file import and change detection.
- Screenshot recognition.
- Supported screen-capture workflows.
- Other reliable sources of game-state information.

These are capabilities to investigate and implement over time, not guarantees that every game or device can be monitored automatically.

### 6.3 Minimal Manual Input

When automatic detection is unavailable, the companion should ask for the smallest amount of information necessary.

Examples include confirming an important milestone, selecting a current location, or recording a newly caught Pokémon when no reliable automatic method is available.

The interface should avoid repetitive, lengthy forms for routine progress updates.

### 6.4 Hardware and Emulator Support

The long-term experience should support both emulator players and players using original hardware or consoles.

Different setups may require different tracking methods. The application must not promise equivalent automatic detection where access to game data differs.

### 6.5 Confidence and Uncertainty

The application must distinguish:

- Confirmed progress.
- Inferred progress.
- Unknown progress.
- Hypothetical progress used for simulations.

It must not silently mark a Pokémon caught, a trainer defeated, or an event completed without sufficient evidence.

When uncertainty affects a recommendation, the companion should ask a focused question or present the uncertainty clearly.

---

## 7. Game Guide and Progression Recommendations

### 7.1 Proactive Guidance

Pokémon Companion should provide a compact next-step recommendation on the active adventure dashboard.

Players can request more details when needed, including instructions, requirements, relevant locations, alternative routes, and related information.

Guidance should be useful without dominating the interface.

### 7.2 No Forced Walkthrough

The companion must not impose one fixed walkthrough.

Players may choose among currently available activities, explore optional locations, pursue collection goals, or take alternate routes permitted by the game.

The system should distinguish between required progression, useful optional activities, and future objectives.

### 7.3 Data-Driven Progression

Recommendations must use the selected game's progression rules and the player's recorded state.

Availability must not be inferred solely from a badge count or a fixed numerical gym sequence.

The system should account for relevant requirements such as:

- Badges.
- Field-move permissions.
- Key items.
- Story events.
- Cleared obstacles.
- Location access.
- Trainer defeats.
- Optional routes and alternate progression paths.

### 7.4 Hypothetical Progress

Players may preview future progression without changing their saved tracker.

Simulated states and hypothetical actions must remain separate from actual recorded progress.

---

## 8. Pokémon Companion Chat

Pokémon Companion should include a conversational assistant that makes the application's knowledge and tools easier to use.

### 8.1 Two Ways to Access Chat

The chat experience should provide:

1. A dedicated chat page for longer conversations and detailed questions.
2. A smaller assistant accessible throughout the application.

The assistant should be available without forcing the user to leave the current tool unnecessarily.

### 8.2 General Pokémon Questions

Users should be able to ask general questions about Pokémon, including species, moves, abilities, evolutions, items, game mechanics, and other supported knowledge.

General reference questions should remain available without an active adventure tracker.

### 8.3 Context-Aware Adventure Assistance

When a selected game and adventure are available, the assistant should use that context to answer questions about the player's recorded progress and available objectives.

Examples:

- What should I do next?
- Where can I catch a particular Pokémon in this game?
- Can I reach this location yet?
- Why is this route blocked?
- Which Pokémon can learn a required move?
- How should I prepare for the next Gym?
- What do I still need for my collection?

Answers must distinguish the actual game state from the progress recorded by Pokémon Companion.

### 8.4 Integration with Other Tools

Where appropriate, chat responses should link to relevant application features.

Examples include opening:

- A Pokémon entry.
- An encounter location on the map.
- A progression objective.
- A trainer battle simulation.
- A team analysis.
- A collection checklist.

### 8.5 Explainable Guidance

The assistant should explain why it recommends an action rather than merely issuing instructions.

It should use validated, game-specific knowledge wherever possible and communicate uncertainty when information or progress is incomplete.

---

## 9. Battle Simulator System

Pokémon Companion will provide three distinct battle experiences.

### 9.1 PvP Battle Simulator

The Player versus Player simulator allows logged-in users to battle one another.

The intended experience is similar in spirit to Pokémon Showdown, allowing users to select Pokémon freely rather than restricting them to the contents of an adventure tracker.

The long-term experience should support:

- Team creation and Pokémon selection.
- Selection of moves and other relevant battle settings.
- Supported battle formats and rulesets.
- Turn-by-turn battles between users.
- Clear separation between different game mechanics and competitive rulesets.

The exact battle formats, matchmaking experience, and initial scope remain open decisions.

PvP team selection must not require the user to own the selected Pokémon in an adventure tracker unless a future, explicitly separate format introduces such a restriction.

### 9.2 PvE Battle Simulator

The Player versus Environment simulator allows users to battle NPC trainers from supported Pokémon games.

The intended experience includes:

- Selecting a game context.
- Selecting a known NPC trainer or trainer battle.
- Using the trainer's known team and relevant battle data.
- Testing player-selected teams and strategies.
- Applying the selected game's appropriate battle mechanics.

Trainer data should come from the shared knowledge system rather than being duplicated separately for each battle feature.

### 9.3 Tracker-Integrated Battle Simulator

The third simulator is part of an active adventure tracker.

Its purpose is to help players assess the risks of upcoming battles before fighting those opponents in the actual game.

This feature is particularly valuable for Nuzlocke challenges, where losing a Pokémon may have serious consequences.

The simulator should use the relevant game context and the Pokémon available to that tracker.

Potential outputs include:

- Estimated probability of winning.
- Potentially dangerous matchups.
- Damage ranges and knockout possibilities.
- Relevant speed and move-order considerations.
- Potential risk of losing one or more Pokémon.
- Potential risk of a total party wipe.
- Alternative teams or battle strategies.
- Explanations of why a battle may be dangerous.

These results must come from actual simulation or a defensible probabilistic model. The application must not present arbitrary scores as reliable win probabilities.

The simulator should explain uncertainty and avoid implying that a calculated probability guarantees a particular result.

### 9.4 Battle Recommendation Priorities

The tracker-integrated simulator should prioritize battles based on availability, usefulness, and relevance to the player's current goals.

The following principles are confirmed:

- Currently accessible and relevant battles receive the greatest priority.
- Useful optional battles may receive additional emphasis when they unlock valuable capabilities or make later objectives easier.
- Multiple equally viable options should retain comparable importance.
- Future battles remain visible as preparation opportunities but receive lower priority than relevant battles available now.
- Future battles should display unmet prerequisites when those are known.
- The ranking must not replace or modify the underlying progression rules.

For example, in FireRed, Brock is the primary Gym recommendation early in the adventure, followed by Misty after Brock is defeated.

After Misty, Lt. Surge may receive additional emphasis because the Flash field-move permission can help with Rock Tunnel. Other accessible Gyms may remain valid alternatives.

Later Gym recommendations must reflect their actual requirements rather than assume that every Gym must be challenged in numerical order.

The exact recommendation algorithm remains an open implementation decision.

---

## 10. New Adventure Creation

When a user selects Adventure Tracker and chooses to start a new adventure, the application should allow them to choose how they want to play.

The two primary categories are:

### 10.1 Normal Adventure

A Normal Adventure provides standard tracking and guidance without adding special challenge restrictions.

The player can pursue the story, collect Pokémon, explore locations, complete optional objectives, and track progress at their own pace.

### 10.2 Challenge Adventure

A Challenge Adventure allows users to select one or more challenge rulesets that define additional restrictions, goals, and completion conditions.

Potential challenges include:

- Nuzlocke.
- Professor Oak Challenge.
- Monotype challenges.
- Solo-Pokémon challenges.
- Level-cap challenges.
- Item-restriction challenges.
- Randomizer challenges, where supported.
- Custom challenges.

This list is illustrative and does not establish an implementation schedule.

### 10.3 Challenge Configuration

Challenge selection should support configuration where a challenge has optional or variant rules.

For example, Nuzlocke configurations may differ in how duplicate encounters, gift Pokémon, fainted Pokémon, or other special situations are handled.

Challenge definitions should make their rules and completion conditions clear before the adventure begins.

### 10.4 Multiple Challenges in One Adventure

A single adventure may contain multiple active challenges.

For example, a user may create a FireRed adventure combining Nuzlocke rules with a compatible Kaizo challenge.

The application should support:

- One adventure containing multiple challenges.
- Separate rules and objectives for each challenge.
- Shared recording of underlying game events.
- Appropriate progress updates across all relevant challenges.
- Separate completion status for each challenge.
- Clear handling of conflicting rules.
- A combined view of the adventure's challenge status.

A single event should not need to be manually recorded multiple times merely because it affects several challenges.

### 10.5 Game Modifications and Challenge Rules

The application must distinguish between the selected game or game modification and the challenges applied to the adventure.

A Kaizo experience may involve a modified game with its own trainers, encounters, mechanics, and difficulty changes. It is not necessarily just a challenge ruleset layered over an unmodified official game.

Compatibility between a game or modification and a selected challenge must be considered.

Support for ROM hacks and modified games requires separate technical, data-availability, and compatibility decisions.

### 10.6 Challenge Integrity

Challenge rules should be tracked transparently.

When an action appears to violate a selected rule, the application may warn the user and explain the relevant restriction.

The companion should not silently alter challenge records or pretend that a rule was followed when it was not.

The precise treatment of rule violations, optional rule changes, and challenge completion remains to be defined.

---

## 11. Interactive World Map

The interactive map is one of the major features of Pokémon Companion, but it is not the entire application.

It should provide a visual representation of the selected game's world and connect map exploration with game knowledge and adventure tracking.

### 11.1 Map Interaction

Users should be able to explore the world through map navigation and interact with supported map objects.

Potential interactions include:

- Inspecting NPCs and trainers.
- Viewing Pokémon encounter information.
- Inspecting visible and hidden items.
- Viewing obstacles and their requirements.
- Inspecting story events and gift Pokémon.
- Recording relevant progress.
- Seeing completed and incomplete objectives.
- Understanding accessible and inaccessible routes.

### 11.2 Tracker-Aware Maps

When an adventure is active, the map should be able to show relevant recorded progress.

Examples include visited locations, collected items, defeated trainers, cleared obstacles, and discovered encounters.

The map must use the selected tracker and game context. Progress from unrelated trackers must never leak into the current view.

### 11.3 Connection to Progression

Map reachability should be derived from the progression system.

The map should distinguish accessible routes from routes that require additional progress, where the relevant data is available.

Recommendations may highlight useful routes, but they must not replace the underlying progression rules.

### 11.4 Clickable Objects

Supported objects should open relevant information and actions.

For example:

- A Pokémon encounter opens its encounter details.
- A trainer opens trainer information and battle tools.
- An item opens item information and, where applicable, a tracker action.
- An obstacle explains its requirements.
- A story event shows its relevant conditions and progress.

The exact set of supported objects depends on available data and implementation maturity.

---

## 12. Pokédex, Research, and Collection Tools

Pokémon Companion should provide comprehensive, game-aware Pokémon research tools.

Potential capabilities include:

- Species and form information.
- Game-specific availability.
- Encounter locations and methods.
- Evolution methods and requirements.
- Moves, abilities, and types.
- Item and machine compatibility.
- Trainer and encounter information.
- Regional Pokédex progress.
- Seen, caught, owned, and shiny tracking.
- Forms, ribbons, marks, and other collection goals where supported.

Users should be able to use general reference tools without starting an adventure.

When a tracker is active, collection tools should connect to that tracker's progress without changing canonical Pokémon data.

---

## 13. Offline and Cross-Device Experience

Offline use is an essential product goal.

After necessary datasets are available locally, supported reference and tracking features should continue to work without internet access.

### 13.1 Local Progress

Tracker changes made offline should be preserved locally.

The application should not discard user progress merely because the connection is unavailable.

### 13.2 Synchronization

When connectivity returns, eligible local changes should be synchronized with the user's account.

Synchronization must preserve tracker isolation and use defined conflict-handling rules.

Independent changes should be merged where safe. Conflicts that cannot be resolved reliably should use deterministic rules or request user confirmation.

### 13.3 Feature Limitations

Some capabilities may require an internet connection, including authentication, cloud synchronization, community features, certain AI services, and remote dataset updates.

The application should communicate these limitations clearly rather than making offline availability promises that a particular feature cannot meet.

---

## 14. Future Capabilities

The broader vision leaves room for additional tools and integrations.

Potential future capabilities include:

- AI battle planning and team analysis.
- Context-aware adventure guidance.
- Screenshot recognition.
- Save-file import and progress reconciliation.
- Automatic save detection where technically feasible.
- Battle replay analysis.
- Advanced collection dashboards.
- Additional challenge types.
- Community sharing and challenges.
- Additional battle formats and tools.

These capabilities are part of the long-term product direction where applicable, but this document does not automatically schedule them for implementation.

Their feasibility, data availability, dependencies, maintenance requirements, and priorities must be evaluated separately.

---

## 15. Relationship to Existing Architecture

This document describes the intended product experience and product-level decisions.

It does not replace the existing technical architecture or detailed feature specifications.

The following documents remain responsible for their respective concerns:

- `SYSTEM_ARCHITECTURE.md`: Major systems, boundaries, and interactions.
- `DATABASE_SCHEMA.md`: Logical data entities and ownership.
- `DATA_ARCHITECTURE.md`: Data flow, transformation, validation, and storage.
- `DATASETS.md`: Dataset responsibilities, dependencies, and lifecycle.
- `KNOWLEDGE_MODEL.md`: Canonical knowledge and relationship principles.
- `READER_ARCHITECTURE.md`: Platform-independent access to official game data.
- `FEATURES.md`: Detailed feature specifications and feature status.
- `UI_GUIDELINES.md`: Visual design, interaction, responsiveness, and accessibility.
- `REPOSITORY_STRUCTURE.md`: Repository organization and directory responsibilities.
- `DEVELOPMENT_ROADMAP.md`: Planned implementation work and sequencing.

Product requirements should be translated into detailed feature specifications and implementation tasks when the relevant decisions are sufficiently clear.

Where a product decision requires a technical decision, the appropriate architecture document or approved architectural decision record should be updated.

---

## 16. Confirmed Product Decisions

The following decisions have been established through product discussions.

1. Pokémon Companion is intended to become a multipurpose Pokémon companion rather than only a tracker.
2. The application should connect reference tools, maps, tracking, progression guidance, battle tools, and chat.
3. General reference features should not require an account.
4. A logged-in user with an active adventure should return directly to that adventure when opening the application.
5. Automatic progress detection should be used wherever technically feasible, with minimal manual input elsewhere.
6. The long-term tracking experience should accommodate both emulator players and players using original hardware or consoles, even if their tracking methods differ.
7. The companion should recommend useful next steps without forcing players to follow a fixed route.
8. Chat should have a dedicated page and a smaller assistant accessible throughout the application.
9. The adventure dashboard should show a compact next-step recommendation, with more detailed guidance available on request.
10. Three distinct battle experiences are intended: PvP, NPC PvE, and tracker-integrated battle-risk simulation.
11. The tracker-integrated simulator should prioritize relevant battles available now while retaining visibility into useful future battles.
12. New adventures should support Normal Adventure and Challenge Adventure categories.
13. A single adventure should be able to combine multiple challenges, such as a Nuzlocke and a compatible Kaizo challenge.
14. Game modifications must be distinguished from challenge rulesets.
15. The interactive world map is a major feature, but it should not be the default home for every user.
16. Offline reference and local tracking capabilities are essential product goals.
17. Canonical game knowledge and personal tracker progress must remain separate.

These decisions describe the intended product direction. They do not mean the corresponding features are already implemented.

---

## 17. Open Product Questions

The following areas still require decisions or further investigation.

### Tracking

- Which games and emulators should receive automatic tracking support first?
- Which forms of screenshot recognition and capture workflows are practical?
- How should conflicting or uncertain progress detections be presented?
- What should the fallback tracking experience look like for unsupported hardware?

### Battle Simulation

- Which game-specific battle engine should be supported first?
- Which competitive rulesets and formats should PvP initially provide?
- How should users challenge, invite, or match with other players?
- What simulation method and assumptions should support win-probability estimates?
- How should random effects, uncertain opponent decisions, and battle strategies be modeled?

### Challenges

- Which challenge presets should be available initially?
- How should users define custom rules?
- How should incompatible challenge combinations be handled?
- Which modified games or ROM hacks, if any, should be supported?
- How should challenge violations affect completion records?

### Chat and Guidance

- Which tools should be accessible directly from chat?
- How should the assistant handle missing or uncertain tracker information?
- Which AI capabilities should work offline, if any?
- How should users control proactive recommendations?

### Product Delivery

- Which features should be delivered first?
- Which dependencies must be completed before each feature?
- Which capabilities are suitable for an initial release versus later releases?

These questions should be resolved progressively rather than prematurely fixed in this document.

---

## 18. Document Maintenance

This is a living product document.

When new product decisions are made:

1. Record confirmed decisions in the relevant section.
2. Keep unresolved proposals in the Open Product Questions or Future Capabilities sections.
3. Avoid describing planned features as implemented.
4. Update detailed feature specifications when a decision becomes sufficiently concrete.
5. Update the development roadmap when implementation priorities and dependencies are established.
6. Update architecture documents or architectural decision records when a product decision changes technical boundaries or system responsibilities.

The purpose of this document is to preserve the direction of Pokémon Companion as the project grows.

---

## 19. Final Vision

Pokémon Companion should become a comprehensive companion for Pokémon players: a place to discover information, explore game worlds, manage adventures, prepare for battles, pursue collections, and receive useful guidance.

It should support different ways of playing without assuming that every player follows the same path.

The application should reduce repetitive work, connect its tools through shared game knowledge, preserve personal progress reliably, and help players make informed decisions while leaving the actual adventure in their hands.

**The ultimate goal is simple: give players one companion that helps them get more out of every Pokémon adventure.**