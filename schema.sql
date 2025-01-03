-- Core user table (identity)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    points INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quests table
CREATE TABLE quests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    points INTEGER NOT NULL,
    quest_type TEXT NOT NULL, -- 'daily', 'weekly', 'achievement', etc.
    requirements JSON, -- Store complex requirements as JSON
    start_date TIMESTAMP,
    end_date TIMESTAMP, -- NULL for permanent quests
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Quest completions
CREATE TABLE quest_completions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    quest_id INTEGER NOT NULL,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    points_awarded INTEGER NOT NULL,
    proof JSON, -- Store proof of completion (e.g., tweet ID, transaction hash)
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (quest_id) REFERENCES quests(id),
    UNIQUE(user_id, quest_id) -- Prevent duplicate completions unless quest_type allows it
);

-- Point approvals (for manual point awards)
CREATE TABLE approvals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    points_awarded INTEGER NOT NULL,
    reason TEXT, -- Description of why points were awarded
    approved_by TEXT NOT NULL, -- Admin/moderator who approved
    approved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Leaderboard snapshots (optional, for historical tracking)
CREATE TABLE leaderboard_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    snapshot_date DATE NOT NULL,
    snapshot_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    leaderboard JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_quest_completions_user_id ON quest_completions(user_id);
CREATE INDEX idx_quest_completions_quest_id ON quest_completions(quest_id);
CREATE INDEX idx_approvals_user_id ON approvals(user_id);
CREATE INDEX idx_leaderboard_snapshots_date ON leaderboard_snapshots(snapshot_date);