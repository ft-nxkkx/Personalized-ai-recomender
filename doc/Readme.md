# AI Arena — Blind AI Model Comparison & Personalized Recommender

## Overview
AI Arena is a blind, pairwise AI model comparison platform that learns which AI models an individual user prefers for different tasks.

**Core loop:** Prompt → Generate → Blind Compare → Vote → Reveal → Learn → Recommend

A user enters a prompt. Two AI models independently answer it. Their identities are hidden as **Model A** and **Model B**. The user chooses the response they prefer without seeing the provider/model name. Only after the vote are the identities revealed.

## Problem
Different AI models can be useful for different tasks and different users. Static rankings do not necessarily represent an individual's preferences.

AI Arena addresses:
- Brand/model-name influence during comparison
- Lack of personalization
- Static benchmark limitations
- Difficulty comparing models on real prompts
- Lack of task-specific preference learning

The product reduces identity-driven bias; it does not claim to eliminate all bias.

## Core Features
### Blind A/B comparison
- One prompt, two responses
- Anonymous A/B presentation
- Randomized A/B assignment
- No provider name/logo/brand color before voting

### Preference capture
- A is better
- B is better
- Both are good / Tie
- Neither

### Reveal
After voting, actual model identities are revealed and the preference is recorded.

### Personalized profile
Track preferences overall, by category, difficulty, model pair, and feedback reason.

### Adaptive recommendation
Balance exploitation (models the user tends to prefer) with exploration (models/categories with limited evidence). A starting strategy can be about 80% exploitation and 20% exploration.

## Full Interactive Experience
The frontend is intentionally interactive rather than static.

- **Landing:** hero reveal, CTA hover/press, subtle parallax, scroll-triggered statistics.
- **Prompt:** focus expansion, animated category chips, suggestions, live validation.
- **Generation:** animated skeletons, progressive response reveal, partial-completion state.
- **Comparison:** equal A/B cards, hover lift, copy feedback, expand/collapse.
- **Vote:** selected-card emphasis, other-card de-emphasis, confirmation transition.
- **Reveal:** signature A/B-to-real-model identity transformation.
- **Insights:** animated counters/charts, interactive filters and highlighting.
- **Recommendation:** animated “Your next matchup” transition while keeping identities hidden.
- **Arena:** animated aggregate statistics and filter transitions.
- **History:** expandable cards and smooth detail transitions.
- **Accessibility:** reduced-motion support and keyboard/screen-reader compatibility.

## Main Navigation
**Compare | Insights | Arena | History | Settings**

## Data Concept
`User → Prompt → Category → Difficulty → Model A → Model B → Responses → A/B Assignment → Choice → Feedback → Timestamp`

## Recommendation Philosophy
Use wording such as:
> “Based on your previous choices, this model is currently your most frequently preferred model for this task.”

Do not present personal preference as objective model quality. Show sample size with percentages.

## Future Extensions
More models, benchmark suites, Bayesian preference estimation, Thompson Sampling, contextual bandits, Elo/Bradley-Terry, team profiles, public benchmark challenges, API access, and profile export.

## Project Positioning
> **AI Arena is a blind pairwise AI evaluation and personalized model recommendation system that learns individual preferences across tasks.**

