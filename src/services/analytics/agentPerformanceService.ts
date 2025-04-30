
import { getStorageItem, setStorageItem } from '../storage/localStorageService';
import { getCurrentUserEmail } from '../user/userService';

// Storage key for performance data
export const AGENT_PERFORMANCE_KEY = 'agent_performance';

// Interface for agent performance metrics
export interface AgentPerformanceMetrics {
  sales: number;
  appointments: number;
  conversions: number;
  responseTime: number; // average in seconds
  messagesReceived: number;
  leadsGenerated: number;
  formsCompleted: number;
  startDate: string; // ISO date string
  aiModel: 'gptomini' | 'claude-3-sonnet' | 'deepseek-r1' | 'gemini-2' | string;
  // Daily metrics for charting
  dailyMetrics: {
    date: string; // ISO date string
    sales: number;
    appointments: number;
    conversions: number;
    messagesReceived: number;
    leadsGenerated: number;
  }[];
}

// Interface for full agent performance data
export interface AgentPerformance {
  agentId: string;
  agentName: string;
  userEmail: string;
  metrics: AgentPerformanceMetrics;
  lastUpdated: string; // ISO date string
}

/**
 * Get all agent performance data
 */
export const getAllAgentPerformance = (): Record<string, AgentPerformance> => {
  return getStorageItem<Record<string, AgentPerformance>>(AGENT_PERFORMANCE_KEY, {});
};

/**
 * Get performance data for a specific agent
 */
export const getAgentPerformance = (agentId: string): AgentPerformance | null => {
  const allPerformance = getAllAgentPerformance();
  return allPerformance[agentId] || null;
};

/**
 * Initialize performance data for a new agent
 */
export const initializeAgentPerformance = (
  agentId: string, 
  agentName: string, 
  aiModel: string = 'gptomini'
): AgentPerformance => {
  const userEmail = getCurrentUserEmail();
  const today = new Date().toISOString();
  
  // Create default performance metrics
  const newPerformance: AgentPerformance = {
    agentId,
    agentName,
    userEmail,
    metrics: {
      sales: 0,
      appointments: 0,
      conversions: 0,
      responseTime: 0,
      messagesReceived: 0,
      leadsGenerated: 0,
      formsCompleted: 0,
      startDate: today,
      aiModel,
      dailyMetrics: [
        {
          date: today,
          sales: 0,
          appointments: 0,
          conversions: 0,
          messagesReceived: 0,
          leadsGenerated: 0
        }
      ]
    },
    lastUpdated: today
  };
  
  // Save the new performance data
  const allPerformance = getAllAgentPerformance();
  allPerformance[agentId] = newPerformance;
  setStorageItem(AGENT_PERFORMANCE_KEY, allPerformance);
  
  return newPerformance;
};

/**
 * Update performance metrics for an agent
 */
export const updateAgentPerformance = (
  agentId: string, 
  metrics: Partial<AgentPerformanceMetrics>
): AgentPerformance => {
  const allPerformance = getAllAgentPerformance();
  let agentPerformance = allPerformance[agentId];
  
  // If agent performance doesn't exist yet, initialize it
  if (!agentPerformance) {
    // We need agent name to initialize, so we'll use a placeholder
    agentPerformance = initializeAgentPerformance(agentId, `Agent ${agentId.slice(-4)}`);
  }
  
  // Update the metrics
  agentPerformance.metrics = {
    ...agentPerformance.metrics,
    ...metrics
  };
  
  // Update today's daily metrics or add a new entry
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const todayMetricsIndex = agentPerformance.metrics.dailyMetrics
    .findIndex(dm => dm.date.startsWith(today));
  
  if (todayMetricsIndex >= 0) {
    // Update existing entry for today
    const dailyMetrics = agentPerformance.metrics.dailyMetrics[todayMetricsIndex];
    agentPerformance.metrics.dailyMetrics[todayMetricsIndex] = {
      ...dailyMetrics,
      sales: metrics.sales !== undefined ? metrics.sales : dailyMetrics.sales,
      appointments: metrics.appointments !== undefined ? metrics.appointments : dailyMetrics.appointments,
      conversions: metrics.conversions !== undefined ? metrics.conversions : dailyMetrics.conversions,
      messagesReceived: metrics.messagesReceived !== undefined ? metrics.messagesReceived : dailyMetrics.messagesReceived,
      leadsGenerated: metrics.leadsGenerated !== undefined ? metrics.leadsGenerated : dailyMetrics.leadsGenerated
    };
  } else {
    // Add new entry for today
    agentPerformance.metrics.dailyMetrics.push({
      date: new Date().toISOString(),
      sales: metrics.sales || 0,
      appointments: metrics.appointments || 0,
      conversions: metrics.conversions || 0,
      messagesReceived: metrics.messagesReceived || 0,
      leadsGenerated: metrics.leadsGenerated || 0
    });
  }
  
  // Update last updated timestamp
  agentPerformance.lastUpdated = new Date().toISOString();
  
  // Save updated performance data
  allPerformance[agentId] = agentPerformance;
  setStorageItem(AGENT_PERFORMANCE_KEY, allPerformance);
  
  return agentPerformance;
};

/**
 * Get performance data for all agents belonging to the current user
 */
export const getUserAgentsPerformance = (): AgentPerformance[] => {
  const userEmail = getCurrentUserEmail();
  const allPerformance = getAllAgentPerformance();
  
  return Object.values(allPerformance).filter(
    performance => performance.userEmail === userEmail
  );
};

/**
 * Add performance event (e.g., new sale, new lead, etc.)
 */
export const addPerformanceEvent = (
  agentId: string,
  eventType: keyof AgentPerformanceMetrics,
  value: number = 1
): void => {
  const allPerformance = getAllAgentPerformance();
  const agentPerformance = allPerformance[agentId];
  
  if (!agentPerformance) {
    return;
  }
  
  // Update the specific metric
  if (typeof agentPerformance.metrics[eventType] === 'number') {
    (agentPerformance.metrics[eventType] as number) += value;
  }
  
  // If this is a daily metric, update it
  const dailyMetricKeys = ['sales', 'appointments', 'conversions', 'messagesReceived', 'leadsGenerated'];
  if (dailyMetricKeys.includes(eventType)) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const todayMetricsIndex = agentPerformance.metrics.dailyMetrics
      .findIndex(dm => dm.date.startsWith(today));
      
    if (todayMetricsIndex >= 0) {
      // Update existing entry for today
      (agentPerformance.metrics.dailyMetrics[todayMetricsIndex][eventType as keyof typeof agentPerformance.metrics.dailyMetrics[0]] as number) += value;
    } else {
      // Add new entry for today with just this metric updated
      const newDailyMetric = {
        date: new Date().toISOString(),
        sales: 0,
        appointments: 0,
        conversions: 0,
        messagesReceived: 0,
        leadsGenerated: 0
      };
      (newDailyMetric[eventType as keyof typeof newDailyMetric] as number) = value;
      agentPerformance.metrics.dailyMetrics.push(newDailyMetric);
    }
  }
  
  // Update last updated timestamp
  agentPerformance.lastUpdated = new Date().toISOString();
  
  // Save updated performance data
  allPerformance[agentId] = agentPerformance;
  setStorageItem(AGENT_PERFORMANCE_KEY, allPerformance);
};

/**
 * Update AI model being used by the agent
 */
export const updateAgentAiModel = (agentId: string, aiModel: string): void => {
  updateAgentPerformance(agentId, { aiModel });
};
