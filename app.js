const PRESET_RECOMMENDATIONS = {
  routines: {
    severe: [
      {
        title: "Shift Outdoor Errands Outside Peak Smog Hours",
        detail: "Avoid heavy outdoor movement during early morning inversions and late-evening traffic peaks; schedule necessary errands around midday when atmospheric mixing is typically higher."
      },
      {
        title: "Keep Commutes Short, Smooth, and Idling-Free",
        detail: "Turn off engines at traffic signals longer than 20 seconds and combine errands into a single loop to cut tailpipe emissions and personal smoke exposure."
      }
    ],
    poor: [
      {
        title: "Plan Low-Exposure Transit Windows",
        detail: "Choose shaded or interior side streets over congested arterial roads when walking, cycling, or waiting for rides during winter smog advisories."
      },
      {
        title: "Adopt Smart Energy & Cooking Habits",
        detail: "Use tight-fitting lids on pots, run kitchen exhaust fans while cooking, and keep space-heating clean and well-ventilated."
      }
    ],
    moderate: [
      {
        title: "Time Light Outdoor Activity Wisely",
        detail: "Keep brisk walks or outdoor chores concise and check local air conditions before longer outings."
      },
      {
        title: "Reduce Routine Vehicle Trips",
        detail: "Walk or combine short trips under 2 km whenever safe and practical."
      }
    ],
    good: [
      {
        title: "Build Preventive Clean-Air Habits Early",
        detail: "Maintain regular car/two-wheeler servicing and plant native, low-maintenance greenery around balconies and entryways."
      }
    ]
  },
  indoor: {
    family: [
      {
        title: "Seal Drafts During Peak Smog Hours",
        detail: "Keep windows and balcony doors closed when outdoor particulate levels spike; use door draft stoppers in rooms where children or elders rest."
      },
      {
        title: "Use Damp Wiping Instead of Dry Sweeping",
        detail: "Wipe hard floors and window sills with a slightly damp cloth so settled dust and fine particles aren't kicked back into indoor air."
      }
    ],
    student: [
      {
        title: "Create a Clean Study Corner",
        detail: "Keep your desk away from leaky window frames and run a simple cross-ventilation check only when outdoor air is clearer."
      },
      {
        title: "Care for Your Mask & Bag",
        detail: "Store reusable respirators or masks in a clean, dry, breathable pouch rather than loose inside a dusty school or commute bag."
      }
    ],
    wfh: [
      {
        title: "Optimize Your Primary Work Room",
        detail: "Keep indoor plants healthy without overwatering (to avoid excess humidity/mold) and keep workspace surfaces dust-free."
      },
      {
        title: "Brief Controlled Air Exchange",
        detail: "If indoor air feels stale, crack a window briefly during cleaner midday hours rather than leaving it open all day."
      }
    ],
    community: [
      {
        title: "Share Building-Wide Smog Alerts",
        detail: "Post simple daily air-quality reminders in resident groups so families know when to keep common lobbies and stairwells closed."
      },
      {
        title: "Keep Shared Spaces Dust-Controlled",
        detail: "Coordinate wet mopping in shared corridors and discourage open leaf or waste burning near the premises."
      }
    ]
  },
  swaps: [
    {
      swap: "Public Transit / Shared Ride / E-Mobility vs. Solo Daily Fuel Trip",
      impact: "Lowers per-person tailpipe CO2 and particulate emissions while cutting fuel costs on regular commutes."
    },
    {
      swap: "Damp Microfiber Cleaning & Sealed Windows vs. Open-Window Dusting",
      impact: "Reduces indoor resuspended dust and keeps living spaces noticeably cleaner during dry winter months."
    },
    {
      swap: "Refillable Water Bottle, Cloth Bags & Local Produce vs. Single-Use Packaging",
      impact: "Cuts household waste and supply-chain transport footprint over time."
    }
  ]
};

function sanitizeText(input, maxLen = 120) {
  if (typeof input !== "string") return "";
  return input
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLen);
}

function buildLocalPlan({ city, aqiLevel, lifestyle, habit, notes }) {
  const safeCity = sanitizeText(city, 60) || "Your City";
  const safeNotes = sanitizeText(notes, 180);

  const routines = [
    ...(PRESET_RECOMMENDATIONS.routines[aqiLevel] || PRESET_RECOMMENDATIONS.routines.poor),
    {
      title: `Tailored Step for ${habit.replace("-", " ")}`,
      detail: `Adjust your ${habit.replace("-", " ")} routine in ${safeCity} by pacing effort during high-haze hours and keeping surfaces/gear clean.`
    }
  ];

  const indoor = [
    ...(PRESET_RECOMMENDATIONS.indoor[lifestyle] || PRESET_RECOMMENDATIONS.indoor.family)
  ];

  if (safeNotes) {
    indoor.push({
      title: "Focused Note on Your Household Context",
      detail: `Regarding "${safeNotes}" — prioritize calm, low-exertion indoor routines and consult a qualified doctor if anyone experiences breathing discomfort.`
    });
  }

  const swaps = [...PRESET_RECOMMENDATIONS.swaps];

  return {
    headline: `Clean-Air & Low-Emission Action Plan for ${safeCity}`,
    summary: `Condition: ${aqiLevel.toUpperCase()} • Profile: ${lifestyle} • Built to balance practical winter smog protection with everyday emission reductions.`,
    routines,
    indoor,
    swaps
  };
}

