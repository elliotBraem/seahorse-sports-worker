export interface Env {
  DB: D1Database;
}

// Quest Types
export interface CreateQuestRequest {
  title: string;
  description: string;
  points: number;
  quest_type: string;
  requirements: Record<string, any>;
  start_date?: string;
  end_date?: string;
}

export interface CompleteQuestRequest {
  username: string;
  quest_id: number;
  proof: Record<string, any>;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  points: number;
  quest_type: string;
  requirements: Record<string, any>;
  start_date: string | null;
  end_date: string | null;
}

export interface QuestCompletion {
  title: string;
  description: string;
  points_awarded: number;
  completed_at: string;
  proof: Record<string, any>;
}

// Approval Types
export interface ApproveRequest {
  username: string;
  points: number;
  reason: string;
  approved_by: string;
}

export interface ApprovalHistory {
  points_awarded: number;
  reason: string;
  approved_by: string;
  approved_at: string;
}

// User Types
export interface User {
  id: number;
  username: string;
  points: number;
  created_at: string;
  updated_at: string;
}

// Leaderboard Types
export interface LeaderboardEntry {
  username: string;
  points: number;
  updated_at: string;
}
