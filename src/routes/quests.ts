import {
  CompleteQuestRequest,
  CreateQuestRequest,
  Env,
  Quest,
  QuestCompletion,
  User
} from '../types';

export async function handleCreateQuest(request: Request, env: Env): Promise<Response> {
  const quest = await request.json() as CreateQuestRequest;

  const result = await env.DB.prepare(`
    INSERT INTO quests (
      title, description, points, quest_type, 
      requirements, start_date, end_date
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `).bind(
    quest.title,
    quest.description,
    quest.points,
    quest.quest_type,
    JSON.stringify(quest.requirements),
    quest.start_date || null,
    quest.end_date || null
  ).all<{ id: number }>();

  if (!result.success) {
    throw new Error("Failed to create quest");
  }

  return new Response(JSON.stringify(result.results![0]), {
    headers: { "content-type": "application/json" },
  });
}

export async function handleListQuests(env: Env): Promise<Response> {
  const result = await env.DB.prepare(`
    SELECT id, title, description, points, quest_type, 
           requirements, start_date, end_date
    FROM quests
    WHERE (start_date IS NULL OR start_date <= DATETIME('now'))
    AND (end_date IS NULL OR end_date >= DATETIME('now'))
    ORDER BY created_at DESC
  `).all<Quest>();

  if (!result.success) {
    throw new Error("Failed to fetch quests");
  }

  return new Response(JSON.stringify(result.results), {
    headers: { "content-type": "application/json" },
  });
}

export async function handleCompleteQuest(request: Request, env: Env): Promise<Response> {
  const completion = await request.json() as CompleteQuestRequest;

  // Get user ID and verify quest exists
  const results = await env.DB.batch([
    env.DB.prepare("SELECT id FROM users WHERE username = ?").bind(completion.username),
    env.DB.prepare("SELECT points FROM quests WHERE id = ?").bind(completion.quest_id)
  ]);

  const [userResult, questResult] = results;

  if (!userResult.success || !questResult.success || !userResult.results?.[0] || !questResult.results?.[0]) {
    return new Response(
      JSON.stringify({ error: "Invalid username or quest ID" }),
      { status: 400, headers: { "content-type": "application/json" } }
    );
  }

  const userId = (userResult.results[0] as User).id;
  const questPoints = (questResult.results[0] as Quest).points;

  // Record completion and update points
  const updateResult = await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO quest_completions (
        user_id, quest_id, points_awarded, proof
      ) VALUES (?, ?, ?, ?)
    `).bind(
      userId,
      completion.quest_id,
      questPoints,
      JSON.stringify(completion.proof)
    ),
    env.DB.prepare(`
      UPDATE users 
      SET points = points + ?, 
          updated_at = DATETIME('now')
      WHERE id = ?
    `).bind(questPoints, userId)
  ]);

  if (!updateResult.every(r => r.success)) {
    throw new Error("Failed to record quest completion");
  }

  return new Response(JSON.stringify({
    success: true,
    meta: {
      points_awarded: questPoints,
      changes: updateResult.reduce((acc, r) => acc + r.meta.changes, 0)
    }
  }), {
    headers: { "content-type": "application/json" },
  });
}

export async function handleListCompletedQuests(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const username = url.searchParams.get("username");
  if (!username) {
    return new Response(
      JSON.stringify({ error: "username parameter required" }),
      {
        status: 400,
        headers: { "content-type": "application/json" },
      }
    );
  }

  const result = await env.DB.prepare(`
    SELECT 
      q.title,
      q.description,
      qc.points_awarded,
      qc.completed_at,
      qc.proof
    FROM quest_completions qc
    JOIN quests q ON q.id = qc.quest_id
    JOIN users u ON u.id = qc.user_id
    WHERE u.username = ?
    ORDER BY qc.completed_at DESC
  `).bind(username).all<QuestCompletion>();

  if (!result.success) {
    throw new Error("Failed to fetch completed quests");
  }

  return new Response(JSON.stringify(result.results), {
    headers: { "content-type": "application/json" },
  });
}
