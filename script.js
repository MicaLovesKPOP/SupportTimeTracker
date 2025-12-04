/*
  SupportTimeTracker - Active Time Logging Tool
  Copyright (C) 2025  MicaLovesKPOP

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU Affero General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU Affero General Public License for more details.

  You should have received a copy of the GNU Affero General Public License
  along with this program. If not, see <https://www.gnu.org/licenses/>.
*/

// -------------------------
// State
// -------------------------

const state = {
  isActive: false,
  sessionClosed: false,
  totalActiveSeconds: 0, // accumulated from completed segments
  currentSegmentStartMs: null, // timestamp in ms when last started/resumed
  uiIntervalId: null,
  events: [],
  ratePerMinute: 0 // number, euros per minute
};

// -------------------------
// DOM elements
// -------------------------

const totalTimeEl = document.getElementById("total-time");
const segmentTimeEl = document.getElementById("segment-time");
const rateInputEl = document.getElementById("rate-input");
const costDisplayEl = document.getElementById("cost-display");

const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const resumeBtn = document.getElementById("resume-btn");
const stopBtn = document.getElementById("stop-btn");
const newSessionBtn = document.getElementById("new-session-btn");

const eventActorEl = document.getElementById("event-actor");
const eventTypeEl = document.getElementById("event-type");
const eventDetailsEl = document.getElementById("event-details");
const addEventBtn = document.getElementById("add-event-btn");

const eventLogEl = document.getElementById("event-log");
const copySummaryBtn = document.getElementById("copy-summary-btn");
const downloadJsonBtn = document.getElementById("download-json-btn");
const summaryOutputEl = document.getElementById("summary-output");

// -------------------------
// Utility functions
// -------------------------

function nowIso() {
  return new Date().toISOString();
}

function formatTimeForDisplay(secondsTotal) {
  if (secondsTotal <= 0) return 0;
  return Math.ceil(secondsTotal / 60); // rounded up minutes
}

function formatCurrency(amount) {
  return "€" + amount.toFixed(2);
}

/**
 * Adds an event to state.events and updates the UI log.
 * @param {"you"|"customer"|"system"} actor
 * @param {string} type
 * @param {string} [details]
 */
function addEvent(actor, type, details = "") {
  const event = {
    timestamp: nowIso(),
    actor,
    type,
    details
  };
  state.events.push(event);
  appendEventToLog(event);
}

/**
 * Appends a single event to the visible log.
 * @param {object} event
 */
function appendEventToLog(event) {
  const entry = document.createElement("div");
  entry.classList.add("log-entry", event.actor);

  const header = document.createElement("div");
  header.classList.add("log-entry-header");

  const metaLeft = document.createElement("span");
  metaLeft.classList.add("log-entry-meta");
  metaLeft.textContent = `${event.timestamp}`;

  const metaRight = document.createElement("span");
  metaRight.classList.add("log-entry-meta");
  metaRight.textContent = `${event.actor.toUpperCase()} · ${event.type}`;

  header.appendChild(metaLeft);
  header.appendChild(metaRight);

  const body = document.createElement("div");
  body.classList.add("log-entry-body");
  body.textContent = event.details || "";

  entry.appendChild(header);
  entry.appendChild(body);

  eventLogEl.appendChild(entry);
  eventLogEl.scrollTop = eventLogEl.scrollHeight;
}

/**
 * Rebuilds the log UI from state.events.
 * Useful on reset if needed.
 */
function refreshLogUI() {
  eventLogEl.innerHTML = "";
  state.events.forEach((ev) => appendEventToLog(ev));
}

// -------------------------
// Timer & display logic
// -------------------------

/**
 * Returns total seconds including the currently active segment (if any).
 */
function getTotalSecondsIncludingCurrent() {
  let total = state.totalActiveSeconds;
  if (state.isActive && state.currentSegmentStartMs !== null) {
    const deltaMs = Date.now() - state.currentSegmentStartMs;
    const deltaSec = Math.floor(deltaMs / 1000);
    if (deltaSec > 0) {
      total += deltaSec;
    }
  }
  return total;
}

