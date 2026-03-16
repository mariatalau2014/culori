const focusGuides = {
  insight:
    'Structurează răspunsul în trei blocuri: o introducere care definește subiectul, un paragraf cu context și diferențe cheie, și o secțiune de sfaturi practice sau direcții de explorare.',
  genius:
    'Oferă rapid idei, chartează concepte în bullet points și încheie cu o scurtă concluzie care inspiră experimentul creativ.',
  story:
    'Construiește un micro-eseu: povestește o scenă în care subiectul joacă un rol, apoi trage o concluzie aplicabilă.',
};

const clampTokens = (value) => {
  const normalized = Number(value);
  if (Number.isNaN(normalized)) {
    return 420;
  }
  return Math.min(1200, Math.max(64, normalized));
};

const buildPrompt = (subject, focus) => {
  const guide = focusGuides[focus] || focusGuides.insight;
  return `Ai o sarcină educațională: scrie despre "${subject}" conform indicațiilor următoare. ${guide}`;
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    res.status(405).json({ error: 'Metoda POST este singura acceptată.' });
    return;
  }

  const { subject, focus = 'insight', model = 'anthropic/claude-3-haiku', maxTokens } = req.body || {};

  if (!subject || typeof subject !== 'string' || !subject.trim()) {
    res.status(400).json({ error: 'Trebuie furnizat câmpul „subject”.' });
    return;
  }

  const apiKey = process.env.AI_GATEWAY_API_KEY;
  const hasCredentials = Boolean(apiKey) || Boolean(process.env.VERCEL_OIDC_TOKEN);
  if (!hasCredentials) {
    res
      .status(500)
      .json({ error: 'Lipsește AI_GATEWAY_API_KEY și nu există VERCEL_OIDC_TOKEN auto-generat în mediu.' });
    return;
  }

  const payload = {
    model,
    messages: [
      {
        role: 'system',
        content: 'Ești un asistent român, clar și atent la context. Folosești limba română cu un ton cald și explicit.',
      },
      {
        role: 'user',
        content: buildPrompt(subject.trim(), focus),
      },
    ],
    temperature: 0.65,
    max_tokens: clampTokens(maxTokens),
  };

  try {
    const gatewayResponse = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify(payload),
    });

    const data = await gatewayResponse.json();

    if (!gatewayResponse.ok) {
      res.status(gatewayResponse.status).json({ error: data?.error?.message || 'Eroare la AI Gateway', meta: data });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    console.error('AI Gateway proxy error:', error);
    res.status(500).json({ error: error?.message || 'Eroare necunoscută' });
  }
}
