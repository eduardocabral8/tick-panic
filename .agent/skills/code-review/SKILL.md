---
name: code-review
description: >
  Reviews changed code for bugs, logic errors, security issues, and structural
  problems. Accepts no argument (uncommitted changes), a commit SHA, a branch
  name, or a PR URL. Read-only — never edits files.
invocation:
  - "@code-review"
  - "/code-review"
permissions:
  edit: deny
  write: deny
  bash: read-only
---

# Code Review Skill

## Purpose

Perform a focused, factual review of a diff. Flag real problems only. Do not
praise, summarize effort, or suggest style preferences unrelated to project
rules.

---

## Step 1 — Determine the diff source

Inspect the argument passed by the user:

| Argument | Command to run |
|---|---|
| *(nothing)* | `git diff HEAD` (staged + unstaged changes) |
| Looks like a SHA (7–40 hex chars) | `git show <sha>` |
| Looks like a branch name | `git diff main...<branch>` (or the repo's default branch) |
| Starts with `https://github.com` | `gh pr diff <url>` |

Run exactly one of those commands. Capture the full diff output.

If the diff is empty, stop and report: **"No changes found for the given
argument."**

---

## Step 2 — Identify changed files

Parse the diff headers (`--- a/` / `+++ b/`) to produce a list of every file
that has at least one added or removed line.

---

## Step 3 — Read full file content for context

For each changed file that still exists in the working tree, read its complete
current content. This gives you the surrounding context needed to judge whether
a change is actually wrong.

Do **not** read files that were deleted in the diff.

---

## Step 4 — Read project rules

Check whether any of the following files exist at the repository root:

- `AGENTS.md`
- `CONVENTIONS.md`
- `.cursorrules`
- `CONTRIBUTING.md`

Read every file that exists. These rules are authoritative. A violation of
project rules is always a finding, regardless of general best practices.

---

## Step 5 — Analyse only changed lines

Review only lines introduced by the diff (lines starting with `+`, excluding
the `+++` header line). Pre-existing code is out of scope unless it provides
essential context that reveals a bug in the new code.

For each block of added lines, check:

### Bugs and logic errors
- Off-by-one errors, wrong comparisons, inverted conditions
- Incorrect state transitions or missing guard clauses
- Incorrect use of async/await (missing `await`, unhandled rejection)
- Race conditions introduced by the change
- Data passed to the wrong parameter position

### Security issues
- Unsanitised user input reaching SQL, shell commands, or eval
- Secrets or credentials hardcoded or logged
- Missing authentication or authorisation checks on new routes
- Insecure direct object references

### Structural / architecture violations (check against AGENTS.md rules)
- Domain layer importing from `apps/`, frameworks, or `process.env`
- Frontend importing domain packages directly (must use HTTP/WebSocket)
- Backend importing from frontend
- Business logic placed in a component, WebSocket handler, or HTTP controller
- Timer or game logic placed outside the designated layer
- New `console.log` statements
- Commented-out code
- Code comments (project forbids them)
- `eslint-disable` or inline lint suppression
- New dependencies added without explicit approval
- Missing `.test.ts` for new entities, use cases, or services
- Tests with zero assertions or empty `it()` blocks

### Type safety
- `any` cast that hides a real type mismatch
- Non-null assertion (`!`) on a value that could legitimately be null
- Runtime shape mismatch between what a function returns and what the caller expects

---

## Step 6 — Investigate before reporting

Before labelling something a bug:

1. Read the full function / class involved.
2. Check whether existing tests cover the scenario — if yes, note that.
3. Confirm the problem would actually occur at runtime, not just in theory.
4. If uncertain after reading the full context, do **not** report it as a bug;
   report it as a question under **Needs Clarification**.

---

## Step 7 — Output the review

Write the report in the following structure. Omit sections that have no
entries. Use English.

---

### Files reviewed

List each file in the diff with a one-line description of what changed.

---

### Critical — must fix

Issues that will cause data loss, security breaches, crashes, or incorrect
game state. Include:

- **File and line number** of the offending addition
- **Exact reproduction scenario**: what input or action triggers the problem
- **Why it is wrong**: one or two sentences, no hedging

---

### High — should fix before merge

Logic errors, architecture violations, or missing tests for new logic. Same
format as Critical.

---

### Medium — worth fixing

Type safety issues, minor logic concerns, project-rule violations that do not
break behaviour (e.g. a stray `console.log`, a comment left in code). Same
format.

---

### Needs clarification

Things that look suspicious but where you lack enough context to be certain.
State exactly what you would need to verify before deciding.

---

### No issues found

If there are genuinely no problems, say so once, plainly. Do not elaborate.

---

## Constraints

- Read files and run `git`/`gh` commands only. Never edit, write, or delete
  any file.
- Do not run tests, builds, or install commands.
- Do not suggest refactors unrelated to a concrete problem.
- Do not compliment the code or the author.
- Do not use phrases like "great job", "looks good overall", "minor nit", or
  "you might consider".
- Be specific: file path, line number, exact problem. No generalities.
- One finding per item. Do not bundle unrelated issues.
