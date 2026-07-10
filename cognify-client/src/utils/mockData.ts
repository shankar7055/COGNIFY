export interface Workspace {
  id: string;
  name: string;
  description: string;
  membersCount: number;
  activeAgentsCount: number;
  filesCount: number;
  lastActivity: string;
  tags: string[];
}

export interface Agent {
  id: string;
  name: string;
  type: string;
  description: string;
  usageCount: number;
  requestsCount: number;
  successRate: number;
  performanceScore: number;
  systemPrompt: string;
  temperature: number;
  model: string;
  tools: string[];
  memoryType: string;
  keywords: string[];
}

export interface FileItem {
  id: string;
  filename: string;
  size: string;
  mimetype: string;
  uploadedAt: string;
  status: 'Embedded' | 'Indexing' | 'Failed';
  tags: string[];
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  triggers: string;
  lastTriggered: string;
  nodesCount: number;
  successRate: number;
  history: Array<{
    id: string;
    timestamp: string;
    trigger: string;
    status: 'Success' | 'Failed';
    latencyMs: number;
  }>;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Viewer';
  avatar: string;
  joinedAt: string;
  activity: string;
}

// Mock Data (Cleared for production backend persistence)
export const mockStats = {
  totalRequests: 0,
  activeWorkspaces: 0,
  monthlyUsage: "0 GB",
  tokensConsumed: 0,
  costSavedUSD: 0,
  teamMembersCount: 0,
};

export const dailyRequestsTrend: any[] = [];

export const agentUsageDistribution: any[] = [];

export const recentConversations: any[] = [];

export const mockWorkspaces: Workspace[] = [];

export const mockAgents: Agent[] = [];

export const mockFiles: FileItem[] = [];

export const mockWorkflows: Workflow[] = [];

export const mockTeamMembers: TeamMember[] = [];

