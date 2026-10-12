
"use strict";

// ==========================================
// OFFICE ERP - PAYROLL MANAGEMENT
// ==========================================

const API_URL = "http://localhost:5000/api";

// Login information from existing ERP login
const token = localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken");

const employeeId = localStorage.getItem("employeeId") || "";
const employeeName = localStorage.getItem("employeeName") || "Employee";
const userRole = localStorage.getItem("role") ||
    localStorage.getItem("userRole") || "Employee";

// ==========================================
// DOM ELEMENTS
// ==========================================

const payrollForm = document.getElementById("payrollForm");
const payrollFormSection = document.getElementById("payrollFormSection");
const addPayrollBtn = document.getElementById("addPayrollBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const refreshBtn = document.getElementById("refreshBtn");
const tableBody = document.getElementById("payrollTableBody");
const messageBox = document.getElementById("message");

const employeeIdInput = document.getElementById("employeeId");
const monthInput = document.getElementById("month");
const basicSalaryInput = document.getElementById("basicSalary");
const allowancesInput = document.getElementById("allowances");
const deductionsInput = document.getElementById("deductions");
const netSalaryInput = document.getElementById("netSalary");

let payrollRecords = [];

// ==========================================
// HELPERS
// ==========================================

function showMessage(message, type = "info") {
    messageBox.textContent = message;
    messageBox.className = `message-${type}`;
}

function clearMessage() {
    messageBox.textContent = "";
    messageBox.className = "";
}

function formatCurrency(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(Number(amount) || 0);
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
}

async function apiRequest(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            ...getAuthHeaders(),
            ...(options.headers || {})
        }
    });

    const result = await response.json().catch(() => ({}));

    if (response.status === 401) {
        throw new Error("Login session expired. Please log in again.");
    }

    if (!response.ok || result.success === false) {
        throw new Error(result.message || `Request failed (${response.status}).`);
    }

    return result;
}

// ==========================================
// LOGIN CHECK
// ==========================================

function checkLogin() {
    if (!token) {
        showMessage(
            "Login token not found. Please log in to Office ERP and open Payroll again.",
            "error"
        );

        payrollFormSection.classList.add("hidden");
        addPayrollBtn.disabled = true;
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">Please log in to view payroll records.</td>
            </tr>
        `;

        return false;
    }

    return true;
}

// ==========================================
// NET SALARY CALCULATION
// ==========================================

function calculateNetSalary() {
    const basic = Number(basicSalaryInput.value) || 0;
    const allowances = Number(allowancesInput.value) || 0;
    const deductions = Number(deductionsInput.value) || 0;

    const netSalary = basic + allowances - deductions;

    netSalaryInput.value = formatCurrency(netSalary);
}

[
    basicSalaryInput,
    allowancesInput,
    deductionsInput
].forEach(input => {
    input.addEventListener("input", calculateNetSalary);
});

// ==========================================
// SHOW / HIDE FORM
// ==========================================

addPayrollBtn.addEventListener("click", () => {
    if (userRole !== "Admin") {
        showMessage("Only Admin can create payroll records.", "error");
        return;
    }

    clearMessage();
    payrollForm.reset();

    employeeIdInput.value = "";
    monthInput.value = new Date().toISOString().slice(0, 7);
    allowancesInput.value = "0";
    deductionsInput.value = "0";

    calculateNetSalary();
    payrollFormSection.classList.remove("hidden");
    payrollFormSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
});

cancelFormBtn.addEventListener("click", () => {
    payrollFormSection.classList.add("hidden");
    clearMessage();
});

// ==========================================
// CREATE PAYROLL
// POST /api/payroll
// ==========================================

payrollForm.addEventListener("submit", async event => {
    event.preventDefault();
    clearMessage();

    if (!checkLogin()) return;

    if (userRole !== "Admin") {
        showMessage("Only Admin can create payroll records.", "error");
        return;
    }

    const basicSalary = Number(basicSalaryInput.value);
    const allowances = Number(allowancesInput.value || 0);
    const deductions = Number(deductionsInput.value || 0);

    if (
        !employeeIdInput.value.trim() ||
        !monthInput.value ||
        !Number.isFinite(basicSalary) ||
        !Number.isFinite(allowances) ||
        !Number.isFinite(deductions) ||
        basicSalary < 0 ||
        allowances < 0 ||
        deductions < 0 ||
        basicSalary + allowances - deductions < 0
    ) {
        showMessage("Please enter valid employee and salary details.", "error");
        return;
    }

    const submitButton = payrollForm.querySelector(
        'button[type="submit"]'
    );

    submitButton.disabled = true;

    try {
        const result = await apiRequest("/payroll", {
            method: "POST",
            body: JSON.stringify({
                employeeId: employeeIdInput.value.trim().toUpperCase(),
                month: monthInput.value,
                basicSalary,
                allowances,
                deductions,
                paymentStatus: "Pending"
            })
        });

        showMessage(
            result.message || "Payroll created successfully.",
            "success"
        );

        payrollForm.reset();
        allowancesInput.value = "0";
        deductionsInput.value = "0";
        calculateNetSalary();
        payrollFormSection.classList.add("hidden");

        await loadPayroll();
    } catch (error) {
        showMessage(error.message || "Unable to create payroll.", "error");
    } finally {
        submitButton.disabled = false;
    }
});

// ==========================================
// LOAD PAYROLL RECORDS
// GET /api/payroll
// ==========================================

async function loadPayroll() {
    if (!checkLogin()) return;

    tableBody.innerHTML = `
        <tr><td colspan="8">Loading payroll records...</td></tr>
    `;

    try {
        const result = await apiRequest("/payroll");
        payrollRecords = Array.isArray(result.data) ? result.data : [];

        renderPayroll();
        updateStatistics();
    } catch (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">${escapeHTML(error.message)}</td>
            </tr>
        `;

        showMessage(
            `${error.message} Check the payroll routes in Backend.`,
            "error"
        );
    }
}

