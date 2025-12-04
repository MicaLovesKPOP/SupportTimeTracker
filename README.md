[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit-blue)](https://<your-username>.github.io/SupportTimeTracker/)
[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)


# Support Time Tracker

A small, client-side, dark-mode web app to track **active support time**, apply a **€/minute rate**, and log session events.

Designed for solo technicians who bill only for the time they are *actively* working.

---

## Features

- Manual **Start / Pause / Resume / Stop** control  
- Internal timing in **seconds**, displayed as **minutes rounded up**  
- Rate (€/min) can be changed at any time  
- Live cost estimate  
- Detailed event log, including:
  - Timer activity (start, pause, resume, stop)
  - New session events
  - Rate changes
  - Customer messages
  - Your messages
  - Typing indicators
  - Manual notes
- Session summary generator  
- **Copy to clipboard**  
- **Download raw log (JSON)**  
- 100% client-side — **no backend**, no tracking, no data leaves your browser

---

## How Timing Works

- Time only counts as **active** while the timer is running.  
- Pauses and message gaps do **not** count toward billable time.  
- Internal time = **seconds**, but display and billing use **minutes rounded up**.  
- When a session ends:
  - Total seconds → converted to minutes
  - Minutes → rounded up
  - Multiplied by the chosen rate

**Example**
```
Internal total: 372 seconds
372 / 60 = 6.2 → rounded up: 7 minutes
Rate: €0.20/min
Total cost: 7 × 0.20 = €1.40
```

---

## File Structure

- `index.html` — interface and layout  
- `style.css` — clean dark theme styling  
- `script.js` — timer state, logic, event logging  
- `README.md` — project documentation  

---

## Running Locally

1. Clone or download this repository  
2. Open `index.html` in your browser  

No dependencies, build step, or server required.

---

## Deployment (GitHub Pages)

1. Push this repository to GitHub  
2. Go to **Settings → Pages**  
3. Under **Source**, choose:
   - Branch: `main`  
   - Folder: `/ (root)`  
4. Save  
5. Your site will appear at:
```
https://<your-username>.github.io/SupportTimeTracker/
```

Deployment usually takes less than one minute.

---

## Notes

- All data is stored in memory — **refreshing the page clears everything**.  
- Billing rate can be changed at any time; it is intentionally manual so you can apply discounts or special rates easily.  
- Event logging is designed to be transparent and unintrusive.  
- Useful for on-call technicians, freelance support roles, or anyone who wants accurate tracking of **active work** during text-based support sessions.

---

## License

This project is licensed under the **GNU Affero General Public License v3 (AGPLv3)**.

The AGPL was chosen because it ensures:

- Everyone retains the freedom to inspect, modify, and improve the software  
- No company can take the code, modify it privately, and use it in a closed-source service  
- All improvements remain open and available to the community  
- The software cannot be locked down with DRM or hardware restrictions  

If you run this software as part of a hosted or networked service,  
**AGPLv3 requires you to make your modified source code available to your users.**

This guarantees the project stays free and open for everyone, always.

---

## Contribution Policy

Contributions are welcome!

All contributions must be licensed under the **AGPLv3**, the same license used for the rest of the project.

By submitting code, you confirm that:

- Your contribution is your original work (or you have rights to submit it)  
- You agree to license it under AGPLv3  
- You accept that the project will remain fully open-source  

See `CONTRIBUTING.md` and `CODE_OF_CONDUCT.md` for details.

---
