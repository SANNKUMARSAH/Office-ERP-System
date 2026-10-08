const Employee = require("../models/Employee");


// ======================================================
// CREATE EMPLOYEE
// ======================================================

const createEmployee = async (req, res) => {
    try {

        console.log("Received Employee Data:", req.body);

        const {
            employeeId,
            name,
            email,
            password,
            role,
            department,
            designation,
            phone
        } = req.body;


        // REQUIRED FIELDS
        if (
            !employeeId ||
            !name ||
            !email ||
            !password ||
            !department ||
            !designation
        ) {
            return res.status(400).json({
                success: false,
                message: "Please fill all required fields."
            });
        }


        // CHECK EXISTING EMPLOYEE
        const existingEmployee = await Employee.findOne({
            $or: [
                {
                    employeeId: employeeId.toUpperCase()
                },
                {
                    email: email.toLowerCase()
                }
            ]
        });


        if (existingEmployee) {
            return res.status(400).json({
                success: false,
                message: "Employee ID or Email already exists."
            });
        }


        // CREATE EMPLOYEE
        const employee = new Employee({

            employeeId: employeeId.toUpperCase(),

            name: name,

            email: email.toLowerCase(),

            password: password,

            role: role === "Admin"
                ? "Admin"
                : "Employee",

            department: department,

            designation: designation,

            phone: phone

        });


        await employee.save();


        console.log(
            "Employee Saved:",
            employee._id
        );


        // REMOVE PASSWORD FROM RESPONSE
        const employeeResponse =
            employee.toObject();

        delete employeeResponse.password;


        res.status(201).json({

            success: true,

            message: "Employee created successfully.",

            data: employeeResponse

        });


    } catch (error) {

        console.error(
            "CREATE EMPLOYEE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error.",

            error: error.message

        });
    }
};



// ======================================================
// GET ALL EMPLOYEES
// ======================================================

const getEmployees = async (req, res) => {

    try {

        const employees = await Employee.find()
            .select("-password")
            .sort({
                createdAt: -1
            });


        res.status(200).json({

            success: true,

            count: employees.length,

            data: employees

        });


    } catch (error) {

        console.error(
            "GET EMPLOYEES ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error.",

            error: error.message

        });
    }
};




// ======================================================
// GET SINGLE EMPLOYEE
// ======================================================

const getEmployee = async (req, res) => {

    try {

        const employee =
            await Employee.findById(
                req.params.id
            ).select("-password");


        if (!employee) {

            return res.status(404).json({

                success: false,

                message: "Employee not found."

            });
        }


        // ==========================================
        // EMPLOYEE CAN ONLY VIEW OWN PROFILE
        // ADMIN CAN VIEW ANY EMPLOYEE
        // ==========================================

        if (
            req.user.role !== "Admin" &&
            employee.employeeId.toUpperCase() !==
            req.user.employeeId.toUpperCase()
        ) {

            return res.status(403).json({

                success: false,

                message:
                    "You can only access your own profile."

            });

        }


        res.status(200).json({

            success: true,

            data: employee

        });


    } catch (error) {

        console.error(
            "GET EMPLOYEE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error.",

            error: error.message

        });

    }

};



// ======================================================
// UPDATE EMPLOYEE
// ======================================================

const updateEmployee = async (req, res) => {

    try {

        const employee =
            await Employee.findById(
                req.params.id
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message: "Employee not found."

            });
        }


        const {
            name,
            email,
            password,
            role,
            department,
            designation,
            phone,
            status
        } = req.body;


        // UPDATE BASIC INFORMATION

        if (name) {
            employee.name = name;
        }


        if (email) {
            employee.email =
                email.toLowerCase();
        }


        if (password) {
            employee.password =
                password;
        }


        if (department) {
            employee.department =
                department;
        }


        if (designation) {
            employee.designation =
                designation;
        }


        if (phone !== undefined) {
            employee.phone = phone;
        }


        if (status) {

            if (
                status === "Active" ||
                status === "Inactive"
            ) {
                employee.status = status;
            }
        }


        // UPDATE ROLE

        if (role) {

            if (
                role === "Admin" ||
                role === "Employee"
            ) {
                employee.role = role;
            }
        }


        const updatedEmployee =
            await employee.save();


        // REMOVE PASSWORD FROM RESPONSE

        const employeeResponse =
            updatedEmployee.toObject();

        delete employeeResponse.password;


        res.status(200).json({

            success: true,

            message:
                "Employee updated successfully.",

            data: employeeResponse

        });


    } catch (error) {

        console.error(
            "UPDATE EMPLOYEE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error.",

            error: error.message

        });
    }
};



// ======================================================
// DELETE EMPLOYEE
// ======================================================

const deleteEmployee = async (req, res) => {

    try {

        const employee =
            await Employee.findById(
                req.params.id
            );


        if (!employee) {

            return res.status(404).json({

                success: false,

                message: "Employee not found."

            });
        }


        await employee.deleteOne();


        res.status(200).json({

            success: true,

            message:
                "Employee deleted successfully."

        });


    } catch (error) {

        console.error(
            "DELETE EMPLOYEE ERROR:",
            error
        );


        res.status(500).json({

            success: false,

            message: "Server error.",

            error: error.message

        });
    }
};



// ======================================================
// EXPORT
// ======================================================

module.exports = {

    createEmployee,

    getEmployees,

    getEmployee,

    updateEmployee,

    deleteEmployee

};