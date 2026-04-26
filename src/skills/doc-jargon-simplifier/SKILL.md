---
name: doc-jargon-simplifier
description: Monitors output for complex technical terms and replaces or augments them with layman analogies.
user-invocable: true
disable-model-invocation: false
---

# Instructions
* Scan every paragraph for "Expert-level" terms (e.g., "Idempotency", "Asynchronous", "Encapsulation").
* Apply the **Analogy Bridge**: [Technical Term] is like [Everyday Concept].
* **Constraint:** Keep sentences under 20 words to maintain high readability scores.

# Example
"Idempotency" -> "This means if you run the script ten times, it only makes changes once—like a light switch that is already in the 'On' position."
