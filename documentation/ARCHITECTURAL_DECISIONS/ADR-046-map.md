# POKÉMON COMPANION

## INTERACTIVE FIRE RED MAP + TRACKER SPECIFICATION

---

# 1. CORE PURPOSE

The Pokémon Companion should represent the **FireRed world, the player's journey through it, and the player's personal progress**.

It should function as:

* An interactive FireRed world map
* A DexNav-style Pokémon encounter viewer
* A completion tracker
* A progression and dependency guide
* An event reference
* An NPC and dialogue reference
* A trainer battle reference
* An item and hidden-item tracker
* An in-game trade reference

The player should have the freedom to inspect the entire game world without unnecessary restrictions.

The system should avoid tracking information that has no useful purpose.

---

# 2. TWO MODES

The map has two modes:

## TRACKER MODE

Tracks the player's personal journey and progress.

The player can:

* Mark Pokémon as caught
* Mark items as acquired
* Mark static/gift Pokémon as acquired
* Mark battle NPCs as fought
* Record battle counts for repeatable battle NPCs
* Mark trade NPCs as completed
* Discover locations by actually entering them

Tracker Mode combines:

* Complete game/world information
* Player-specific progress

## GENERAL VIEWER MODE

General Viewer is completely read-only.

The player can inspect:

* All locations
* All buildings
* All interiors
* All Pokémon
* All encounter methods
* All encounter chances
* All items
* All hidden items
* All NPCs
* All battle NPCs
* All trade NPCs
* All events
* All map connections
* All relevant game information

The player cannot:

* Mark Pokémon as caught
* Mark items as acquired
* Mark static encounters as acquired
* Mark NPCs as fought
* Record battle counts
* Mark trades as completed
* Change any tracker state

Both modes use the same underlying world/game data.

---

# 3. SEPARATION OF SYSTEMS

The system should keep these concepts separate:

## WORLD DATA

What exists in the actual game?

Examples:

* Locations
* Buildings
* NPCs
* Items
* Pokémon
* Trainers
* Encounters
* Events

## PROGRESSION DATA

What determines access or story progression?

Examples:

* Badges
* Key items
* Abilities
* Story flags
* Events
* Progression milestones
* Location dependencies

## PLAYER TRACKER DATA

What has this particular player completed?

Examples:

* Location visited
* Pokémon caught
* Item acquired
* Static Pokémon acquired
* Trainer fought
* Times repeatable trainer fought
* Trade completed

## MAP PRESENTATION

How should the information appear visually?

The presentation layer should not change the underlying game data.

---

# 4. LOCATION STATES

Every location has three separate concepts:

## ACCESS

Can the player physically enter the location right now?

This is determined by game progression rules.

## DISCOVERY

Has the player actually entered the location?

This is a player tracker state:

`visited = true / false`

## PROGRESSION

What can the player currently accomplish inside the location?

A location can therefore be:

* Accessible and fully progressed
* Accessible but with some progression blocked
* Inaccessible
* Visited but currently inaccessible

These states must not be merged.

---

# 5. ACCESSIBILITY

Access is calculated from the actual game progression.

Example:

## Cerulean Cave

Before National Dex:

* Accessible: No
* Player may still know the location exists
* Player may still inspect its information

After National Dex:

* Accessible: Yes

The fact that a player has visited or knows about a location does not automatically make it accessible.

---

# 6. STORY PROGRESSION INSIDE ACCESSIBLE AREAS

A location can be physically accessible while some activities or story progression inside it remain blocked.

Example:

## Three Island

Access:

Tri-Pass

Progression:

Specific Lostelle/father-related event

This means:

The player can enter Three Island.

However, some story progression inside Three Island requires completion of a separate event.

Physical access and story progression must remain separate throughout the system.

---

# 7. LOCATION DISCOVERY

Tracker Mode represents an actual player journey.

A location becomes:

`visited = true`

ONLY when the player physically travels into that location through a valid map connection.

Simply opening the location manually does not count as visiting it.

Example:

Player is in Pallet Town.

Route 1:

