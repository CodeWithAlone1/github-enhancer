export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.status(500).json({ error: 'GITHUB_TOKEN not set' });

  const { name, bio, location, blog, twitter_username, company, email } = req.body;

  try {
    const payload = {};
    if (name !== undefined) payload.name = name;
    if (bio !== undefined) payload.bio = bio;
    if (location !== undefined) payload.location = location;
    if (blog !== undefined) payload.blog = blog;
    if (twitter_username !== undefined) payload.twitter_username = twitter_username;
    if (company !== undefined) payload.company = company;
    if (email !== undefined) payload.email = email;

    const response = await fetch('https://api.github.com/user', {
      method: 'PATCH',
      headers: {
        Authorization: `token ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (data.message) return res.status(400).json({ error: data.message });

    res.json({ success: true, user: data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
