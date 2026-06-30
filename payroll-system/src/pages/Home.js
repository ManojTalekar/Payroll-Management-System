import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

function Home() {
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [faqOpen, setFaqOpen] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  const toggleFaq = (idx) => {
    setFaqOpen(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (contactForm.name && contactForm.email && contactForm.message) {
      setFormSubmitted(true);
      setTimeout(() => {
        setFormSubmitted(false);
        setContactForm({ name: "", email: "", message: "" });
      }, 3000);
    }
  };

  return (
    <div style={{ 
      fontFamily: "'Outfit', sans-serif", 
      background: "#0d131a", 
      color: "#f8f9fa",
      minHeight: "100vh",
      overflowX: "hidden"
    }}>
      {/* Decorative Glow Elements */}
      <div className="position-absolute rounded-circle" style={{
        width: "600px", height: "600px", background: "radial-gradient(circle, rgba(0,198,255,0.08) 0%, rgba(0,0,0,0) 70%)",
        top: "-150px", left: "-150px", pointerEvents: "none"
      }}></div>
      <div className="position-absolute rounded-circle" style={{
        width: "600px", height: "600px", background: "radial-gradient(circle, rgba(138,43,226,0.06) 0%, rgba(0,0,0,0) 70%)",
        bottom: "10%", right: "-150px", pointerEvents: "none"
      }}></div>

      {/* STICKY NAVBAR */}
      <nav className="navbar navbar-expand-lg navbar-dark py-3 sticky-top" style={{
        background: "rgba(13, 19, 26, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)"
      }}>
        <div className="container">
          <span className="navbar-brand fw-bold fs-4 d-flex align-items-center">
            <i className="bi bi-cpu-fill text-info me-2"></i>
            PAYROLL <span className="text-info">PRO</span>
          </span>
          <div className="ms-auto d-flex align-items-center gap-3">
            <a href="#features" className="text-light text-decoration-none small d-none d-md-inline opacity-75 hover-opacity-100">Features</a>
            <a href="#pricing" className="text-light text-decoration-none small d-none d-md-inline opacity-75 hover-opacity-100">Pricing</a>
            <a href="#faq" className="text-light text-decoration-none small d-none d-md-inline opacity-75 hover-opacity-100">FAQ</a>
            <Link to="/login" className="btn btn-info fw-bold px-4 py-2" style={{
              borderRadius: "8px",
              background: "linear-gradient(90deg, #00c6ff, #0072ff)",
              border: "none",
              color: "#0d131a"
            }}>
              Access HR Portal
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="container py-5 mt-4">
        <div className="row align-items-center g-5">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="col-lg-6"
          >
            <span className="badge bg-info-subtle text-info px-3 py-2 mb-3 fw-bold text-uppercase border border-info-subtle">
              ✨ Enterprise-Grade HRMS & Payroll
            </span>
            <h1 className="fw-extrabold display-4 mb-4" style={{ letterSpacing: "-1.5px", lineHeight: "1.15" }}>
              Workforce Operations, <br/>
              <span style={{
                background: "linear-gradient(90deg, #00c6ff 0%, #0072ff 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}>
                Reimagined with Google Gemini AI
              </span>
            </h1>
            <p className="text-muted fs-5 mb-4" style={{ lineHeight: "1.7" }}>
              Empower your corporate ecosystem with Payroll Pro. Streamline attendance logs, automate complex tax payouts, track leave workflows, verify official credentials, and run AI predictive insights.
            </p>
            <div className="d-flex gap-3">
              <Link to="/login" className="btn btn-primary btn-lg fw-bold px-4 py-3 shadow-lg" style={{
                background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px"
              }}>
                Get Started Now <i className="bi bi-arrow-right fs-5 ms-1"></i>
              </Link>
              <a href="#features" className="btn btn-outline-light btn-lg fw-semibold px-4 py-3" style={{ 
                borderRadius: "10px", 
                fontSize: "16px",
                border: "1px solid rgba(255,255,255,0.15)"
              }}>
                Explore Modules
              </a>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="col-lg-6 text-center"
          >
            <div className="position-relative">
              {/* Decorative Glow */}
              <div className="position-absolute bg-info rounded-circle blur-3xl opacity-10" style={{
                width: "400px", height: "400px", top: "-50px", right: "-50px", filter: "blur(100px)"
              }}></div>
              <img
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop"
                alt="Payroll Pro Dashboard illustration"
                className="img-fluid rounded-4 shadow-2xl border"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.02)",
                  transform: "perspective(1000px) rotateY(-8deg) rotateX(4deg)",
                  transition: "all 0.5s ease"
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* METRICS SECTION */}
      <section className="container py-5 border-top border-secondary border-opacity-10">
        <div className="row g-4 text-center">
          <div className="col-md-3 col-6">
            <h2 className="fw-bold text-info m-0">100+</h2>
            <small className="text-muted uppercase tracking-wider">Demo Profiles Configured</small>
          </div>
          <div className="col-md-3 col-6">
            <h2 className="fw-bold text-info m-0">99.9%</h2>
            <small className="text-muted uppercase tracking-wider">Payroll Precision SLA</small>
          </div>
          <div className="col-md-3 col-6">
            <h2 className="fw-bold text-info m-0">5+</h2>
            <small className="text-muted uppercase tracking-wider">Leave Workflow Types</small>
          </div>
          <div className="col-md-3 col-6">
            <h2 className="fw-bold text-info m-0">1 Click</h2>
            <small className="text-muted uppercase tracking-wider">Payslip PDF Generation</small>
          </div>
        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="bg-black bg-opacity-30 py-5 border-top border-secondary border-opacity-10">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold display-6">One Core Engine, Universal Admin Control</h2>
            <p className="text-muted max-w-xl mx-auto">A fully integrated cloud system supporting modern HR and payroll rules.</p>
          </div>

          <div className="row g-4">
            {/* Feature 1 */}
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0" style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "15px",
                color: "#fff"
              }}>
                <div className="icon mb-3 text-info fs-3"><i className="bi bi-clock-fill"></i></div>
                <h5 className="fw-bold">QR & Location Attendance</h5>
                <p className="text-muted small">Clock-in from the portal with geolocation audits. Automated calculations for late marks, half-days, and overtime thresholds.</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0" style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "15px",
                color: "#fff"
              }}>
                <div className="icon mb-3 text-info fs-3"><i className="bi bi-currency-rupee"></i></div>
                <h5 className="fw-bold">Tax & Statutory Payroll</h5>
                <p className="text-muted small">Auto ledger configuration including PF (12%), ESI (1%), HRA allocations, and dynamic tax brackets with PDF downloading.</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="col-md-4">
              <div className="card h-100 p-4 border-0" style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.05)",
                borderRadius: "15px",
                color: "#fff"
              }}>
                <div className="icon mb-3 text-info fs-3"><i className="bi bi-cpu-fill"></i></div>
                <h5 className="fw-bold">Gemini AI Assistant</h5>
                <p className="text-muted small">Floating portal chat button connected to Gemini API providing helpful breakdowns on payslips, policies, and leaves.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold display-6">Simple, Scalable Licensing</h2>
          <p className="text-muted">Choose the scale that matches your workspace requirements.</p>
        </div>

        <div className="row g-4 justify-content-center">
          <div className="col-md-4">
            <div className="card text-center p-4 border-0 h-100" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "16px",
              color: "#fff"
            }}>
              <h5 className="fw-bold text-uppercase small opacity-75">Startup Package</h5>
              <h2 className="fw-bold my-3">₹4,999<span className="fs-6 text-muted">/mo</span></h2>
              <p className="small text-muted mb-4">Up to 25 staff members. Core payroll models included.</p>
              <Link to="/login" className="btn btn-outline-info w-100 py-2.5 mt-auto">Get Started</Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-center p-4 h-100" style={{
              background: "linear-gradient(135deg, rgba(0, 198, 255, 0.1) 0%, rgba(0, 114, 255, 0.1) 100%)",
              border: "1px solid rgba(0, 198, 255, 0.3)",
              borderRadius: "16px",
              color: "#fff"
            }}>
              <span className="badge bg-info text-dark align-self-center px-3 py-1.5 mb-2 fw-bold text-uppercase">Most Popular</span>
              <h5 className="fw-bold text-uppercase small">Enterprise Scale</h5>
              <h2 className="fw-bold my-3">₹14,999<span className="fs-6 text-muted">/mo</span></h2>
              <p className="small text-light opacity-75 mb-4">Uncapped users, full document storage and Gemini AI Assistant enabled.</p>
              <Link to="/login" className="btn btn-info w-100 py-2.5 mt-auto" style={{
                background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                border: "none",
                color: "#0d131a",
                fontWeight: "bold"
              }}>Deploy Solution</Link>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card text-center p-4 border-0 h-100" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "16px",
              color: "#fff"
            }}>
              <h5 className="fw-bold text-uppercase small opacity-75">Custom Tier</h5>
              <h2 className="fw-bold my-3">Contact</h2>
              <p className="small text-muted mb-4">Bespoke SLA, dedicated database, local on-prem configurations.</p>
              <a href="#contact" className="btn btn-outline-light w-100 py-2.5 mt-auto">Contact Sales</a>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-black bg-opacity-20 py-5 border-top border-secondary border-opacity-10">
        <div className="container py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">Trusted by Industry HR Managers</h2>
          </div>
          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-4 rounded shadow-sm bg-white bg-opacity-5 border border-white border-opacity-5">
                <p className="fst-italic text-muted">"Migrating our operations to Payroll Pro reduced manual payroll validation times from days to a few seconds. The dynamic tax deduction calculations work flawlessly."</p>
                <div className="d-flex align-items-center mt-3">
                  <i className="bi bi-person-circle fs-3 text-info me-2"></i>
                  <div>
                    <h6 className="m-0 fw-bold">Ananya Deshpande</h6>
                    <small className="text-muted">HR Lead, Apex Digital</small>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-4 rounded shadow-sm bg-white bg-opacity-5 border border-white border-opacity-5">
                <p className="fst-italic text-muted">"Our employees love using the floating Gemini AI chatbot to understand their payslips and request leaves. The cross-device responsiveness is highly optimized."</p>
                <div className="d-flex align-items-center mt-3">
                  <i className="bi bi-person-circle fs-3 text-info me-2"></i>
                  <div>
                    <h6 className="m-0 fw-bold">Rohan Sen</h6>
                    <small className="text-muted">Operations Director, Inova Corp</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="container py-5">
        <div className="text-center mb-5">
          <h2 className="fw-bold display-6">Frequently Asked Questions</h2>
        </div>

        <div className="row justify-content-center">
          <div className="col-lg-8">
            {[
              { q: "How does the location check-in system work?", a: "When an employee clocks in, the browser geolocation retrieves coordinates. The system validates whether these coordinates fall within the DLF Cyber City office radius, marking attendance accordingly." },
              { q: "Can I download salary slips as PDFs?", a: "Yes, both Admins and Employees can download payslips locally as formatted PDFs. The slip is generated with a dynamic QR code for ledger verification." },
              { q: "How does the Nodemailer notification service work?", a: "Whenever an admin pays a salary or approves a leave request, the backend automatically dispatches an HTML email notification directly to the employee's corporate inbox." },
              { q: "Is the database secure?", a: "All password values are hashed via bcryptjs, and transactions are authenticated using JSON Web Tokens (JWT). The API uses secure headers and rate-limiting rules." }
            ].map((faq, idx) => (
              <div key={idx} className="border-bottom border-secondary border-opacity-10 py-3">
                <div className="d-flex justify-content-between align-items-center cursor-pointer" 
                  onClick={() => toggleFaq(idx)}
                  style={{ cursor: "pointer" }}>
                  <h6 className="fw-semibold m-0">{faq.q}</h6>
                  <i className={`bi ${faqOpen[idx] ? "bi-chevron-up" : "bi-chevron-down"} text-info`}></i>
                </div>
                {faqOpen[idx] && (
                  <p className="text-muted small mt-2 leading-relaxed">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="container py-5 border-top border-secondary border-opacity-10">
        <div className="row align-items-center g-5">
          <div className="col-lg-5">
            <h2 className="fw-bold mb-3">Initiate Integration</h2>
            <p className="text-muted">Ready to upgrade your enterprise operations? Fill out the inquiry sheet, and our integration team will set up your database.</p>
            <div className="mt-4">
              <p className="small mb-2"><i className="bi bi-geo-alt-fill text-info me-2"></i> Thane, Maharashtra, India</p>
              <p className="small mb-2"><i className="bi bi-telephone-fill text-info me-2"></i> +91 XXXXXXXXXX</p>
              <p className="small mb-2"><i className="bi bi-envelope-fill text-info me-2"></i> manojtalekar29@gmail.com</p>
              <p className="small"><i className="bi bi-person-fill text-info me-2"></i> Developer: Manoj Talekar</p>
            </div>
          </div>

          <div className="col-lg-7">
            <div className="p-4 rounded" style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)"
            }}>
              {formSubmitted ? (
                <div className="alert alert-success text-center">
                  <i className="bi bi-check-circle-fill fs-3 d-block text-success mb-2"></i>
                  Thank you! Your ticket was successfully dispatched. Our staff will respond shortly.
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Full Name</label>
                      <input type="text" className="form-control bg-transparent text-white border-secondary"
                        value={contactForm.name} onChange={e => setContactForm(prev => ({ ...prev, name: e.target.value }))} required />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small text-muted">Work Email</label>
                      <input type="email" className="form-control bg-transparent text-white border-secondary"
                        value={contactForm.email} onChange={e => setContactForm(prev => ({ ...prev, email: e.target.value }))} required />
                    </div>
                    <div className="col-12">
                      <label className="form-label small text-muted">Details / Query message</label>
                      <textarea className="form-control bg-transparent text-white border-secondary" rows="4"
                        value={contactForm.message} onChange={e => setContactForm(prev => ({ ...prev, message: e.target.value }))} required></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-info px-4 py-2 fw-bold text-dark w-100" style={{
                        background: "linear-gradient(90deg, #00c6ff, #0072ff)",
                        border: "none"
                      }}>
                        Dispatch Ticket
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-4 border-top border-secondary border-opacity-10 text-center text-muted small bg-black bg-opacity-20">
        <p className="m-0">&copy; 2026 Manoj Talekar. All Rights Reserved.</p>
        <p className="m-0 mt-1">Email: manojtalekar29@gmail.com | Location: Thane, Maharashtra, India</p>
        <p className="m-0 mt-1">Designed & Developed by Manoj Talekar</p>
      </footer>
    </div>
  );
}

export default Home;