`visited = false`

Display:

`???`

When the player actually enters Route 1:

`visited = true`

Display:

`Route 1`

There is no visit history.

Do not track:

* Visit count
* Last visit
* Timestamps
* Movement history
* Time spent

Only:

`visited = true / false`

---

# 8. LOCATION NAMES

## GENERAL VIEWER

All location names are visible immediately.

## TRACKER MODE

An undiscovered location displays:

`???`

Once the player enters it:

The actual location name is revealed permanently.

Discovery only affects the location's displayed identity.

It does NOT hide the information inside that location.

The player can still see:

* Pokémon
* Items
* Hidden items
* NPCs
* Trainers
* Buildings
* Other information

even when the location itself still displays `???`.

---

# 9. INACCESSIBLE LOCATION INFORMATION

When a location is inaccessible, the map should not simply show a lock.

It should show a compact explanation.

Example:

`🔒 Requires: National Dex`

Another:

`🔒 Requires: All 7 badges + Silph Co. completed`

Another:

`🔒 Requires: Team Rocket cleared on Five Island`

The main map should NOT list every individual prerequisite in excessive detail.

The summary should tell the player what they need to know.

---

# 10. REQUIREMENT DETAILS

Requirements can be interactive.

For example:

`🔒 Requires: All 7 badges + Silph Co. completed`

Clicking `Silph Co.` opens the relevant event information.

The user should not be taken to a generic page containing unrelated events.

A requirement should reference the **specific event, milestone, or location dependency** that it actually needs.

---

# 11. EVENT SYSTEM

Events should have specific identities.

Avoid generic identifiers such as:

`TEAM_ROCKET_EVENT`

Use specific identifiers such as:

`FIVE_ISLAND_TEAM_ROCKET_CLEAR`

This is necessary because the same characters or groups can participate in many unrelated events.

An event view should provide a compact explanation of the event.

It can contain:

* Important actions
* Important NPCs
* Important battles
* Important items
* Conditions
* Completion state

The event view should not dump the entire underlying game script.

The player should see the useful progression without unnecessary information.

Every event view should provide:

`[ GO TO MAP ]`

This takes the player directly to the relevant map.

---

# 12. EVENT NAVIGATION

When a requirement references a specific event:

Example:

`🔒 Requires: Team Rocket cleared on Five Island`

Clicking the requirement opens only:

**Five Island Team Rocket Event**

It should not open every Team Rocket event in the game.

The user can then select:

`GO TO MAP`

to open Five Island.

---

# 13. LOCATION DEPENDENCIES

Locations can depend on other locations.

Example:

Victory Road 1F:

Requires all 8 badges.

Victory Road 2F:

Requires access to Victory Road 1F.

Victory Road 3F:

Requires access to Victory Road 2F.

This creates:

`Victory Road 1F → Victory Road 2F → Victory Road 3F`

instead of repeating the same badge requirement on every floor.

Requirements can contain location dependencies such as:

`locations: ["MAP_VICTORY_ROAD_1F"]`

A location dependency means:

"The player must be able to access this location."

Location dependencies should be recursive.

The system should therefore resolve dependency chains automatically.

---

# 14. PROGRESSION REQUIREMENT TYPES

The progression system should support reusable requirement types such as:

* Badges
* Key items
* Abilities
* Story flags
* Locations
* Progression milestones
* Events

Multiple requirement categories may be combined when necessary.

The system should represent relationships rather than repeatedly hard-coding the same prerequisite.

---

# 15. SEVII ISLAND STRUCTURE

The Sevii Islands must distinguish physical access from story progression.

## ONE ISLAND

Access is associated with:

* Required Gym Badge progression
* Required Bill/Tri-Pass progression

Exact implementation should use the actual game data.

## TWO ISLAND

Physical access:

Tri-Pass

## THREE ISLAND

Physical access:

Tri-Pass

Three Island does NOT require Two Island for physical access.

However, story progression on Three Island can require the relevant Lostelle/father event.

## FIVE ISLAND

Has its own access and progression structure.

## SIX ISLAND

