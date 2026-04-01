# Agent Collaboration Plugin - Test Prompt

Copy and paste this prompt into OpenCode to test the collaboration plugin:

---

## Test Prompt

```
I have the Agent Collaboration Plugin installed. Let's test it by building a real project together with multiple agents collaborating as a team.

## Project: AI Question App

We're building an AI-powered question answering application with two versions:
1. **JavaScript Frontend**: Web app using the NVIDIA API for AI responses
2. **Python Terminal Version**: CLI-based chat application

### Requirements:
- Prompt user for NVIDIA API key on startup
- Allow user to select from available AI models
- Enable interactive chat/question-answering session
- Clean, user-friendly interface (web for JS, terminal for Python)

---

## Multi-Agent Collaboration Test

### Setup Instructions (Read Before Starting)
- **Each agent session should run this prompt independently**
- **Each agent MUST set a unique name** - coordinate with your team!
- **Suggested names**: LeadDev, FrontendDev, PythonDev, TestDev, etc.

### Agent Roles
- **Agent 1 (First Session)**: You are the **Lead Developer**. Set your name to "LeadDev"
- **Agent 2+ (Other Sessions)**: You are a **Developer**. Pick a unique name like "FrontendDev", "PythonDev", etc.

### IMPORTANT: Agent Naming & Communication Rules
1. **Set your name FIRST**: Use `agent.name` immediately - pick a unique name!
2. **Discover others**: Use `agent.discover` to find teammates
3. **Use display names**: Always use agent NAMES (not IDs) when sending messages
4. **Continuous conversation loop**: After each action, check your inbox and respond. Keep the conversation flowing!
5. **Poll regularly**: Between major tasks, check `agent.inbox` for new messages

Please perform the following steps:

### Step 1: Set Your Agent Name
Set a unique display name for yourself:
- Use `agent.name` with a descriptive name (e.g., "LeadDev", "FrontendDev", "PythonDev")
- Make sure your name is UNIQUE - no other agent should have the same name
- Report your name once set

### Step 2: Discover Available Agents
Check what other agents are active in the collaboration network:
- Use `agent.discover` to list all active agents
- Note their DISPLAY NAMES (use these for messaging, not their IDs)
- Report what agents are available and their capabilities
- If no other agents are found, broadcast a message inviting others to join and wait a moment

### Step 3: Create Project Tasks
Break down the project and create tasks for the team:

**Task 1**: "Setup NVIDIA API Integration"
- Description: "Create module to handle NVIDIA API authentication and model listing. Prompt user for API key and fetch available models."
- Dependencies: none

**Task 2**: "Build JavaScript Frontend"
- Description: "Create a simple web interface with HTML/CSS/JS that connects to NVIDIA API. Include model selector, chat input, and response display area."
- Dependencies: Task 1

**Task 3**: "Build Python Terminal App"
- Description: "Create a Python CLI application with prompt_toolkit or similar. Include API key prompt, model selection menu, and interactive chat loop."
- Dependencies: Task 1

**Task 4**: "Testing and Documentation"
- Description: "Test both applications, create README with setup instructions, and add example usage."
- Dependencies: Task 2, Task 3

Use `agent.task` with action "create" for each task and report all task IDs.

### Step 4: Broadcast Task Assignments
Announce the project to all agents:
- Use `agent.message` with:
  - to: "broadcast"
  - type: "task_request"
  - content: "New project: AI Question App with NVIDIA API. We're building both a JavaScript web frontend and Python terminal version. Check the task board for available tasks. Please claim a task based on your expertise!"
  - priority: "high"

### Step 5: Claim Lead Developer Tasks
As the lead developer, claim the integration and coordination work:
- Use `agent.task` to claim Task 1 (API Integration)
- Update it to "in_progress"
- Report your progress

### Step 6: Simulate Junior Developer Response
Simulate a junior agent responding to your broadcast:
- Use `agent.message` with:
  - to: "broadcast"
  - type: "solution_proposal"
  - content: "I can take on the Python terminal app! I'll use prompt_toolkit for a nice CLI experience with auto-completion for model names. Should I claim Task 3?"
  - priority: "medium"

### Step 7: Delegate and Coordinate
Respond to the junior agent and delegate:
- Use `agent.message` to approve and provide guidance:
  - to: "broadcast"
  - type: "status_update"
  - content: "Great! Please claim Task 3. Make sure to: 1) Store API key securely (don't hardcode), 2) Handle API errors gracefully, 3) Add a /models command to list available models mid-chat, 4) Include conversation history in API calls for context. Let me know if you hit any blockers!"
  - priority: "medium"

### Step 8: Check Inbox for Updates
Check if any agents have completed work or need help:
- Use `agent.inbox`
- Report any new messages

### Step 9: Update Project Status
Provide a project status update:
- Use `agent.task` with action "list" to show all tasks
- Use `agent.message` to broadcast:
  - to: "broadcast"
  - type: "status_update"
  - content: "Project update: API integration in progress. Python app claimed by team member. JavaScript frontend still available - who can take it? Remember to coordinate on the shared API module structure."
  - priority: "medium"

### Step 10: Handle Blockers (Simulation)
Simulate a junior developer hitting a blocker:
- Use `agent.message` as if from another agent:
  - to: "broadcast"
  - type: "blocker_report"
  - content: "BLOCKER on Task 3: Getting 401 errors from NVIDIA API even with valid key. Not sure if I'm formatting the authorization header correctly. Can someone review my approach?"
  - priority: "urgent"

### Step 11: Resolve Blocker
Help resolve the blocker:
- Use `agent.message` to provide solution:
  - to: "broadcast"
  - type: "solution_proposal"
  - content: "For the NVIDIA API, make sure you're using: headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}. Also check that your API key has the correct permissions. Here's a working example snippet: [provide code example]"
  - priority: "high"

### Step 12: Final Project Summary
Provide a comprehensive summary:
- List all tasks and their current status
- Summarize all messages exchanged
- Describe how the collaboration went
- Identify what worked well and what could be improved
- Suggest next steps for completing the project

---

This test will verify that:
✅ Agent naming and identity works
✅ Agent discovery with display names works
✅ Task breakdown and delegation works
✅ Lead agent can coordinate junior developers
✅ Blocker reporting and resolution works
✅ Multi-agent collaboration on real project works
✅ Task dependencies are tracked
✅ Communication flows effectively between agents

### IMPORTANT: Continuous Conversation Loop
Throughout this test, maintain an active conversation loop:
1. After each action, check `agent.inbox` for new messages
2. Respond to any messages using `agent.message`
3. Don't wait for instructions - proactively check and respond
4. If no new messages, send a status update to keep the conversation flowing
5. Think of this as a real team chat - keep checking and responding!
```

---

## Expected Behavior

When you run this prompt, you should see:

1. **Agent Discovery**: The plugin will show your current agent ID and any other active agents
2. **Message System**: Messages will be written to `.opencode/collaboration/messages.json`
3. **Task Board**: Tasks will be created and tracked in `.opencode/collaboration/tasks.json`
4. **Agent Registry**: Your agent will be registered in `.opencode/collaboration/agents.json`

## Testing with Multiple Agents

To truly test multi-agent collaboration:

1. **Open multiple OpenCode sessions** in the same project directory
2. **Run the test prompt in each session**
3. **Agents should be able to**:
   - Discover each other via `agent.discover`
   - Send messages to specific agents or broadcast
   - Share tasks and coordinate work
   - See each other's status updates

## Verification Commands

You can verify the plugin is working by checking the collaboration files:

```bash
# Check registered agents
cat .opencode/collaboration/agents.json

# View all messages
cat .opencode/collaboration/messages.json

# View task board
cat .opencode/collaboration/tasks.json
```

## Troubleshooting

If agents don't see each other:
- Ensure both sessions are in the same project directory
- Verify the plugin is loaded in both sessions
- Check that `.opencode/collaboration/` directory exists and is writable
- Run `agent.discover` in both sessions to confirm registration
