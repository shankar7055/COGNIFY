export type AgentStep = {

  thought: string;

  action?: string;

  observation?: any;

};

export type AgentState = {

  input: string;

  steps: AgentStep[];

};