Should become accessible after the relevant Team Rocket event on Five Island is completed.

## SEVEN ISLAND

Should become accessible from the same Five Island Team Rocket completion.

Do NOT model:

Five Island → Six Island → Seven Island

Instead:

Five Island Team Rocket cleared

↓

Six Island

and

Seven Island

Both use the same prerequisite.

## NATIONAL DEX

National Dex should be represented as a reusable progression requirement for appropriate post-game content.

Exact requirements should come from actual FireRed data rather than invented flags.

---

# 16. MAP CONTENT

The map should contain essentially all meaningful world content.

This includes:

* Routes
* Cities
* Towns
* Caves
* Houses
* Gyms
* Pokémon Centers
* Shops
* Museums
* Special buildings
* Multi-floor buildings
* NPCs
* Battle NPCs
* Trade NPCs
* Items
* Hidden items
* Wild Pokémon
* Static Pokémon
* Legitimate gift Pokémon
* Legitimate special encounters
* Events

The player should have the freedom to inspect whatever they want.

---

# 17. MAP INTERACTION

Map objects should use a clean interaction pattern.

The main map should not be overloaded with information.

Typical interaction:

`Map object`

↓

`Small popup`

↓

`View Details`

↓

`Detailed view/page`

Examples:

NPC:

`View Details`

Item:

`View Details`
`Item Acquired`

Battle NPC:

`View Details`
`Fought`

Trade NPC:

`View Details`
`Trade Completed`

Pokémon:

Encounter information
`Caught` where applicable

---

# 18. ITEMS

Every individual item should be represented.

This includes:

* Normal visible items
* Hidden items

Each item must have its own identity.

Two Potion pickups are two different item records.

The map should display the item sprite at its actual location.

Clicking the sprite opens a small popup containing:

Item name

`[ VIEW DETAILS ]`

`[ ☐ ITEM ACQUIRED ]`

In Tracker Mode, the player can mark that exact item as acquired.

In General Viewer Mode, the item is read-only.

---

# 19. HIDDEN ITEMS

Hidden items should be visually distinguishable from normal visible items.

This may use:

* A different icon
* A different marker
* A subtle Hidden Item label

The exact visual design can be decided during UI implementation.

The player should immediately understand that the object is a hidden item.

---

# 20. ITEM DETAILS

The separate Item Details page should show the complete relevant item information available from FireRed.

Possible information includes:

* Item name
* Description
* Type/category
* Effect
* Field effect
* Battle effect
* Buy price
* Sell price
* Other relevant game-defined behavior

The map itself should remain clean.

---

# 21. AREA ITEM SUMMARY

Opening an area's information should show the overall item progress.

Example:

**Items**

5 total

3 acquired

✓ Potion

✓ Poké Ball

✓ Antidote

○ Paralyze Heal

○ Hidden Potion

The player should be able to see:

* Total items
* Number acquired
* Names of acquired items
* Names of remaining items

---

# 22. POKÉMON ENCOUNTERS

Every legitimate obtainable Pokémon encounter should be represented.

Examples:

* Grass
* Surfing
* Fishing
* Static encounters
* Legitimate gift Pokémon
* In-game trades
* Birth Island encounters
* Navel Rock encounters
* Other legitimate in-game obtainable Pokémon

External/code-dependent event Pokémon that are not normally accessible through the represented game flow should not be treated as normal map encounters.

---

# 23. ENCOUNTER DATA

Every encounter record should preserve relevant information such as:

* Species
* Area/location
* Encounter method
* Spawn chance
* Other relevant encounter information

The map presentation should use this data to determine where the Pokémon sprite appears.

---

# 24. ENCOUNTER VISUALIZATION

The Pokémon map presentation should resemble the spirit of the Gen 6 DexNav.

Examples:

Grass encounter:

Pokémon sprite appears in grass.

Surf encounter:

Pokémon sprite appears in water.

Fishing encounter:

Pokémon sprite appears in the appropriate fishing/water area.

The encounter method should therefore influence visual placement.

---

