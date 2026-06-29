const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Interview = require("../models/Interview");

// --- JOB POSTINGS ---
const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: jobs });
  } catch (err) {
    next(err);
  }
};

const createJob = async (req, res, next) => {
  try {
    const { title, department, openings, status } = req.body;
    if (!title || !department || !openings) {
      return res.status(400).json({ success: false, message: "Please provide title, department and openings" });
    }

    const count = await Job.countDocuments();
    const jobId = `JOB${String(count + 1).padStart(3, "0")}`;

    const job = await Job.create({
      jobId,
      title,
      department,
      openings,
      status: status || "Active"
    });

    res.status(201).json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
};

// --- CANDIDATE APPLICATIONS ---
const getCandidates = async (req, res, next) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: candidates });
  } catch (err) {
    next(err);
  }
};

const createCandidate = async (req, res, next) => {
  try {
    const { name, email, jobTitle, stage } = req.body;
    if (!name || !email || !jobTitle) {
      return res.status(400).json({ success: false, message: "Please provide candidate name, email and jobTitle" });
    }

    const count = await Candidate.countDocuments();
    const candidateId = `CAN${String(count + 1).padStart(3, "0")}`;

    const candidate = await Candidate.create({
      candidateId,
      name,
      email,
      jobTitle,
      stage: stage || "Applied"
    });

    res.status(201).json({ success: true, data: candidate });
  } catch (err) {
    next(err);
  }
};

const updateCandidateStage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { stage } = req.body;

    if (!stage) {
      return res.status(400).json({ success: false, message: "Please provide a valid candidate stage" });
    }

    const candidate = await Candidate.findByIdAndUpdate(
      id,
      { stage },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    res.status(200).json({ success: true, data: candidate });
  } catch (err) {
    next(err);
  }
};

// --- INTERVIEWS CALENDAR ---
const getInterviews = async (req, res, next) => {
  try {
    const interviews = await Interview.find()
      .populate("candidate")
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: interviews });
  } catch (err) {
    next(err);
  }
};

const createInterview = async (req, res, next) => {
  try {
    const { candidate, candidateId, interviewer, date, time } = req.body;
    const targetCandidateId = candidate || candidateId;

    if (!targetCandidateId || !interviewer || !date || !time) {
      return res.status(400).json({ success: false, message: "Please provide candidate (or candidateId), interviewer, date, and time" });
    }

    // Lookup candidate to fetch details
    const cand = await Candidate.findById(targetCandidateId);
    if (!cand) {
      return res.status(404).json({ success: false, message: "Candidate not found" });
    }

    const count = await Interview.countDocuments();
    const interviewId = `INT${String(count + 1).padStart(3, "0")}`;

    const interview = await Interview.create({
      interviewId,
      candidate: targetCandidateId,
      candidateName: cand.name,
      jobTitle: cand.jobTitle,
      interviewer,
      date,
      time
    });

    // Automatically transition candidate to "Interview Scheduled" stage
    cand.stage = "Interview Scheduled";
    await cand.save();

    res.status(201).json({ success: true, data: interview });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getJobs,
  createJob,
  getCandidates,
  createCandidate,
  updateCandidateStage,
  getInterviews,
  createInterview
};
