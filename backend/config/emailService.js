const nodemailer = require("nodemailer");

// Create Mail Transporter
let transporter;
const isMockSMTP = !process.env.SMTP_HOST || process.env.SMTP_HOST.includes("dummy") || process.env.SMTP_HOST.includes("mailtrap");

try {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.SMTP_PORT) || 2525,
    auth: {
      user: process.env.SMTP_USER || "dummy_user",
      pass: process.env.SMTP_PASS || "dummy_pass"
    }
  });
} catch (err) {
  console.warn("Mail transporter initialization failed. Email system running in console-log mock mode.", err.message);
}

/**
 * Send an email with console-log fallback support
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"TechNova HRMS" <noreply@technova.com>',
    to,
    subject,
    html: html || `<p>${text}</p>`,
    text: text || "TechNova HRMS Update"
  };

  if (isMockSMTP) {
    console.log("\n==================================================");
    console.log(`[MOCK EMAIL DISPATCH]`);
    console.log(`TO:      ${mailOptions.to}`);
    console.log(`FROM:    ${mailOptions.from}`);
    console.log(`SUBJECT: ${mailOptions.subject}`);
    console.log("------------------ HTML BODY ------------------");
    console.log(mailOptions.html);
    console.log("==================================================\n");
    return { success: true, messageId: "mock-id-" + Date.now() };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email successfully dispatched: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Direct SMTP email dispatch failed:", error.message);
    // Silent fallback to console log to prevent blocking application flows
    console.log("\n[SMTP FAIL FALLBACK] Outputted Email:", mailOptions);
    return { success: false, error: error.message };
  }
};

/**
 * Trigger welcome onboarding email
 */
const sendWelcomeEmail = async (employee) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #0072ff; text-align: center;">Welcome to TechNova Solutions!</h2>
      <p>Dear <strong>${employee.name}</strong>,</p>
      <p>We are absolutely thrilled to welcome you to the TechNova corporate family. Your employee account is ready for access.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p style="margin: 5px 0;"><strong>Employee ID:</strong> ${employee.employeeId}</p>
        <p style="margin: 5px 0;"><strong>Corporate Portal Login:</strong> <a href="http://localhost:3000/login">Access Here</a></p>
        <p style="margin: 5px 0;"><strong>Initial Account Password:</strong> 1234 (Please reset this upon first login)</p>
      </div>
      <p>If you have any questions, feel free to ask our <strong>AI HR Assistant</strong> or reach out to the HR department.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888888; text-align: center;">TechNova Solutions Pvt Ltd &bull; Phase II, DLF Cyber City, Sector 24, Gurugram</p>
    </div>
  `;
  return await sendEmail({
    to: employee.email,
    subject: "Welcome to TechNova - Your Employee Portal Account is Ready!",
    html
  });
};

/**
 * Trigger password reset request token
 */
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `http://localhost:3000/reset-password/${resetToken}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #ff5e62; text-align: center;">Reset Account Password</h2>
      <p>You are receiving this email because you (or someone else) requested a password reset for your TechNova account.</p>
      <p>Please click the button below to complete the password reset process within 10 minutes:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #ff5e62; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
      </div>
      <p>Or paste this link into your browser address bar:</p>
      <p style="word-break: break-all; color: #0072ff;">${resetUrl}</p>
      <p>If you did not make this request, you can safely ignore this email.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888888; text-align: center;">TechNova Solutions &bull; HR Admin Security</p>
    </div>
  `;
  return await sendEmail({
    to: email,
    subject: "TechNova Account Password Reset Link",
    html
  });
};

/**
 * Trigger leave request update notifications
 */
const sendLeaveStatusEmail = async (employee, leaveRequest) => {
  const color = leaveRequest.status === "Approved" ? "#28a745" : "#dc3545";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: ${color}; text-align: center;">Leave Request ${leaveRequest.status}</h2>
      <p>Hi <strong>${employee.name}</strong>,</p>
      <p>Your leave request has been reviewed and updated in the system.</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Leave Type</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${leaveRequest.leaveType}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Duration</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${new Date(leaveRequest.startDate).toLocaleDateString()} to ${new Date(leaveRequest.endDate).toLocaleDateString()}</td>
        </tr>
        <tr style="background-color: #f8f9fa;">
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Status</th>
          <td style="padding: 10px; border: 1px solid #ddd; color: ${color}; font-weight: bold;">${leaveRequest.status}</td>
        </tr>
        <tr>
          <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Reason</th>
          <td style="padding: 10px; border: 1px solid #ddd;">${leaveRequest.reason || "N/A"}</td>
        </tr>
      </table>
      <p>Please log in to your dashboard to view your remaining leave balance.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888888; text-align: center;">TechNova HR Operations</p>
    </div>
  `;
  return await sendEmail({
    to: employee.email,
    subject: `Leave Request ${leaveRequest.status} Notification`,
    html
  });
};

