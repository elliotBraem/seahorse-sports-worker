import { Env, LeaderboardEntry } from '../types';
import { renderHtml } from '../renderHtml';

export async function handleGetLeaderboard(request: Request, env: Env): Promise<Response> {
  const result = await env.DB.prepare(`
    SELECT username, points, updated_at 
    FROM users 
    ORDER BY points DESC 
    LIMIT 10
  `).all<LeaderboardEntry>();

  if (!result.success) {
    throw new Error("Failed to fetch leaderboard");
  }

  // Return HTML for browser requests, JSON for API requests
  const accept = request.headers.get("accept") || "";
  if (accept.includes("text/html")) {
    return new Response(renderHtml(result.results!), {
      headers: { "content-type": "text/html" },
    });
  }

  return new Response(JSON.stringify(result.results), {
    headers: { "content-type": "application/json" },
  });
}
