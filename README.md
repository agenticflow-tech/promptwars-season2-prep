# AeroCare AI — Urban Air Quality & Winter Smog Assistant

Built by **AgenticFlow Tech** for **Google PromptWars Virtual — Challenge 06**.

## Overview
AeroCare AI is an accessible, GenAI-powered assistant designed to help families and urban communities navigate severe winter smog and urban air pollution. Tailored to a user's city, current air quality condition, household lifestyle, and daily commute habits, it generates actionable guidance across three pillars:
1. **Low-Emission Daily Routines**
2. **Indoor Air Quality Hacks**
3. **Sustainable Alternatives & Direct Impact Explanations**

## Key Engineering Highlights
- **Hybrid GenAI + Guided Fallback Engine:** Integrates directly with Google's Gemini API (`gemini-2.5-flash`) when an API key is provided, while seamlessly running a structured local recommendation engine out-of-the-box for instant evaluation without requiring exposed credentials.
- **Security First:** Zero persistent API key storage (session memory only) and strict input sanitization (`sanitizeText`) against injection.
- **Accessibility (WCAG-Aligned):** Semantic landmarks, skip-to-content navigation, `aria-live` status updates, keyboard focus outlines, and responsive mobile/desktop grid layouts.
- **Automated Testing:** Lightweight unit test suite (`test.js`) verifying input sanitization and structured plan generation.

## Approach, Logic & Assumptions

- **Chosen Vertical:** Urban Air Quality & Winter Smog Assistant (Challenge 06 — GenAI Sustainability).
- **Approach & Decision Logic:** Combines user context—city/neighborhood, local AQI severity, household vulnerability profile (such as families with children or elders), and daily commute/energy habits—to generate tailored guidance across low-emission routines, indoor air quality protections, and sustainable swaps with measurable impact notes.
- **Hybrid Architecture:** Uses Google's Gemini API (`gemini-2.5-flash`) when a session API key is supplied, and automatically falls back to a deterministic rule-based engine so evaluators and users can test full functionality immediately without exposed credentials.
- **Key Assumptions:**
  1. Users may not always have an exact real-time AQI sensor reading, so intuitive AQI severity bands (with a practical winter smog default) enable immediate, actionable guidance.
  2. Client-side deployment on GitHub Pages requires zero backend storage; optional API keys are kept strictly in volatile session memory and user text is sanitized before rendering.
  3. High-impact household air-quality improvements (draft sealing, damp wiping, transit timing) should remain practical and accessible even without mechanical air purifiers.
  
## Running Locally & Testing
- Open `index.html` in any modern web browser.
- Run automated unit tests via Node.js:
  ```bash
  node test.js
  ```