/**
 * Trigger monthly payslip email statement
 */
const sendPayslipEmail = async (employee, salarySlip) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthName = months[salarySlip.month - 1];
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
      <h2 style="color: #0072ff; text-align: center;">Payslip Statement - ${monthName} ${salarySlip.year}</h2>
      <p>Dear <strong>${employee.name}</strong>,</p>
      <p>Your salary payout for the month of <strong>${monthName} ${salarySlip.year}</strong> has been processed and credited.</p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h4 style="margin-top: 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Salary Breakdown Summary</h4>
        <p style="margin: 5px 0;"><strong>Basic Salary:</strong> ₹${salarySlip.basicSalary.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>House Rent Allowance (HRA):</strong> ₹${salarySlip.hra.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>Dearness Allowance (DA):</strong> ₹${salarySlip.da.toLocaleString()}</p>
        <p style="margin: 5px 0;"><strong>Overtime Hours Pay:</strong> ₹${(salarySlip.overtimePay || 0).toLocaleString()}</p>
        <p style="margin: 5px 0; color: red;"><strong>Tax & PF Deductions:</strong> ₹${(salarySlip.pf + salarySlip.esi + salarySlip.professionalTax + salarySlip.incomeTax).toLocaleString()}</p>
        <h3 style="margin: 10px 0 0 0; color: #28a745;">Net Credited Salary: ₹${salarySlip.netSalary.toLocaleString()}</h3>
      </div>
      <p>You can view and download your full signed PDF payslip directly in the <a href="http://localhost:3000/employee-salary-slip">Employee Portal</a>.</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888888; text-align: center;">TechNova Finance & Payroll Department</p>
    </div>
  `;
  return await sendEmail({
    to: employee.email,
    subject: `TechNova Corporate Payslip - ${monthName} ${salarySlip.year}`,
    html
  });
};

/**
 * Trigger Birthday Wishes
 */
const sendBirthdayWishesEmail = async (employee) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: linear-gradient(135deg, #ffffff 0%, #f6f9fc 100%);">
      <h2 style="color: #ff9966; text-align: center; margin-bottom: 10px;">🎉 Happy Birthday, ${employee.name}! 🎉</h2>
      <p style="text-align: center; font-size: 18px; color: #555555; margin-top: 0;">Warm wishes from the TechNova family!</p>
      <div style="text-align: center; margin: 20px 0;">
        <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" width="80" alt="Birthday Cake" />
      </div>
      <p>Dear <strong>${employee.name}</strong>,</p>
      <p>On behalf of everyone at TechNova, we want to wish you a fantastic birthday. We appreciate your dedicated hard work and positive contributions to our engineering and corporate family.</p>
      <p>May this year bring you great health, happiness, and continued success!</p>
      <hr style="border: 0; border-top: 1px solid #eeeeee; margin: 20px 0;" />
      <p style="font-size: 11px; color: #888888; text-align: center;">TechNova Solutions Pvt Ltd &bull; HR Employee Welfare</p>
    </div>
  `;
  return await sendEmail({
    to: employee.email,
    subject: `Happy Birthday ${employee.name}! 🎂 - From TechNova`,
    html
  });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendLeaveStatusEmail,
  sendPayslipEmail,
  sendBirthdayWishesEmail
};
