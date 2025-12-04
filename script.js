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

let running = false;
let paused = false;
let totalSeconds = 0;
let timerInterval = null;

const timeDisplay = document.getElementById("timeDisplay");
const costDisplay = document.getElementById("costDisplay");

const startBtn = document.getElementById("startBtn");
const pauseBtn = document.getElementById("pauseBtn");
const stopBtn = document.getElementById("stopBtn");
const newSessionBtn = document.getElementById("newSessionBtn");

const manualSection = document.getElementById("manualSection");

const rateInput = document.getElementById("rateInput");
const rateUp = document.getElementById("rateUp");
const rateDown = document.getElementById("rateDown");

const manualInput = document.getElementById("manualInput");
const logList = document.getElementById("logList");

const exportType = document.getElementById("exportType");
const exportBtn = document.getElementById("exportBtn");

const billingInfo = document.getElementById("billingInfo");
const tooltip = document.getElementById("tooltip");

let eventLog = [];

/* Tooltip */
billingInfo.addEventListener("mouseover", () => {
    tooltip.style.display = "block";
});
billingInfo.addEventListener("mouseout", () => {
    tooltip.style.display = "none";
});

/* Utilities */

function logEvent(text) {
    const time = new Date().toLocaleTimeString();
    eventLog.push({ time, text });

    const li = document.createElement("li");
    li.textContent = `${time} — ${text}`;
    logList.appendChild(li);
}

function cleanRate(v) {
    return Number(v).toString();
}

function updateDisplays() {
    const minutes = Math.ceil(totalSeconds / 60);
    timeDisplay.textContent = `${minutes} min`;

    const rate = Number(rateInput.value || 0);
    const cost = (minutes * rate).toFixed(2);
    costDisplay.textContent = `€${cost}`;
}

/* Timer Logic */

function startSession() {
    running = true;
    paused = false;

    startBtn.style.display = "none";
    pauseBtn.style.display = "inline-block";
    stopBtn.style.display = "inline-block";

    manualSection.style.display = "block";

    logEvent("Session started");

    timerInterval = setInterval(() => {
        totalSeconds++;
        updateDisplays();
    }, 1000);
}

function pauseSession() {
    paused = true;
    running = false;

    clearInterval(timerInterval);

    pauseBtn.textContent = "Resume";
    logEvent("Session paused");
}

function resumeSession() {
    paused = false;
    running = true;

    pauseBtn.textContent = "Pause";
    logEvent("Session resumed");

    timerInterval = setInterval(() => {
        totalSeconds++;
        updateDisplays();
    }, 1000);
}

function stopSession() {
    running = false;
    paused = false;

    clearInterval(timerInterval);

    pauseBtn.style.display = "none";
    stopBtn.style.display = "none";
    newSessionBtn.style.display = "inline-block";

    logEvent("Session stopped");
}

/* Button handlers */

startBtn.addEventListener("click", startSession);

pauseBtn.addEventListener("click", () => {
    if (paused) resumeSession();
    else pauseSession();
});

stopBtn.addEventListener("click", stopSession);

newSessionBtn.addEventListener("click", () => {
    // Reset everything
    running = false;
    paused = false;
    totalSeconds = 0;
    eventLog = [];
    logList.innerHTML = "";

    newSessionBtn.style.display = "none";
    startBtn.style.display = "inline-block";

    manualSection.style.display = "none";

    updateDisplays();
});

/* Rate Controls */

rateUp.addEventListener("click", () => {
    rateInput.value = cleanRate(Number(rateInput.value) + 0.05);
    updateDisplays();
});

rateDown.addEventListener("click", () => {
    rateInput.value = cleanRate(Math.max(0, Number(rateInput.value) - 0.05));
    updateDisplays();
});

rateInput.addEventListener("input", () => {
    rateInput.value = cleanRate(rateInput.value);
    updateDisplays();
});

/* Manual Input */

manualInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && manualInput.value.trim()) {
        logEvent(manualInput.value.trim());
        manualInput.value = "";
    }
});

/* Export */

exportBtn.addEventListener("click", () => {
    if (eventLog.length === 0) return alert("No events to export.");

    const type = exportType.value;

    if (type === "json") {
        download(new Blob([JSON.stringify(eventLog, null, 2)]), "log.json");
    }

    if (type === "txt") {
        download(new Blob([eventLog.map(e => `${e.time} — ${e.text}`).join("\n")]), "log.txt");
    }

    if (type === "csv") {
        const csv = ["time,text", ...eventLog.map(e => `"${e.time}","${e.text.replace(/"/g, '""')}"`)].join("\n");
        download(new Blob([csv], { type: "text/csv" }), "log.csv");
    }
});

function download(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
