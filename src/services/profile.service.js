const db = require('../config/db');
const { fetchAndAnalyze } = require('./github.service');

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

async function analyzeUser(username) {
  const [rows] = await db.query(
    'SELECT * FROM github_profiles WHERE username = ?',
    [username]
  );

  if (rows.length > 0) {
    const existing = rows[0];
    const age = Date.now() - new Date(existing.last_analyzed_at).getTime();
    if (age < CACHE_TTL_MS) {
      return { status: 'cached', data: existing };
    }
  }

  const data = await fetchAndAnalyze(username);

  await db.query(
    `INSERT INTO github_profiles
       (username, name, bio, location, company, blog, avatar_url,
        public_repos, followers, following, account_age_days,
        top_language, most_starred_repo, most_starred_count, total_stars, last_analyzed_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
     ON DUPLICATE KEY UPDATE
       name=VALUES(name), bio=VALUES(bio), location=VALUES(location),
       company=VALUES(company), blog=VALUES(blog), avatar_url=VALUES(avatar_url),
       public_repos=VALUES(public_repos), followers=VALUES(followers),
       following=VALUES(following), account_age_days=VALUES(account_age_days),
       top_language=VALUES(top_language), most_starred_repo=VALUES(most_starred_repo),
       most_starred_count=VALUES(most_starred_count), total_stars=VALUES(total_stars),
       last_analyzed_at=NOW()`,
    [
      data.username, data.name, data.bio, data.location, data.company,
      data.blog, data.avatar_url, data.public_repos, data.followers,
      data.following, data.account_age_days, data.top_language,
      data.most_starred_repo, data.most_starred_count, data.total_stars,
    ]
  );

  return { status: 'fresh', data };
}

async function getAllProfiles() {
  const [rows] = await db.query(
    `SELECT username, name, followers, public_repos, top_language, last_analyzed_at
     FROM github_profiles ORDER BY last_analyzed_at DESC`
  );
  return rows;
}

async function getProfile(username) {
  const [rows] = await db.query(
    'SELECT * FROM github_profiles WHERE username = ?',
    [username]
  );
  if (rows.length === 0) {
    const error = new Error(`Profile '${username}' has not been analyzed yet`);
    error.statusCode = 404;
    throw error;
  }
  return rows[0];
}

module.exports = { analyzeUser, getAllProfiles, getProfile };
