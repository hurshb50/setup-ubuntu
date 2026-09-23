---
name: design
description: Push an architecture forward. Interview me, fan out on widely varying designs, then build the API shape together.
disable-model-invocation: true
---

# Design

Turn a vague idea into one API shape.

## Output

- Produce the API shape
- Types, signatures, classes with fields and methods
- No implementation, no function bodies, no pseudocode

## Phase 1. Interview

1. Ask only about decisions needing my judgement
2. Move on when only trying designs can answer

## Phase 2. Ideation

- Spawn 4 subagents at once
- Send each one different starting material

Each subagent returns:

- The API shape
- An example caller

## Phase 3. Feedback

- Present all the designs
- Show how a caller would use each one
- Do not pick a winner
- Ask what I like and dislike
- Ask whether to run another round

## Phase 4. Converge

- Build one API shape from my choices
- It must read as one design
- Show it, then refine from my feedback
