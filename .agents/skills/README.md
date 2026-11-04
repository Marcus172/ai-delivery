# Project skills

Skills for this repo, shared by every agent. `.claude/skills` is a symlink to this directory, so
Claude Code and Codex load the same set.

One directory per skill:

```
.agents/skills/<skill-name>/
  SKILL.md        # required: frontmatter (name, description) + instructions
  references/     # optional: longer docs the skill loads on demand
  scripts/        # optional: helpers the skill runs
```

`SKILL.md` frontmatter:

```yaml
---
name: skill-name            # kebab-case, same as the directory
description: Use when ...   # when to trigger it; this is what the agent matches on
---
```

Rules from `AGENTS.md` apply here too: skills are public, so no client or employer names, internal
systems or paths into private research. Point to `.private/` instead.
