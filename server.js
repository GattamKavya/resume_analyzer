const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const path = require("path");
const cors = require("cors");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.use(cors());

// Serve static files (frontend)
app.use(express.static(__dirname));

// Main API endpoint
app.post("/api/analyze", upload.single("resume"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 1) Extract text from PDF
    const pdfData = await pdfParse(req.file.buffer);
    const resumeText = pdfData.text;

    // 2) Optionally call Wrap AI flow if configured, otherwise mock
    let analysis;
    if (process.env.WRAP_AI_WEBHOOK_URL) {
      analysis = await callWrapAIWorkflow(resumeText);
    } else {
      analysis = mockAnalysis(resumeText);
    }

    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to analyze resume" });
  }
});

async function callWrapAIWorkflow(resumeText) {
  const url = process.env.WRAP_AI_WEBHOOK_URL;

  const response = await axios.post(
    url,
    { resume_text: resumeText },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.WRAP_AI_API_KEY || ""}`,
      },
    }
  );

  return {
    domain: response.data.domain || "Unknown",
    skills: response.data.skills || [],
    strengths: response.data.strengths || [],
    weaknesses: response.data.weaknesses || [],
    improvements: response.data.improvements || [],
  };
}

function mockAnalysis(text) {
  const lower = text.toLowerCase();
  let domain = "Non-tech";

  if (lower.includes("python") || lower.includes("java") || lower.includes("react")) {
    domain = "IT";
  } else if (lower.includes("nurse") || lower.includes("clinic") || lower.includes("hospital")) {
    domain = "Medical";
  }

  return {
    domain,
    skills: ["Communication", "Teamwork", "Problem Solving"],
    strengths: [
      "Clear structure and easy to read",
      "Relevant experience highlighted",
    ],
    weaknesses: [
      "Summary section could be more concise",
      "Achievements are not quantified with numbers",
    ],
    improvements: [
      "Add 2–3 bullet points with measurable results (e.g., 'Improved X by 20%').",
      "Include a short professional summary tailored to your target role.",
      "Align skills section with keywords from job descriptions you apply to.",
    ],
  };
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Resume Analyzer running at http://localhost:${PORT}`);
});