async function generateWithGemini(apiKey, payload) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = `You are AeroCare AI, a helpful urban air quality and sustainability assistant.
Create a concise, practical JSON response (no markdown fences) for:
City: ${payload.city}
Air Condition: ${payload.aqiLevel}
Lifestyle: ${payload.lifestyle}
Habit: ${payload.habit}
Notes: ${payload.notes || "None"}

Return ONLY valid JSON with this exact schema:
{
  "headline": "string",
  "summary": "string",
  "routines": [{"title": "string", "detail": "string"}],
  "indoor": [{"title": "string", "detail": "string"}],
  "swaps": [{"swap": "string", "impact": "string"}]
}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    throw new Error(`Gemini request failed (${response.status})`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const cleaned = rawText.replace(/```json|```/gi, "").trim();
  const parsed = JSON.parse(cleaned);

  if (
    !Array.isArray(parsed.routines) ||
    !Array.isArray(parsed.indoor) ||
    !Array.isArray(parsed.swaps)
  ) {
    throw new Error("Unexpected AI response format");
  }

  return parsed;
}

function renderPlan(plan) {
  const resultsSection = document.getElementById("results-section");
  const summaryEl = document.getElementById("impact-summary");
  const routinesList = document.getElementById("routines-list");
  const indoorList = document.getElementById("indoor-list");
  const swapsList = document.getElementById("swaps-list");

  summaryEl.innerHTML = "";
  const h2 = document.createElement("h2");
  h2.textContent = sanitizeText(plan.headline, 140);
  const p = document.createElement("p");
  p.textContent = sanitizeText(plan.summary, 240);
  summaryEl.append(h2, p);

  routinesList.innerHTML = "";
  plan.routines.forEach((item) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = sanitizeText(item.title, 120);
    const span = document.createElement("span");
    span.textContent = sanitizeText(item.detail, 280);
    li.append(strong, span);
    routinesList.appendChild(li);
  });

  indoorList.innerHTML = "";
  plan.indoor.forEach((item) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = sanitizeText(item.title, 120);
    const span = document.createElement("span");
    span.textContent = sanitizeText(item.detail, 280);
    li.append(strong, span);
    indoorList.appendChild(li);
  });

  swapsList.innerHTML = "";
  plan.swaps.forEach((item) => {
    const div = document.createElement("div");
    div.className = "swap-item";
    const strong = document.createElement("strong");
    strong.textContent = sanitizeText(item.swap, 150);
    const impact = document.createElement("span");
    impact.className = "impact-text";
    impact.textContent = `Impact: ${sanitizeText(item.impact, 220)}`;
    div.append(strong, impact);
    swapsList.appendChild(div);
  });

  resultsSection.hidden = false;
  resultsSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function initAeroCareApp() {
  const form = document.getElementById("air-assistant-form");
  if (!form) return;

  const cityInput = document.getElementById("city-input");
  const aqiSelect = document.getElementById("aqi-select");
  const lifestyleSelect = document.getElementById("lifestyle-select");
  const commuteSelect = document.getElementById("commute-select");
  const notesInput = document.getElementById("notes-input");
  const apiKeyInput = document.getElementById("api-key-input");
  const errorBanner = document.getElementById("form-error");
  const generateBtn = document.getElementById("generate-btn");
  const modeIndicator = document.getElementById("mode-indicator");

  document.querySelectorAll(".chip[data-city]").forEach((chip) => {
    chip.addEventListener("click", () => {
      cityInput.value = chip.getAttribute("data-city") || "";
      cityInput.focus();
    });
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorBanner.hidden = true;
    errorBanner.textContent = "";

    const city = sanitizeText(cityInput.value, 60);
    if (!city) {
      errorBanner.textContent = "Please enter a city or neighborhood (or pick a quick preset chip) before generating your plan.";
      errorBanner.hidden = false;
      cityInput.focus();
      return;
    }

    const payload = {
      city,
      aqiLevel: aqiSelect.value,
      lifestyle: lifestyleSelect.value,
      habit: commuteSelect.value,
      notes: sanitizeText(notesInput.value, 180)
    };

    const apiKey = (apiKeyInput?.value || "").trim();
    generateBtn.disabled = true;
    generateBtn.textContent = "Generating Plan...";

    try {
      let plan;
      if (apiKey) {
        modeIndicator.textContent = "Generating via Gemini API...";
        try {
          plan = await generateWithGemini(apiKey, payload);
          modeIndicator.textContent = "Live • Gemini AI Generated";
        } catch {
          plan = buildLocalPlan(payload);
          modeIndicator.textContent = "Fallback Active • Guided Smog Engine";
        }
      } else {
        plan = buildLocalPlan(payload);
        modeIndicator.textContent = "Ready • Guided Smog Engine";
      }
      renderPlan(plan);
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Personalized Clean-Air Plan";
    }
  });
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", initAeroCareApp);
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { sanitizeText, buildLocalPlan };
}