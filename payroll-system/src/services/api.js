import axios from "axios";

// Create Axios Client targeting our Express server API
const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:63389/api"
});

// Decorate outgoing requests with Authorization Bearer JWT
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses to handle auth errors, timeouts, network failures, etc.
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Handle Network Errors or Timeouts
    if (!error.response) {
      console.error("Network or Timeout error occurred:", error.message);
      return Promise.reject(new Error("Network connection lost or request timed out. Please check if the server is active."));
    }

    const { status } = error.response;

    // Handle 401 Unauthorized (attempt token rotation)
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token stored");
        }

        // Post to refresh endpoint
        const baseURL = process.env.REACT_APP_API_URL || "http://localhost:63389/api";
        const res = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        if (res.data.success) {
          const { accessToken, refreshToken: newRefresh } = res.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefresh);
          
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return API(originalRequest);
        }
      } catch (refreshErr) {
        console.error("Session expired, logging out...", refreshErr);
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    // Handle 403 Forbidden
    if (status === 403) {
      console.error("Access Forbidden (403): You do not have permissions for this action.");
    }

    // Handle 404 Not Found
    if (status === 404) {
      console.warn("API Endpoint not found (404).");
    }

    // Handle 500 Server Error
    if (status === 500) {
      console.error("Internal Server Error (500). Please check backend logs.");
    }

    return Promise.reject(error);
  }
);

// API endpoint abstraction bindings
export const authAPI = {
  login: (username, password) => API.post("/auth/login", { username, password }),
  logout: () => API.post("/auth/logout"),
  forgotPassword: (email) => API.post("/auth/forgot-password", { email }),
  resetPassword: (token, password) => API.post(`/auth/reset-password/${token}`, { password }),
  changePassword: (oldPassword, newPassword) => API.put("/auth/change-password", { oldPassword, newPassword }),
  getActivityLogs: () => API.get("/auth/activity-logs")
};

export const employeeAPI = {
  getEmployees: (search = "", department = "") => 
    API.get(`/employees?search=${search}&department=${department}`),
  getEmployeeById: (id) => API.get(`/employees/${id}`),
  createEmployee: (formData) => API.post("/employees", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  updateEmployee: (id, formData) => API.put(`/employees/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  deleteEmployee: (id) => API.delete(`/employees/${id}`),
  getProfile: () => API.get("/employees/me/profile")
};

export const attendanceAPI = {
  getAttendance: (employeeId = "", month = "", year = "") => 
    API.get(`/attendance?employeeId=${employeeId}&month=${month}&year=${year}`),
  checkIn: () => API.post("/attendance/check-in"),
  checkOut: () => API.post("/attendance/check-out")
};

export const leaveAPI = {
  getLeaves: (employeeId = "") => API.get(`/leaves?employeeId=${employeeId}`),
  applyLeave: (leaveData) => API.post("/leaves", leaveData),
  updateLeaveStatus: (id, status) => API.put(`/leaves/${id}`, { status }),
  getLeaveBalance: (employeeId = "") => API.get(`/leaves/me/balance?employeeId=${employeeId}`)
};

export const salaryAPI = {
  getSalaries: (employeeId = "", month = "", year = "") => 
    API.get(`/salaries?employeeId=${employeeId}&month=${month}&year=${year}`),
  generatePayroll: (month, year) => API.post("/salaries/generate", { month, year }),
  updateSalaryStatus: (id, status) => API.put(`/salaries/${id}/status`, { status })
};

export const hrAPI = {
  // Departments
  getDepartments: () => API.get("/hr/departments"),
  createDepartment: (deptData) => API.post("/hr/departments", deptData),
  deleteDepartment: (id) => API.delete(`/hr/departments/${id}`),
  
  // Designations
  getDesignations: () => API.get("/hr/designations"),
  createDesignation: (desData) => API.post("/hr/designations", desData),
  deleteDesignation: (id) => API.delete(`/hr/designations/${id}`),

  // Shifts
  getShifts: () => API.get("/hr/shifts"),
  createShift: (shiftData) => API.post("/hr/shifts", shiftData),
  deleteShift: (id) => API.delete(`/hr/shifts/${id}`),

  // Holidays
  getHolidays: () => API.get("/hr/holidays"),
  createHoliday: (holidayData) => API.post("/hr/holidays", holidayData),
  deleteHoliday: (id) => API.delete(`/hr/holidays/${id}`),

  // Company Details
  getCompany: () => API.get("/hr/company"),
  updateCompany: (companyData) => API.put("/hr/company", companyData),

  // Documents
  getDocuments: (employeeId = "") => API.get(`/hr/documents?employeeId=${employeeId}`),
  uploadDocument: (formData) => API.post("/hr/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" }
  }),
  deleteDocument: (id) => API.delete(`/hr/documents/${id}`),

  // Announcements
  getAnnouncements: () => API.get("/hr/announcements"),
  createAnnouncement: (annData) => API.post("/hr/announcements", annData),
  deleteAnnouncement: (id) => API.delete(`/hr/announcements/${id}`)
};

export const aiAPI = {
  chat: (message) => API.post("/ai/chat", { message }),
  getAnalytics: () => API.get("/ai/analytics")
};

export const performanceAPI = {
  getReviews: (employeeId = "") => API.get(`/performance?employeeId=${employeeId}`),
  upsertReview: (reviewData) => API.post("/performance", reviewData)
};

export const recruitmentAPI = {
  getJobs: () => API.get("/recruitment/jobs"),
  createJob: (jobData) => API.post("/recruitment/jobs", jobData),
  getCandidates: () => API.get("/recruitment/candidates"),
  createCandidate: (candidateData) => API.post("/recruitment/candidates", candidateData),
  updateCandidateStage: (id, stage) => API.put(`/recruitment/candidates/${id}/stage`, { stage }),
  getInterviews: () => API.get("/recruitment/interviews"),
  createInterview: (interviewData) => API.post("/recruitment/interviews", interviewData)
};

export default API;
