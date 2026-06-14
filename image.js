exports.handler = async function(event) {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: cors, body: '' };
  }

  try {
    const body = JSON.parse(event.body);
    let promptText = '';
    if (body.instances?.prompt) promptText = body.instances.prompt;
    else if (body.contents) {
      const parts = body.contents[0]?.parts || [];
      promptText = parts.find(p => p.text)?.text || '';
    } else if (body.prompt) {
      promptText = body.prompt;
    }

    const seed = Math.floor(Math.random() * 99999);
    const encoded = encodeURIComponent(promptText.substring(0, 500));
    const imageUrl = `https://image.pollinations.ai/prompt/${encoded}?width=576&height=1024&nologo=true&seed=${seed}&model=flux`;

    const imgRes = await fetch(imageUrl);
    const arrayBuffer = await imgRes.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');

    return {
      statusCode: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        predictions: [{ bytesBase64Encoded: base64 }],
        candidates: [{ content: { parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64 } }] } }]
      })
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers: { ...cors, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: e.message })
    };
  }
};
