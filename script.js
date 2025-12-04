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
const costDisplay = document.getElementById("costDisplay");

const startPauseBtn = document.getElementById("startPauseBtn");
const stopBtn = document.getElementById("stopBtn");

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

/* Utility */

function logEvent(text) {
    const timestamp = new Date().toLocaleTimeString();
    eventLog.push({ time: timestamp, text });

    const li = document.createElement("li");
    li.textContent = `${timestamp} — ${text}`;
    logList.appendChild(li);
}

function cleanRate(v) {
    return parseFloat(v).toString();
}

function updateDisplays() {
    const minutes = Math.ceil(totalSeconds / 60);
    timeDisplay.textContent = `${minutes} min`;

    const rate = parseFloat(rateInput.value || 0);
    const cost = (minutes * rate).toFixed(2);
    costDisplay.textContent = `€${cost}`;
}

/* Timer Logic */

function startTimer() {
    running = true;
    startPauseBtn.textContent = "Pause";
    stopBtn.disabled = false;

    logEvent("Session started");

    timerInterval = setInterval(() => {
        totalSeconds++;
        updateDisplays();
    }, 1000);
}

function pauseTimer() {
    running = false;
    clearInterval(timerInterval);
    startPauseBtn.textContent = "Start";

    logEvent("Session paused");
}

function stopTimer() {
    running = false;
    clearInterval(timerInterval);
    startPauseBtn.textContent = "Start";
    stopBtn.disabled = true;

    logEvent("Session stopped");
}

startPauseBtn.addEventListener("click", () => {
    if (!running && totalSeconds === 0) return startTimer();
    if (running) return pauseTimer();
    if (!running) return startTimer(); // resume = start
});

stopBtn.addEventListener("click", stopTimer);

/* Rate Controls */

rateUp.addEventListener("click", () => {
    let v = parseFloat(rateInput.value || 0);
    v += 0.05;
    rateInput.value = cleanRate(v);
    updateDisplays();
});

rateDown.addEventListener("click", () => {
    let v = parseFloat(rateInput.value || 0);
    v = Math.max(0, v - 0.05);
    rateInput.value = cleanRate(v);
    updateDisplays();
});

rateInput.addEventListener("input", () => {
    rateInput.value = cleanRate(rateInput.value);
    updateDisplays();
});

/* Manual Logging */

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
        const blob = new Blob([JSON.stringify(eventLog, null, 2)], { type: "application/json" });
        download(blob, "log.json");
    }

    if (type === "txt") {
        const text = eventLog.map(e => `${e.time} — ${e.text}`).join("\n");
        const blob = new Blob([text], { type: "text/plain" });
        download(blob, "log.txt");
    }

    if (type === "csv") {
        const csv = ["time,text", ...eventLog.map(e => `"${e.time}","${e.text.replace(/"/g, '""')}"`)].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        download(blob, "log.csv");
    }
});

function download(blob, name) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
}
