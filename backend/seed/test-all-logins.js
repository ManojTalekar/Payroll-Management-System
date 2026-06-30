const http = require("http");

const makeRequest = (username, password) => {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ username, password });
    const options = {
      hostname: "localhost",
      port: process.env.PORT || 63389,
      path: "/api/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => { responseData += chunk; });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            body: parsed
          });
        } catch (e) {
          reject(new Error(`Failed to parse JSON: ${responseData}`));
        }
      });
    });

    req.on("error", (error) => { reject(error); });
    req.write(data);
    req.end();
  });
};

const run = async () => {
  console.log("Testing various logins...");
  
  // Test 1: Admin
  try {
    const res = await makeRequest("admin@technova.com", "1234");
    console.log("Admin (admin@technova.com):", res.statusCode, res.body.success, res.body.user?.role || "no role");
  } catch (err) {
    console.error("Admin login test failed:", err);
  }

  // Test 2: HR
  try {
    const res = await makeRequest("hr@technova.com", "1234");
    console.log("HR (hr@technova.com):", res.statusCode, res.body.success, res.body.user?.role || "no role");
  } catch (err) {
    console.error("HR login test failed:", err);
  }

  // Test 3: Employee
  try {
    const res = await makeRequest("employee@technova.com", "1234");
    console.log("Employee (employee@technova.com):", res.statusCode, res.body.success, res.body.user?.role || "no role");
  } catch (err) {
    console.error("Employee login test failed:", err);
  }
};

run();
