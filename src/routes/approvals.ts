import { ApprovalHistory, ApproveRequest, Env } from '../types';

export async function handleApprove(request: Request, env: Env): Promise<Response> {
  const { username, points, reason, approved_by } = await request.json() as ApproveRequest;

  // First, get or create user
  const userResult = await env.DB.prepare(
    "SELECT id FROM users WHERE username = ?"
  ).bind(username).all<{ id: number }>();

  let userId: number;

  if (!userResult.results?.length) {
    // Create new user
    const newUserResult = await env.DB.prepare(
      "INSERT INTO users (username) VALUES (?) RETURNING id"
    ).bind(username).all<{ id: number }>();

    if (!newUserResult.success || !newUserResult.results?.[0]) {
      throw new Error("Failed to create user");
    }
    userId = newUserResult.results[0].id;
  } else {
    userId = userResult.results[0].id;
  }

  // Record approval and update points
  const updateResult = await env.DB.batch([
    env.DB.prepare(`
      INSERT INTO approvals (
        user_id, points_awarded, reason, approved_by
      ) VALUES (?, ?, ?, ?)
    `).bind(userId, points, reason, approved_by),
    env.DB.prepare(`
      UPDATE users 
      SET points = points + ?, 
          updated_at = DATETIME('now')
      WHERE id = ?
    `).bind(points, userId)
  ]);

  if (!updateResult.every(r => r.success)) {
    throw new Error("Failed to record approval");
  }

  return new Response(JSON.stringify({ 
    success: true,
    meta: {
      changes: updateResult.reduce((acc, r) => acc + r.meta.changes, 0)
    }
  }), {
    headers: { "content-type": "application/json" },
  });
}

export async function handleListApprovals(request: Request, env: Env): Promise<Response> {
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
      a.points_awarded,
      a.reason,
      a.approved_by,
      a.approved_at
    FROM approvals a 
    JOIN users u ON u.id = a.user_id 
    WHERE u.username = ?
    ORDER BY a.approved_at DESC
  `).bind(username).all<ApprovalHistory>();

  if (!result.success) {
    throw new Error("Failed to fetch approval history");
  }

  return new Response(JSON.stringify(result.results), {
    headers: { "content-type": "application/json" },
  });
}
