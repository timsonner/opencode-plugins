# Agent Collaboration Plugin

OpenCode plugin that lets agents working in the same project directory message each other, share a task board, and see who else is registered. The implementation is `agent-collaboration.ts`. It stores state as JSON under `.opencode/collaboration/`, which is gitignored.

On load, the plugin registers the current process, writes that record to `agents.json`, and logs a startup line through `client.app.log`. The agent id is `agent-` plus the first 8 characters of the OpenCode project id (`unknown` when the project id is missing) plus the process pid. The display name starts as that id. The recorded capabilities are `task_execution`, `problem_solving`, and `code_review`. Status starts as `active`.

An agent left at `active` with `lastActive` older than 5 minutes is marked `stale`. That cleanup runs when the plugin loads and when `agent.discover` runs.

## Prerequisites

- Node.js and npm, to install the packages declared in `package.json`
- Bun, because the plugin imports `$` from `bun` and writes files with `Bun.write`
- OpenCode, which loads the plugin and exposes its tools to agents

`package.json` declares:

- `@opencode-ai/plugin` `^1.3.13`
- `zod` `^4.3.6`
- `@types/bun` `^1.3.11` (dev)

`.opencode/package.json` lists `@opencode-ai/plugin` and `zod` as `latest`.

## Install, build, and check

Install the dependencies in this repository:

```bash
npm install
```

`package.json` has no `scripts` entries. TypeScript is not a dependency. `tsconfig.json` targets ES2022, uses `module` `ESNext`, includes `*.ts`, and emits to `dist/` (gitignored) with declarations and source maps.

Typecheck:

```bash
npx --yes -p typescript@5.8.2 tsc --noEmit
```

Emit `dist/`:

```bash
npx --yes -p typescript@5.8.2 tsc
```

There is no test script and no run script in this repository. The plugin runs inside OpenCode.

OpenCode discovers `.ts` files in `.opencode/plugins/` and in `~/.config/opencode/plugins/`. Copy the plugin into the project that should load it:

```bash
mkdir -p .opencode/plugins
cp agent-collaboration.ts .opencode/plugins/
```

Or copy it where OpenCode looks for global plugins:

```bash
mkdir -p ~/.config/opencode/plugins
cp agent-collaboration.ts ~/.config/opencode/plugins/
```

The file's plugin value is the named export `AgentCollaborationPlugin` from `@opencode-ai/plugin`. The project that loads the file needs `@opencode-ai/plugin`, `zod`, and Bun resolvable the same way this repository installs them with `npm install`.

`MULTI-SESSION-GUIDE.md` describes starting more than one OpenCode session with the `opencode` command so those sessions share the collaboration files.

## Usage

Agents call these tools. Arguments below match the schemas in `agent-collaboration.ts`.

### `agent.name`

Sets the display name other agents see.

```json
{ "name": "LeadDev" }
```

### `agent.message`

Sends a message. `to` is a display name or `broadcast`. When `to` matches an agent's `name`, the stored recipient is that agent's id. When it does not match, the raw `to` string is stored, and `agent.inbox` will not return it to another agent. `broadcast` stays `broadcast`.

`type` is one of `task_request`, `task_update`, `help_request`, `solution_proposal`, `status_update`, `blocker_report`.

`priority` is `low`, `medium`, `high`, or `urgent`. The default is `medium`. `taskId` is optional.

```json
{
  "to": "broadcast",
  "type": "help_request",
  "content": "Need help with the token refresh path.",
  "priority": "high"
}
```

### `agent.inbox`

Returns messages whose recipient is this agent id or `broadcast`, newest first. Optional filters are `type` and `priority`. `limit` defaults to 10.

```json
{ "limit": 10 }
```

### `agent.task`

`action` is `create`, `update`, `list`, `claim`, or `complete`.

- `create` stores a new id, `title` (default `Untitled Task`), `description` (default empty), `assignedTo` set to the current agent, `status` `pending`, and `dependencies` (default `[]`).
- `update` requires an existing `taskId`. It can change `title`, `description`, and `status`.
- `list` returns each task's `id`, `title`, `assignedTo`, `status`, and `dependencies`.
- `claim` sets `assignedTo` to the current agent and `status` to `in_progress`.
- `complete` sets `status` to `completed`.

`status` values are `pending`, `in_progress`, `blocked`, and `completed`.

```json
{
  "action": "create",
  "title": "Implement user authentication",
  "description": "Add login, registration, and session management",
  "dependencies": ["task-setup-db"]
}
```

```json
{ "action": "claim", "taskId": "task-123" }
```

```json
{ "action": "complete", "taskId": "task-123" }
```

### `agent.discover`

Lists agents whose `status` is `active`. Pass `capability` to keep only agents whose `capabilities` array includes that string.

```json
{ "capability": "code_review" }
```

### Hooks

The plugin returns these hooks:

| Hook | What it does |
| --- | --- |
| `session.created` | Writes the agent again as `active`, keeping an existing display name |
| `message.updated` | Sets `lastActive` to the current time |
| `session.updated` | Sets `lastActive` to the current time |
| `session.idle` | Sets `status` to `idle` |
| `experimental.session.compacting` | Appends tasks whose status is not `completed` to the compaction context |
| `tool.execute.before` | When the tool is `bash` or `read` and more than one agent is `active`, prefixes `output.args.command` with a comment that counts those agents |

### Files

| Path | Contents |
| --- | --- |
| `.opencode/collaboration/messages.json` | Messages sent with `agent.message` |
| `.opencode/collaboration/tasks.json` | Task board |
| `.opencode/collaboration/agents.json` | Registered agents, names, capabilities, status, and `lastActive` |

Reads fall back to an empty list or object when the file is missing or is not valid JSON.

## Layout

```text
agent-collaboration.ts    Plugin source
package.json              Dependency ranges for this repository
.opencode/package.json    Dependency ranges using "latest"
tsconfig.json             TypeScript emit settings
MULTI-SESSION-GUIDE.md    Notes on running more than one OpenCode session
TEST-PROMPT.md            Prompt text for exercising the tools
```

## License

This repository has no `LICENSE` file.
