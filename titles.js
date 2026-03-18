export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  try {
    const { apiKey, topic, target } = req.body;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `소방 전문 블로거로서 네이버 블로그 포스팅 제목 후보 5개를 만들어주세요.
주제: ${topic}
타겟: ${target}
조건: 클릭 유도하는 숫자/궁금증/경고 포함, 서로 다른 스타일(숫자형/질문형/경고형/가이드형/비교형)
JSON 배열만 응답: ["제목1","제목2","제목3","제목4","제목5"]`
        }]
      }),
    });

    const data = await response.json();
    const raw = data.content?.[0]?.text?.trim() || '[]';
    let titles = [];
    try { titles = JSON.parse(raw); }
    catch { titles = raw.match(/"([^"]+)"/g)?.map(s => s.replace(/"/g, '')) || []; }

    res.status(200).json({ titles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
