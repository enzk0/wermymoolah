# wermymoolah (JavaScript version)

A calendar-first spendings tracker. Click a day, write down what it cost you, and see every
day's total on the calendar itself.

Built on the **PERN** stack (Postgres, Express, React, Node) in plain JavaScript, styled
with Tailwind CSS. It's a rewrite of `../wermymoolah_project`, which is the same app in
TypeScript. Both use the same database, so they show the same entries.

## Features

- **Month calendar** as the main screen, with each day's total and entry count in its
  square, today circled, and days from the months before and after greyed out.
- **Click any day** to open a panel listing everything recorded on it, with a form to add
  more.
- **Amount, note, or both.** A note with no amount still gets a dot on the calendar.
- Edit and delete entries; totals for the day and the month.
- Arrow keys move between days, <kbd>Esc</kbd> closes the panel.
- Light and dark theme, following your system setting.

## Setup

You need Node 22 or newer and Postgres running, with the `moolah` role and database the
TypeScript project's README set up. If the TypeScript version works, this one will too.

```bash
cd ~/programming/wermymoolah-js
cp server/.env.example server/.env   # or copy the .env from the TypeScript project
npm install                          # installs everything: root, server and client
npm run migrate                      # creates the table (safe to re-run)
npm run seed                         # optional: sample entries for this month
npm run dev
```

Open <http://localhost:5173>.

Both projects use ports 4000 and 5173, so run only one of them at a time.

## Commands

All from the project root.

| Command | What it does |
| - | - |
| `npm install` | Install all dependencies (npm workspaces handle server and client) |
| `npm run dev` | Start the API (:4000) and the website (:5173) together |
| `npm run migrate` | Apply `server/src/schema.sql` |
| `npm run seed` | Fill the current month with sample entries |
| `npm run lint` | Check all code for likely mistakes with ESLint |
| `npm run build` | Production build of the website into `client/dist` |

## Project layout

```
server/                     The API (Node + Express)
  src/index.js              Starts Express: middleware, routes, error handler
  src/db.js                 Connects to Postgres; exports query()
  src/routes/entries.js     The /api/entries endpoints, with zod validation
  src/schema.sql            The entries table, index, and updated_at trigger
  src/migrate.js            Runs schema.sql
  src/seed.js               Inserts sample data

client/                     The website (React + Vite + Tailwind)
  index.html                The page shell; React fills in <div id="root">
  vite.config.js            Dev server settings; forwards /api to Express
  src/main.jsx              Starts React
  src/index.css             Tailwind setup and the colour palette
  src/App.jsx               Top-level component: month + selected day, arrow keys
  src/lib/day.js            'YYYY-MM-DD' date helpers
  src/lib/money.js          Cents <-> '$12.50'
  src/lib/api.js            The only file that calls fetch()
  src/lib/useEntries.js     Loads and changes the month's entries
  src/components/
    MonthCalendar.jsx       The calendar card
    DayCell.jsx             One square on the calendar
    DayDetail.jsx           The side panel for the selected day
    EntryForm.jsx           Add / edit form
    Button.jsx              Styled button used everywhere

docs/                       Study guides
  development-process.md    How this project was built, step by step
  working-with-claude.md    Getting good results from Claude Code
```

## How it works: follow one click

A good way to study the code is to follow what happens when you add an entry.

1. **You click a day.** `DayCell.jsx` calls `onSelect(day)`. That's `selectDay` in
   `App.jsx`, which stores the day in state. React re-renders, and `DayDetail.jsx` now
   shows that day.
2. **You type "12.50" and press Add.** `EntryForm.jsx` checks the input, turns "12.50" into
   `1250` cents with `parseAmountToCents()` from `money.js`, and calls `onSubmit`.
3. **The hook sends it.** That `onSubmit` leads to `createEntry()` in `useEntries.js`,
   which calls `api.createEntry()` in `api.js`, which does
   `fetch('/api/entries', { method: 'POST', ... })`.
4. **Vite forwards it.** The browser sent the request to port 5173. `vite.config.js`
   passes anything under `/api` on to Express on port 4000.
5. **Express handles it.** `index.js` parses the JSON body and hands the request to
   `routes/entries.js`. The `POST /` handler checks the body with zod, then runs an
   `INSERT` through `query()` from `db.js`.
6. **Postgres stores it** in the `entries` table defined in `schema.sql`, and sends the new
   row back (`RETURNING ...`).
7. **The answer comes back.** `toEntry()` renames the columns to camelCase, Express replies
   with JSON, and `useEntries.js` adds the new entry to its `entries` state.
8. **React re-renders.** `entriesByDay` and `monthTotal` are recalculated from `entries`,
   so the day's square, the panel and the month total all show the new amount.

## API

| Method | Path | Notes |
| - | - | - |
| `GET` | `/api/health` | Checks the server and database are working |
| `GET` | `/api/entries?from=&to=` | Entries between two `YYYY-MM-DD` dates, inclusive |
| `POST` | `/api/entries` | Replies `201` with the created entry |
| `PATCH` | `/api/entries/:id` | Change any of the fields |
| `DELETE` | `/api/entries/:id` | Replies `204` with no body |

Errors always look like `{ error: string, details?: ... }`.

## Two rules worth knowing before you edit

**A calendar day is a `'YYYY-MM-DD'` string, never a `Date`.** A `Date` is an exact moment,
and which day a moment falls on depends on the timezone. Use the helpers in `lib/day.js`.

**Money is a whole number of cents.** `0.1 + 0.2 === 0.30000000000000004` in JavaScript, so
decimals drift when you add them up. Only `lib/money.js` deals with decimals.

[MODEL.md](MODEL.md) explains both in more depth, along with the other decisions.

## What's different from the TypeScript version

| TypeScript version | This version | Why |
| - | - | - |
| `.ts` / `.tsx` with type annotations | `.js` / `.jsx` | Plain JavaScript |
| `tsx` runs the server | `node --watch` runs it | Node runs `.js` directly and restarts on save |
| `npm run typecheck` | `npm run lint` (ESLint) | No types to check; ESLint catches typos and hook mistakes |
| `styles.css` (600 lines) | Tailwind classes + a small `index.css` | Styles sit next to the markup they affect |
| `shared/types.ts` | Removed | Only the category list was real code; it moved into `EntryForm.jsx` |
| `npm run install:all` | `npm install` | npm workspaces install all three folders at once |
| `useMemo` / `useCallback` | Plain values and functions | Not needed at this size; easier to read |
| `loading` kept in state | `loading` worked out from which month is loaded | ESLint's React rules flagged the old way |

The trade-off: without TypeScript, nothing warns you before running the code if you, say,
misspell `amountCents` as `amountCent` on an object. ESLint catches misspelled *variables*,
but not misspelled object properties.

## Known limitations

Single user, no login, runs on localhost only. No automated tests yet. One currency, set by
`CURRENCY` at the top of `client/src/lib/money.js`.
