# Data Processes

An overview of how data flows through the eBMS app — from local storage to remote syncing.

## Storage Layer

All persistent data lives in a single SQLite database (`indicia`) managed by `@flumens` `Store` instances.

| Store               | Table           | Purpose                            |
| ------------------- | --------------- | ---------------------------------- |
| `mainStore`         | `main`          | App settings, user profile         |
| `samplesStore`      | `samples`       | Survey records (drafts & uploaded) |
| `locationsStore`    | `locations`     | Transects, sites, moth traps       |
| `groupsStore`       | `groups`        | Projects / groups                  |
| `speciesListsStore` | `species_lists` | Installed species list metadata    |
| `speciesStore`      | `species`       | Actual taxon rows for each list    |

Two join tables link groups to their related data:

- **`group_locations`** — `(group_cid, location_cid)`
- **`group_species_lists`** — `(group_cid, species_list_cid)`

Both cascade-delete when the parent group or related entity is removed.

---

## Collections

Collections are MobX-observable arrays of models that sync with local SQLite stores. Each collection auto-loads from SQLite on startup (`this.ready`) and provides `fetchRemote()` to pull from the Indicia warehouse API.

| Collection     | Model         | File                                 |
| -------------- | ------------- | ------------------------------------ |
| `groups`       | `Group`       | `models/collections/groups.ts`       |
| `locations`    | `Location`    | `models/collections/locations.ts`    |
| `speciesLists` | `SpeciesList` | `models/collections/speciesLists.ts` |
| `samples`      | `Sample`      | `models/collections/samples.ts`      |

---

## Startup Sequence

1. **SQLite opens** — stores initialise tables.
2. **Collections hydrate** — each collection reads its rows from SQLite into MobX-observable `.data` arrays.
3. **Auto-fetch on first load** — `groups`, `locations`, and `speciesLists` each check if data is empty + user is online + logged in, then call `fetchRemote()`.
4. **Species list refresh** — `speciesLists` automatically refreshes any locally installed lists that were updated remotely since the last check (`refreshInstalledLists`).
5. **Common names** — `profiles/index.tsx` uses an `autorun` to query the `species` table and attach `commonName` to the bundled species profiles.

```
App boot
  ├─ stores.ready
  ├─ groups.ready       → fetchRemote({ type: 'member' }) if empty
  ├─ locations.ready    → fetchRemote() if empty
  └─ speciesLists.ready → refreshInstalledLists()
```

---

## Groups (Projects)

### Fetch member groups

`groups.fetchRemote({ type: 'member' })` is the main entry point. It orchestrates three cascading downloads:

```
fetchRemote({ type: 'member' })
  │
  ├─ 1. super.fetchRemote()
  │     Downloads the user's member groups from the warehouse
  │     and upserts them into the local groups store.
  │
  ├─ 2. locations.fetchRemote({ type: 'sites' })
  │     Downloads the user's own sites + all group sites.
  │     Links each group site to its parent group (bidirectional).
  │
  └─ 3. Species lists linking
        a. speciesLists.fetchRemoteWithLinks()
           Fetches ALL available species lists with their
           associated groupIds and locationIds.
        b. For each list whose groupIds overlap with a member group:
           - Save the list to the local store  →  list.save(true)
           - Push it into the collection       →  speciesLists.push(list)
           - Link it to each matching group    →  list.linkGroup(group)
           - Download its taxon rows           →  list.fetchRemoteSpecies()
```

### Fetch joinable groups

`groups.fetchRemote({ type: 'joinable' })` fetches groups filtered by the user's selected country. No cascading downloads happen — it's a simple list for the UI.

### Join / Leave

- **Join**: `group.join()` → re-fetch member + joinable groups.
- **Leave**: `group.leave()` → re-fetch member + joinable groups.

---

## Locations

`locations.fetchRemote()` can be called with a `type` filter or without one (fetches all types):

```
fetchRemote()
  ├─ transects
  │    Fetch transects → fetch their sections → upsert → remove stale
  │
  ├─ mothTraps
  │    Fetch moth traps → upsert → remove stale
  │
  └─ sites
       Fetch user's own sites
       + Fetch group sites (for each member group → group.fetchRemoteLocations())
       → upsert all
       → link each group site to its group (bidirectional via group_locations table)
       → remove stale
```

### Bidirectional linking

`group.linkLocation(location)` writes a row to `group_locations` and calls `location.linkGroup(group)` (and vice versa). Both sides track their linked CIDs in memory arrays.

---

## Species Lists

### Manual install (Settings UI)

The user can browse, search, or find nearby species lists and manually install one:

```
list.save(true)           → persist metadata to species_lists store
list.fetchRemoteSpecies() → download taxon rows into species table
speciesLists.push(list)   → add to in-memory collection
```

### Country list auto-install

When the user selects a country in Settings, the app automatically fetches and installs the matching country species list:

```
fetchRemote({ locationCode })  → find the list for this country
list.save(true)                → persist
list.fetchRemoteSpecies()      → download species
```

### Background refresh

On startup, `refreshInstalledLists()` checks for any installed lists that were updated on the server since the last refresh timestamp. Updated lists get their species re-downloaded.

### Species data

`list.fetchRemoteSpecies()` downloads species in chunks (40k per request), deletes existing rows for that list, then batch-inserts new rows (500 per batch) inside a transaction.

---

## Samples (Surveys)

### Survey types

| Survey key                    | Description               |
| ----------------------------- | ------------------------- |
| `precise-area`                | Area count (15-min timed) |
| `precise-single-species-area` | Single species area count |
| `transect`                    | Transect walk             |
| `moth`                        | Moth trap                 |
| `bait-trap`                   | Bait trap (dev only)      |

### Lifecycle

```
Create draft
  → User fills in details (location, weather, species, photos)
  → sample.save()           — persists locally
  → Mark as saved            — sample.metadata.saved = true

Upload
  → sample.upload()
  → Validates remotely (validateRemote)
  → Checks: online, user activated, not already uploading
  → sample.saveRemote()     — POST to Indicia warehouse
  → Marked as uploaded
```

### Structure

Area count samples use a **nested structure**:

```
Sample (parent)
  ├─ data: location, weather, date, speciesGroups
  ├─ metadata: survey type, saved flag
  └─ samples[] (sub-samples, one per species observation)
       └─ occurrences[] (one per sub-sample)
            └─ data: taxon, count, media
```

Transect samples add **section sub-samples** matching transect sections.

---

## Linking Diagram

```
Group ──────┬──── group_locations ────── Location
            │
            └──── group_species_lists ── SpeciesList
                                              │
                                              └── species (taxon rows)
```

All links are bidirectional in memory (each side tracks the other's CIDs) and persisted via join tables in SQLite. Cascade deletes keep referential integrity.

---

## Key Model Files

| File                      | Role                                              |
| ------------------------- | ------------------------------------------------- |
| `models/store.ts`         | SQLite database and all store definitions         |
| `models/GroupsStore.ts`   | Custom store with join tables for groups          |
| `models/group.tsx`        | Group model with linking methods                  |
| `models/location.tsx`     | Location model with GPS, linking, DTO             |
| `models/speciesList.ts`   | Species list model with remote fetch              |
| `models/sample/index.tsx` | Sample model with survey logic, GPS, timer        |
| `models/occurrence.ts`    | Occurrence model (taxon + count)                  |
| `models/user.ts`          | User authentication and profile                   |
| `models/app.ts`           | App-level settings and preferences                |
| `data/profiles/index.tsx` | Bundled species profiles + common name resolution |
