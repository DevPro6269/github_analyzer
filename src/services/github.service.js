const axios = require('axios');

function getHeaders() {
  return process.env.GITHUB_TOKEN
    ? { Authorization: `token ${process.env.GITHUB_TOKEN}` }
    : {};
}

function extractInsights(profile, repos) {
  const createdAt = new Date(profile.created_at);
  const account_age_days = Math.floor((Date.now() - createdAt) / (1000 * 60 * 60 * 24));

  if (repos.length === 0) {
    return { account_age_days, top_language: null, most_starred_repo: null, most_starred_count: 0, total_stars: 0 };
  }

  const langCount = {};
  let mostStarred = repos[0];
  let total_stars = 0;

  for (const repo of repos) {
    if (repo.language) langCount[repo.language] = (langCount[repo.language] || 0) + 1;
    if (repo.stargazers_count > mostStarred.stargazers_count) mostStarred = repo;
    total_stars += repo.stargazers_count;
  }

  const top_language = Object.keys(langCount).length
    ? Object.keys(langCount).reduce((a, b) => langCount[a] >= langCount[b] ? a : b)
    : null;

  return {
    account_age_days,
    top_language,
    most_starred_repo: mostStarred.name,
    most_starred_count: mostStarred.stargazers_count,
    total_stars,
  };
}

async function fetchAndAnalyze(username) {
  const headers = getHeaders();
  const base = 'https://api.github.com';

  let profileRes;
  try {
    profileRes = await axios.get(`${base}/users/${username}`, { headers });
  } catch (err) {
    if (err.response?.status === 404) {
      const error = new Error(`GitHub user '${username}' not found`);
      error.statusCode = 404;
      throw error;
    }
    if (err.response?.status === 403) {
      const error = new Error('GitHub rate limit exceeded. Try again later.');
      error.statusCode = 429;
      throw error;
    }
    const error = new Error('Could not reach GitHub API');
    error.statusCode = 502;
    throw error;
  }

  const profile = profileRes.data;

  let repos = [];
  try {
    const reposRes = await axios.get(`${base}/users/${username}/repos?per_page=100`, { headers });
    repos = reposRes.data;
  } catch (err) {
    if (err.response?.status === 403) {
      const error = new Error('GitHub rate limit exceeded. Try again later.');
      error.statusCode = 429;
      throw error;
    }
    const error = new Error('Could not reach GitHub API');
    error.statusCode = 502;
    throw error;
  }

  const insights = extractInsights(profile, repos);

  return {
    username: profile.login,
    name:      profile.name      || null,
    bio:       profile.bio       || null,
    location:  profile.location  || null,
    company:   profile.company   || null,
    blog:      profile.blog      || null,
    avatar_url: profile.avatar_url || null,
    public_repos: profile.public_repos || 0,
    followers:    profile.followers    || 0,
    following:    profile.following    || 0,
    ...insights,
  };
}

module.exports = { fetchAndAnalyze, extractInsights };
