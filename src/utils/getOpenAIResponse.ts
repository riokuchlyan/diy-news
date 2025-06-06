export async function getOpenAIResponse(prompt: string) {

    const response = await fetch(`${process.env.HOST_URL}/api/openai`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': process.env.API_SECRET_KEY!
        },
        body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
        throw new Error('Failed to get OpenAI response: ' + response.statusText);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}