# 25. ONE WILD POKÉMON SPRITE PER AREA

If the same species appears through multiple encounter methods in the same area:

Only ONE sprite of that species is displayed on the map.

The sprite is placed using the environment associated with the encounter that has the highest spawn chance.

Example:

Pikachu:

Grass = 25%

Surf = 5%

Map:

Pikachu sprite appears in grass.

The full information still shows:

Grass: 25%

Surf: 5%

The encounter data keeps all methods.

The map presentation uses only the highest-probability method.

If two methods have equal probability, a consistent method-priority rule should later be defined.

---

# 26. AREA POKÉMON INFORMATION

Opening area information should show the COMPLETE list of Pokémon obtainable there.

Example:

**Route 2**

Grass:

Pidgey 45%

Rattata 55%

Surf:

Tentacool 80%

Psyduck 20%

Fishing:

Magikarp 90%

Poliwag 10%

The player should be able to inspect every encounter method and chance.

The map still uses one sprite per species per area.

---

# 27. GLOBAL WILD POKÉMON CAUGHT STATE

For normal/wild Pokémon, caught status is global by species.

Example:

Player catches Pikachu in Viridian Forest.

Result:

`Pikachu caught = true`

Every encounter list containing Pikachu now shows Pikachu as caught.

Viridian Forest:

Pikachu ✓

Power Plant:

Pikachu ✓

The state means:

"Player has caught this species somewhere."

It does NOT mean:

"Player caught this species in this particular area."

The player can mark a species as caught from any location where it appears.

---

# 28. WILD POKÉMON VISUAL STATE

Normal wild/encounter Pokémon do NOT disappear after being caught.

Not caught:

* Normal sprite

Caught:

* Same sprite remains
* Sprite is slightly faded

The sprite should not be replaced with a large checkmark or removed from the map.

The fading alone indicates the caught state.

This keeps the map visually clean.

---

# 29. STATIC AND GIFT POKÉMON

Static and legitimate gift Pokémon are individual encounters.

Each one has its own identity and completion state.

Examples:

* Route 12 Snorlax
* Route 16 Snorlax
* Silph Co. Gift Lapras

They are not completed merely because the species has already been caught.

For these encounters the tracker label is:

`☐ ACQUIRED`

not:

`☐ CAUGHT`

---

# 30. STATIC/GIFT ENCOUNTER VISIBILITY

A static or gift Pokémon remains visible on the map until the player manually marks that exact encounter as acquired.

When the player marks the specific encounter as acquired:

* That exact marker disappears
* Other encounters of the same species remain unaffected

Example:

Player has already caught Lapras elsewhere.

Silph Co. Gift Lapras:

`Acquired = false`

↓

Still visible.

Player manually marks:

`☑ Acquired`

↓

Silph Co. Gift Lapras marker disappears.

A separate Lapras encounter elsewhere remains visible until it is individually acquired.

---

# 31. SPECIES STATE VS ENCOUNTER STATE

The system must distinguish:

## SPECIES STATE

Has the player caught this species anywhere?

Example:

`Lapras caught = true`

## INDIVIDUAL ENCOUNTER STATE

Has the player acquired this particular static/gift encounter?

Example:

`Silph Co. Lapras acquired = false`

## MAP VISIBILITY

Should this individual static marker remain visible?

Example:

Acquired:

Marker disappears.

Not acquired:

Marker remains.

These states must never be treated as the same thing.

---

# 32. PLAYER-CONTROLLED STATIC COMPLETION

Static encounter completion is explicitly player-controlled.

The system should NOT assume that a static encounter was completed because:

* The species is already caught
* The player obtained the species through a trade
* The player obtained the species in another game
* The player owns the species through another source

Only the player's explicit `Acquired` action completes that specific static/gift encounter.

---

# 33. TRADE NPCS

In-game trade NPCs should be visually identified on the map.

For example:

`TRADE NPC`

↓

NPC sprite

This allows the player to immediately recognize that the NPC performs a trade.

Clicking the NPC opens its trade information.

---

# 34. TRADE INFORMATION

Trade information should show:

