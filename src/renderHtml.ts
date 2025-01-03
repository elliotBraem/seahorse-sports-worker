interface LeaderboardEntry {
  twitter_handle: string;
  points: number;
}

export function renderHtml(leaderboard: LeaderboardEntry[]) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>D1</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      </head>

      <body>
        <header>
          <h1>🏆 Seahorse Sports Leaderboard</h1>
        </header>
        <main>
          <div class="leaderboard">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Twitter Handle</th>
                  <th>Points</th>
                </tr>
              </thead>
              <tbody>
                ${leaderboard.map((entry, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td><a href="https://twitter.com/${entry.twitter_handle}" target="_blank">@${entry.twitter_handle}</a></td>
                    <td>${entry.points}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <style>
            .leaderboard {
              margin: 2rem auto;
              max-width: 800px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            th, td {
              padding: 1rem;
              text-align: left;
              border-bottom: 1px solid #eee;
            }
            th {
              background: #f5f5f5;
              font-weight: 600;
            }
            tr:hover {
              background: #f9f9f9;
            }
            a {
              color: #0E838F;
              text-decoration: none;
            }
            a:hover {
              text-decoration: underline;
            }
          </style>
        </main>
      </body>
    </html>
`;
}
