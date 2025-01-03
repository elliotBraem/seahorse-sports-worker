import { Env } from './types';
import { handleApprove, handleListApprovals } from './routes/approvals';
import { handleGetLeaderboard } from './routes/leaderboard';
import { 
  handleCreateQuest, 
  handleListQuests, 
  handleCompleteQuest, 
  handleListCompletedQuests 
} from './routes/quests';

export default {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Quest routes
      if (path === "/quests" && request.method === "POST") {
        return await handleCreateQuest(request, env);
      }
      if (path === "/quests" && request.method === "GET") {
        return await handleListQuests(env);
      }
      if (path === "/quests/complete" && request.method === "POST") {
        return await handleCompleteQuest(request, env);
      }
      if (path === "/quests/completed" && request.method === "GET") {
        return await handleListCompletedQuests(request, env);
      }

      // Approval routes
      if (path === "/approve" && request.method === "POST") {
        return await handleApprove(request, env);
      }
      if (path === "/history" && request.method === "GET") {
        return await handleListApprovals(request, env);
      }

      // Leaderboard routes
      if (path === "/leaderboard" && request.method === "GET") {
        return await handleGetLeaderboard(request, env);
      }

      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "content-type": "application/json" },
      });
    } catch (error) {
      console.error('[Error]', error);
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