// ==========================================
// RENDER PAYROLL TABLE
// ==========================================

function renderPayroll() {
    if (payrollRecords.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8">No payroll records found.</td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = payrollRecords.map(payroll => {
        const status = payroll.paymentStatus || "Pending";
        const statusClass = status === "Paid"
            ? "status-paid"
            : "status-pending";

        return `
            <tr>
                <td>${escapeHTML(payroll.employeeId)}</td>
                <td>${escapeHTML(payroll.month)}</td>
                <td>${formatCurrency(payroll.basicSalary)}</td>
                <td>${formatCurrency(payroll.allowances)}</td>
                <td>${formatCurrency(payroll.deductions)}</td>
                <td><strong>${formatCurrency(payroll.netSalary)}</strong></td>
                <td>
                    <span class="status-badge ${statusClass}">
                        ${escapeHTML(status)}
                    </span>
                </td>
                <td>
                    <button
                        type="button"
                        class="coming-soon-btn"
                        disabled
                        title="Bank transfer will be available in a future update"
                    >
                        Coming Soon
                    </button>
                </td>
            </tr>
        `;
    }).join("");
}

// ==========================================
// UPDATE DASHBOARD STATISTICS
// ==========================================

function updateStatistics() {
    const total = payrollRecords.length;

    const pending = payrollRecords.filter(
        payroll => payroll.paymentStatus !== "Paid"
    ).length;

    const totalSalary = payrollRecords.reduce(
        (sum, payroll) => sum + (Number(payroll.netSalary) || 0),
        0
    );

    document.getElementById("totalRecords").textContent = total;
    document.getElementById("pendingRecords").textContent = pending;
    document.getElementById("totalSalary").textContent =
        formatCurrency(totalSalary);
}

// ==========================================
// REFRESH
// ==========================================

refreshBtn.addEventListener("click", () => {
    clearMessage();
    loadPayroll();
});

// ==========================================
// INITIALIZE
// ==========================================

if (userRole !== "Admin") {
    addPayrollBtn.style.display = "none";
    employeeIdInput.value = employeeId;
    employeeIdInput.readOnly = true;
} else {
    employeeIdInput.readOnly = false;
}

calculateNetSalary();
loadPayroll();