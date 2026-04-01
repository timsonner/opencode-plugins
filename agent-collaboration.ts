import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { z } from "zod"
import { $ } from "bun"

// Collaboration message types
type MessageType = "task_request" | "task_update" | "help_request" | "solution_proposal" | "status_update" | "blocker_report"

interface CollaborationMessage {
  id: string
  from: string
  to: string | "broadcast"
  type: MessageType
  content: string
  timestamp: number
  taskId?: string
  priority: "low" | "medium" | "high" | "urgent"
  metadata?: Record<string, any>
}

interface TaskBoard {
  [taskId: string]: {
    id: string
    title: string
    description: string
    assignedTo: string
    status: "pending" | "in_progress" | "blocked" | "completed"
    dependencies: string[]
    createdAt: number
    updatedAt: number
  }
}

// Message storage path
const COLLAB_DIR = ".opencode/collaboration"
const MESSAGES_FILE = `${COLLAB_DIR}/messages.json`
const TASKS_FILE = `${COLLAB_DIR}/tasks.json`
const AGENTS_FILE = `${COLLAB_DIR}/agents.json`

// Helper to read/write collaboration files
async function readCollabFile<T>(path: string, defaultValue: T): Promise<T> {
  try {
    const content = await $`cat ${path}`.text()
    return JSON.parse(content)
  } catch {
    return defaultValue
  }
}

async function writeCollabFile(path: string, data: any): Promise<void> {
  await $`mkdir -p ${COLLAB_DIR}`
  await Bun.write(path, JSON.stringify(data, null, 2))
}

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Get current agent identity from session - uses PID for uniqueness across sessions
function getAgentId(sessionId: string): string {
  const pid = typeof process !== 'undefined' ? process.pid : Math.floor(Math.random() * 10000)
  return `agent-${sessionId.substr(0, 8)}-${pid}`
}

// Stale agent threshold in milliseconds (5 minutes)
const STALE_THRESHOLD = 5 * 60 * 1000

// Clean up stale agents that haven't been active recently
async function cleanupStaleAgents(): Promise<void> {
  const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
  const now = Date.now()
  let changed = false
  
  for (const [id, agent] of Object.entries(agents)) {
    const a = agent as any
    if (a.status === "active" && (now - a.lastActive) > STALE_THRESHOLD) {
      agents[id].status = "stale"
      changed = true
    }
  }
  
  if (changed) {
    await writeCollabFile(AGENTS_FILE, agents)
  }
}

