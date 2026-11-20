const axios = require('axios');

const githubApi = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    Authorization: `token ${process.env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
  },
});

const parseRepoUrl = (url) => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)(\.git)?\/?$/);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
};

const fetchRepoData = async (owner, repo) => {
  const [repoInfo, languages, commits, contents] = await Promise.all([
    githubApi.get(`/repos/${owner}/${repo}`),
    githubApi.get(`/repos/${owner}/${repo}/languages`),
    githubApi.get(`/repos/${owner}/${repo}/commits`, { params: { per_page: 100 } }),
    githubApi.get(`/repos/${owner}/${repo}/contents`),
  ]);

  return {
    repoInfo: repoInfo.data,
    languages: languages.data,
    commits: commits.data,
    rootFiles: contents.data.map((f) => f.name.toLowerCase()),
  };
};

const SKILL_LANGUAGE_MAP = {
  javascript: ['JavaScript'],
  react: ['JavaScript', 'TypeScript', 'CSS', 'HTML'],
  nodejs: ['JavaScript', 'TypeScript'],
};

const calculateLanguageMatchScore = (languages, skill) => {
  const relevant = SKILL_LANGUAGE_MAP[skill] || [];
  const totalBytes = Object.values(languages).reduce((sum, b) => sum + b, 0);
  if (totalBytes === 0) return 0;
  const relevantBytes = Object.entries(languages)
    .filter(([lang]) => relevant.includes(lang))
    .reduce((sum, [, b]) => sum + b, 0);
  return Math.round((relevantBytes / totalBytes) * 100);
};

const calculateActivityScore = (commitCount) => {
  if (commitCount >= 100) return 100;
  if (commitCount >= 50) return 80;
  if (commitCount >= 20) return 60;
  if (commitCount >= 5) return 40;
  return 20;
};

const calculateStructureScore = (rootFiles) => {
  let score = 0;
  if (rootFiles.includes('package.json')) score += 35;
  if (rootFiles.includes('src')) score += 30;
  if (rootFiles.some((f) => ['test', 'tests', '__tests__'].includes(f))) score += 20;
  if (rootFiles.some((f) => ['.gitignore', '.env.example', 'vite.config.js', 'webpack.config.js'].includes(f))) score += 15;
  return Math.min(score, 100);
};

const calculateDocumentationScore = (rootFiles) => {
  return rootFiles.some((f) => f.startsWith('readme')) ? 100 : 0;
};

const buildWeeklyBuckets = (commits) => {
  if (commits.length === 0) return [];
  const dates = commits.map((c) => new Date(c.commit.author.date)).sort((a, b) => a - b);
  const start = dates[0];
  const buckets = {};

  dates.forEach((d) => {
    const weekNum = Math.floor((d - start) / (7 * 24 * 60 * 60 * 1000));
    buckets[weekNum] = (buckets[weekNum] || 0) + 1;
  });

  const maxWeek = Math.max(...Object.keys(buckets).map(Number));
  const series = [];
  for (let w = 0; w <= maxWeek; w++) {
    series.push({ week: w, count: buckets[w] || 0 });
  }
  return series;
};

const buildRecentCommits = (commits) => {
  return commits.slice(0, 5).map((c) => ({
    sha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    verified: c.commit.verification?.verified || false,
    date: c.commit.author.date,
  }));
};

const evaluateRepo = async (repoUrl, skill) => {
  const parsed = parseRepoUrl(repoUrl);
  if (!parsed) throw new Error('Invalid GitHub repository URL');

  const { owner, repo } = parsed;
  const data = await fetchRepoData(owner, repo);
  const commitCount = data.commits.length;

  const languageMatchScore = calculateLanguageMatchScore(data.languages, skill);
  const activityScore = calculateActivityScore(commitCount);
  const structureScore = calculateStructureScore(data.rootFiles);
  const documentationScore = calculateDocumentationScore(data.rootFiles);

  const finalScore = Math.round(
    languageMatchScore * 0.4 +
    activityScore * 0.25 +
    structureScore * 0.2 +
    documentationScore * 0.15
  );

  const dates = data.commits.map((c) => new Date(c.commit.author.date));
  const verifiedCount = data.commits.filter((c) => c.commit.verification?.verified).length;

  return {
    owner,
    repo,
    finalScore,
    breakdown: { languageMatchScore, activityScore, structureScore, documentationScore },
    raw: {
      languages: data.languages,
      commitCount,
      stars: data.repoInfo.stargazers_count,
      hasPackageJson: data.rootFiles.includes('package.json'),
      hasReadme: data.rootFiles.some((f) => f.startsWith('readme')),
    },
    timeline: {
      firstCommit: dates.length ? new Date(Math.min(...dates)) : null,
      lastCommit: dates.length ? new Date(Math.max(...dates)) : null,
      verifiedCount,
      totalCount: commitCount,
      weeklyBuckets: buildWeeklyBuckets(data.commits),
      recentCommits: buildRecentCommits(data.commits),
    },
  };
};

module.exports = { evaluateRepo };