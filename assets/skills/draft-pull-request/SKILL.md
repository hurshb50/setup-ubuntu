---
name: draft-pull-request
description: Create draft pull requests while preserving Git stack structure.
---

# Draft PR

Create draft PRs using repository conventions.

## Relevant commands

- `gh pr list`: Find nearby PRs.
- `gh pr view`: Inspect PR details.
- `gh pr create --draft`: Create a draft.
- `gh pr edit`: Update PR details.
- `gh pr ready --undo`: Restore draft status.
- `gh stack view`: Inspect the stack.
- `gh stack link`: Link existing PRs.
- `gh stack rebase`: Rebase stack branches.
- `gh stack push`: Push stack branches.
- `gh stack submit`: Create or update stack PRs.

Check `gh --help`, `gh pr --help`, or `gh stack --help` when needed. Check subcommand help before using unfamiliar options.

## Draft status

Draft status belongs to each PR, not its stack.

- Draft only PRs explicitly requested as drafts.
- Preserve every existing PR's current status.
- Never convert an entire stack to drafts.
- Before stack commands, verify their draft-status behavior.
- Ask before any command could change other PR statuses.

## Workflow

- Inspect branch and working-tree state.
- Identify the intended base branch.
- Review nearby PR titles and descriptions.
- Split changes into stacked PRs when requested.
- Preserve user changes and uncommitted work.
- Ask before committing changes.
- Do not use `gh stack submit` unless requested.
- Verify titles, bases, and draft status.
- Report PRs and stack links.