**You Give**

Pokémon A

**You Receive**

Pokémon B

The received Pokémon should show the exact FireRed-defined instance information wherever available.

This can include:

* Species
* Level
* Nature
* Ability
* Moves
* IVs/DVs
* EVs
* Held item
* OT
* OT ID
* Other defined Pokémon data

The information should come from the actual FireRed source data.

---

# 35. TRADE POKÉMON DETAILS

The received Pokémon is a specific game-defined Pokémon instance.

The player should be able to inspect its exact:

* Ability
* Moves
* Level
* Nature
* Held item
* Stats or defined stat information
* Other relevant properties

This should not be replaced with generic species information.

---

# 36. TRADE TRACKING

Tracker Mode:

`☐ TRADE COMPLETED`

General Viewer:

* Trade can be inspected
* Trade cannot be marked completed

Completing a trade represents a specific player action.

---

# 37. TRADE COMPLETION AND POKÉDEX

When the player marks a trade as completed:

`Trade Completed = true`

and the received Pokémon species becomes:

`Caught = true`

This caught state is global.

Example:

Trade gives Machamp.

Player marks:

`☑ Trade Completed`

Result:

`Machamp caught = true`

Machamp becomes caught everywhere it appears.

---

# 38. TRADE GIVE-POKÉMON RULE

Completing a trade does not remove any Pokémon from the global caught state.

Example:

Give:

Spearow

Receive:

Farfetch'd

After the trade:

Spearow:

`Caught = true`

Farfetch'd:

`Caught = true`

The player's Pokédex state remains intact.

Trading away a Pokémon must not make it become uncaught.

---

# 39. TRADE AND STATIC ENCOUNTERS

Receiving a Pokémon through a trade does not automatically complete any static or gift encounter of the same species.

Example:

Player receives Lapras through a trade.

Result:

`Lapras caught = true`

But:

`Silph Co. Gift Lapras acquired = false`

The gift Lapras remains available until the player explicitly marks that exact encounter as acquired.

---

# 40. NORMAL NPCS

Normal NPCs should be visible on the map.

Clicking an NPC should first show a simple popup containing:

`[ VIEW DETAILS ]`

The full information should open in a separate details page/view.

The map itself should remain clean.

---

# 41. NPC DETAILS

The NPC Details page should contain the complete relevant information available from FireRed.

Possible information includes:

* NPC name where defined
* Role
* Location
* Coordinates
* Dialogue
* Dialogue conditions
* Events
* Items
* Battles
* Trades
* Other relevant game data

The goal is to preserve the full useful NPC data without putting it directly on the map.

---

# 42. NPC DIALOGUE

NPC dialogue should preserve the original FireRed dialogue exactly as available from the game data.

This includes:

* Original wording
* Original line breaks
* Separate dialogue states
* Story-dependent dialogue
* Action-dependent dialogue

Dialogue should not be flattened into a single generic text block when the game provides separate states.

---

# 43. STATE-DEPENDENT NPC DIALOGUE

If an NPC's dialogue changes because of progression or player actions, each state should remain separate.

Example:

**Before receiving the item**

[Original dialogue]

**After receiving the item**

[Original dialogue]

**After defeating Team Rocket**

[Original dialogue]

The condition associated with each version should be clear.

---

# 44. BATTLE NPCS

Battle NPCs are a specialized NPC type.

The map should visually identify them as battle-related.

For example:

`BATTLE`

↓

NPC sprite

The player should immediately know that the NPC is a trainer.

---

# 45. ONE-TIME BATTLE NPCS

For a one-time trainer:

`☐ FOUGHT`

No battle-count field is required.

There is no need to store repeatable battle information for a trainer that can only be fought once.

---

# 46. REPEATABLE BATTLE NPCS

For a repeatable trainer:

`☐ FOUGHT`

`Times Fought: 3`

Only repeatable trainers store battle counts.

The system should not create unnecessary counters for one-time trainers.

---

# 47. BATTLE NPC DETAILS

Battle NPCs should have a detailed trainer view.

