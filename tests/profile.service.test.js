jest.mock('../src/config/db');
jest.mock('../src/services/github.service');

const db = require('../src/config/db');
const { fetchAndAnalyze } = require('../src/services/github.service');
const { analyzeUser } = require('../src/services/profile.service');

const mockGithubData = {
  username: 'testuser', name: 'Test User', bio: null, location: null,
  company: null, blog: null, avatar_url: null,
  public_repos: 5, followers: 10, following: 2,
  account_age_days: 365, top_language: 'JavaScript',
  most_starred_repo: 'my-repo', most_starred_count: 42, total_stars: 50,
};

describe('analyzeUser', () => {
  beforeEach(() => jest.clearAllMocks());

  test('returns cached data when last_analyzed_at is under 24hrs', async () => {
    const recentTime = new Date(Date.now() - 1 * 60 * 60 * 1000);
    db.query = jest.fn().mockResolvedValueOnce([[{ ...mockGithubData, last_analyzed_at: recentTime }]]);

    const result = await analyzeUser('testuser');

    expect(result.status).toBe('cached');
    expect(fetchAndAnalyze).not.toHaveBeenCalled();
  });

  test('re-fetches when last_analyzed_at is over 24hrs', async () => {
    const oldTime = new Date(Date.now() - 25 * 60 * 60 * 1000);
    db.query = jest.fn()
      .mockResolvedValueOnce([[{ ...mockGithubData, last_analyzed_at: oldTime }]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    fetchAndAnalyze.mockResolvedValueOnce(mockGithubData);

    const result = await analyzeUser('testuser');

    expect(result.status).toBe('fresh');
    expect(fetchAndAnalyze).toHaveBeenCalledWith('testuser');
  });

  test('fetches and inserts when user not yet in DB', async () => {
    db.query = jest.fn()
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);
    fetchAndAnalyze.mockResolvedValueOnce(mockGithubData);

    const result = await analyzeUser('testuser');

    expect(result.status).toBe('fresh');
    expect(fetchAndAnalyze).toHaveBeenCalledWith('testuser');
  });
});
