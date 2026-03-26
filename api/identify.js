export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const apiKey = req.query.api_key || process.env.PLANTNET_API_KEY;

    if (!apiKey) {
        return res.status(400).json({ error: 'API Key is required' });
    }

    try {
        const formData = new FormData();

        if (req.body.images && Array.isArray(req.body.images)) {
            for (let i = 0; i < req.body.images.length; i++) {
                const image = req.body.images[i];
                const blob = Buffer.from(image.data, 'base64');
                formData.append('images', new File([blob], `image_${i}.jpg`, { type: image.type }));
            }
        }

        const apiUrl = `https://my-api.plantnet.org/v2/diseases/identify?api-key=${apiKey}&include-related-images=true`;

        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        const data = await response.text();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: 'API call failed',
                details: data
            });
        }

        const result = JSON.parse(data);
        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({ 
            error: 'Internal Server Error',
            details: error.message
        });
    }
}
