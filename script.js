const uploadForm = document.getElementById("uploadForm");
const resumeInput = document.getElementById("resumeInput");
const fileNameEl = document.getElementById("fileName");
const statusEl = document.getElementById("status");
const analyzeBtn = document.getElementById("analyzeBtn");
const resultCard = document.getElementById("resultCard");

const domainEl = document.getElementById("domain");
const skillsEl = document.getElementById("skills");
const strengthsEl = document.getElementById("strengths");
const weaknessesEl = document.getElementById("weaknesses");
const improvementsEl = document.getElementById("improvements");

resumeInput.addEventListener("change", () => {
  const file = resumeInput.files[0];
  fileNameEl.textContent = file ? file.name : "No file chosen";
});

uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const file = resumeInput.files[0];
  if (!file) {
    statusEl.textContent = "Please select a PDF resume.";
    statusEl.classList.add("error");
    return;
  }

  if (file.type !== "application/pdf") {
    statusEl.textContent = "Only PDF files are supported.";
    statusEl.classList.add("error");
    return;
  }

  statusEl.classList.remove("error");
  statusEl.textContent = "Analyzing resume with AI. This may take a few seconds...";
  analyzeBtn.disabled = true;
  analyzeBtn.textContent = "Analyzing...";

  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch("/api/analyze", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();
    renderResult(data);
    statusEl.textContent = "Analysis complete.";
  } catch (err) {
    console.error(err);
    statusEl.textContent = "Failed to analyze resume. Please try again.";
    statusEl.classList.add("error");
  } finally {
    analyzeBtn.disabled = false;
    analyzeBtn.textContent = "Analyze Resume";
  }
});

function renderResult(data) {
  resultCard.hidden = false;

  domainEl.textContent = data.domain || "Not detected";

  renderList(skillsEl, data.skills || []);
  renderList(strengthsEl, data.strengths || []);
  renderList(weaknessesEl, data.weaknesses || []);
  renderList(improvementsEl, data.improvements || []);
}

function renderList(ulElement, items) {
  ulElement.innerHTML = "";

  if (!items || items.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No data";
    ulElement.appendChild(li);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    ulElement.appendChild(li);
  });
}