/**
 * Returns current segment seconds (0 if not active).
 */
function getCurrentSegmentSeconds() {
  if (!state.isActive || state.currentSegmentStartMs === null) {
    return 0;
  }
  const deltaMs = Date.now() - state.currentSegmentStartMs;
  return Math.max(0, Math.floor(deltaMs / 1000));
}

/**
 * Updates UI for time and cost display.
 * Called periodically while active and also after events.
 */
function updateDisplay() {
  const totalSecWithCurrent = getTotalSecondsIncludingCurrent();
  const currentSegSec = getCurrentSegmentSeconds();

  const totalMinRounded = formatTimeForDisplay(totalSecWithCurrent);
  const segmentMinRounded = formatTimeForDisplay(currentSegSec);

  totalTimeEl.textContent = `${totalMinRounded} min`;
  segmentTimeEl.textContent = `${segmentMinRounded} min`;

  if (state.ratePerMinute > 0 && totalMinRounded >= 0) {
    const estimatedCost = totalMinRounded * state.ratePerMinute;
    costDisplayEl.textContent = formatCurrency(estimatedCost);
  } else {
    costDisplayEl.textContent = "€0.00";
  }
}

/**
 * Starts the UI update interval if not already running.
 */
function ensureUiInterval() {
  if (state.uiIntervalId === null) {
    state.uiIntervalId = window.setInterval(updateDisplay, 1000);
  }
}

/**
 * Stops the UI update interval.
 */
function stopUiInterval() {
  if (state.uiIntervalId !== null) {
    window.clearInterval(state.uiIntervalId);
    state.uiIntervalId = null;
  }
}

// -------------------------
// Timer control handlers
// -------------------------

function handleStart() {
  if (state.sessionClosed || state.isActive) return;

  state.isActive = true;
  state.currentSegmentStartMs = Date.now();
  addEvent("you", "start_active", "Timer started");
  ensureUiInterval();

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
  stopBtn.disabled = false;
  newSessionBtn.disabled = true;

  updateDisplay();
}

function handlePause() {
  if (!state.isActive || state.currentSegmentStartMs === null) return;

  const deltaMs = Date.now() - state.currentSegmentStartMs;
  const deltaSec = Math.floor(deltaMs / 1000);
  if (deltaSec > 0) {
    state.totalActiveSeconds += deltaSec;
  }
  state.currentSegmentStartMs = null;
  state.isActive = false;

  addEvent("you", "pause_active", "Timer paused");

  startBtn.disabled = true;
  pauseBtn.disabled = true;
  resumeBtn.disabled = false;
  stopBtn.disabled = false;
  newSessionBtn.disabled = true;

  updateDisplay();
}

function handleResume() {
  if (state.sessionClosed || state.isActive) return;

  state.isActive = true;
  state.currentSegmentStartMs = Date.now();
  addEvent("you", "resume_active", "Timer resumed");
  ensureUiInterval();

  startBtn.disabled = true;
  pauseBtn.disabled = false;
  resumeBtn.disabled = true;
  stopBtn.disabled = false;
  newSessionBtn.disabled = true;

  updateDisplay();
}

