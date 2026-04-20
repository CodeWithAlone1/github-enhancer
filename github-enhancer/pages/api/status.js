export default async function handler(req, res) {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not set in environment variables' });

  try {
    const headers = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const [userRes, reposRes] = await Promise.all([
      fetch('https://api.github.com/user', { headers }),
      fetch('https://api.github.com/user/repos?per_page=100&type=owner&sort=updated', { headers }),
    ]);

    const user = await userRes.json();
    const repos = await reposRes.json();

    if (user.message) return res.status(401).json({ error: 'Invalid token: ' + user.message });

    // Profile completeness score
    let score = 0;
    const checks = {
      name: !!user.name,
      bio: !!user.bio,
      location: !!user.location,
      blog: !!user.blog,
      twitter: !!user.twitter_username,
      avatar: !user.avatar_url?.includes('identicons'),
      email: !!user.email,
      company: !!user.company,
    };
    score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);

    const repoStats = {
      total: repos.length,
      withDesc: repos.filter((r) => r.description).length,
      withTopics: repos.filter((r) => r.topics?.length > 0).length,
      withReadme: 0,
      empty: repos.filter((r) => r.size === 0).length,
    };

    res.json({ user, repos, score, checks, repoStats });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
