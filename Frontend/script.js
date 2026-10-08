// ======================================================
// OFFICE ERP - LOGIN SCRIPT
// ======================================================


// ======================================================
// LOGIN FORM
// ======================================================

const loginForm = document.getElementById("loginForm");


if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        // Page reload hone se rokna
        event.preventDefault();


        // ==================================================
        // GET INPUT VALUES
        // ==================================================

        const employeeId =
            document.getElementById("employeeId").value.trim();

        const password =
            document.getElementById("password").value;


        // ==================================================
        // VALIDATION
        // ==================================================

        if (!employeeId || !password) {

            alert(
                "Please enter Employee ID and Password."
            );

            return;
        }


        // ==================================================
        // LOGIN REQUEST
        // ==================================================

        try {

            const response = await fetch(
                "http://localhost:5000/api/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        employeeId: employeeId,

                        password: password

                    })
                }
            );


            // Backend response
            const data = await response.json();


            // ==================================================
            // LOGIN FAILED
            // ==================================================

            if (!data.success) {

                alert(
                    data.message ||
                    "Invalid Employee ID or Password."
                );

                return;
            }


            // ==================================================
            // LOGIN SUCCESS
            // ==================================================

            const user = data.data;


            // ==================================================
            // SAVE USER INFORMATION
            // ==================================================

            localStorage.setItem(
                "isLoggedIn",
                "true"
            );


            localStorage.setItem(
                "employeeId",
                user.employeeId
            );


            localStorage.setItem(
                "employeeName",
                user.name
            );


            localStorage.setItem(
                "role",
                user.role
            );


            localStorage.setItem(
                "employeeEmail",
                user.email || ""
            );


            localStorage.setItem(
                "department",
                user.department || ""
            );


            localStorage.setItem(
                "designation",
                user.designation || ""
            );


            localStorage.setItem(
                "employeeDbId",
                user.id || ""
            );


            // ==================================================
            // GO TO DASHBOARD
            // ==================================================

            window.location.href =
                "dashboard.html";


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            alert(
                "Backend connection failed. Please start the backend."
            );

        }

    });

}


// ======================================================
// FORGOT PASSWORD
// ======================================================

const forgotPassword =
    document.getElementById("forgotPassword");


if (forgotPassword) {

    forgotPassword.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            alert(
                "Please contact the Admin to reset your password."
            );

        }
    );

}