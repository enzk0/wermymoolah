# MODEL.md: decisions and gotchas

Why the code looks the way it does: each decision, the reasoning, what was rejected, and a
source to read more. Adapted from the TypeScript project's MODEL.md; the sections that only
applied to TypeScript were replaced.

When you make a non-obvious choice, add an entry. When you lose an hour to a gotcha, add it
to the log at the bottom.

---

## Decisions

### Dates are not timestamps

`entries.entry_date` is a Postgres `DATE`, and a day is a `'YYYY-MM-DD'` string everywhere
in the code.

Spending happens on a *day*, which is a calendar fact, not a moment in time. Storing a
timestamp would mean converting timezones on every read, and any conversion can move an
entry across midnight: something saved at 00:30 on Oct 15 in Manila (UTC+8) is 16:30 on
Oct 14 in UTC.

A bonus: these strings sort and compare correctly as plain text
(`'2026-10-15' < '2026-10-16'`), which is why `useEntries.js` can sort and filter them
without parsing.

- Postgres date types: https://www.postgresql.org/docs/current/datatype-datetime.html

### Money is integer cents

`amount_cents BIGINT`. The only code that sees a decimal is `client/src/lib/money.js`.

Computers store numbers in binary, which can't represent most decimals exactly:
`0.1 + 0.2` is `0.30000000000000004`. Added up over a month, the error shows. Whole numbers
are exact.

Rejected: `NUMERIC(12,2)`, also exact and a fine choice. `BIGINT` cents was picked so
the value is a plain JS number on both sides. Never `FLOAT` or `REAL`.

`parseAmountToCents` uses `Math.round(value * 100)` because `12.5 * 100` can come out as
`1249.9999999999998`.

- Why floats do this: https://0.30000000000000004.com/

### node-postgres conversions are overridden

`server/src/db.js` changes how two column types are turned into JS values.

**DATE** becomes a JS `Date` at local midnight by default. Sent as JSON, that turns into a
UTC time that can fall on the previous day, which brings back the exact bug the `DATE` column
was meant to avoid. The override keeps the raw `'YYYY-MM-DD'` string.

**BIGINT** becomes a *string* by default, because a BIGINT can be larger than JS numbers
hold exactly (2^53). Strings make `+` join instead of add (`"100" + "50" === "10050"`).
Cents are nowhere near 2^53 (about $90 trillion), so the override returns a number.

- https://node-postgres.com/features/types

### One connection pool per process

`new pg.Pool()` is created once in `db.js`. Opening a new connection on every request
would add several network round trips to each API call. `pool.end()` runs on Ctrl-C so the
process can exit.

- https://node-postgres.com/apis/pool

### Express 5

If an `async` route handler throws, Express 5 passes the error to the error handler
automatically. Express 4 didn't, which is why older tutorials wrap every route in
`try/catch` or an `asyncHandler` helper. That's not needed here.

- https://expressjs.com/en/guide/migrating-5.html

### Validation at the boundary with zod

Every handler checks its input with `safeParse` and replies `400 { error, details }` if it's
wrong. In plain JavaScript nothing checks what a request contains, so this is the only
thing standing between a bad request and the database.

The `dayKey` schema checks the format *and* that the date exists, because the regex alone
accepts `2026-02-31`.

"An entry needs an amount or a note" is checked in both zod and a SQL `CHECK`. That's on
purpose: the database enforces it even if some future code skips the API, and zod turns
what would be a 500 into a readable 400.

- https://zod.dev/

### Cancel stale reads

`useEntries.js` gives `api.listEntries` an `AbortSignal` and aborts it in the effect's
cleanup. Clicking "next month" three times fast starts three requests. Without cancelling,
whichever finishes *last* wins, which might be a month you've already left.

- https://developer.mozilla.org/en-US/docs/Web/API/AbortController
- https://react.dev/reference/react/useEffect#fetching-data-with-effects

### Derived values are calculated, not stored

`entriesByDay`, `monthTotal` and `loading` are worked out from other state on every render.
Two pieces of state holding the same fact will eventually disagree; a calculated value
can't.

`loading` is a good example. The first version kept it as `useState` and called
`setLoading(true)` at the top of the effect. ESLint's React rules flagged that
(`react-hooks/set-state-in-effect`) because it causes an extra render. Now the hook records
*which* month's data it has (`loadedFrom`) and `loading` is simply "that isn't the month on
screen".

- https://react.dev/learn/you-might-not-need-an-effect

### No useMemo / useCallback

The TypeScript version wrapped derived values in `useMemo` and callbacks in `useCallback`.
Those only help when a calculation is expensive or a child component is memoised, and
neither is true here: grouping ~40 entries is instant. Leaving them out makes the code
easier to read. Add them back if profiling ever shows a need.

- https://react.dev/reference/react/useMemo#should-you-add-usememo-everywhere

### Tailwind with theme colours

Colours are defined once in `client/src/index.css` under `@theme` (`--color-ink`,
`--color-surface`, ...), which gives classes like `text-ink` and `bg-surface`. Dark mode
redefines the same variables inside a `prefers-color-scheme: dark` block, and every class
follows.

Rejected: Tailwind's `dark:` variant on every element (`bg-white dark:bg-zinc-900`). It
works, but doubles the class lists and puts the palette in dozens of places.

- https://tailwindcss.com/docs/theme
- https://tailwindcss.com/docs/dark-mode

### npm workspaces

The root `package.json` lists `server` and `client` as workspaces, so one `npm install`
installs all three and `npm run dev -w server` runs a script in one of them. The TypeScript
version avoided workspaces because of how they interact with compiling a shared TypeScript
folder; with no TypeScript and no `shared/` folder, that reason is gone.

- https://docs.npmjs.com/cli/using-npm/workspaces

### Vite proxy instead of CORS in development

`api.js` uses the relative path `/api`, and `vite.config.js` forwards it to port 4000. The
browser only talks to one origin, so there are no CORS issues in development.

- https://vite.dev/config/server-options.html#server-proxy

### Migrations

`npm run migrate` runs one re-runnable `schema.sql` in a transaction. That's enough while
the schema only grows. Once a column needs renaming or data needs moving, switch to
numbered migration files and a table recording which have run.

- node-pg-migrate: https://salsita.github.io/node-pg-migrate/

---

## Gotchas log

| Symptom | Cause | Fix |
| - | - | - |
| Entry shows on the day before/after | A `Date` crossed a timezone boundary | Keep days as strings; use `lib/day.js` |
| Totals end in `...0000004` | Decimal arithmetic on money | Whole cents only |
| Amounts join instead of adding | `BIGINT` arrives as a string from `pg` | The BIGINT override in `db.js` |
| Old month's data appears | Overlapping requests, last one wins | `AbortController` in `useEntries.js` |
| `type="number"` rejects `1,234.56` | Browsers validate number inputs strictly | `type="text"` + `inputMode="decimal"` |
| Express error handler never runs | It has fewer than 4 parameters | Keep `(err, req, res, next)`, even if `next` is unused |
| A Tailwind class has no effect | Typo, or a class built from pieces like `` `bg-${color}` `` | Write full class names; Tailwind finds them by scanning the source |

---

## Open questions

- **No login.** Single user, localhost only.
- **No tests.** Start with `lib/day.js` and `lib/money.js`: plain functions with tricky
  edge cases (leap years, rounding) and nothing to mock.
- **One currency**, set in `lib/money.js`.
- **The date of an entry can't be changed in the UI.** The API allows it, but
  `useEntries.js` would need to handle an entry moving off the visible month.
