# wermymoolah

A calendar-first spendings tracker. Click a day, write down what it cost you, and see every
day's total on the calendar itself.

Built on the **PERN** stack (Postgres, Express, React, Node) in JavaScript, styled
with Tailwind CSS.

## Features

- **Month calendar** as the main screen, with each day's total and entry count in its
  square, today circled, and days from the months before and after greyed out.
- **Click any day** to open a panel listing everything recorded on it, with a form to add
  more.
- **Amount, note, or both.** A note with no amount still gets a dot on the calendar.
- Edit and delete entries; totals for the day and the month.
- Arrow keys move between days, <kbd>Esc</kbd> closes the panel.

## Download for Windows

Get `wermymoolah-Setup-x.y.z.exe` from the
[latest release](https://github.com/enzk0/wermymoolah/releases/latest) (about 150 MB) and
run it. It installs for your user only, needs no admin rights, and adds a Start-menu
shortcut. Nothing else is needed: the app brings its own database.

**"Windows protected your PC".** The installer isn't code-signed, so SmartScreen warns
about it. Click **More info**, then **Run anyway**.

**Check the download.** Each release lists the installer's SHA-256. In PowerShell:

```powershell
Get-FileHash .\wermymoolah-Setup-1.0.0.exe
```

The `Hash` it prints should match the one on the release page (PowerShell shows it in
capitals; case doesn't matter).

**Your data** lives in `%APPDATA%\wermymoolah`. Uninstalling keeps it, so reinstalling
picks up where you left off. Delete that folder to remove it for good.

## Setup

You need Node 22 or newer and Postgres running with the `moolah` role

```bash
cd ~/programming/wermymoolah-js
npm install
npm run migrate
npm run seed
npm run dev
```

Open <http://localhost:5173>.
