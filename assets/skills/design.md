---
name: design
description: Push an architecture forward. Interview me, fan out on widely varying designs, then build the API shape together.
disable-model-invocation: true
---

# Design

Turn a vague architectural idea into one API shape we agree on.

Produce the API shape, not the implementation: types, function signatures, classes with their fields and methods. No function bodies, no pseudocode, no queries. If a decision depends on how something would be built, say so in prose and let me decide.

## Phase 1. Interview

Interview me before designing anything.

Ask me about the decisions the design has to make.

Some decisions depend on others. Ask the unblocked ones now and leave the rest for a later round.

Put every unblocked question in one round, numbered, each with your recommended answer. Then stop and wait for mine.

Do not ask me for facts. Look them up, then ask me only what needs my judgement.

Move on when the remaining questions can only be answered by trying designs. That is Phase 2.

## Phase 2. Ideation

Spawn three or four subagents at once. They all solve the same problem, and each one takes a different approach.

Send them different starting material. At least one starts from the code as it is today, and at least one ignores the current code and designs as if the problem were new.

Each subagent returns:

- The API shape: types, signatures, classes with fields and methods.
- An example of a caller using it.
- A short paragraph on what the API handles for the caller.
- The rules a caller must follow, and how it fails.
- What this approach makes worse.

Read what comes back before Phase 3. Throw away any design that does not address the problem, and spawn a replacement with a different approach until you have three or four that do. Merge any two that describe the same shape, or re-run one with different starting material. If all of them match, either the domain forces that shape or the starting material was too alike. Tell me which you think it is.

## Phase 3. Choose together

Present the designs one at a time.

Then ask me one round of numbered questions about what to keep, each with your recommendation. Do not pick a winner. I want to mix.

Fold my answers into another round of Ideation. Keep going until I say we are done, then converge.

## Phase 4. Converge

Build one API shape from the parts I chose. It has to read as one design, not several stuck together. When two parts conflict, pick one and tell me why.

Show it to me, then refine it from my feedback until I say it is done.

Then output the same things the subagents returned, and explain why you chose each part. Say how much of the code we already have has to change.
