import { renderHtml } from "./renderHtml";

interface ApproveRequest {
  twitter_handle: string;
}

interface LeaderboardEntry {
  twitter_handle: string;
  points: number;
}

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Record an approval (100 points)
      if (path === "/approve" && request.method === "POST") {
        const { twitter_handle } = await request.json() as ApproveRequest;

        // First, get or create user
        let userStmt = env.DB.prepare("SELECT id FROM users WHERE twitter_handle = ?").bind(twitter_handle);
        let { results: userResults } = await userStmt.all();
        let userId;

        if (userResults.length === 0) {
          // Create new user
          const insertUserStmt = env.DB.prepare(
            "INSERT INTO users (twitter_handle) VALUES (?) RETURNING id"
          ).bind(twitter_handle);
          const { results: newUser } = await insertUserStmt.all();
          userId = newUser[0].id;
        } else {
          userId = userResults[0].id;
        }

        // Record approval and update points
        await env.DB.batch([
          env.DB.prepare(
            "INSERT INTO approvals (user_id, points_awarded) VALUES (?, ?)"
          ).bind(userId, 100),
          env.DB.prepare(
            "UPDATE users SET points = points + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
          ).bind(100, userId)
        ]);

        return new Response(JSON.stringify({ success: true }), {
          headers: { "content-type": "application/json" },
        });
      }

      // Get leaderboard
      if (path === "/leaderboard" && request.method === "GET") {
        const stmt = env.DB.prepare(
          "SELECT twitter_handle, points FROM users ORDER BY points DESC LIMIT 10"
        );
        const { results } = await stmt.all() as { results: LeaderboardEntry[] };

        // Return HTML for browser requests, JSON for API requests
        const accept = request.headers.get("accept") || "";
        if (accept.includes("text/html")) {
          return new Response(renderHtml(results), {
            headers: { "content-type": "text/html" },
          });
        }

        return new Response(JSON.stringify(results), {
          headers: { "content-type": "application/json" },
        });
      }

      // Get user approval history
      if (path === "/history" && request.method === "GET") {
        const twitter_handle = url.searchParams.get("twitter_handle");
        if (!twitter_handle) {
          return new Response(
            JSON.stringify({ error: "twitter_handle parameter required" }),
            {
              status: 400,
              headers: { "content-type": "application/json" },
            }
          );
        }

        const stmt = env.DB.prepare(`
          SELECT a.points_awarded, a.approved_at 
          FROM approvals a 
          JOIN users u ON u.id = a.user_id 
          WHERE u.twitter_handle = ?
          ORDER BY a.approved_at DESC
        `).bind(twitter_handle);

        const { results } = await stmt.all();

        return new Response(JSON.stringify(results), {
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      return new Response(
        JSON.stringify({ error: errorMessage }),
        {
          status: 500,
          headers: { "content-type": "application/json" },
        }
      );
    }
  },
} satisfies ExportedHandler<Env>;
