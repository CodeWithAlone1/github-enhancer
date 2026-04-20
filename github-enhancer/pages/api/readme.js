function generateReadme(username, opts = {}) {
  const {
    title = `Hi there, I'm ${username} 👋`,
    tagline = 'Passionate Developer | Open Source Enthusiast',
    skills = ['JavaScript', 'React', 'Node.js', 'Python'],
    github_stats_theme = 'radical',
    show_streak = true,
    show_langs = true,
    show_trophies = true,
    social = {},
  } = opts;

  const skillBadges = skills
    .map((s) => {
      const normalized = s.toLowerCase().replace(/\s+/g, '');
      const colorMap = {
        javascript: 'F7DF1E&logoColor=black',
        typescript: '3178C6',
        react: '61DAFB&logoColor=black',
        nodejs: '339933',
        'node.js': '339933',
        python: '3776AB',
        java: 'ED8B00',
        'c++': '00599C',
        c: 'A8B9CC&logoColor=black',
        go: '00ADD8',
        rust: '000000',
        php: '777BB4',
        html: 'E34F26',
        css: '1572B6',
        sql: '4479A1',
        mysql: '4479A1',
        postgresql: '4169E1',
        mongodb: '47A248',
        docker: '2496ED',
        kubernetes: '326CE5',
        aws: '232F3E',
        git: 'F05032',
        linux: 'FCC624&logoColor=black',
        vue: '4FC08D',
        angular: 'DD0031',
        nextjs: '000000',
        'next.js': '000000',
        tailwindcss: '06B6D4',
        graphql: 'E10098',
        redis: 'DC382D',
        firebase: 'FFCA28&logoColor=black',
      };
      const color = colorMap[normalized] || '555555';
      const logoName = normalized === 'nodejs' ? 'node.js' : normalized === 'nextjs' ? 'next.js' : normalized;
      return `![${s}](https://img.shields.io/badge/${encodeURIComponent(s)}-${color}?style=for-the-badge&logo=${encodeURIComponent(logoName)})`;
    })
    .join(' ');

  const trophies = show_trophies
    ? `\n## 🏆 GitHub Trophies\n![Trophies](https://github-profile-trophy.vercel.app/?username=${username}&theme=${github_stats_theme}&no-frame=true&no-bg=true&margin-w=4&row=1)\n`
    : '';

  const streak = show_streak
    ? `\n## 🔥 GitHub Streak\n![Streak](https://github-readme-streak-stats.herokuapp.com/?user=${username}&theme=${github_stats_theme})\n`
    : '';

  const langs = show_langs
    ? `![Top Languages](https://github-readme-stats.vercel.app/api/top-langs/?username=${username}&layout=compact&theme=${github_stats_theme})`
    : '';

  const socialLinks = [];
  if (social.linkedin) socialLinks.push(`[![LinkedIn](https://img.shields.io/badge/LinkedIn-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](${social.linkedin})`);
  if (social.twitter) socialLinks.push(`[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://twitter.com/${social.twitter})`);
  if (social.portfolio) socialLinks.push(`[![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge&logo=google-chrome&logoColor=white)](${social.portfolio})`);
  if (social.email) socialLinks.push(`[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:${social.email})`);

  return `<h1 align="center">${title}</h1>
<h3 align="center">${tagline}</h3>

<p align="center">
  <img src="https://komarev.com/ghpvc/?username=${username}&label=Profile%20Views&color=0e75b6&style=flat" alt="Profile Views" />
</p>

---

## 🛠️ Tech Stack

${skillBadges}

---

## 📊 GitHub Stats

<p align="center">
  <img src="https://github-readme-stats.vercel.app/api?username=${username}&show_icons=true&theme=${github_stats_theme}&count_private=true" alt="GitHub Stats" />
  ${langs}
</p>
${streak}${trophies}
---
${socialLinks.length ? `## 🌐 Connect With Me\n\n${socialLinks.join(' ')}\n\n---\n` : ''}
<p align="center">
  <i>⭐ From <a href="https://github.com/${username}">${username}</a></i>
</p>
`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not set' });

  try {
    const headers = {
      Authorization: `token ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    };

    // Get username
    const userRes = await fetch('https://api.github.com/user', { headers });
    const user = await userRes.json();
    const username = user.login;

    const readmeContent = generateReadme(username, req.body);

    // Check if profile repo exists
    const repoRes = await fetch(`https://api.github.com/repos/${username}/${username}`, { headers });

    if (repoRes.status === 404) {
      // Create the special profile repo
      const createRes = await fetch('https://api.github.com/user/repos', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: username,
          description: `✨ My GitHub Profile Repository`,
          private: false,
          auto_init: false,
        }),
      });
      if (!createRes.ok) {
        const err = await createRes.json();
        return res.status(400).json({ error: 'Could not create profile repo: ' + err.message });
      }
    }

    // Get existing README SHA if it exists
    const fileRes = await fetch(`https://api.github.com/repos/${username}/${username}/contents/README.md`, { headers });
    const fileData = fileRes.ok ? await fileRes.json() : null;

    // Push/update README
    const pushPayload = {
      message: '✨ Update GitHub Profile README [via GitHub Enhancer]',
      content: Buffer.from(readmeContent).toString('base64'),
    };
    if (fileData?.sha) pushPayload.sha = fileData.sha;

    const pushRes = await fetch(`https://api.github.com/repos/${username}/${username}/contents/README.md`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(pushPayload),
    });

    if (!pushRes.ok) {
      const err = await pushRes.json();
      return res.status(400).json({ error: err.message });
    }

    res.json({ success: true, username, profileUrl: `https://github.com/${username}` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
