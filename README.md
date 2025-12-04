[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)

# Support Time Tracker

A small, client-side, dark-mode web app to track **active support time**, apply a **€/minute rate**, and log session events.

Designed for solo technicians who bill only for the time they are actively working.

## Features

- Manual **Start / Pause / Resume / Stop** control
- Internal timing in seconds, displayed as **minutes rounded up**
- Rate (€/min) can be set or changed at any time
- Live estimated cost display
- Full event log with:
  - Timer events (start, pause, resume, stop, new session, rate changes)
  - Manual events (customer message, your message, typing, notes)
- Session summary generation
- Copy summary to clipboard
- Download raw log as JSON
- 100% client-side, no backend, no data leaves your browser

## How timing works

- Time only counts as **active** while the timer is running (after you press **Start** or **Resume**).
- Paused time and gaps are not billed.
- Internally, active time is stored in **seconds**.
- When displaying time, it shows **minutes rounded up**.
- When ending a session, total active seconds are rounded up to full minutes, then multiplied by your rate.

Example:

- Internal total = 372 seconds
- 372 / 60 = 6.2 → rounded up to 7 minutes
- Rate = €0.20/min
- Total cost = 7 × 0.20 = €1.40

## Files

- `index.html` — main HTML, UI layout
- `style.css` — dark, clean styling
- `script.js` — state, timer logic, event logging
- `README.md` — this file

## Running locally

1. Clone or download this repository.
2. Open `index.html` in a browser.

No build steps or dependencies required.

## Deploying on GitHub Pages

1. Push this repository to GitHub.
2. Go to **Settings → Pages** in the repo.
3. Under "Source", choose branch: `main` (or `master`) and folder: `/ (root)`.
4. Save. GitHub will build and host it at:

   `https://<your-username>.github.io/<repository-name>/`

Deployment usually takes less than a minute.

## Notes

- All data is kept in memory only. Reloading the page clears the session.
- Rate and discount decisions are fully manual: you can enter any rate at any time.
- This tool is designed to help you track your own active time fairly and transparently.

## License

This project is licensed under the GNU Affero General Public License v3 (AGPLv3).

The AGPL was chosen because it guarantees that:

- All users have the freedom to inspect, modify, and improve the software.
- No company can take the code, make private modifications, and run it as a closed service.
- Any improvements made by others must remain open and available to the community.
- The software can never be locked down through DRM, device restrictions, or proprietary forks.

If you use this project in a network service or hosted application,  
AGPLv3 requires that you make your modified source code available to your users.

This helps ensure that all future versions of the project stay free and open for everyone.

## Contribution Policy

All contributions to this project must be licensed under the same license (AGPLv3).

By submitting code, you agree that your contribution will be distributed under the AGPLv3 license so the project remains fully free and open-source.

