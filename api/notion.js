export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const token = process.env.NOTION_TOKEN;
  if (!token) return res.status(500).json({ error: 'Token not configured' });

  try {
    let allResults = [], cursor = undefined, hasMore = true;
    while (hasMore) {
      const body = { page_size: 100 };
      if (cursor) body.start_cursor = cursor;
      const r = await fetch(
        'https://api.notion.com/v1/databases/358742e5d51681e7af7ff055a2ef5381/query',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + token,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        }
      );
      if (!r.ok) {
        const err = await r.json();
        return res.status(r.status).json(err);
      }
      const data = await r.json();
      allResults = [...allResults, ...(data.results || [])];
      hasMore = data.has_more;
      cursor = data.next_cursor;
    }
    res.status(200).json({ results: allResults });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
