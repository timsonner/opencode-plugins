# Agent Collaboration Plugin - Test Prompt

Copy and paste this prompt into OpenCode to test the collaboration plugin:

---

## Test Prompt

```
I have the Agent Collaboration Plugin installed. Let's test it by building a real project together with multiple agents acting as junior developers.

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

You are the **Lead Developer Agent**. Your role is to:
1. Break down the project into subtasks
2. Create tasks for junior developer agents
3. Delegate work and coordinate collaboration
4. Review and integrate completed work

Please perform the following steps:

### Step 1: Discover Available Agents
Check what other agents are active in the collaboration network:
- Use `agent.discover` to list all active agents
- Report what agents are available and their capabilities
- If no other agents are found, note that you'll need to work solo or request additional agents

### Step 2: Create Project Tasks
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

### Step 3: Broadcast Task Assignments
Announce the project to all agents:
- Use `agent.message` with:
  - to: "broadcast"
  - type: "task_request"
  - content: "New project: AI Question App with NVIDIA API. We're building both a JavaScript web frontend and Python terminal version. Check the task board for available tasks. Please claim a task based on your expertise!"
  - priority: "high"

### Step 4: Claim Lead Developer Tasks
As the lead developer, claim the integration and coordination work:
- Use `agent.task` to claim Task 1 (API Integration)
- Update it to "in_progress"
- Report your progress

### Step 5: Simulate Junior Developer Response
Simulate a junior agent responding to your broadcast:
- Use `agent.message` with:
  - to: "broadcast"
  - type: "solution_proposal"
  - content: "I can take on the Python terminal app! I'll use prompt_toolkit for a nice CLI experience with auto-completion for model names. Should I claim Task 3?"
  - priority: "medium"

### Step 6: Delegate and Coordinate
Respond to the junior agent and delegate:
- Use `agent.message` to approve and provide guidance:
  - to: "broadcast"
  - type: "status_update"
  - content: "Great! Please claim Task 3. Make sure to: 1) Store API key securely (don't hardcode), 2) Handle API errors gracefully, 3) Add a /models command to list available models mid-chat, 4) Include conversation history in API calls for context. Let me know if you hit any blockers!"
  - priority: "medium"

### Step 7: Check Inbox for Updates
Check if any agents have completed work or need help:
- Use `agent.inbox`
- Report any new messages

### Step 8: Update Project Status
Provide a project status update:
- Use `agent.task` with action "list" to show all tasks
- Use `agent.message` to broadcast:
  - to: "broadcast"
  - type: "status_update"
  - content: "Project update: API integration in progress. Python app claimed by team member. JavaScript frontend still available - who can take it? Remember to coordinate on the shared API module structure."
  - priority: "medium"

### Step 9: Handle Blockers (Simulation)
Simulate a junior developer hitting a blocker:
- Use `agent.message` as if from another agent:
  - to: "broadcast"
  - type: "blocker_report"
  - content: "BLOCKER on Task 3: Getting 401 errors from NVIDIA API even with valid key. Not sure if I'm formatting the authorization header correctly. Can someone review my approach?"
  - priority: "urgent"

### Step 10: Resolve Blocker
Help resolve the blocker:
- Use `agent.message` to provide solution:
  - to: "broadcast"
  - type: "solution_proposal"
  - content: "For the NVIDIA API, make sure you're using: headers = {'Authorization': f'Bearer {api_key}', 'Content-Type': 'application/json'}. Also check that your API key has the correct permissions. Here's a working example snippet: [provide code example]"
  - priority: "high"

### Step 11: Final Project Summary
Provide a comprehensive summary:
- List all tasks and their current status
- Summarize all messages exchanged
- Describe how the collaboration went
- Identify what worked well and what could be improved
- Suggest next steps for completing the project

---

This test will verify that:
✅ Agent discovery and capability assessment works
✅ Task breakdown and delegation works
✅ Lead agent can coordinate junior developers
✅ Blocker reporting and resolution works
✅ Multi-agent collaboration on real project works
✅ Task dependencies are tracked
✅ Communication flows effectively between agents
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
