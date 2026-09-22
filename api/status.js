// /api/status.js
// Vercel serverless function — ambil status.txt langsung dari GitHub API
// (bukan raw.githubusercontent.com), jadi gak kena delay CDN cache GitHub.

const OWNER = "Zryx1";
const REPO = "ZeffStatusDat";
const BRANCH = "main";
const FILE_PATH = "status.txt";

export default async function handler(req, res) {
  try {
    const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE_PATH}?ref=${BRANCH}`;

    const headers = {
      Accept: "application/vnd.github.raw",
      "User-Agent": "status-proxy",
    };

    // opsional: kalau di-set di Vercel (Settings -> Environment Variables),
    // rate limit GitHub API naik dari 60/jam jadi 5000/jam.
    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const ghRes = await fetch(url, { headers, cache: "no-store" });

    if (!ghRes.ok) {
      res.status(ghRes.status).json({ error: `GitHub API error ${ghRes.status}` });
      return;
    }

    const text = await ghRes.text();
    const data = JSON.parse(text);

    res.setHeader("Cache-Control", "no-store, max-age=0");
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