It should contain the complete trainer battle data available from FireRed.

Possible information includes:

* Trainer name
* Trainer class
* Location
* Party
* Levels
* Abilities where defined
* Held items where defined
* Moves
* Battle conditions
* Other relevant trainer data

---

# 48. TRAINER PARTY DISPLAY

Each trainer Pokémon should appear as an expandable/collapsible entry.

Example:

`▶ [Pikachu sprite] Pikachu Lv. 14`

`▶ [Pidgey sprite] Pidgey Lv. 16`

`▶ [Rattata sprite] Rattata Lv. 15`

Opening one:

`▼ [Pikachu sprite] Pikachu Lv. 14`

Then show its full trainer-specific information:

* Ability
* Held item
* Moves
* Level
* Other defined information

Pressing it again collapses the entry.

The Pokémon sprite should appear beside its name.

---

# 49. BUILDINGS AND INTERIORS

Every home and meaningful building should be represented.

Examples:

* Houses
* Gyms
* Pokémon Centers
* Shops
* Museums
* Special buildings
* Caves
* Multi-floor locations
* Other interiors

Buildings are not merely decorative elements.

They should be represented as actual connected map locations.

---

# 50. INTERIOR MAPS

Clicking a building opens its actual interior map.

Example:

Pewter City

↓

Pewter Gym

↓

Pewter Gym Map

The interior should reproduce the original game layout as closely as practical.

It should contain relevant:

* NPCs
* Battle NPCs
* Trade NPCs
* Items
* Hidden items
* Static Pokémon
* Other objects
* Exits

---

# 51. MAP CONNECTIONS

Every interior should be connected to its parent/exterior location.

Example:

Pewter City

↓

Pewter Gym

↓

EXIT

↓

Pewter City

The same principle applies to:

* Houses
* Gyms
* Shops
* Pokémon Centers
* Caves
* Multi-floor buildings
* Special locations
* Other connected maps

Map relationships should be derived from the actual game map structure wherever possible.

---

# 52. EXIT BEHAVIOR

An interior map should have a clear:

`EXIT`

Pressing EXIT returns the player to the correct parent location.

Example:

Pewter City

↓

House

↓

EXIT

↓

Pewter City

The user should not have to manually search for the parent map again.

---

# 53. ORIGINAL MAP LAYOUT

The interactive map should preserve the original FireRed layouts as closely as practical.

A house should look like the house.

A gym should look like the gym.

A cave should look like the cave.

Objects should appear in their corresponding positions wherever source data allows.

The goal is to make the companion feel like navigation through the actual Pokémon world rather than an abstract database.

---

# 54. MAP NAVIGATION HIERARCHY

The world should form a connected structure:

World

↓

Area

↓

Building / Interior

↓

Objects

Objects include:

* NPCs
* Battle NPCs
* Trade NPCs
* Items
* Hidden items
* Pokémon
* Static Pokémon
* Other relevant objects

Each map should know its real connections to other maps.

---

# 55. MAP UI

The map should prioritize visual clarity.

The main map should primarily show:

* Map layout
* Pokémon sprites
* Item sprites
* Hidden-item indicators
* NPC sprites
* Battle indicators
* Trade indicators
* Buildings
* Exits
* Location names
* Compact access information where necessary

Detailed information should be opened through interaction.

---

# 56. POKÉMON VISUAL STATE

Normal wild Pokémon:

Not caught:

Normal sprite.

Caught:

Same sprite, slightly faded.

Static/gift Pokémon:

Not acquired:

Normal sprite.

Acquired:

Specific marker disappears.

This is the primary distinction between ordinary species encounters and unique encounters.

---

# 57. LOCATION INFORMATION PANEL

An area information panel should summarize useful completion information.

Possible sections include:

## Location

Name and access state.

## Pokémon

Total Pokémon available and encounter details.

## Items

Total and acquired count.

## Trainers

Total, fought, and repeatable battle information where relevant.

## Events

Relevant progression/event information.

The panel should remain readable and should not duplicate every piece of information shown elsewhere.

---

# 58. INFORMATION VISIBILITY

