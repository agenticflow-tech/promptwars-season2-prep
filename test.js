const assert = require("assert");
const { sanitizeText, buildLocalPlan } = require("./app.js");

function runTests() {
  // 1. Security & input sanitization tests
  const xssAttempt = '<script>alert("xss")</script>  Jaipur   ';
  const sanitized = sanitizeText(xssAttempt, 50);
  assert.strictEqual(sanitized, 'scriptalert("xss")/script Jaipur', "Should strip angle brackets and collapse spaces");
  assert.strictEqual(sanitizeText(null), "", "Should safely handle non-string inputs");

  // 2. Plan generation & problem alignment tests
  const plan = buildLocalPlan({
    city: "Delhi NCR",
    aqiLevel: "severe",
    lifestyle: "family",
    habit: "two-wheeler",
    notes: "Elderly grandparents at home"
  });

  assert.ok(plan.headline.includes("Delhi NCR"), "Headline should include target city");
  assert.ok(Array.isArray(plan.routines) && plan.routines.length >= 2, "Should include low-emission routines");
  assert.ok(Array.isArray(plan.indoor) && plan.indoor.length >= 3, "Should include indoor hacks and household note");
  assert.ok(Array.isArray(plan.swaps) && plan.swaps.length >= 3, "Should include sustainable swaps with direct impact");

  console.log("All AeroCare AI unit tests passed successfully!");
}

runTests();