# Agent Collaboration Plugin for OpenCode

A comprehensive plugin that enables OpenCode agents to communicate, coordinate, and collaborate on shared tasks.

## Quick Start

### Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd plugins

# Install dependencies
npm install

# Copy plugin to your OpenCode project
mkdir -p .opencode/plugins
cp agent-collaboration.ts .opencode/plugins/

# Or install globally
mkdir -p ~/.config/opencode/plugins
cp agent-collaboration.ts ~/.config/opencode/plugins/
```

### Dependencies

The plugin requires the following dependencies (already included in `package.json`):
- `@opencode-ai/plugin` - OpenCode plugin SDK
- `zod` - Schema validation
- `@types/bun` - Bun type definitions (dev dependency)

Run `npm install` to install all required packages.

## Features

### 🤝 Agent Communication
- **Direct Messaging**: Send messages to specific agents or broadcast to all
- **Message Types**: Task requests, help requests, solution proposals, status updates, blocker reports
- **Priority System**: Low, medium, high, and urgent message priorities
- **Inbox Management**: Check and filter messages by type or priority

### 📋 Shared Task Board
- **Task Creation**: Create tasks that any agent can claim
- **Task Assignment**: Agents can claim tasks to work on
- **Status Tracking**: Pending, in-progress, blocked, completed
- **Dependency Management**: Track task dependencies

### 🔍 Agent Discovery
- **Active Agent List**: See all active agents in the collaboration network
- **Capability Filtering**: Find agents with specific capabilities
- **Status Tracking**: Monitor agent availability

### 🔄 Automatic Coordination
- **Activity Tracking**: Agents automatically update their status
- **Session Awareness**: Collaboration context maintained across compaction
- **Tool Integration**: Collaboration reminders injected into tool execution

## Installation

### Local Installation
1. Copy `agent-collaboration.ts` to your project's plugin directory:
   ```bash
   mkdir -p .opencode/plugins
   cp agent-collaboration.ts .opencode/plugins/
   ```

2. Or install globally:
   ```bash
   mkdir -p ~/.config/opencode/plugins
   cp agent-collaboration.ts ~/.config/opencode/plugins/
   ```

### Dependencies
The plugin requires the following dependencies. Add to your `.opencode/package.json`:

```json
{
  "dependencies": {
    "@opencode-ai/plugin": "latest",
    "zod": "latest"
  }
}
```

## How Agents Discover These Tools

The plugin automatically registers custom tools that become available to all OpenCode agents:

1. **`agent.message`** - Send messages to other agents
2. **`agent.inbox`** - Check for new messages
3. **`agent.task`** - Manage shared tasks
4. **`agent.discover`** - Find other active agents

Agents will see these tools in their available tool list and can use them based on the detailed descriptions provided in each tool definition.

## Usage Examples

### Agent A Requests Help
```typescript
// Agent A encounters a complex problem
agent.message({
  to: "broadcast",
  type: "help_request",
  content: "Need help implementing OAuth2 flow. Stuck on token refresh logic.",
  priority: "high"
})
```

### Agent B Responds with Solution
```typescript
// Agent B sees the message and responds
agent.message({
  to: "agent-abc123",
  type: "solution_proposal",
  content: "I've implemented OAuth2 before. Here's the pattern: 1) Store refresh token securely, 2) Check expiry before each request, 3) Use exponential backoff on failures...",
  priority: "medium"
})
```

### Coordinating Task Work
```typescript
// Create a shared task
agent.task({
  action: "create",
  title: "Implement user authentication",
  description: "Add login, registration, and session management",
  dependencies: ["task-setup-db"]
})

// Another agent claims the task
agent.task({
  action: "claim",
  taskId: "task-123"
})

// Update progress
agent.task({
  action: "update",
  taskId: "task-123",
  status: "in_progress"
})

// Complete the task
agent.task({
  action: "complete",
  taskId: "task-123"
})
```

### Discovering Available Agents
```typescript
// Find agents with code review capability
agent.discover({
  capability: "code_review"
})
```

## Collaboration Workflow

1. **Initialization**: When an agent starts, it automatically registers in the collaboration network
2. **Discovery**: Agents can discover each other and their capabilities
3. **Communication**: Agents send messages using the `agent.message` tool
4. **Task Coordination**: Shared tasks are created, claimed, and tracked
5. **Status Updates**: Agent activity is automatically tracked via hooks
6. **Context Preservation**: Collaboration state is maintained across session compaction

## File Structure

The plugin creates a `.opencode/collaboration/` directory with:
- `messages.json` - All collaboration messages
- `tasks.json` - Shared task board
- `agents.json` - Registered agents and their status

## Hooks Used

| Hook | Purpose |
|------|---------|
| `message.updated` | Track agent activity |
| `session.updated` | Update agent status |
| `session.idle` | Mark agent as idle |
| `experimental.session.compacting` | Preserve collaboration context |
| `tool.execute.before` | Inject collaboration awareness |

## Best Practices for Agent Collaboration

1. **Be Specific**: Include relevant context in messages
2. **Use Priority Appropriately**: Reserve "urgent" for critical blockers
3. **Claim Tasks**: Always claim tasks before working on them
4. **Update Status**: Keep task status current
5. **Broadcast Wisely**: Use broadcast for important announcements only
6. **Check Inbox Regularly**: Poll for new messages between major actions

## Troubleshooting

### Agents Not Seeing Each Other
- Ensure all agents are in the same project directory
- Check that the plugin is loaded in all sessions
- Verify `.opencode/collaboration/agents.json` exists

### Messages Not Delivered
- Check file permissions on the collaboration directory
- Ensure agents are using the correct agent IDs
- Verify messages are being written to `messages.json`

### Tasks Not Syncing
- Confirm all agents have write access to the tasks file
- Check for JSON parse errors in the tasks file
- Ensure agents are using the same task IDs

## Future Enhancements

- Real-time message notifications
- Agent capability negotiation
- Task priority queues
- Collaboration analytics
- Cross-project collaboration
- Message threading and replies
- Agent reputation system
