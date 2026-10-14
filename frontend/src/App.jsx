import { useEffect, useState } from "react";
import employeeApi from "./api/employeeApi";
import "./App.css";

function App() {
  const [employees, setEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
const [sortBy, setSortBy] = useState("default");


  // Dashboard statistics
  const totalEmployees = employees.length;

  const totalDepartments = new Set(
    employees
      .map((employee) => employee.department?.trim())
      .filter(Boolean)
  ).size;

  const totalPayroll = employees.reduce(
    (total, employee) => total + (Number(employee.salary) || 0),
    0
  );
// Get unique department names
const departments = [
  ...new Set(
    employees
      .map((employee) => employee.department?.trim())
      .filter(Boolean)
  ),
];

// Filter employees by search term and department
const filteredEmployees = employees.filter((employee) => {
  const search = searchTerm.trim().toLowerCase();

  const matchesSearch =
    employee.name?.toLowerCase().includes(search) ||
    employee.email?.toLowerCase().includes(search);

  const matchesDepartment =
    selectedDepartment === "All" ||
    employee.department?.trim() === selectedDepartment;

  return matchesSearch && matchesDepartment;
});

const sortedEmployees = [...filteredEmployees].sort((a, b) => {
  switch (sortBy) {
    case "name-asc":
      return (a.name || "").localeCompare(b.name || "");

    case "name-desc":
      return (b.name || "").localeCompare(a.name || "");

    case "salary-asc":
      return Number(a.salary) - Number(b.salary);

    case "salary-desc":
      return Number(b.salary) - Number(a.salary);

    default:
      return 0;
  }
});

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    designation: "",
    salary: "",
  });

  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // GET: Fetch employees from Spring Boot
  async function fetchEmployees() {
    try {
      setError("");

     const response = await employeeApi.get("");
      setEmployees(response.data);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError("Unable to load employees. Check whether the backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Handle input changes
  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // POST: Create employee
  // PUT: Update employee
  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setError("");

      const employee = {
        ...formData,
        salary: Number(formData.salary),
      };

      if (
        !employee.name.trim() ||
        !employee.email.trim() ||
        !employee.department.trim() ||
        !employee.designation.trim() ||
        formData.salary === ""
      ) {
        setError("Please fill in all fields.");
        return;
      }

      if (editingId !== null) {
        await employeeApi.put(`/${editingId}`, employee);
      } else {
        await employeeApi.post("", employee);
      }

      setFormData({
        name: "",
        email: "",
        department: "",
        designation: "",
        salary: "",
      });

      setEditingId(null);

      await fetchEmployees();
    } catch (err) {
      console.error("Error saving employee:", err);
      setError(
        err.response?.data?.message ||
          "Unable to save employee. Please check the backend."
      );
    }
  }

  // Load employee details into the form
  function handleEdit(employee) {
    setFormData({
      name: employee.name ?? "",
      email: employee.email ?? "",
      department: employee.department ?? "",
      designation: employee.designation ?? "",
      salary: employee.salary ?? "",
    });

    setEditingId(employee.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // DELETE: Remove employee
  async function handleDelete(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await employeeApi.delete(`/${id}`);

      await fetchEmployees();
    } catch (err) {
      console.error("Error deleting employee:", err);
      setError("Unable to delete employee.");
    }
  }

  function handleCancelEdit() {
    setEditingId(null);

    setFormData({
      name: "",
      email: "",
      department: "",
      designation: "",
      salary: "",
    });
  }

  return (
    <div className="app">
      <header className="header">
        <h1>Worksphere</h1>
        <p>Employee Management System</p>
      </header>

      <main className="container">

          {/* Dashboard Statistics */}
          <section className="dashboard">
            <div className="stat-card">
              <p>Total Employees</p>
              <h2>{totalEmployees}</h2>
            </div>

            <div className="stat-card">
              <p>Total Departments</p>
              <h2>{totalDepartments}</h2>
            </div>

            <div className="stat-card">
              <p>Total Payroll</p>
              <h2>
                {totalPayroll.toLocaleString("en-IN", {
                  style: "currency",
                  currency: "INR",
                  maximumFractionDigits: 0,
                })}
              </h2>
            </div>
          </section>

        <section className="card">
          <h2>
            {editingId !== null ? "Update Employee" : "Add Employee"}
          </h2>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Employee name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Employee email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="department"
              placeholder="Department"
              value={formData.department}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="designation"
              placeholder="Designation"
              value={formData.designation}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="salary"
              placeholder="Salary"
              value={formData.salary}
              onChange={handleChange}
              min="0"
              required
            />

            <button type="submit">
              {editingId !== null ? "Update Employee" : "Add Employee"}
            </button>

            {editingId !== null && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </form>
        </section>

       <section className="card">
         <h2>Employee List</h2>

         <p className="employee-count">
           Total Employees: {totalEmployees}
         </p>

         {/* Search and Department Filter */}
         <div className="employee-filters">
           <input
             type="text"
             placeholder="Search by name or email..."
             value={searchTerm}
             onChange={(event) => setSearchTerm(event.target.value)}
           />
           <select
             value={sortBy}
             onChange={(event) => setSortBy(event.target.value)}
           >
             <option value="default">Default Order</option>
             <option value="name-asc">Name: A–Z</option>
             <option value="name-desc">Name: Z–A</option>
             <option value="salary-asc">Salary: Low to High</option>
             <option value="salary-desc">Salary: High to Low</option>
           </select>

           <select
             value={selectedDepartment}
             onChange={(event) => setSelectedDepartment(event.target.value)}
           >
             <option value="All">All Departments</option>

             {departments.map((department) => (
               <option key={department} value={department}>
                 {department}
               </option>
             ))}
           </select>

           <button
             type="button"
             className="clear-button"
             onClick={() => {
               setSearchTerm("");
               setSelectedDepartment("All");
               setSortBy("default");
             }}
           >
             Clear Filters
           </button>
         </div>

         <p className="employee-count">
           Showing {filteredEmployees.length} of {totalEmployees} employees
         </p>

         {error && <p className="error-message">{error}</p>}

         {loading ? (
           <p>Loading employees...</p>
         ) : employees.length === 0 ? (
           <p className="empty-message">No employees have been added yet.</p>
         ) : filteredEmployees.length === 0 ? (
           <p className="empty-message">
             No employees match your search or department filter.
           </p>
         ) : (
           <div className="table-wrapper">
             <table>
               <thead>
                 <tr>
                   <th>Name</th>
                   <th>Email</th>
                   <th>Department</th>
                   <th>Designation</th>
                   <th>Salary</th>
                   <th>Actions</th>
                 </tr>
               </thead>

               <tbody>
                 {sortedEmployees.map((employee) => (
                   <tr key={employee.id}>
                     <td>{employee.name}</td>
                     <td>{employee.email}</td>
                     <td>{employee.department}</td>
                     <td>{employee.designation}</td>
                     <td>
                       {Number(employee.salary).toLocaleString("en-IN", {
                         style: "currency",
                         currency: "INR",
                         maximumFractionDigits: 0,
                       })}
                     </td>
                     <td>
                       <div className="actions">
                         <button
                           type="button"
                           onClick={() => handleEdit(employee)}
                         >
                           Edit
                         </button>

                         <button
                           type="button"
                           className="delete-button"
                           onClick={() => handleDelete(employee.id)}
                         >
                           Delete
                         </button>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}
              </section>
            </main>
          </div>
        );
      }

      export default App;