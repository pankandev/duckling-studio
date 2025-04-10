export async function* readTextStream(response: Response) {
    if (!response.body) {
        return;
    }

    const reader = response.body.getReader();

    while (true) {
        const chunk = await reader.read();
        if (chunk.done || chunk.value === undefined) {
            break;
        }

        const message = Buffer.from(chunk.value).toString();
        yield message;
    }
}