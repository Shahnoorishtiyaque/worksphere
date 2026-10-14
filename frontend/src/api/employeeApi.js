import axios from "axios";

const employeeApi = axios.create({
  baseURL: "http://localhost:8080/api/employees",
  baseURL : "https://passionate-empathy-production-1e37.up.railway.app/api",
  headers: {

    "Content-Type": "application/json",
  },
});

export default employeeApi;