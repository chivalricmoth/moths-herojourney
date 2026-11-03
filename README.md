# north star

Your personal planner and life coach for the 2027 → 2030 plan. It is a static web app (plain HTML/CSS/JS, no build step), so it runs on GitHub Pages for free and works on any phone or computer.

## What's inside

| Page | What it does |
| --- | --- |
| **Today** | A guided daily spread: a "Next up" step, rituals grouped morning / daytime / evening, water, meals and calories, steps, sleep, energy and mood, your cycle phase with a daily tip, journal, close-the-day. |
| **Week** | Seven-day strip, weekly weigh-in, averages and bar charts, weekly review, next-week plan. |
| **Month** | Calendar (showed up, water goal, food logged, cycle phases), monthly stats, weight vs. gentle pace, the written plan for that month with milestones, notes. |
| **Archive** | Look back at every day, week and month; search your journal; trend charts (30d / 90d / 1y / all); cycle history. |
| **Vision** | Your own image board (add, drop, caption) plus an optional Pinterest embed. |
| **Plan** | Roadmap, why & identity, tracks (car, job, health, money), toolkit, atelier, syllabus. |
| **Settings** (tap your avatar) | Avatar and name, light/dark, accent "house", targets, cycle settings, Google Drive sync, backup. |

Edit `data.js` any time to change the plan text, rituals, tips or palette. Every page is defined once in `pages.js`; `core.js` holds state/sync, `main.js` the shell and events, `style.css` all styling. See `docs/REDESIGN.md` for the layout system.

## 1. Put it on GitHub Pages

1. Create a new repository on GitHub (for example `north-star`). **Private repos need a paid plan for Pages**, so a public repo is simplest. Your data never goes into the repo; it lives in your browser and your Google Drive.
2. Upload every file in this folder (`index.html`, `style.css`, `data.js`, `content.js`, `syllabus.js`, `core.js`, `food.js`, `imgstore.js`, `pages.js`, `main.js`, `sw.js`, `manifest.json`, `icon.svg`). `apps-script.gs` and this README can go too.
3. Repo → **Settings → Pages** → Source: *Deploy from a branch* → branch `main`, folder `/ (root)` → Save.
4. After a minute your app is at `https://<your-username>.github.io/north-star/`. Bookmark it on every device.
5. **Install it like an app:** on iPhone open it in Safari → Share → *Add to Home Screen*. On Android/Chrome → menu → *Install app*. On desktop Chrome/Edge → the install icon in the address bar.

To update the design or plan later, edit the files in GitHub and commit; refresh the app to get the new version.

## 2. Turn on Google Drive sync

Sync keeps one JSON file in **your** Google Drive and merges changes from every device, so editing on your phone and laptop never overwrites either.

1. Go to <https://script.google.com> → **New project**.
2. Delete the placeholder code and paste in everything from `apps-script.gs`.
3. Change `TOKEN` near the top to a long random phrase only you know (for example four unrelated words plus a number).
4. **Deploy → New deployment** → gear icon → **Web app**. Set *Execute as*: **Me** and *Who has access*: **Anyone**. Click **Deploy** and approve the permissions (Google may warn that the app is unverified: *Advanced → Go to project*; it is your own script).
5. Copy the **Web app URL** (ends in `/exec`).
6. In north star open **Settings** (tap your avatar) → *Sync across devices*. Paste the URL and your token, tick automatic sync, press **Save connection**, then **Sync now**.
7. Repeat step 6 on every other device (same URL, same token). The first sync there pulls everything down.

Notes:
- If you change the script code later, use **Deploy → Manage deployments → Edit → New version** so the URL stays the same.
- The app syncs when you open it, when you come back to it, and about 15 seconds after you make changes. The little dot beside "synced" shows the state.
- Look settings (light/dark, accent colour) are per device by design. The avatar, name, targets and all your logs sync.
- Treat the URL and token like a password.

## 3. Backups

Settings → *Download backup* saves a `.json` copy; *Restore from file* merges one back in. Do one occasionally even with sync on.

## Notes on the trackers

- **Calories** are for awareness only. There is no default goal; add one in Settings only if a doctor or dietitian suggests a number.
- **Cycle phases** are estimates from the dates you log and your own average length. They are a planning aid, not medical advice. Irregular, very painful or very heavy cycles are worth bringing to a clinician (the log in Archive → Cycle helps).
- Step goals follow the plan month by month and can be overridden in Settings.
