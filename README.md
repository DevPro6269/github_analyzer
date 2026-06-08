# GitHub Analyzer API

A Node.js/Express backend that analyzes GitHub user profiles and stores insights in MySQL.

## Live API

`https://githubanalyzer-production-f230.up.railway.app`

## Tech Stack

- Node.js + Express.js
- MySQL (mysql2)
- GitHub REST API v3

## Local Setup

### Prerequisites

- Node.js 18+
- MySQL 8+

### Steps

1. Clone the repo
   ```bash
   git clone <repo-url>
   cd github-analyzer
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create the database and table
   ```bash
   mysql -u root -p < schema.sql
   ```

4. Configure environment variables
   ```bash
   cp .env.example .env
   # Edit .env with your MySQL credentials
   ```

5. (Optional) Add a GitHub Personal Access Token to `.env` for higher rate limits (5000 req/hr vs 60)
   ```
   GITHUB_TOKEN=your_token_here
   ```

6. Start the server
   ```bash
   npm run dev
   ```

## API Endpoints

### POST /api/analyze/:username
Fetch and store a GitHub user's profile insights. Returns `status: "fresh"` on new data, `status: "cached"` if analyzed within 24 hours.

```bash
curl -X POST http://localhost:3000/api/analyze/torvalds
```

**Response:**
```json
{
  "status": "fresh",
  "data": {
    "username": "torvalds",
    "name": "Linus Torvalds",
    "public_repos": 12,
    "followers": 180000,
    "top_language": "C",
    "most_starred_repo": "linux",
    "most_starred_count": 180000,
    "total_stars": 183000,
    "account_age_days": 5840,
    "last_analyzed_at": "2026-06-08T10:00:00.000Z"
  }
}
```

### GET /api/profiles
List all analyzed profiles (summary view).

```bash
curl http://localhost:3000/api/profiles
```

### GET /api/profiles/:username
Get full stored data for a single profile.

```bash
curl http://localhost:3000/api/profiles/torvalds
```

### GET /health
Health check (used by Railway).

```bash
curl http://localhost:3000/health
```

## Error Responses

All errors return `{ "error": "message" }` with the appropriate HTTP status.

| Status | Scenario |
|--------|----------|
| 400 | Invalid username format |
| 404 | GitHub user not found / profile not yet analyzed |
| 429 | GitHub API rate limit exceeded |
| 502 | GitHub API unreachable |
| 500 | Internal server error |

## Database Schema

See `schema.sql` for the full schema export.

## Running Tests

```bash
npm test
```

## Deployment (Railway)

1. Push to a public GitHub repository
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub repo
3. Select this repository
4. Add MySQL plugin: `+ New` → Database → MySQL
5. Set environment variables (copy from `.env.example`, fill values from MySQL plugin)
6. Railway auto-deploys on every push to `main`
