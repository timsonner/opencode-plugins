# Multi-Session Setup Guide

This guide explains how to run multiple OpenCode sessions simultaneously to test the Agent Collaboration Plugin.

## What is an OpenCode Session?

An OpenCode session is an independent AI agent instance that runs in your terminal. Each session has its own conversation context but can share files and collaboration data with other sessions in the same project.

## Prerequisites

- OpenCode installed (`opencode` command available)
- Agent Collaboration Plugin installed (see main README)
- A project directory to work in

## Method 1: Multiple Terminal Windows/Tabs (Recommended)

This is the simplest approach for testing multi-agent collaboration.

### Step-by-Step:

1. **Open your project directory:**
   ```bash
   cd /path/to/your/project
   ```

2. **Open your first terminal and start OpenCode:**
   ```bash
   opencode
   ```
   This is **Agent 1** (Lead Developer)

3. **Open a second terminal window/tab:**
   - In VS Code: `` Ctrl+` `` then click the `+` icon
   - In GNOME Terminal: `Ctrl+Shift+T`
   - Or just open a new terminal window

4. **Navigate to the same project directory:**
   ```bash
   cd /path/to/your/project
   ```

5. **Start a second OpenCode session:**
   ```bash
   opencode
   ```
   This is **Agent 2** (Junior Developer)

6. **Repeat for more agents:**
   Open additional terminals and run `opencode` in each

### Testing the Collaboration:

**In Terminal 1 (Lead Agent):**
```
Use agent.discover to see what other agents are active
```

**In Terminal 2 (Junior Agent):**
```
Use agent.discover to see what other agents are active
```

Both agents should now see each other in the collaboration network!

## Method 2: Terminal Multiplexer (tmux/screen)

If you prefer working in a single terminal window, use a terminal multiplexer.

### Using tmux:

1. **Start tmux:**
   ```bash
   tmux
   ```

2. **Split the window vertically:**
   Press `Ctrl+b`, then `%`

3. **Split horizontally (optional):**
   Press `Ctrl+b`, then `"`

4. **Navigate to your project in each pane:**
   ```bash
   cd /path/to/your/project
   ```

5. **Start OpenCode in each pane:**
   ```bash
   opencode
   ```

6. **Switch between panes:**
   Press `Ctrl+b`, then arrow keys

### Using screen:

1. **Start screen:**
   ```bash
   screen
   ```

2. **Create new window:**
   Press `Ctrl+a`, then `c`

3. **Switch between windows:**
   Press `Ctrl+a`, then `n` (next) or `p` (previous)

4. **Start OpenCode in each window**

## Method 3: VS Code Integrated Terminal

If you're using VS Code:

1. **Open your project in VS Code**

2. **Open the terminal panel:**
   - `` Ctrl+` `` (backtick)
   - Or: Terminal → New Terminal

3. **Create multiple terminal instances:**
   - Click the `+` icon in the terminal panel
   - Or: `` Ctrl+Shift+` ``

4. **Navigate to project in each terminal:**
   ```bash
   cd /path/to/your/project
   ```

5. **Run OpenCode in each:**
   ```bash
   opencode
   ```

## Verifying Multi-Session Setup

### Check that agents can see each other:

In any OpenCode session, run:
```
Use agent.discover to list all active agents
```

You should see output like:
```json
{
  "currentAgent": "agent-abc12345",
  "activeAgents": [
    {
      "id": "agent-abc12345",
      "sessionId": "abc12345...",
      "capabilities": ["task_execution", "problem_solving", "code_review"],
      "lastActive": 1234567890,
      "status": "active"
    },
    {
      "id": "agent-def67890",
      "sessionId": "def67890...",
      "capabilities": ["task_execution", "problem_solving", "code_review"],
      "lastActive": 1234567891,
      "status": "active"
    }
  ],
  "totalAgents": 2
}
```

### Check collaboration files:

In a regular terminal (not OpenCode):
```bash
# View registered agents
cat .opencode/collaboration/agents.json

# View messages
cat .opencode/collaboration/messages.json

# View tasks
cat .opencode/collaboration/tasks.json
```

## Common Issues and Solutions

### Issue: Agents don't see each other

**Possible causes:**
- Sessions are in different directories
- Plugin not loaded in all sessions
- Collaboration directory not created

**Solutions:**
```bash
# Verify all sessions are in the same directory
pwd

# Check plugin is installed
ls -la ~/.config/opencode/plugins/agent-collaboration.ts
# or
ls -la .opencode/plugins/agent-collaboration.ts

# Manually create collaboration directory
mkdir -p .opencode/collaboration
```

### Issue: Only one agent appears

**Possible causes:**
- Second session hasn't registered yet
- Session crashed or exited

**Solutions:**
- Wait a few seconds for registration
- Run `agent.discover` again
- Check that both OpenCode sessions are still running

### Issue: Messages not appearing

**Possible causes:**
- File permissions issue
- JSON file corrupted

**Solutions:**
```bash
# Check file permissions
ls -la .opencode/collaboration/

# Reset collaboration files
rm -rf .opencode/collaboration/
# Then restart OpenCode sessions
```

## Testing Workflow Example

Here's a complete workflow to test the collaboration:

### Terminal 1 (Lead Agent):
```
1. Use agent.discover
2. Use agent.task with action "create", title "Build API Integration"
3. Use agent.message to broadcast: "New task available, who can help?"
```

### Terminal 2 (Junior Agent):
```
1. Use agent.discover (should see Agent 1)
2. Use agent.inbox (should see the broadcast message)
3. Use agent.task with action "list" (should see the task)
4. Use agent.task with action "claim" on the task
5. Use agent.message to respond: "I've claimed the task, starting work now!"
```

### Terminal 1 (Lead Agent):
```
1. Use agent.inbox (should see Agent 2's response)
2. Use agent.task with action "list" (should show task claimed by Agent 2)
```

## Tips for Effective Multi-Agent Testing

1. **Label your terminals** - Keep track of which is which
2. **Start with 2 agents** - Easier to debug than 3+
3. **Use the TEST-PROMPT.md** - Follow the structured test
4. **Check collaboration files** - Verify data is being written
5. **Keep sessions active** - Don't let them go idle during testing
6. **Use broadcast sparingly** - Direct messages are clearer for testing

## Cleaning Up

After testing, you can clean up the collaboration data:

```bash
# Remove collaboration files
rm -rf .opencode/collaboration/

# Or keep them for reference
mv .opencode/collaboration/ .opencode/collaboration-backup/
```

## Next Steps

Once you have multiple sessions working:
1. Run the test prompt from `TEST-PROMPT.md`
2. Try building a real project together
3. Experiment with different message types
4. Test task dependencies and delegation
5. Simulate blocker scenarios

Happy collaborating! 🤖🤝🤖