export const AgentCollaborationPlugin: Plugin = async ({ project, client, $, directory, worktree }) => {
  const sessionId = project?.id || "unknown"
  const agentId = getAgentId(sessionId)

  // Initialize collaboration directory
  await $`mkdir -p ${COLLAB_DIR}`

  // Register agent on startup
  await cleanupStaleAgents()
  const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
  agents[agentId] = {
    id: agentId,
    name: agentId, // Default name is the agent ID
    sessionId,
    registeredAt: Date.now(),
    lastActive: Date.now(),
    capabilities: ["task_execution", "problem_solving", "code_review"],
    status: "active"
  }
  await writeCollabFile(AGENTS_FILE, agents)

  // Inject collaboration instructions into session context
  await client.app.log({
    body: {
      service: "agent-collaboration",
      level: "info",
      message: `Agent ${agentId} registered for collaboration. IMPORTANT: Use the agent.name tool to set a unique display name (e.g., "LeadDev", "FrontendDev", "PythonDev") so other agents can identify you. Then use agent.discover to find other agents.`,
      extra: { sessionId, agentId }
    }
  })

  return {
    // Register custom collaboration tools
    tool: {
      // Tool for agents to set their display name
      "agent.name": tool({
        description: `Set your display name for the collaboration network. Use a unique, memorable name like "LeadDev", "FrontendAgent", "PythonDev", etc. This name will be shown to other agents instead of your agent ID.`,
        args: {
          name: tool.schema.string().describe("Your display name - should be unique and descriptive")
        },
        async execute(args, context) {
          const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
          if (agents[agentId]) {
            agents[agentId].name = args.name
            agents[agentId].lastActive = Date.now()
            await writeCollabFile(AGENTS_FILE, agents)
            return JSON.stringify({
              success: true,
              agentId,
              name: args.name,
              message: `Your display name is now "${args.name}". Other agents will see this name in messages and discovery.`
            }, null, 2)
          }
          return JSON.stringify({ success: false, error: "Agent not registered" }, null, 2)
        }
      }),

      // Tool for agents to send messages to each other
      "agent.message": tool({
        description: `Send a message to another agent or broadcast to all agents. Use this to:
- Request help with a specific task or problem
- Share solutions or insights
- Report blockers or dependencies
- Coordinate work on shared tasks
- Ask for code review or feedback

IMPORTANT: Always use agent DISPLAY NAMES (not agent IDs) in the "to" field. Use agent.discover to find names.

Message types:
- task_request: Request another agent to take on a task
- task_update: Update on task progress
- help_request: Ask for help with a problem
- solution_proposal: Share a solution or approach
- status_update: General status update
- blocker_report: Report something blocking progress`,
        args: {
          to: tool.schema.string().describe("Target agent DISPLAY NAME or 'broadcast' for all agents"),
          type: tool.schema.enum(["task_request", "task_update", "help_request", "solution_proposal", "status_update", "blocker_report"]).describe("Type of message"),
          content: tool.schema.string().describe("Message content - be specific and include relevant context"),
          taskId: tool.schema.string().optional().describe("Associated task ID if applicable"),
          priority: tool.schema.enum(["low", "medium", "high", "urgent"]).default("medium").describe("Message priority level")
        },
        async execute(args, context) {
          const messages = await readCollabFile<CollaborationMessage[]>(MESSAGES_FILE, [])
          const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
          
          // Resolve display name to agent ID
          let targetId = args.to
          if (args.to !== "broadcast") {
            const targetAgent = Object.values(agents).find((a: any) => a.name === args.to)
            if (targetAgent) {
              targetId = (targetAgent as any).id
            }
          }
          
          const message: CollaborationMessage = {
            id: generateId(),
            from: agentId,
            to: targetId,
            type: args.type as MessageType,
            content: args.content,
            timestamp: Date.now(),
            taskId: args.taskId,
            priority: args.priority as any,
            metadata: {
              directory,
              worktree,
              fromName: agents[agentId]?.name || agentId,
              toName: args.to
            }
          }

          messages.push(message)
          await writeCollabFile(MESSAGES_FILE, messages)

          return JSON.stringify({
            success: true,
            messageId: message.id,
            sentTo: args.to,
            timestamp: message.timestamp,
            note: args.to === "broadcast" 
              ? "Message sent to all agents" 
              : `Message queued for agent "${args.to}"`
          }, null, 2)
        }
      }),

      // Tool for agents to check for new messages
      "agent.inbox": tool({
        description: `Check your message inbox for new messages from other agents. Returns messages with sender display names.

IMPORTANT: After checking inbox, if you have messages to respond to, use agent.message to reply. Keep the conversation going!`,
        args: {
          type: tool.schema.enum(["task_request", "task_update", "help_request", "solution_proposal", "status_update", "blocker_report"]).optional().describe("Filter by message type"),
          priority: tool.schema.enum(["low", "medium", "high", "urgent"]).optional().describe("Filter by priority"),
          limit: tool.schema.number().default(10).describe("Maximum number of messages to return")
        },
        async execute(args, context) {
          const messages = await readCollabFile<CollaborationMessage[]>(MESSAGES_FILE, [])
          const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
          
          // Filter messages for this agent
          const inbox = messages
            .filter(m => m.to === agentId || m.to === "broadcast")
            .filter(m => !args.type || m.type === args.type)
            .filter(m => !args.priority || m.priority === args.priority)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, args.limit || 10)

          return JSON.stringify({
            agentId,
            yourName: agents[agentId]?.name || agentId,
            messageCount: inbox.length,
            messages: inbox.map(m => ({
              id: m.id,
              from: m.from,
              fromName: m.metadata?.fromName || m.from,
              type: m.type,
              priority: m.priority,
              content: m.content,
              timestamp: m.timestamp,
              taskId: m.taskId
            }))
          }, null, 2)
        }
      }),

      // Tool for creating and managing shared tasks
      "agent.task": tool({
        description: `Create, update, or query shared tasks that multiple agents can work on.
Actions:
- create: Create a new task for agents to claim
- update: Update task status or details
- list: List all tasks and their status
- claim: Claim a task to work on
- complete: Mark a task as completed`,
        args: {
          action: tool.schema.enum(["create", "update", "list", "claim", "complete"]).describe("Action to perform"),
          taskId: tool.schema.string().optional().describe("Task ID for update/claim/complete actions"),
          title: tool.schema.string().optional().describe("Task title (for create)"),
          description: tool.schema.string().optional().describe("Task description (for create/update)"),
          status: tool.schema.enum(["pending", "in_progress", "blocked", "completed"]).optional().describe("Task status (for update)"),
          dependencies: tool.schema.array(tool.schema.string()).optional().describe("Task IDs this task depends on")
        },
        async execute(args, context) {
          const tasks = await readCollabFile<TaskBoard>(TASKS_FILE, {})

          switch (args.action) {
            case "create": {
              const taskId = generateId()
              tasks[taskId] = {
                id: taskId,
                title: args.title || "Untitled Task",
                description: args.description || "",
                assignedTo: agentId,
                status: "pending",
                dependencies: args.dependencies || [],
                createdAt: Date.now(),
                updatedAt: Date.now()
              }
              await writeCollabFile(TASKS_FILE, tasks)
              return JSON.stringify({ success: true, taskId, task: tasks[taskId] }, null, 2)
            }

            case "update": {
              if (!args.taskId || !tasks[args.taskId]) {
                return JSON.stringify({ success: false, error: "Task not found" }, null, 2)
              }
              const task = tasks[args.taskId]
              if (args.title) task.title = args.title
              if (args.description) task.description = args.description
              if (args.status) task.status = args.status
              task.updatedAt = Date.now()
              await writeCollabFile(TASKS_FILE, tasks)
              return JSON.stringify({ success: true, task }, null, 2)
            }

            case "list": {
              return JSON.stringify({
                tasks: Object.values(tasks).map(t => ({
                  id: t.id,
                  title: t.title,
                  assignedTo: t.assignedTo,
                  status: t.status,
                  dependencies: t.dependencies
                }))
              }, null, 2)
            }

            case "claim": {
              if (!args.taskId || !tasks[args.taskId]) {
                return JSON.stringify({ success: false, error: "Task not found" }, null, 2)
              }
              tasks[args.taskId].assignedTo = agentId
              tasks[args.taskId].status = "in_progress"
              tasks[args.taskId].updatedAt = Date.now()
              await writeCollabFile(TASKS_FILE, tasks)
              return JSON.stringify({ success: true, task: tasks[args.taskId] }, null, 2)
            }

            case "complete": {
              if (!args.taskId || !tasks[args.taskId]) {
                return JSON.stringify({ success: false, error: "Task not found" }, null, 2)
              }
              tasks[args.taskId].status = "completed"
              tasks[args.taskId].updatedAt = Date.now()
              await writeCollabFile(TASKS_FILE, tasks)
              return JSON.stringify({ success: true, task: tasks[args.taskId] }, null, 2)
            }

            default:
              return JSON.stringify({ success: false, error: "Unknown action" }, null, 2)
          }
        }
      }),

      // Tool for agents to discover other active agents
      "agent.discover": tool({
        description: `Discover other active agents in the collaboration network. Returns list of agents with their DISPLAY NAMES, capabilities and status.

IMPORTANT: Use the "name" field (not "id") when sending messages to specific agents.`,
        args: {
          capability: tool.schema.string().optional().describe("Filter agents by capability")
        },
        async execute(args, context) {
          // Clean up stale agents before discovery
          await cleanupStaleAgents()
          
          const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
          
          const activeAgents = Object.values(agents)
            .filter((a: any) => a.status === "active")
            .filter((a: any) => !args.capability || a.capabilities?.includes(args.capability))
            .map((a: any) => ({
              id: a.id,
              name: a.name || a.id,
              sessionId: a.sessionId,
              capabilities: a.capabilities,
              lastActive: a.lastActive,
              status: a.status
            }))

          return JSON.stringify({
            currentAgent: agentId,
            activeAgents: activeAgents,
            totalAgents: activeAgents.length
          }, null, 2)
        }
      })
    },

    // Event hooks for collaboration
    "session.created": async (input: any, output: any) => {
      // Re-register agent when session is created
      const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
      agents[agentId] = {
        id: agentId,
        name: agents[agentId]?.name || agentId,
        sessionId,
        registeredAt: Date.now(),
        lastActive: Date.now(),
        capabilities: ["task_execution", "problem_solving", "code_review"],
        status: "active"
      }
      await writeCollabFile(AGENTS_FILE, agents)
    },

    "message.updated": async (input: any, output: any) => {
      // Track agent activity
      const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
      if (agents[agentId]) {
        agents[agentId].lastActive = Date.now()
        await writeCollabFile(AGENTS_FILE, agents)
      }
    },

    "session.updated": async (input: any, output: any) => {
      // Update agent status based on session state
      const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
      if (agents[agentId]) {
        agents[agentId].lastActive = Date.now()
        await writeCollabFile(AGENTS_FILE, agents)
      }
    },

    "session.idle": async (input: any, output: any) => {
      // Mark agent as idle when session is idle
      const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
      if (agents[agentId]) {
        agents[agentId].status = "idle"
        await writeCollabFile(AGENTS_FILE, agents)
      }
    },

    // Inject collaboration context during compaction
    "experimental.session.compacting": async (input, output) => {
      const tasks = await readCollabFile<TaskBoard>(TASKS_FILE, {})
      const activeTasks = Object.values(tasks).filter(t => t.status !== "completed")
      
      if (activeTasks.length > 0) {
        output.context.push(`
## Active Collaboration Tasks
${activeTasks.map(t => `- **${t.title}** (${t.id}): ${t.status} - Assigned to ${t.assignedTo}`).join('\n')}

Maintain awareness of these tasks and coordinate with other agents as needed.
`)
      }
    },

    // Tool execution hooks for collaboration awareness
    "tool.execute.before": async (input, output) => {
      // Add collaboration context to tool executions
      if (input.tool === "bash" || input.tool === "read") {
        const agents = await readCollabFile<Record<string, any>>(AGENTS_FILE, {})
        const activeAgentCount = Object.values(agents).filter((a: any) => a.status === "active").length
        
        if (activeAgentCount > 1) {
          // Inject collaboration reminder into command context
          output.args.command = `# ${activeAgentCount} agents active in collaboration network\n${output.args.command}`
        }
      }
    }
  }
}