Information should generally remain visible even if:

* A location has not been visited
* A location is inaccessible
* Story progression is incomplete
* A Pokémon has been caught
* An item has been acquired
* A trainer has been fought

The companion represents the game world.

Completing something should normally change its tracker state or visual presentation, not erase the underlying game information.

Exceptions are explicitly defined, such as completed static Pokémon markers disappearing.

---

# 59. NO UNNECESSARY TRACKING

The player should remain free to play however they want.

Do not track:

* Visit history
* Visit counts
* Time spent
* Last visited
* Movement history
* Unnecessary analytics

Track only meaningful progress:

* Visited
* Caught
* Acquired
* Fought
* Times fought for repeatable trainers
* Trade completed

---

# 60. NO AUTOMATIC ASSUMPTIONS

The tracker should not pretend to know what happened in the player's actual save unless the player explicitly records it.

Examples:

Owning Lapras does not mean the player acquired the Silph Co. Lapras.

Owning Snorlax does not mean a specific Snorlax encounter was completed.

Owning a Pokémon through another game does not complete a static encounter.

The player controls those tracker states.

The important exception is an explicitly tracked action:

When the player marks a trade as completed, the received species is automatically marked as caught because the user directly recorded the trade action.

---

# 61. GENERAL VIEWER PHILOSOPHY

General Viewer should function as a complete read-only FireRed reference.

The player should be able to explore the entire world and inspect everything without needing to have personally discovered or completed anything.

There are no progression restrictions on viewing information.

Progression rules describe the game.

They do not restrict the player's access to knowledge in General Viewer.

---

# 62. TRACKER MODE PHILOSOPHY

Tracker Mode adds the player's personal journey to the same complete world data.

Examples:

Location:

`visited = true`

Wild species:

`caught = true`

Item:

`acquired = true`

Static encounter:

`acquired = true`

One-time trainer:

`fought = true`

Repeatable trainer:

`fought = true`

`timesFought = 3`

Trade:

`completed = true`

The player can always inspect the world, while their own progress is represented separately.

---

# 63. CORE DATA MODEL PRINCIPLE

The system should conceptually separate:

```text
WORLD
├── Locations
├── Connections
├── Buildings
├── NPCs
├── Trainers
├── Items
├── Encounters
├── Pokémon
└── Events

PROGRESSION
├── Requirements
├── Dependencies
├── Story flags
├── Milestones
└── Access rules

PLAYER
├── Visited locations
├── Caught species
├── Acquired items
├── Acquired static/gift encounters
├── Fought trainers
├── Repeat battle counts
└── Completed trades

PRESENTATION
├── Map
├── Sprites
├── Popups
├── Details pages
├── Event pages
└── Tracker indicators
```

These systems should interact without being unnecessarily merged together.

---

# 64. FINAL DESIGN PRINCIPLE

The companion should answer four different questions clearly:

**What exists here?**

World data.

**Can I access it right now?**

Progression/access data.

**Have I personally been here?**

Tracker discovery state.

**Have I personally completed/acquired it?**

Tracker completion state.

These questions should never be confused with one another.

---

# 65. FINAL EXPERIENCE

The completed companion should feel like an interactive version of the FireRed world where the player can:

* Explore the complete map
* Enter buildings and interiors
* Follow actual map connections
* Inspect NPCs and dialogue
* Inspect trainers and their exact Pokémon
* Inspect every item and hidden item
* View every Pokémon encounter
* See encounter chances
* See Pokémon placed in the appropriate environment
* Track global Pokémon catches
* Track individual static/gift encounters
* Track items
* Track trainers
* Track repeatable battle counts
* Inspect in-game trades
* Inspect exact traded Pokémon data
* Follow event requirements
* Understand how to unlock inaccessible areas
* Navigate directly from events to maps
* Discover locations naturally through their journey
* Use Tracker Mode for personal progression
* Use General Viewer for complete read-only reference

The guiding principle is:

**Show the world completely. Track the player's journey separately. Never add tracking or restrictions unless they provide meaningful value.**
