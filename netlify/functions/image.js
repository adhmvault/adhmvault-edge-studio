exports.handler = async function(event, context) {
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        const body = JSON.parse(event.body || '{}');
        const prompt = (body.prompt || '').substring(0, 500).replace(/[^\w\s,.\-()]/g, ' ').trim();
        
        if (!prompt) {
            return {
                statusCode: 400,
                headers: { 'Access-Control-Allow-Origin': '*' },
                body: JSON.stringify({ error: 'Prompt kosong' })
            };
        }

        const seed = Math.floor(Math.random() * 999999);
        const encodedPrompt = encodeURIComponent(prompt);
        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=576&height=1024&seed=${seed}&nologo=true&enhance=true&model=flux`;

        const res = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; NetlifyFunction/1.0)'
            }
        });

        if (!res.ok) {
            throw new Error(`Pollinations error: ${res.status}`);
        }

        const arrayBuffer = await res.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');

        if (base64.length < 1000) {
            throw new Error('Imej terlalu kecil — mungkin ralat dari Pollinations');
        }

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ base64 })
        };

    } catch (err) {
        console.error('Image function error:', err.message);
        return {
            statusCode: 500,
            headers: { 'Access-Control-Allow-Origin': '*' },
            body: JSON.stringify({ error: err.message })
        };
    }
};
