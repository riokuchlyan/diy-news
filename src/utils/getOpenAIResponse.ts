export async function getOpenAIResponse(prompt: string) {
    const response = await fetch('/api/openai', {
        method: 'POST',
        body: JSON.stringify({ prompt }),
    })
    const data = await response.json()
    return data.choices[0].message.content
}