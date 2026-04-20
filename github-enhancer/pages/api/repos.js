const LANGUAGE_TOPICS = {
  JavaScript: ['javascript', 'js', 'web-development'],
  TypeScript: ['typescript', 'ts', 'web-development'],
  Python: ['python', 'python3'],
  Java: ['java', 'jvm'],
  'C++': ['cpp', 'cplusplus'],
  C: ['c', 'systems-programming'],
  Go: ['golang', 'go'],
  Rust: ['rust', 'systems-programming'],
  PHP: ['php', 'web-development'],
  Ruby: ['ruby', 'rails'],
  Swift: ['swift', 'ios'],
  Kotlin: ['kotlin', 'android'],
  HTML: ['html', 'web', 'frontend'],
  CSS: ['css', 'frontend', 'web'],
  Shell: ['bash', 'shell-script', 'linux'],
  Jupyter: ['jupyter-notebook', 'data-science', 'python'],
};

function generateDescription(repo) {
  if (repo.description) return null; // Already has description

  const name = repo.name
    .replace(/-/g, ' ')
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .toLowerCase();

  const langDesc = repo.language ? ` built with ${repo.language}` : '';
  return `${name.charAt(0).toUpperCase() + name.slice(1)}${langDesc}`;
}

function generateTopics(repo, existingTopics = []) {
  const topics = new Set(existingTopics);
  const lang = repo.language;
  if (lang && LANGUAGE_TOPICS[lang]) {
    LANGUAGE_TOPICS[lang].forEach((t) => topics.add(t));
  }

  // Add based on repo name keywords
  const name = repo.name.toLowerCase();
  if (name.includes('api')) topics.add('api');
  if (name.includes('bot')) topics.add('bot');
  if (name.includes('cli')) topics.add('cli');
  if (name.includes('web')) topics.add('web');
  if (name.includes('app')) topics.add('app');
  if (name.includes('ml') || name.includes('model') || name.includes('ai')) topics.add('machine-learning');
  if (name.includes('data') || name.includes('analysis')) topics.add('data-analysis');
  if (name.includes('game')) topics.add('game');
  if (name.includes('portfolio')) topics.add('portfolio');
  if (name.includes('todo') || name.includes('task')) topics.add('productivity');
  if (name.includes('chat')) topics.add('chat');
  if (name.includes('auth') || name.includes('login')) topics.add('authentication');
  if (name.includes('blog')) topics.add('blog');
  if (name.includes('test')) topics.add('testing');
  if (name.includes('docker')) topics.add('docker');

  // GitHub limits topics to 20
  return [...topics].slice(0, 20);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not set' });

  const { mode = 'all', repoNames = [] } = req.body; // mode: 'all' | 'selected'

  const headers = {
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
  };

  try {
    const userRes = await fetch('https://api.github.com/user', { headers });
    const user = await userRes.json();
    const username = user.login;

    // Fetch all repos
    const reposRes = await fetch(`https://api.github.com/user/repos?per_page=100&type=owner&sort=updated`, { headers });
    let repos = await reposRes.json();

    if (mode === 'selected' && repoNames.length > 0) {
      repos = repos.filter((r) => repoNames.includes(r.name));
    }

    const results = [];
    let enhanced = 0;
    let failed = 0;

    for (const repo of repos) {
      if (repo.fork) continue; // Skip forks

      const updates = {};
      const actions = [];

      // Description
      const newDesc = generateDescription(repo);
      if (newDesc) {
        updates.description = newDesc;
        actions.push('description');
      }

      // Topics
      const topicsRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/topics`, {
        headers: { ...headers, Accept: 'application/vnd.github.mercy-preview+json' },
      });
      const topicsData = topicsRes.ok ? await topicsRes.json() : { names: [] };
      const newTopics = generateTopics(repo, topicsData.names || []);

      if (newTopics.length > (topicsData.names?.length || 0)) {
        actions.push('topics');
      }

      // Update description/homepage
      if (Object.keys(updates).length > 0) {
        const updateRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}`, {
          method: 'PATCH',
          headers,
          body: JSON.stringify(updates),
        });
        if (!updateRes.ok) failed++;
      }

      // Update topics
      if (newTopics.length > 0) {
        const topicRes = await fetch(`https://api.github.com/repos/${username}/${repo.name}/topics`, {
          method: 'PUT',
          headers: { ...headers, Accept: 'application/vnd.github.mercy-preview+json' },
          body: JSON.stringify({ names: newTopics }),
        });
        if (!topicRes.ok) failed++;
      }

      if (actions.length > 0) {
        enhanced++;
        results.push({ name: repo.name, actions });
      }

      // Throttle to avoid rate limiting
      await new Promise((r) => setTimeout(r, 100));
    }

    res.json({ success: true, enhanced, failed, total: repos.length, results });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
