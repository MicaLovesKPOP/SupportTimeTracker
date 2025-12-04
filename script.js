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
let totalSeconds = 0;
let timerInterval = null;

const timeDisplay = document.getElementById("timeDisplay");
const startBtn = document.getElementById("startPauseResumeBtn");
const stopBtn = document.getElementById("stopBtn");
const rateInput = document.getElementById("rateInput");
const rateUp = document.getElementById("rateUp");
const rateDown = document.getElementById("rateDown");
const manualInput = document.getElementById("manualInput");
const logList = document.getElementById("logList");
const exportBtn = document.getElementById("exportBtn");
const exportType = document.getElementById("exportType");

let eventLog = [];

/* Utility */

function logEvent(text) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = { time: timestamp, text };
    eventLog.push(entry);

    const li = document.createElement("li");
    li.textContent = `${timestamp} — ${text}`;
    logList.appendChild(li);
}

function updateDisplay() {
    const minutes = Math.ceil(totalSeconds / 60);
    timeDisplay.textContent = `${minutes} min`;
}

/* Timer Logic */

function startTimer() {
    running = true;
    startBtn.textContent = "Pause";
    stopBtn.disabled = false;
    logEvent("Session started");

    timerInterval = setInterval(() => {
        totalSeconds++;
        updateDisplay();
    }, 1000);
}

function pauseTimer() {
    running = false;
    clearInterval(timerInterval);
    startBtn.textContent = "Resume";
    logEvent("Session paused");
}

function resumeTimer() {
    running = true;
    startBtn.textContent = "Pause";
    logEvent("Session resumed");

    timerInterval = setInterval(() => {
        totalSeconds++;
        updateDisplay();
    }, 1000);
}

function stopTimer() {
    running = false;
    clearInterval(timerInterval);
    startBtn.textContent = "Start";
    stopBtn.disabled = true;
    logEvent("Session stopped");
}

/* Start/Pause/Resume button */

startBtn.addEventListener("click", () => {
    if (!running && totalSeconds === 0) return startTimer();
    if (running) return pauseTimer();
    if (!running) return resumeTimer();
});

/* Stop button */

stopBtn.addEventListener("click", stopTimer);

/* Rate Controls */

rateUp.addEventListener("click", () => {
    let v = parseFloat(rateInput.value || 0);
    v += 0.05;
    rateInput.value = v.toFixed(4);
});

rateDown.addEventListener("click", () => {
    let v = parseFloat(rateInput.value || 0);
    v = Math.max(0, v - 0.05);
    rateInput.value = v.toFixed(4);
});

/* Manual Event */

manualInput.addEventListener("keydown", e => {
    if (e.key === "Enter" && manualInput.value.trim().length > 0) {
        logEvent(manualInput.value.trim());
        manualInput.value = "";
    }
});

/* Export */

exportBtn.addEventListener("click", () => {
    if (eventLog.length === 0) return alert("No events to export.");

    const type = exportType.value;

    if (type === "json") {
        const blob = new Blob([JSON.stringify(eventLog, null, 2)], { type: "application/json" });
        downloadBlob(blob, "log.json");
    }

    if (type === "txt") {
        const lines = eventLog.map(e => `${e.time} — ${e.text}`).join("\n");
        const blob = new Blob([lines], { type: "text/plain" });
        downloadBlob(blob, "log.txt");
    }

    if (type === "csv") {
        const lines = ["time,text", ...eventLog.map(e => `"${e.time}","${e.text.replace(/"/g, '""')}"`)];
        const blob = new Blob([lines.join("\n")], { type: "text/csv" });
        downloadBlob(blob, "log.csv");
    }
});

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
