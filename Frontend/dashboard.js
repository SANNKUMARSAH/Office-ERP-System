// ============================================================
// OFFICE ERP - DASHBOARD.JS
// ============================================================

// ============================================================
// API & LOGIN INFORMATION
// ============================================================

const API_URL = "http://localhost:5000/api";

const isLoggedIn = localStorage.getItem("isLoggedIn");

const employeeId = localStorage.getItem("employeeId") || "";
const employeeName = localStorage.getItem("employeeName") || "Employee";
const userRole = localStorage.getItem("role") || "Employee";


// ============================================================
// LOGIN CHECK
// ============================================================

if (isLoggedIn !== "true") {
    window.location.href = "index.html";
}


// ============================================================
// GLOBAL VARIABLES
// ============================================================

let employeeRecords = [];
let attendanceRecords = [];
let leaveRecords = [];
let taskRecords = [];
let payrollRecords = [];


// ============================================================
// DOM ELEMENTS
// ============================================================

const employeeNameElement = document.getElementById("employeeName");
const employeeIdElement = document.getElementById("employeeId");
const userAvatar = document.getElementById("userAvatar");
const userRoleElement = document.getElementById("userRole");

const currentDateElement = document.getElementById("currentDate");

const pageTitle = document.getElementById("pageTitle");
const pageDescription = document.getElementById("pageDescription");
const pageContent = document.getElementById("pageContent");

const logoutBtn = document.getElementById("logoutBtn");


// ============================================================
// USER INFORMATION
// ============================================================

if (employeeNameElement) {
    employeeNameElement.textContent = employeeName;
}

if (employeeIdElement) {
    employeeIdElement.textContent = employeeId;
}

if (userAvatar) {
    userAvatar.textContent = employeeName.charAt(0).toUpperCase();
}

if (userRoleElement) {
    userRoleElement.textContent = userRole;
}

