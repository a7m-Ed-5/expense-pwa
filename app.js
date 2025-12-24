/* app.js - UI + Logic (Arabic RTL Offline PWA) */

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

const SETTINGS_KEY = "expense_pwa_settings_v1";

const defaultSettings = {
  currency: "EGP",
  monthlyBudget: ""
};

function loadSettings() {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...defaultSettings };
    return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    return { ...defaultSettings };
  }
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

let settings = loadSettings();

/* ===================== FORMAT ===================== */
function formatMoney(value) {
  const n = Number(value || 0);
  try {
    return new Intl.NumberFormat("ar-EG", {
      style: "currency",
      currency: settings.currency,
      maximumFractionDigits: 2
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${settings.currency}`;
  }
}

function todayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0];
}

function inRange(date, from, to) {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

/* ===================== MODAL ===================== */
const modal = $("#modal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");
const modalActions = $("#modalActions");

$("#modalClose").onclick = () => modal.classList.add("hidden");

function openModal(title, body, actions) {
  modalTitle.textContent = title;
  modalBody.innerHTML = body;
  modalActions.innerHTML = "";
  actions.forEach(a => {
    const b = document.createElement("button");
    b.className = a.class;
    b.textContent = a.text;
    b.onclick = a.action;
    modalActions.appendChild(b);
  });
  modal.classList.remove("hidden");
}

/* ===================== NAV ===================== */
$$(".tab").forEach(tab => {
  tab.onclick = () => {
    $$(".tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    $$(".view").forEach(v => v.classList.remove("active"));
    $("#view-" + tab.dataset.view).classList.add("active");
  };
});

/* ===================== INCOME ===================== */
$("#incomeDate").value = todayStr();

$("#incomeForm").onsubmit = async (e) => {
  e.preventDefault();

  const rec = {
    id: crypto.randomUUID(),
    amount: +$("#incomeAmount").value,
    date: $("#incomeDate").value,
    source: $("#incomeSource").value,
    notes: $("#incomeNotes").value
  };

  if (!rec.amount || !rec.date) return alert("البيانات ناقصة");

  const list = JSON.parse(localStorage.getItem("incomes") || "[]");
  list.push(rec);
  localStorage.setItem("incomes", JSON.stringify(list));

  e.target.reset();
  $("#incomeDate").value = todayStr();
  loadIncome();
};

function loadIncome() {
  const list = JSON.parse(localStorage.getItem("incomes") || "[]");
  const box = $("#incomeList");
  box.innerHTML = "";

  list.forEach(r => {
    box.innerHTML += `
      <div class="item">
        <div>
          <b>${formatMoney(r.amount)}</b><br>
          <small>${r.date} - ${r.source || "بدون مصدر"}</small>
        </div>
      </div>`;
  });
}

/* ===================== EXPENSE ===================== */
$("#expenseDate").value = todayStr();

$("#expenseForm").onsubmit = async (e) => {
  e.preventDefault();

  const rec = {
    id: crypto.randomUUID(),
    name: $("#expenseName").value,
    amount: +$("#expenseAmount").value,
    date: $("#expenseDate").value,
    category: $("#expenseCategory").value,
    payment: $("#expensePay").value,
    notes: $("#expenseNotes").value
  };

  if (!rec.name || !rec.amount || !rec.date)
    return alert("البيانات ناقصة");

  const list = JSON.parse(localStorage.getItem("expenses") || "[]");
  list.push(rec);
  localStorage.setItem("expenses", JSON.stringify(list));

  e.target.reset();
  $("#expenseDate").value = todayStr();
  loadExpenses();
};

/* ===================== LOAD ===================== */
function loadExpenses() {
  const list = JSON.parse(localStorage.getItem("expenses") || "[]");
  const box = $("#expenseList");
  box.innerHTML = "";

  list.forEach(r => {
    box.innerHTML += `
      <div class="item">
        <div>
          <b>${r.name}</b> - ${formatMoney(r.amount)}<br>
          <small>${r.date} | ${r.category || "بدون تصنيف"}</small>
        </div>
      </div>`;
  });
}

/* ===================== DASHBOARD ===================== */
function loadDashboard() {
  const incomes = JSON.parse(localStorage.getItem("incomes") || "[]");
  const expenses = JSON.parse(localStorage.getItem("expenses") || "[]");

  const sumIn = incomes.reduce((a, b) => a + b.amount, 0);
  const sumEx = expenses.reduce((a, b) => a + b.amount, 0);

  $("#sumIncome").textContent = formatMoney(sumIn);
  $("#sumExpenses").textContent = formatMoney(sumEx);
  $("#sumBalance").textContent = formatMoney(sumIn - sumEx);
}

/* ===================== SETTINGS ===================== */
$("#saveCurrencyBtn").onclick = () => {
  settings.currency = $("#currencySelect").value;
  saveSettings(settings);
  loadDashboard();
  loadIncome();
  loadExpenses();
};

/* ===================== START ===================== */
loadIncome();
loadExpenses();
loadDashboard();
