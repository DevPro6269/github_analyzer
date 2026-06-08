const { extractInsights } = require('../src/services/github.service');

describe('extractInsights', () => {
  const mockProfile = {
    created_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
  };

  const mockRepos = [
    { language: 'JavaScript', stargazers_count: 50, name: 'repo-a' },
    { language: 'JavaScript', stargazers_count: 20, name: 'repo-b' },
    { language: 'Python',     stargazers_count: 100, name: 'repo-c' },
  ];

  test('computes account_age_days within 2 days of expected', () => {
    const result = extractInsights(mockProfile, mockRepos);
    expect(result.account_age_days).toBeGreaterThanOrEqual(363);
    expect(result.account_age_days).toBeLessThanOrEqual(367);
  });

  test('finds top_language as the most frequent language', () => {
    const result = extractInsights(mockProfile, mockRepos);
    expect(result.top_language).toBe('JavaScript');
  });

  test('finds most_starred_repo correctly', () => {
    const result = extractInsights(mockProfile, mockRepos);
    expect(result.most_starred_repo).toBe('repo-c');
    expect(result.most_starred_count).toBe(100);
  });

  test('sums total_stars across all repos', () => {
    const result = extractInsights(mockProfile, mockRepos);
    expect(result.total_stars).toBe(170);
  });

  test('handles empty repos array gracefully', () => {
    const result = extractInsights(mockProfile, []);
    expect(result.top_language).toBeNull();
    expect(result.most_starred_repo).toBeNull();
    expect(result.most_starred_count).toBe(0);
    expect(result.total_stars).toBe(0);
  });
});