if (currentDateElement) {
    const today = new Date();

    currentDateElement.textContent = today.toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


// ============================================================
// API HEADERS
// ============================================================

function getHeaders() {
    return {
        "Content-Type": "application/json",
        "employee-id": employeeId
    };
}


// ============================================================
// API REQUEST FUNCTION
// ============================================================

async function apiRequest(url, options = {}) {

    try {

        const response = await fetch(url, {
            ...options,
            headers: {
                ...getHeaders(),
                ...(options.headers || {})
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.message || "Something went wrong."
            );
        }

        return data;

    } catch (error) {

        console.error("API ERROR:", error);

        throw error;
    }
}


// ============================================================
// ROLE PERMISSIONS
// ============================================================

function applyRolePermissions() {

    const adminMenus =
        document.querySelectorAll(".admin-menu");

    const adminCards =
        document.querySelectorAll(".admin-card");

    if (userRole !== "Admin") {

        adminMenus.forEach(menu => {
            menu.style.display = "none";
        });

        adminCards.forEach(card => {
            card.style.display = "none";
        });
    }
}


// ============================================================
// MENU CLICK
// ============================================================

document.querySelectorAll("[data-page]").forEach(menu => {

    menu.addEventListener("click", function () {

        const page = this.getAttribute("data-page");

        // Employee permission check
        if (
            userRole !== "Admin" &&
            (
                page === "employees" ||
                page === "reports" ||
                page === "settings"
            )
        ) {

            alert("You do not have permission to access this page.");

            return;
        }

        openPage(page);
    });

});


// ============================================================
// OPEN PAGE
// ============================================================

function openPage(page) {

    setActiveMenu(page);

    switch (page) {

        case "dashboard":
            showDashboard();
            break;

        case "employees":

            if (userRole === "Admin") {
                showEmployees();
            }

            break;

        case "attendance":
            showAttendance();
            break;

        case "leave":
            showLeave();
            break;

        case "tasks":
            showTasks();
            break;

        case "payroll":
            showPayroll();
            break;

        case "reports":

            if (userRole === "Admin") {
                showReports();
            }

            break;

        case "settings":

            if (userRole === "Admin") {
                showSettings();
            }

            break;

        case "calendar":
            showCalendar();
            break;

        default:
            showDashboard();
    }
}


// ============================================================
// ACTIVE MENU
// ============================================================

function setActiveMenu(page) {

    document.querySelectorAll("[data-page]").forEach(item => {

        item.classList.remove("active");

        if (item.getAttribute("data-page") === page) {
            item.classList.add("active");
        }
    });
}


// ============================================================
// DASHBOARD
// ============================================================

function showDashboard() {

    pageTitle.textContent = "Dashboard";

    pageDescription.textContent =
        "Welcome to Sysacs Technology Private Limited ERP Management System.";

    pageContent.innerHTML = `

        <div class="dashboard-page">

            <div class="welcome-box">

                <h2>
                    Welcome, ${escapeHtml(employeeName)} 👋
                </h2>

                <p>
                    Manage your office activities from one place.
                </p>

            </div>

            <div class="dashboard-stats">

                <div class="stat-card">

                    <h3>Employees</h3>

                    <div id="totalEmployees">
                        0
                    </div>

                </div>

                <div class="stat-card">

                    <h3>Attendance</h3>

                    <div id="totalAttendance">
                        0
                    </div>

                </div>

                <div class="stat-card">

                    <h3>Leave</h3>

                    <div id="totalLeaves">
                        0
                    </div>

                </div>

                <div class="stat-card">

                    <h3>Tasks</h3>

                    <div id="totalTasks">
                        0
                    </div>

                </div>

            </div>

            <div class="quick-actions">

                <h2>Quick Actions</h2>

                <div class="quick-action-grid">

                    ${
                        userRole === "Admin"
                            ? `
                                <button
                                    class="quick-action-card"
                                    onclick="openPage('employees')"
                                >
                                    👥 Employees
                                </button>
                            `
                            : ""
                    }

                    <button
                        class="quick-action-card"
                        onclick="openPage('attendance')"
                    >
                        🕒 Attendance
                    </button>

                    <button
                        class="quick-action-card"
                        onclick="openPage('leave')"
                    >
                        📅 Leave
                    </button>

                    <button
                        class="quick-action-card"
                        onclick="openPage('tasks')"
                    >
                        ✅ Tasks
                    </button>

                    <button
                        class="quick-action-card"
                        onclick="openPage('payroll')"
                    >
                        💰 Payroll
                    </button>

                </div>

            </div>

        </div>
    `;

    loadDashboardStats();
}


// ============================================================
// DASHBOARD STATS
// ============================================================

async function loadDashboardStats() {

    try {

        const attendance = await apiRequest(
            `${API_URL}/attendance`
        );

        const leaves = await apiRequest(
            `${API_URL}/leaves`
        );

        const tasks = await apiRequest(
            `${API_URL}/tasks`
        );

        const attendanceElement =
            document.getElementById("totalAttendance");

        const leaveElement =
            document.getElementById("totalLeaves");

        const taskElement =
            document.getElementById("totalTasks");

        if (attendanceElement) {
            attendanceElement.textContent =
                attendance.count || attendance.data?.length || 0;
        }

        if (leaveElement) {
            leaveElement.textContent =
                leaves.count || leaves.data?.length || 0;
        }

        if (taskElement) {
            taskElement.textContent =
                tasks.count || tasks.data?.length || 0;
        }

        if (userRole === "Admin") {

            const employees = await apiRequest(
                `${API_URL}/employees`
            );

            const employeeElement =
                document.getElementById("totalEmployees");

            if (employeeElement) {

                employeeElement.textContent =
                    employees.count ||
                    employees.data?.length ||
                    0;
            }
        }

    } catch (error) {

        console.error(
            "Dashboard stats error:",
            error
        );
    }
}


// ============================================================
// EMPLOYEES PAGE
// ============================================================
function showEmployees() {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    pageTitle.textContent = "Employees";

    pageDescription.textContent =
        "Manage all office employees.";

    pageContent.innerHTML = `

        <div class="employee-page">

            <div class="employee-top">

                <div>
                    <h2>Employee Management</h2>

                    <p>
                        Add, update and manage employees.
                    </p>
                </div>

                <button
                    class="employee-btn"
                    onclick="showEmployeeForm()"
                >
                    + Add Employee
                </button>

            </div>

            <div id="employeeFormContainer"></div>

            <div id="employeeTableContainer">
                <div class="loading">
                    Loading employees...
                </div>
            </div>

        </div>
    `;

    loadEmployees();
}
// ============================================================
// EMPLOYEE FORM
// ============================================================

function showEmployeeForm(editId = "") {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    const container =
        document.getElementById("employeeFormContainer");

    const employee =
        employeeRecords.find(item => item._id === editId);

    container.innerHTML = `

        <div class="employee-form-box">

            <h3>
                ${employee ? "Edit Employee" : "Add Employee"}
            </h3>

            <form
                id="employeeForm"
                onsubmit="saveEmployee(event)"
            >

                <input
                    type="hidden"
                    id="employeeRecordId"
                    value="${employee ? employee._id : ""}"
                >

                <div class="form-grid">

                    <div class="form-group">

                        <label>Employee ID</label>

                        <input
                            type="text"
                            id="employeeFormId"
                            value="${employee ? escapeHtml(employee.employeeId) : ""}"
                            ${employee ? "readonly" : ""}
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Name</label>

                        <input
                            type="text"
                            id="employeeFormName"
                            value="${employee ? escapeHtml(employee.name) : ""}"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Email</label>

                        <input
                            type="email"
                            id="employeeFormEmail"
                            value="${employee ? escapeHtml(employee.email) : ""}"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            id="employeeFormPassword"
                            placeholder="${employee ? "Leave blank to keep old password" : ""}"
                            ${employee ? "" : "required"}
                        >

                    </div>

                    <div class="form-group">

                        <label>Department</label>

                        <input
                            type="text"
                            id="employeeFormDepartment"
                            value="${employee ? escapeHtml(employee.department) : ""}"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Designation</label>

                        <input
                            type="text"
                            id="employeeFormDesignation"
                            value="${employee ? escapeHtml(employee.designation) : ""}"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Phone</label>

                        <input
                            type="text"
                            id="employeeFormPhone"
                            value="${employee ? escapeHtml(employee.phone || "") : ""}"
                        >

                    </div>

                    <div class="form-group">

                        <label>Role</label>

                        <select id="employeeFormRole">

                            <option
                                value="Employee"
                                ${employee?.role === "Employee" ? "selected" : ""}
                            >
                                Employee
                            </option>

                            <option
                                value="Admin"
                                ${employee?.role === "Admin" ? "selected" : ""}
                            >
                                Admin
                            </option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label>Status</label>

                        <select id="employeeFormStatus">

                            <option
                                value="Active"
                                ${employee?.status === "Active" ? "selected" : ""}
                            >
                                Active
                            </option>

                            <option
                                value="Inactive"
                                ${employee?.status === "Inactive" ? "selected" : ""}
                            >
                                Inactive
                            </option>

                        </select>

                    </div>

                </div>

                <div class="form-buttons">

                    <button
                        type="submit"
                        class="employee-btn"
                    >
                        ${employee ? "Update Employee" : "Save Employee"}
                    </button>

                    <button
                        type="button"
                        class="cancel-btn"
                        onclick="closeEmployeeForm()"
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    `;
}


// ============================================================
// SAVE EMPLOYEE
// ============================================================

async function saveEmployee(event) {

    event.preventDefault();

    try {

        const id =
            document.getElementById(
                "employeeRecordId"
            ).value;

        const data = {

            employeeId:
                document.getElementById(
                    "employeeFormId"
                ).value.trim(),

            name:
                document.getElementById(
                    "employeeFormName"
                ).value.trim(),

            email:
                document.getElementById(
                    "employeeFormEmail"
                ).value.trim(),

            department:
                document.getElementById(
                    "employeeFormDepartment"
                ).value.trim(),

            designation:
                document.getElementById(
                    "employeeFormDesignation"
                ).value.trim(),

            phone:
                document.getElementById(
                    "employeeFormPhone"
                ).value.trim(),

            role:
                document.getElementById(
                    "employeeFormRole"
                ).value,

            status:
                document.getElementById(
                    "employeeFormStatus"
                ).value
        };

        const password =
            document.getElementById(
                "employeeFormPassword"
            ).value;

        if (password) {
            data.password = password;
        }

        if (id) {

            await apiRequest(
                `${API_URL}/employees/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data)
                }
            );

            alert("Employee updated successfully.");

        } else {

            await apiRequest(
                `${API_URL}/employees`,
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );

            alert("Employee created successfully.");
        }

        loadEmployees();

    } catch (error) {

        alert(error.message);
    }
}


// ============================================================
// LOAD EMPLOYEES
// ============================================================

async function loadEmployees() {

    try {

        const result =
            await apiRequest(
                `${API_URL}/employees`
            );

        employeeRecords =
            result.data || [];

        const container =
            document.getElementById(
                "employeeTableContainer"
            );

        if (!employeeRecords.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No employees found.
                </div>
            `;

            return;
        }

        container.innerHTML = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Employee ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${employeeRecords.map(employee => `

                            <tr>

                                <td>
                                    ${escapeHtml(employee.employeeId)}
                                </td>

                                <td>
                                    ${escapeHtml(employee.name)}
                                </td>

                                <td>
                                    ${escapeHtml(employee.email)}
                                </td>

                                <td>
                                    ${escapeHtml(employee.department)}
                                </td>

                                <td>
                                    ${escapeHtml(employee.designation)}
                                </td>

                                <td>
                                    ${escapeHtml(employee.role)}
                                </td>

                                <td>
                                    ${escapeHtml(employee.status)}
                                </td>

                                <td>

                                    <button
                                        class="edit-btn"
                                        onclick="showEmployeeForm('${employee._id}')"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        class="delete-btn"
                                        onclick="deleteEmployee('${employee._id}')"
                                    >
                                        Delete
                                    </button>

                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        document.getElementById(
            "employeeTableContainer"
        ).innerHTML = `
            <div class="error-message">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


// ============================================================
// DELETE EMPLOYEE
// ============================================================

async function deleteEmployee(id) {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    const confirmDelete =
        confirm(
            "Are you sure you want to delete this employee?"
        );

    if (!confirmDelete) return;

    try {

        await apiRequest(
            `${API_URL}/employees/${id}`,
            {
                method: "DELETE"
            }
        );

        alert("Employee deleted successfully.");

        loadEmployees();

    } catch (error) {

        alert(error.message);
    }
}


// ============================================================
// CLOSE EMPLOYEE FORM
// ============================================================

function closeEmployeeForm() {

    const container =
        document.getElementById(
            "employeeFormContainer"
        );

    if (container) {
        container.innerHTML = "";
    }
}


// ============================================================
// ATTENDANCE PAGE
// ============================================================

// ============================================================
// ATTENDANCE PAGE
// ============================================================

function showAttendance() {

    pageTitle.textContent = "Attendance";

    pageDescription.textContent =
        "Track and manage employee attendance.";

    pageContent.innerHTML = `

        <div class="attendance-page">

            <div class="attendance-top">

                <div>
                    <h2>Attendance Management</h2>

                    <p>
                        Track employee attendance and daily status.
                    </p>
                </div>

                <button
                    class="attendance-btn"
                    onclick="showAttendanceForm()"
                >
                    + Mark Attendance
                </button>

            </div>

            <div id="attendanceFormContainer"></div>

            <div id="attendanceTableContainer">

                <div class="loading">
                    Loading attendance...
                </div>

            </div>

        </div>
    `;

    loadAttendance();
}

// ============================================================
// ATTENDANCE FORM
// ============================================================

function showAttendanceForm() {

    const container =
        document.getElementById(
            "attendanceFormContainer"
        );

    container.innerHTML = `

        <div class="attendance-form-box">

            <h3>Mark Attendance</h3>

            <form
                onsubmit="saveAttendance(event)"
            >

                <div class="form-grid">

                    ${
                        userRole === "Admin"
                            ? `
                                <div class="form-group">

                                    <label>
                                        Employee ID
                                    </label>

                                    <input
                                        type="text"
                                        id="attendanceEmployeeId"
                                        required
                                    >

                                </div>
                            `
                            : `
                                <input
                                    type="hidden"
                                    id="attendanceEmployeeId"
                                    value="${escapeHtml(employeeId)}"
                                >
                            `
                    }

                    <div class="form-group">

                        <label>Date</label>

                        <input
                            type="date"
                            id="attendanceDate"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Status</label>

                        <select
                            id="attendanceStatus"
                            required
                        >

                            <option value="Present">
                                Present
                            </option>

                            <option value="Absent">
                                Absent
                            </option>

                            <option value="Late">
                                Late
                            </option>

                            <option value="Half Day">
                                Half Day
                            </option>

                        </select>

                    </div>

                </div>

                <div class="form-buttons">

                    <button
                        type="submit"
                        class="attendance-btn"
                    >
                        Save Attendance
                    </button>

                    <button
                        type="button"
                        class="cancel-btn"
                        onclick="closeAttendanceForm()"
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    `;
}


// ============================================================
// SAVE ATTENDANCE
// ============================================================

async function saveAttendance(event) {

    event.preventDefault();

    try {

        const data = {

            employeeId:
                document.getElementById(
                    "attendanceEmployeeId"
                ).value.trim(),

            date:
                document.getElementById(
                    "attendanceDate"
                ).value,

            status:
                document.getElementById(
                    "attendanceStatus"
                ).value
        };

        await apiRequest(
            `${API_URL}/attendance`,
            {
                method: "POST",
                body: JSON.stringify(data)
            }
        );

        alert(
            "Attendance saved successfully."
        );

        loadAttendance();

    } catch (error) {

        alert(error.message);
    }
}


// ============================================================
// LOAD ATTENDANCE
// ============================================================

async function loadAttendance() {

    try {

        const result =
            await apiRequest(
                `${API_URL}/attendance`
            );

        attendanceRecords =
            result.data || [];

        const container =
            document.getElementById(
                "attendanceTableContainer"
            );

        if (!attendanceRecords.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No attendance records found.
                </div>
            `;

            return;
        }

        container.innerHTML = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Employee ID</th>
                            <th>Date</th>
                            <th>Status</th>

                            ${
                                userRole === "Admin"
                                    ? "<th>Action</th>"
                                    : ""
                            }

                        </tr>

                    </thead>

                    <tbody>

                        ${attendanceRecords.map(item => `

                            <tr>

                                <td>
                                    ${escapeHtml(item.employeeId)}
                                </td>

                                <td>
                                    ${formatDate(item.date)}
                                </td>

                                <td>
                                    ${escapeHtml(item.status)}
                                </td>

                                ${
                                    userRole === "Admin"
                                        ? `
                                            <td>

                                                <button
                                                    class="delete-btn"
                                                    onclick="deleteAttendance('${item._id}')"
                                                >
                                                    Delete
                                                </button>

                                            </td>
                                        `
                                        : ""
                                }

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        document.getElementById(
            "attendanceTableContainer"
        ).innerHTML = `
            <div class="error-message">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


// ============================================================
// DELETE ATTENDANCE
// ============================================================

async function deleteAttendance(id) {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    if (!confirm("Delete this attendance record?")) {
        return;
    }

    try {

        await apiRequest(
            `${API_URL}/attendance/${id}`,
            {
                method: "DELETE"
            }
        );

        alert(
            "Attendance deleted successfully."
        );

        loadAttendance();

    } catch (error) {

        alert(error.message);
    }
}


function closeAttendanceForm() {

    const container =
        document.getElementById(
            "attendanceFormContainer"
        );

    if (container) {
        container.innerHTML = "";
    }
}


// ============================================================
// LEAVE PAGE
// ============================================================

function showLeave() {

    pageTitle.textContent = "Leave";

    pageDescription.textContent =
        userRole === "Admin"
            ? "Manage employee leave requests."
            : "Manage your leave requests.";

    pageContent.innerHTML = `

        <div class="leave-page">

            <div class="leave-top">

                <div>

                    <h2>Leave Management</h2>

                    <p>
                        Submit and manage leave requests.
                    </p>

                </div>

                <button
                    class="leave-btn"
                    onclick="showLeaveForm()"
                >
                    + Apply Leave
                </button>

            </div>

            <div id="leaveFormContainer"></div>

            <div id="leaveTableContainer">
                <div class="loading">
                    Loading leave records...
                </div>
            </div>

        </div>
    `;

    loadLeaves();
}


// ============================================================
// LEAVE FORM
// ============================================================

function showLeaveForm() {

    const container =
        document.getElementById(
            "leaveFormContainer"
        );

    container.innerHTML = `

        <div class="leave-form-box">

            <h3>Apply Leave</h3>

            <form
                onsubmit="saveLeave(event)"
            >

                <div class="form-grid">

                    ${
                        userRole === "Admin"
                            ? `
                                <div class="form-group">

                                    <label>
                                        Employee ID
                                    </label>

                                    <input
                                        type="text"
                                        id="leaveEmployeeId"
                                        required
                                    >

                                </div>
                            `
                            : `
                                <input
                                    type="hidden"
                                    id="leaveEmployeeId"
                                    value="${escapeHtml(employeeId)}"
                                >
                            `
                    }

                    <div class="form-group">

                        <label>Leave Type</label>

                        <select id="leaveType">

                            <option value="Casual">
                                Casual
                            </option>

                            <option value="Sick">
                                Sick
                            </option>

                            <option value="Earned">
                                Earned
                            </option>

                            <option value="Other">
                                Other
                            </option>

                        </select>

                    </div>

                    <div class="form-group">

                        <label>Start Date</label>

                        <input
                            type="date"
                            id="leaveStartDate"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>End Date</label>

                        <input
                            type="date"
                            id="leaveEndDate"
                            required
                        >

                    </div>

                    <div class="form-group">

                        <label>Reason</label>

                        <textarea
                            id="leaveReason"
                            rows="3"
                            required
                        ></textarea>

                    </div>

                </div>

                <div class="form-buttons">

                    <button
                        type="submit"
                        class="leave-btn"
                    >
                        Submit Leave
                    </button>

                    <button
                        type="button"
                        class="cancel-btn"
                        onclick="closeLeaveForm()"
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    `;
}


// ============================================================
// SAVE LEAVE
// ============================================================

async function saveLeave(event) {

    event.preventDefault();

    try {

        const data = {

            employeeId:
                document.getElementById(
                    "leaveEmployeeId"
                ).value.trim(),

            leaveType:
                document.getElementById(
                    "leaveType"
                ).value,

            startDate:
                document.getElementById(
                    "leaveStartDate"
                ).value,

            endDate:
                document.getElementById(
                    "leaveEndDate"
                ).value,

            reason:
                document.getElementById(
                    "leaveReason"
                ).value.trim()
        };

        await apiRequest(
            `${API_URL}/leaves`,
            {
                method: "POST",
                body: JSON.stringify(data)
            }
        );

        alert(
            "Leave request submitted successfully."
        );

        loadLeaves();

    } catch (error) {

        alert(error.message);
    }
}


// ============================================================
// LOAD LEAVES
// ============================================================

async function loadLeaves() {

    try {

        const result =
            await apiRequest(
                `${API_URL}/leaves`
            );

        leaveRecords =
            result.data || [];

        const container =
            document.getElementById(
                "leaveTableContainer"
            );

        if (!leaveRecords.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No leave records found.
                </div>
            `;

            return;
        }

        container.innerHTML = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Employee ID</th>
                            <th>Type</th>
                            <th>Start</th>
                            <th>End</th>
                            <th>Reason</th>
                            <th>Status</th>

                            ${
                                userRole === "Admin"
                                    ? "<th>Action</th>"
                                    : ""
                            }

                        </tr>

                    </thead>

                    <tbody>

                        ${leaveRecords.map(item => `

                            <tr>

                                <td>
                                    ${escapeHtml(item.employeeId)}
                                </td>

                                <td>
                                    ${escapeHtml(item.leaveType)}
                                </td>

                                <td>
                                    ${formatDate(item.startDate)}
                                </td>

                                <td>
                                    ${formatDate(item.endDate)}
                                </td>

                                <td>
                                    ${escapeHtml(item.reason || "")}
                                </td>

                                <td>
                                    ${escapeHtml(item.status || "Pending")}
                                </td>

                                ${
                                    userRole === "Admin"
                                        ? `
                                            <td>

                                                ${
                                                    item.status === "Pending"
                                                        ? `
                                                            <button
                                                                class="approve-btn"
                                                                onclick="updateLeaveStatus('${item._id}', 'Approved')"
                                                            >
                                                                Approve
                                                            </button>

                                                            <button
                                                                class="reject-btn"
                                                                onclick="updateLeaveStatus('${item._id}', 'Rejected')"
                                                            >
                                                                Reject
                                                            </button>
                                                        `
                                                        : ""
                                                }

                                                <button
                                                    class="delete-btn"
                                                    onclick="deleteLeave('${item._id}')"
                                                >
                                                    Delete
                                                </button>

                                            </td>
                                        `
                                        : ""
                                }

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        document.getElementById(
            "leaveTableContainer"
        ).innerHTML = `
            <div class="error-message">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


// ============================================================
// UPDATE LEAVE STATUS
// ============================================================

async function updateLeaveStatus(id, status) {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    try {

        await apiRequest(
            `${API_URL}/leaves/${id}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    status
                })
            }
        );

        alert(
            `Leave ${status.toLowerCase()} successfully.`
        );

        loadLeaves();

    } catch (error) {

        alert(error.message);
    }
}


// ============================================================
// DELETE LEAVE
// ============================================================

async function deleteLeave(id) {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    if (!confirm("Delete this leave record?")) {
        return;
    }

    try {

        await apiRequest(
            `${API_URL}/leaves/${id}`,
            {
                method: "DELETE"
            }
        );

        alert(
            "Leave deleted successfully."
        );

        loadLeaves();

    } catch (error) {

        alert(error.message);
    }
}


function closeLeaveForm() {

    const container =
        document.getElementById(
            "leaveFormContainer"
        );

    if (container) {
        container.innerHTML = "";
    }
}


// ============================================================
// TASK PAGE
// ============================================================

function showTasks() {

    pageTitle.textContent = "Tasks";

    pageDescription.textContent =
        userRole === "Admin"
            ? "Create and manage employee tasks."
            : "View and update your assigned tasks.";

    pageContent.innerHTML = `

        <div class="task-page">

            <div class="task-top">

                <div>

                    <h2>Task Management</h2>

                    <p>
                        ${
                            userRole === "Admin"
                                ? "Assign and manage employee tasks."
                                : "Manage your assigned tasks."
                        }
                    </p>

                </div>

                ${
                    userRole === "Admin"
                        ? `
                            <button
                                class="task-btn"
                                onclick="showTaskForm()"
                            >
                                + Create Task
                            </button>
                        `
                        : ""
                }

            </div>

            ${
                userRole === "Admin"
                    ? `<div id="taskFormContainer"></div>`
                    : ""
            }

            <div id="taskTableContainer">

                <div class="loading">
                    Loading tasks...
                </div>

            </div>

        </div>
    `;

    loadTasks();
}


// ============================================================
// TASK FORM
// ============================================================

function showTaskForm(editId = "") {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    const container =
        document.getElementById(
            "taskFormContainer"
        );

    const task =
        taskRecords.find(item => item._id === editId);

    container.innerHTML = `

        <div class="task-form-box">

            <h3>
                ${task ? "Edit Task" : "Create Task"}
            </h3>

            <form
                onsubmit="saveTask(event)"
            >

                <input
                    type="hidden"
                    id="taskRecordId"
                    value="${task ? task._id : ""}"
                >

                <div class="task-form-grid">

                    <div class="task-form-group">

                        <label>Task Title</label>

                        <input
                            type="text"
                            id="taskTitle"
                            value="${task ? escapeHtml(task.title) : ""}"
                            required
                        >

                    </div>

                    <div class="task-form-group">

                        <label>Employee ID</label>

                        <input
                            type="text"
                            id="taskAssignedTo"
                            value="${task ? escapeHtml(task.assignedTo) : ""}"
                            ${task ? "readonly" : ""}
                            required
                        >

                    </div>

                    <div class="task-form-group">

                        <label>Due Date</label>

                        <input
                            type="date"
                            id="taskDueDate"
                            value="${task ? getInputDate(task.dueDate) : ""}"
                            required
                        >

                    </div>

                    <div class="task-form-group">

                        <label>Priority</label>

                        <select id="taskPriority">

                            <option
                                value="Low"
                                ${task?.priority === "Low" ? "selected" : ""}
                            >
                                Low
                            </option>

                            <option
                                value="Medium"
                                ${!task || task?.priority === "Medium" ? "selected" : ""}
                            >
                                Medium
                            </option>

                            <option
                                value="High"
                                ${task?.priority === "High" ? "selected" : ""}
                            >
                                High
                            </option>

                        </select>

                    </div>

                    <div class="task-form-group">

                        <label>Description</label>

                        <textarea
                            id="taskDescription"
                            rows="4"
                        >${task ? escapeHtml(task.description || "") : ""}</textarea>

                    </div>

                </div>

                <div class="task-form-buttons">

                    <button
                        type="submit"
                        class="task-btn"
                    >
                        ${task ? "Update Task" : "Create Task"}
                    </button>

                    <button
                        type="button"
                        class="cancel-btn"
                        onclick="closeTaskForm()"
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    `;
}


// ============================================================
// SAVE TASK
// ============================================================

async function saveTask(event) {

    event.preventDefault();

    try {

        const id =
            document.getElementById(
                "taskRecordId"
            ).value;

        const data = {

            title:
                document.getElementById(
                    "taskTitle"
                ).value.trim(),

            assignedTo:
                document.getElementById(
                    "taskAssignedTo"
                ).value.trim(),

            dueDate:
                document.getElementById(
                    "taskDueDate"
                ).value,

            priority:
                document.getElementById(
                    "taskPriority"
                ).value,

            description:
                document.getElementById(
                    "taskDescription"
                ).value.trim()
        };

        if (id) {

            await apiRequest(
                `${API_URL}/tasks/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data)
                }
            );

            alert("Task updated successfully.");

        } else {

            await apiRequest(
                `${API_URL}/tasks`,
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );

            alert("Task created successfully.");
        }

        loadTasks();

    } catch (error) {

        alert(error.message);
    }
}


// ============================================================
// LOAD TASKS
// ============================================================

async function loadTasks() {

    try {

        const result =
            await apiRequest(
                `${API_URL}/tasks`
            );

        taskRecords =
            result.data || [];

        const container =
            document.getElementById(
                "taskTableContainer"
            );

        if (!taskRecords.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No tasks found.
                </div>
            `;

            return;
        }

        container.innerHTML = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Task</th>
                            <th>Assigned To</th>
                            <th>Due Date</th>
                            <th>Priority</th>
                            <th>Status</th>
                            <th>Action</th>

                        </tr>

                    </thead>

                    <tbody>

                        ${taskRecords.map(task => `

                            <tr>

                                <td>

                                    <strong>
                                        ${escapeHtml(task.title)}
                                    </strong>

                                    <br>

                                    <small>
                                        ${escapeHtml(task.description || "")}
                                    </small>

                                </td>

                                <td>
                                    ${escapeHtml(task.assignedTo)}
                                </td>

                                <td>
                                    ${formatDate(task.dueDate)}
                                </td>

                                <td>

                                    <span
                                        class="task-priority ${getTaskPriorityClass(task.priority)}"
                                    >
                                        ${escapeHtml(task.priority)}
                                    </span>

                                </td>

                                <td>

                                    ${
                                        userRole === "Admin"
                                            ? `
                                                <select
                                                    class="task-status-select"
                                                    onchange="updateTaskStatus('${task._id}', this.value)"
                                                >

                                                    <option
                                                        value="Pending"
                                                        ${task.status === "Pending" ? "selected" : ""}
                                                    >
                                                        Pending
                                                    </option>

                                                    <option
                                                        value="In Progress"
                                                        ${task.status === "In Progress" ? "selected" : ""}
                                                    >
                                                        In Progress
                                                    </option>

                                                    <option
                                                        value="Completed"
                                                        ${task.status === "Completed" ? "selected" : ""}
                                                    >
                                                        Completed
                                                    </option>

                                                </select>
                                            `
                                            : `
                                                <select
                                                    class="task-status-select"
                                                    onchange="updateTaskStatus('${task._id}', this.value)"
                                                >

                                                    <option
                                                        value="Pending"
                                                        ${task.status === "Pending" ? "selected" : ""}
                                                    >
                                                        Pending
                                                    </option>

                                                    <option
                                                        value="In Progress"
                                                        ${task.status === "In Progress" ? "selected" : ""}
                                                    >
                                                        In Progress
                                                    </option>

                                                    <option
                                                        value="Completed"
                                                        ${task.status === "Completed" ? "selected" : ""}
                                                    >
                                                        Completed
                                                    </option>

                                                </select>
                                            `
                                    }

                                </td>

                                <td>

                                    ${
                                        userRole === "Admin"
                                            ? `
                                                <button
                                                    class="edit-btn"
                                                    onclick="showTaskForm('${task._id}')"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    class="delete-btn"
                                                    onclick="deleteTask('${task._id}')"
                                                >
                                                    Delete
                                                </button>
                                            `
                                            : "—"
                                    }

                                </td>

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        document.getElementById(
            "taskTableContainer"
        ).innerHTML = `
            <div class="error-message">
                ${escapeHtml(error.message)}
            </div>
        `;
    }
}


// ============================================================
// UPDATE TASK STATUS
// ============================================================

async function updateTaskStatus(id, status) {

    try {

        await apiRequest(
            `${API_URL}/tasks/${id}`,
            {
                method: "PUT",
                body: JSON.stringify({
                    status
                })
            }
        );

        loadTasks();

    } catch (error) {

        alert(error.message);
        loadTasks();
    }
}


// ============================================================
// DELETE TASK
// ============================================================

async function deleteTask(id) {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    if (!confirm("Delete this task?")) {
        return;
    }

    try {

        await apiRequest(
            `${API_URL}/tasks/${id}`,
            {
                method: "DELETE"
            }
        );

        alert("Task deleted successfully.");

        loadTasks();

    } catch (error) {

        alert(error.message);
    }
}


function closeTaskForm() {

    const container =
        document.getElementById(
            "taskFormContainer"
        );

    if (container) {
        container.innerHTML = "";
    }
}


// ============================================================
// TASK STATUS CLASS
// ============================================================

function getTaskStatusClass(status) {

    if (status === "Completed") {
        return "task-completed";
    }

    if (status === "In Progress") {
        return "task-progress";
    }

    return "task-pending";
}


// ============================================================
// TASK PRIORITY CLASS
// ============================================================

function getTaskPriorityClass(priority) {

    if (priority === "High") {
        return "task-high";
    }

    if (priority === "Low") {
        return "task-low";
    }

    return "task-medium";
}


// ============================================================
// PAYROLL PAGE
// ============================================================

function showPayroll() {

    pageTitle.textContent = "Payroll";

    pageDescription.textContent =
        userRole === "Admin"
            ? "Manage employee payroll information."
            : "View your own payroll information.";

    pageContent.innerHTML = `

        <div class="payroll-page">

            <div class="payroll-top">

                <div>

                    <h2>Payroll Management</h2>

                    <p>
                        ${
                            userRole === "Admin"
                                ? "Create and manage employee salary records."
                                : "View your salary and payment records."
                        }
                    </p>

                </div>

                ${
                    userRole === "Admin"
                        ? `
                            <button
                                class="payroll-btn"
                                onclick="showPayrollForm()"
                            >
                                + Add Payroll
                            </button>
                        `
                        : ""
                }

            </div>

            ${
                userRole === "Admin"
                    ? `<div id="payrollFormContainer"></div>`
                    : ""
            }

            <div id="payrollTableContainer">

                <div class="loading">
                    Loading payroll...
                </div>

            </div>

        </div>
    `;

    loadPayroll();
}


// ============================================================
// PAYROLL FORM
// ============================================================

function showPayrollForm(editId = "") {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    const container =
        document.getElementById(
            "payrollFormContainer"
        );

    if (!container) return;

    const payroll =
        payrollRecords.find(
            item => item._id === editId
        );

    container.innerHTML = `

        <div class="payroll-form-box">

            <h3>
                ${payroll ? "Edit Payroll" : "Add Payroll"}
            </h3>

            <form
                id="payrollForm"
                onsubmit="savePayroll(event)"
            >

                <input
                    type="hidden"
                    id="payrollRecordId"
                    value="${payroll ? payroll._id : ""}"
                >

                <div class="payroll-form-grid">

                    <div class="payroll-form-group">

                        <label>
                            Employee ID
                        </label>

                        <input
                            type="text"
                            id="payrollEmployeeId"
                            value="${payroll ? escapeHtml(payroll.employeeId) : ""}"
                            required
                        >

                    </div>

                    <div class="payroll-form-group">

                        <label>
                            Salary Month
                        </label>

                        <input
                            type="month"
                            id="payrollSalaryMonth"
                            value="${payroll ? escapeHtml(payroll.salaryMonth) : getCurrentMonth()}"
                            required
                        >

                    </div>

                    <div class="payroll-form-group">

                        <label>
                            Basic Salary
                        </label>

                        <input
                            type="number"
                            id="payrollBasicSalary"
                            value="${payroll ? payroll.basicSalary : ""}"
                            min="0"
                            step="0.01"
                            oninput="calculateNetSalary()"
                            required
                        >

                    </div>

                    <div class="payroll-form-group">

                        <label>
                            Allowances
                        </label>

                        <input
                            type="number"
                            id="payrollAllowances"
                            value="${payroll ? payroll.allowances : 0}"
                            min="0"
                            step="0.01"
                            oninput="calculateNetSalary()"
                        >

                    </div>

                    <div class="payroll-form-group">

                        <label>
                            Deductions
                        </label>

                        <input
                            type="number"
                            id="payrollDeductions"
                            value="${payroll ? payroll.deductions : 0}"
                            min="0"
                            step="0.01"
                            oninput="calculateNetSalary()"
                        >

                    </div>

                    <div class="payroll-form-group">

                        <label>
                            Net Salary
                        </label>

                        <input
                            type="number"
                            id="payrollNetSalary"
                            value="${payroll ? payroll.netSalary : 0}"
                            readonly
                        >

                    </div>

                    <div class="payroll-form-group">

                        <label>
                            Payment Status
                        </label>

                        <select
                            id="payrollPaymentStatus"
                        >

                            <option
                                value="Pending"
                                ${!payroll || payroll.paymentStatus === "Pending" ? "selected" : ""}
                            >
                                Pending
                            </option>

                            <option
                                value="Paid"
                                ${payroll?.paymentStatus === "Paid" ? "selected" : ""}
                            >
                                Paid
                            </option>

                        </select>

                    </div>

                </div>

                <div class="payroll-form-buttons">

                    <button
                        type="submit"
                        class="payroll-btn"
                    >
                        ${payroll ? "Update Payroll" : "Save Payroll"}
                    </button>

                    <button
                        type="button"
                        class="cancel-btn"
                        onclick="closePayrollForm()"
                    >
                        Cancel
                    </button>

                </div>

            </form>

        </div>
    `;

    calculateNetSalary();
}


// ============================================================
// CALCULATE NET SALARY
// ============================================================

function calculateNetSalary() {

    const basicElement =
        document.getElementById(
            "payrollBasicSalary"
        );

    const allowanceElement =
        document.getElementById(
            "payrollAllowances"
        );

    const deductionElement =
        document.getElementById(
            "payrollDeductions"
        );

    const netElement =
        document.getElementById(
            "payrollNetSalary"
        );

    if (
        !basicElement ||
        !allowanceElement ||
        !deductionElement ||
        !netElement
    ) {
        return;
    }

    const basic =
        Number(basicElement.value) || 0;

    const allowances =
        Number(allowanceElement.value) || 0;

    const deductions =
        Number(deductionElement.value) || 0;

    const netSalary =
        basic + allowances - deductions;

    netElement.value =
        netSalary >= 0
            ? netSalary.toFixed(2)
            : "0.00";
}


// ============================================================
// SAVE PAYROLL
// ============================================================

async function savePayroll(event) {

    event.preventDefault();

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    try {

        const id =
            document.getElementById(
                "payrollRecordId"
            ).value;

        const data = {

            employeeId:
                document.getElementById(
                    "payrollEmployeeId"
                ).value.trim(),

            salaryMonth:
                document.getElementById(
                    "payrollSalaryMonth"
                ).value,

            basicSalary:
                Number(
                    document.getElementById(
                        "payrollBasicSalary"
                    ).value
                ),

            allowances:
                Number(
                    document.getElementById(
                        "payrollAllowances"
                    ).value
                ) || 0,

            deductions:
                Number(
                    document.getElementById(
                        "payrollDeductions"
                    ).value
                ) || 0,

            paymentStatus:
                document.getElementById(
                    "payrollPaymentStatus"
                ).value
        };

        if (data.basicSalary < 0) {
            alert("Basic salary cannot be negative.");
            return;
        }

        if (data.allowances < 0) {
            alert("Allowances cannot be negative.");
            return;
        }

        if (data.deductions < 0) {
            alert("Deductions cannot be negative.");
            return;
        }

        if (
            data.basicSalary +
            data.allowances -
            data.deductions < 0
        ) {
            alert(
                "Deductions cannot be greater than total earnings."
            );
            return;
        }

        if (id) {

            await apiRequest(
                `${API_URL}/payroll/${id}`,
                {
                    method: "PUT",
                    body: JSON.stringify(data)
                }
            );

            alert(
                "Payroll updated successfully."
            );

        } else {

            await apiRequest(
                `${API_URL}/payroll`,
                {
                    method: "POST",
                    body: JSON.stringify(data)
                }
            );

            alert(
                "Payroll created successfully."
            );
        }

        loadPayroll();

    } catch (error) {

        alert(error.message);
    }
}


// ============================================================
// LOAD PAYROLL
// ============================================================

async function loadPayroll() {

    try {

        const result =
            await apiRequest(
                `${API_URL}/payroll`
            );

        payrollRecords =
            result.data || [];

        const container =
            document.getElementById(
                "payrollTableContainer"
            );

        if (!container) return;

        if (!payrollRecords.length) {

            container.innerHTML = `
                <div class="empty-state">
                    No payroll records found.
                </div>
            `;

            return;
        }

        container.innerHTML = `

            <div class="table-container">

                <table>

                    <thead>

                        <tr>

                            <th>Employee ID</th>
                            <th>Salary Month</th>
                            <th>Basic Salary</th>
                            <th>Allowances</th>
                            <th>Deductions</th>
                            <th>Net Salary</th>
                            <th>Status</th>

                            ${
                                userRole === "Admin"
                                    ? "<th>Action</th>"
                                    : ""
                            }

                        </tr>

                    </thead>

                    <tbody>

                        ${payrollRecords.map(payroll => `

                            <tr>

                                <td>
                                    ${escapeHtml(payroll.employeeId)}
                                </td>

                                <td>
                                    ${formatSalaryMonth(
                                        payroll.salaryMonth
                                    )}
                                </td>

                                <td>
                                    ${formatCurrency(
                                        payroll.basicSalary
                                    )}
                                </td>

                                <td>
                                    ${formatCurrency(
                                        payroll.allowances
                                    )}
                                </td>

                                <td>
                                    ${formatCurrency(
                                        payroll.deductions
                                    )}
                                </td>

                                <td>
                                    <strong>
                                        ${formatCurrency(
                                            payroll.netSalary
                                        )}
                                    </strong>
                                </td>

                                <td>

                                    <span
                                        class="payroll-status ${
                                            payroll.paymentStatus === "Paid"
                                                ? "payroll-paid"
                                                : "payroll-pending"
                                        }"
                                    >
                                        ${escapeHtml(
                                            payroll.paymentStatus
                                        )}
                                    </span>

                                </td>

                                ${
                                    userRole === "Admin"
                                        ? `
                                            <td>

                                                <button
                                                    class="edit-btn"
                                                    onclick="showPayrollForm('${payroll._id}')"
                                                >
                                                    Edit
                                                </button>

                                                <button
                                                    class="delete-btn"
                                                    onclick="deletePayroll('${payroll._id}')"
                                                >
                                                    Delete
                                                </button>

                                            </td>
                                        `
                                        : ""
                                }

                            </tr>

                        `).join("")}

                    </tbody>

                </table>

            </div>
        `;

    } catch (error) {

        const container =
            document.getElementById(
                "payrollTableContainer"
            );

        if (container) {

            container.innerHTML = `
                <div class="error-message">
                    ${escapeHtml(error.message)}
                </div>
            `;
        }
    }
}


// ============================================================
// DELETE PAYROLL
// ============================================================

async function deletePayroll(id) {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    if (!confirm("Delete this payroll record?")) {
        return;
    }

    try {

        await apiRequest(
            `${API_URL}/payroll/${id}`,
            {
                method: "DELETE"
            }
        );

        alert(
            "Payroll deleted successfully."
        );

        loadPayroll();

    } catch (error) {

        alert(error.message);
    }
}


// ============================================================
// CLOSE PAYROLL FORM
// ============================================================

function closePayrollForm() {

    const container =
        document.getElementById(
            "payrollFormContainer"
        );

    if (container) {
        container.innerHTML = "";
    }
}


// ============================================================
// REPORTS
// ============================================================

// ============================================================
// REPORTS PAGE
// ============================================================

async function showReports() {
    const content = document.getElementById("pageContent");

    content.innerHTML = `
        <div class="reports-page">

            <div class="reports-header">
                <div>
                    <h2>Reports</h2>
                    <p>Office ERP overall management report</p>
                </div>

                <button class="report-refresh-btn" onclick="showReports()">
                    ↻ Refresh
                </button>
            </div>

            <div id="reportsContent">
                <div class="reports-loading">
                    Loading reports...
                </div>
            </div>

        </div>
    `;

    try {
        const headers = {
            "employee-id": employeeId
        };

        // Load all existing ERP data
        const [
            employeesResponse,
            attendanceResponse,
            leavesResponse,
            tasksResponse,
            payrollResponse
        ] = await Promise.all([
            fetch(`${API_URL}/employees`, {
                headers
            }),

            fetch(`${API_URL}/attendance`, {
                headers
            }),

            fetch(`${API_URL}/leaves`, {
                headers
            }),

            fetch(`${API_URL}/tasks`, {
                headers
            }),

            fetch(`${API_URL}/payroll`, {
                headers
            })
        ]);

        const employeesData = await employeesResponse.json();
        const attendanceData = await attendanceResponse.json();
        const leavesData = await leavesResponse.json();
        const tasksData = await tasksResponse.json();
        const payrollData = await payrollResponse.json();

        // Extract arrays safely
        const employees = Array.isArray(employeesData)
            ? employeesData
            : employeesData.employees || [];

        const attendance = Array.isArray(attendanceData)
            ? attendanceData
            : attendanceData.attendance || [];

        const leaves = Array.isArray(leavesData)
            ? leavesData
            : leavesData.leaves || [];

        const tasks = Array.isArray(tasksData)
            ? tasksData
            : tasksData.tasks || [];

        const payroll = Array.isArray(payrollData)
            ? payrollData
            : payrollData.payroll || payrollData.payrolls || [];

        // ====================================================
        // EMPLOYEE SUMMARY
        // ====================================================

        const totalEmployees = employees.length;

        const activeEmployees = employees.filter(
            emp => emp.status === "Active"
        ).length;

        const inactiveEmployees = employees.filter(
            emp => emp.status === "Inactive"
        ).length;

        // ====================================================
        // ATTENDANCE SUMMARY
        // ====================================================

        const presentCount = attendance.filter(
            item =>
                item.status &&
                item.status.toLowerCase() === "present"
        ).length;

        const absentCount = attendance.filter(
            item =>
                item.status &&
                item.status.toLowerCase() === "absent"
        ).length;

        const lateCount = attendance.filter(
            item =>
                item.status &&
                item.status.toLowerCase() === "late"
        ).length;

        // ====================================================
        // LEAVE SUMMARY
        // ====================================================

        const pendingLeaves = leaves.filter(
            leave => leave.status === "Pending"
        ).length;

        const approvedLeaves = leaves.filter(
            leave => leave.status === "Approved"
        ).length;

        const rejectedLeaves = leaves.filter(
            leave => leave.status === "Rejected"
        ).length;

        // ====================================================
        // TASK SUMMARY
        // ====================================================

        const pendingTasks = tasks.filter(
            task => task.status === "Pending"
        ).length;

        const inProgressTasks = tasks.filter(
            task => task.status === "In Progress"
        ).length;

        const completedTasks = tasks.filter(
            task => task.status === "Completed"
        ).length;

        // ====================================================
        // PAYROLL SUMMARY
        // ====================================================

        const totalPayroll = payroll.reduce(
            (total, item) => total + Number(item.netSalary || 0),
            0
        );

        const paidPayroll = payroll
            .filter(item => item.paymentStatus === "Paid")
            .reduce(
                (total, item) => total + Number(item.netSalary || 0),
                0
            );

        const pendingPayroll = payroll
            .filter(item => item.paymentStatus === "Pending")
            .reduce(
                (total, item) => total + Number(item.netSalary || 0),
                0
            );

        // ====================================================
        // REPORT HTML
        // ====================================================

        document.getElementById("reportsContent").innerHTML = `

            <!-- EMPLOYEE REPORT -->

            <div class="report-section">

                <div class="report-section-title">
                    <h3>Employee Summary</h3>
                </div>

                <div class="report-cards">

                    <div class="report-card">
                        <div class="report-card-icon">👥</div>
                        <div>
                            <span>Total Employees</span>
                            <strong>${totalEmployees}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">🟢</div>
                        <div>
                            <span>Active Employees</span>
                            <strong>${activeEmployees}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">🔴</div>
                        <div>
                            <span>Inactive Employees</span>
                            <strong>${inactiveEmployees}</strong>
                        </div>
                    </div>

                </div>

            </div>


            <!-- ATTENDANCE REPORT -->

            <div class="report-section">

                <div class="report-section-title">
                    <h3>Attendance Summary</h3>
                </div>

                <div class="report-cards">

                    <div class="report-card">
                        <div class="report-card-icon">✅</div>
                        <div>
                            <span>Present</span>
                            <strong>${presentCount}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">❌</div>
                        <div>
                            <span>Absent</span>
                            <strong>${absentCount}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">⏰</div>
                        <div>
                            <span>Late</span>
                            <strong>${lateCount}</strong>
                        </div>
                    </div>

                </div>

            </div>


            <!-- LEAVE REPORT -->

            <div class="report-section">

                <div class="report-section-title">
                    <h3>Leave Summary</h3>
                </div>

                <div class="report-cards">

                    <div class="report-card">
                        <div class="report-card-icon">⏳</div>
                        <div>
                            <span>Pending</span>
                            <strong>${pendingLeaves}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">✅</div>
                        <div>
                            <span>Approved</span>
                            <strong>${approvedLeaves}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">❌</div>
                        <div>
                            <span>Rejected</span>
                            <strong>${rejectedLeaves}</strong>
                        </div>
                    </div>

                </div>

            </div>


            <!-- TASK REPORT -->

            <div class="report-section">

                <div class="report-section-title">
                    <h3>Task Summary</h3>
                </div>

                <div class="report-cards">

                    <div class="report-card">
                        <div class="report-card-icon">📋</div>
                        <div>
                            <span>Pending</span>
                            <strong>${pendingTasks}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">🔄</div>
                        <div>
                            <span>In Progress</span>
                            <strong>${inProgressTasks}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">✅</div>
                        <div>
                            <span>Completed</span>
                            <strong>${completedTasks}</strong>
                        </div>
                    </div>

                </div>

            </div>


            <!-- PAYROLL REPORT -->

            <div class="report-section">

                <div class="report-section-title">
                    <h3>Payroll Summary</h3>
                </div>

                <div class="report-cards">

                    <div class="report-card">
                        <div class="report-card-icon">💰</div>
                        <div>
                            <span>Total Payroll</span>
                            <strong>${formatCurrency(totalPayroll)}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">💵</div>
                        <div>
                            <span>Paid Payroll</span>
                            <strong>${formatCurrency(paidPayroll)}</strong>
                        </div>
                    </div>

                    <div class="report-card">
                        <div class="report-card-icon">⏳</div>
                        <div>
                            <span>Pending Payroll</span>
                            <strong>${formatCurrency(pendingPayroll)}</strong>
                        </div>
                    </div>

                </div>

            </div>


            <!-- REPORT DETAILS TABLE -->

            <div class="report-section">

                <div class="report-section-title">
                    <h3>Quick Overview</h3>
                </div>

                <div class="report-table-container">

                    <table class="report-table">

                        <thead>
                            <tr>
                                <th>Module</th>
                                <th>Total Records</th>
                            </tr>
                        </thead>

                        <tbody>

                            <tr>
                                <td>Employees</td>
                                <td>${totalEmployees}</td>
                            </tr>

                            <tr>
                                <td>Attendance</td>
                                <td>${attendance.length}</td>
                            </tr>

                            <tr>
                                <td>Leave Requests</td>
                                <td>${leaves.length}</td>
                            </tr>

                            <tr>
                                <td>Tasks</td>
                                <td>${tasks.length}</td>
                            </tr>

                            <tr>
                                <td>Payroll Records</td>
                                <td>${payroll.length}</td>
                            </tr>

                        </tbody>

                    </table>

                </div>

            </div>

        `;
    } catch (error) {

        console.error("Reports Error:", error);

        document.getElementById("reportsContent").innerHTML = `
            <div class="reports-error">
                <h3>Unable to load reports</h3>
                <p>Please make sure the backend server is running.</p>
                <button class="report-refresh-btn" onclick="showReports()">
                    Try Again
                </button>
            </div>
        `;
    }
}

// ============================================================
// SETTINGS PAGE
// ============================================================

function showSettings() {

    if (userRole !== "Admin") {
        alert("Admin access required.");
        return;
    }

    pageTitle.textContent = "Settings";

    pageDescription.textContent =
        "Manage your account and system settings.";

    pageContent.innerHTML = `

        <div class="settings-page">

            <!-- ACCOUNT INFORMATION -->

            <div class="settings-section">

                <div class="settings-section-header">

                    <div>

                        <h2>Account Information</h2>

                        <p>
                            Your Office ERP account details.
                        </p>

                    </div>

                </div>


                <div class="settings-info-grid">

                    <div class="settings-info-item">

                        <span class="settings-label">
                            Employee ID
                        </span>

                        <strong>
                            ${escapeHtml(employeeId)}
                        </strong>

                    </div>


                    <div class="settings-info-item">

                        <span class="settings-label">
                            Name
                        </span>

                        <strong>
                            ${escapeHtml(employeeName)}
                        </strong>

                    </div>


                    <div class="settings-info-item">

                        <span class="settings-label">
                            Role
                        </span>

                        <strong>
                            ${escapeHtml(userRole)}
                        </strong>

                    </div>

                </div>

            </div>


            <!-- SECURITY -->

            <div class="settings-section">

                <div class="settings-section-header">

                    <div>

                        <h2>Security</h2>

                        <p>
                            Manage your account password.
                        </p>

                    </div>

                </div>


                <div class="settings-security-box">

                    <div>

                        <h3>Change Password</h3>

                        <p>
                            Update your account password.
                        </p>

                    </div>


                    <button
                        type="button"
                        class="settings-password-btn"
                        onclick="showChangePassword()"
                    >
                        Change Password
                    </button>

                </div>


                <div id="changePasswordContainer"></div>

            </div>


            <!-- SYSTEM INFORMATION -->

            <div class="settings-section">

                <div class="settings-section-header">

                    <div>

                        <h2>System Information</h2>

                        <p>
                            Office ERP system information.
                        </p>

                    </div>

                </div>


                <div class="settings-info-grid">

                    <div class="settings-info-item">

                        <span class="settings-label">
                            System
                        </span>

                        <strong>
                            Office ERP
                        </strong>

                    </div>


                    <div class="settings-info-item">

                        <span class="settings-label">
                            Version
                        </span>

                        <strong>
                            1.0.0
                        </strong>

                    </div>


                    <div class="settings-info-item">

                        <span class="settings-label">
                            Backend
                        </span>

                        <strong>
                            Connected
                        </strong>

                    </div>

                </div>

            </div>

        </div>

    `;
}


// ============================================================
// CHANGE PASSWORD FORM
// ============================================================

function showChangePassword() {

    const container =
        document.getElementById(
            "changePasswordContainer"
        );

    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="change-password-box">

            <div class="change-password-group">

                <label>
                    Current Password
                </label>

                <input
                    type="password"
                    id="currentPassword"
                    placeholder="Enter current password"
                    autocomplete="current-password"
                >

            </div>


            <div class="change-password-group">

                <label>
                    New Password
                </label>

                <input
                    type="password"
                    id="newPassword"
                    placeholder="Enter new password"
                    autocomplete="new-password"
                >

            </div>


            <div class="change-password-group">

                <label>
                    Confirm New Password
                </label>

                <input
                    type="password"
                    id="confirmPassword"
                    placeholder="Confirm new password"
                    autocomplete="new-password"
                >

            </div>


            <div class="change-password-buttons">

                <button
                    type="button"
                    class="settings-save-btn"
                    onclick="changePassword()"
                >
                    Save Password
                </button>


                <button
                    type="button"
                    class="settings-cancel-btn"
                    onclick="closeChangePassword()"
                >
                    Cancel
                </button>

            </div>

        </div>

    `;
}


// ============================================================
// CHANGE PASSWORD
// ============================================================

async function changePassword() {

    const currentPassword =
        document
            .getElementById("currentPassword")
            ?.value.trim();


    const newPassword =
        document
            .getElementById("newPassword")
            ?.value.trim();


    const confirmPassword =
        document
            .getElementById("confirmPassword")
            ?.value.trim();


    // CHECK CURRENT PASSWORD

    if (!currentPassword) {

        alert(
            "Please enter your current password."
        );

        return;
    }


    // CHECK NEW PASSWORD

    if (!newPassword) {

        alert(
            "Please enter your new password."
        );

        return;
    }


    // CHECK CONFIRM PASSWORD

    if (!confirmPassword) {

        alert(
            "Please confirm your new password."
        );

        return;
    }


    // PASSWORD LENGTH

    if (newPassword.length < 6) {

        alert(
            "New password must be at least 6 characters."
        );

        return;
    }


    // PASSWORD MATCH

    if (newPassword !== confirmPassword) {

        alert(
            "New password and confirm password do not match."
        );

        return;
    }


    // SAME PASSWORD

    if (currentPassword === newPassword) {

        alert(
            "New password must be different from current password."
        );

        return;
    }


    try {

        const saveButton =
            document.querySelector(
                ".settings-save-btn"
            );


        if (saveButton) {

            saveButton.disabled = true;

            saveButton.textContent =
                "Saving...";

        }


        const result =
            await apiRequest(
                `${API_URL}/auth/change-password`,
                {
                    method: "PUT",

                    body: JSON.stringify({

                        currentPassword:
                            currentPassword,

                        newPassword:
                            newPassword

                    })
                }
            );


        alert(
            result.message ||
            "Password changed successfully."
        );


        closeChangePassword();


    } catch (error) {

        console.error(
            "CHANGE PASSWORD ERROR:",
            error
        );


        alert(
            error.message ||
            "Unable to change password."
        );


    } finally {

        const saveButton =
            document.querySelector(
                ".settings-save-btn"
            );


        if (saveButton) {

            saveButton.disabled = false;

            saveButton.textContent =
                "Save Password";

        }

    }
}


// ============================================================
// CLOSE CHANGE PASSWORD
// ============================================================

function closeChangePassword() {

    const container =
        document.getElementById(
            "changePasswordContainer"
        );


    if (container) {

        container.innerHTML = "";

    }

}

// ============================================================
// CALENDAR
// ============================================================


function showCalendar() {

    pageTitle.textContent = "Calendar";

    pageDescription.textContent =
        "View and manage your office schedule.";

    pageContent.innerHTML = `

        <div class="calendar-page">

            <div class="calendar-header">

                <div class="calendar-navigation">

                    <button
                        class="calendar-nav-btn"
                        onclick="previousMonth()"
                    >
                        ‹
                    </button>

                    <h2 id="calendarMonth"></h2>

                    <button
                        class="calendar-nav-btn"
                        onclick="nextMonth()"
                    >
                        ›
                    </button>

                </div>

                <button
                    class="calendar-today-btn"
                    onclick="goToToday()"
                >
                    Today
                </button>

            </div>


            <div class="calendar-container">

                <div class="calendar-weekdays">

                    <div>Sun</div>
                    <div>Mon</div>
                    <div>Tue</div>
                    <div>Wed</div>
                    <div>Thu</div>
                    <div>Fri</div>
                    <div>Sat</div>

                </div>

                <div
                    id="calendarDays"
                    class="calendar-days"
                ></div>

            </div>


            <div class="calendar-events">

                <div class="calendar-events-header">

                    <div>

                        <h3>Upcoming Events</h3>

                        <p>
                            Your upcoming office activities
                        </p>

                    </div>

                    <button
                        class="add-event-btn"
                        onclick="addCalendarEvent()"
                    >
                        + Add Event
                    </button>

                </div>


                <div class="event-list">

                    <div class="calendar-event">

                        <div class="event-date">
                            <strong>10</strong>
                            <span>OCT</span>
                        </div>

                        <div class="event-info">

                            <h4>
                                Team Meeting
                            </h4>

                            <p>
                                10:00 AM · Meeting Room
                            </p>

                        </div>

                    </div>


                    <div class="calendar-event">

                        <div class="event-date">
                            <strong>15</strong>
                            <span>OCT</span>
                        </div>

                        <div class="event-info">

                            <h4>
                                Project Review
                            </h4>

                            <p>
                                02:00 PM · Conference Room
                            </p>

                        </div>

                    </div>


                    <div class="calendar-event">

                        <div class="event-date">
                            <strong>25</strong>
                            <span>OCT</span>
                        </div>

                        <div class="event-info">

                            <h4>
                                Monthly Meeting
                            </h4>

                            <p>
                                11:00 AM · Main Office
                            </p>

                        </div>

                    </div>

                </div>

            </div>

        </div>

    `;

    renderCalendar();
}

// ============================================================
// CLOSE / LOGOUT
// ============================================================

if (logoutBtn) {

    logoutBtn.addEventListener(
        "click",
        function () {

            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );

            if (!confirmLogout) {
                return;
            }

            localStorage.removeItem("isLoggedIn");
            localStorage.removeItem("employeeId");
            localStorage.removeItem("employeeName");
            localStorage.removeItem("role");

            window.location.href =
                "index.html";
        }
    );
}


// ============================================================
// HELPER - FORMAT DATE
// ============================================================

function formatDate(date) {

    if (!date) {
        return "-";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return "-";
    }

    return d.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


// ============================================================
// HELPER - INPUT DATE
// ============================================================

function getInputDate(date) {

    if (!date) {
        return "";
    }

    const d = new Date(date);

    if (isNaN(d.getTime())) {
        return "";
    }

    const year =
        d.getFullYear();

    const month =
        String(d.getMonth() + 1)
            .padStart(2, "0");

    const day =
        String(d.getDate())
            .padStart(2, "0");

    return `${year}-${month}-${day}`;
}


// ============================================================
// HELPER - CURRENT MONTH
// ============================================================

function getCurrentMonth() {

    const date = new Date();

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    return `${year}-${month}`;
}


// ============================================================
// HELPER - SALARY MONTH
// ============================================================

function formatSalaryMonth(month) {

    if (!month) {
        return "-";
    }

    const parts =
        month.split("-");

    if (parts.length !== 2) {
        return escapeHtml(month);
    }

    const date =
        new Date(
            Number(parts[0]),
            Number(parts[1]) - 1,
            1
        );

    return date.toLocaleDateString(
        "en-IN",
        {
            month: "long",
            year: "numeric"
        }
    );
}


// ============================================================
// HELPER - CURRENCY
// ============================================================

function formatCurrency(amount) {

    const number =
        Number(amount) || 0;

    return "₹" +
        number.toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            }
        );
}


// ============================================================
// HELPER - ESCAPE HTML
// ============================================================

function escapeHtml(value) {

    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// INITIAL LOAD
// ============================================================

applyRolePermissions();

showDashboard();


// ============================================================
// END OF DASHBOARD.JS
// ============================================================

// ==========================================
// CURRENT DATE + FULL YEAR CALENDAR
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

    const dateBox = document.getElementById("dateBox");
    const currentDateFormatted =
        document.getElementById("currentDateFormatted");

    // Show today's date
    const today = new Date();

    const dateText = today.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });

    if (currentDateFormatted) {
        currentDateFormatted.textContent = dateText;
    }

    // Click date box
    if (dateBox) {
        dateBox.addEventListener("click", () => {
            openPage("calendar");
        });
    }

});

// Attandance box click event to open calendar page
document.getElementById("dateBox").addEventListener("click", function () {
    window.location.href = "calendar.html";
});