function handleStopSession() {
  if (state.sessionClosed) return;

  // If currently active, finalize the current segment.
  if (state.isActive && state.currentSegmentStartMs !== null) {
    const deltaMs = Date.now() - state.currentSegmentStartMs;
    const deltaSec = Math.floor(deltaMs / 1000);
    if (deltaSec > 0) {
      state.totalActiveSeconds += deltaSec;
    }
  }

  state.currentSegmentStartMs = null;
  state.isActive = false;
  state.sessionClosed = true;

  addEvent("you", "stop_session", "Session stopped");

  stopUiInterval();
  updateDisplay();

  startBtn.disabled = true;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  stopBtn.disabled = true;
  newSessionBtn.disabled = false;

  // Build summary with final rounding.
  const finalSeconds = state.totalActiveSeconds;
  const finalMinutesRounded = formatTimeForDisplay(finalSeconds);
  let summary = "";
  summary += "Support Session Summary\n";
  summary += "------------------------\n";
  summary += `Total active time (rounded): ${finalMinutesRounded} minute(s)\n`;
  summary += `Internal total active seconds: ${finalSeconds} second(s)\n`;

  if (state.ratePerMinute > 0) {
    const finalCost = finalMinutesRounded * state.ratePerMinute;
    summary += `Rate: ${state.ratePerMinute.toFixed(2)} €/min\n`;
    summary += `Total due: ${formatCurrency(finalCost)}\n`;
  } else {
    summary += "No rate set. Set a rate to calculate cost.\n";
  }

  summary += "\nEvents:\n";
  state.events.forEach((ev) => {
    summary += `- [${ev.timestamp}] (${ev.actor}) ${ev.type}`;
    if (ev.details) {
      summary += `: ${ev.details}`;
    }
    summary += "\n";
  });

  summaryOutputEl.value = summary;
}

/**
 * Resets the state to start a new, empty session.
 */
function handleNewSession() {
  stopUiInterval();

  state.isActive = false;
  state.sessionClosed = false;
  state.totalActiveSeconds = 0;
  state.currentSegmentStartMs = null;
  state.events = [];
  // ratePerMinute is kept as-is; can be cleared if desired
  // state.ratePerMinute = 0;

  eventLogEl.innerHTML = "";
  summaryOutputEl.value = "";

  addEvent("system", "new_session", "New session started");

  startBtn.disabled = false;
  pauseBtn.disabled = true;
  resumeBtn.disabled = true;
  stopBtn.disabled = true;
  newSessionBtn.disabled = true;

  updateDisplay();
}

// -------------------------
// Manual events & rate input
// -------------------------

function handleAddManualEvent() {
  const actor = eventActorEl.value;
  const type = eventTypeEl.value;
  const details = eventDetailsEl.value.trim();

  addEvent(actor, type, details || "");
  eventDetailsEl.value = "";
}

/**
 * Called on rate input changes.
 */
function handleRateChange() {
  const raw = rateInputEl.value.trim();
  if (raw === "") {
    state.ratePerMinute = 0;
  } else {
    const num = parseFloat(raw);
    state.ratePerMinute = isNaN(num) || num < 0 ? 0 : num;
  }

  addEvent("system", "rate_changed", `Rate set to ${state.ratePerMinute.toFixed(2)} €/min`);
  updateDisplay();
}

// -------------------------
// Copy & download helpers
// -------------------------

function handleCopySummary() {
  const text = summaryOutputEl.value.trim();
  if (!text) {
    alert("No summary to copy yet. Stop the session first.");
    return;
  }

  navigator.clipboard
    .writeText(text)
    .then(() => {
      alert("Session summary copied to clipboard.");
    })
    .catch(() => {
      alert("Failed to copy to clipboard. You can copy manually.");
    });
}

function handleDownloadJson() {
  const blob = new Blob([JSON.stringify(state.events, null, 2)], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `support-session-${new Date().toISOString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// -------------------------
// Wire up event listeners
// -------------------------

startBtn.addEventListener("click", handleStart);
pauseBtn.addEventListener("click", handlePause);
resumeBtn.addEventListener("click", handleResume);
stopBtn.addEventListener("click", handleStopSession);
newSessionBtn.addEventListener("click", handleNewSession);

addEventBtn.addEventListener("click", handleAddManualEvent);

rateInputEl.addEventListener("change", handleRateChange);
rateInputEl.addEventListener("blur", handleRateChange);
rateInputEl.addEventListener("keyup", (e) => {
  if (e.key === "Enter") {
    handleRateChange();
  }
});

copySummaryBtn.addEventListener("click", handleCopySummary);
downloadJsonBtn.addEventListener("click", handleDownloadJson);

// -------------------------
// Initial setup
// -------------------------

// Initialize log with a boot event and draw first state
addEvent("system", "boot", "Support Time Tracker loaded");
updateDisplay();
