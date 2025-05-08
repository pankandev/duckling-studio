

function joinUrlAndPath(baseUrl: string, path: string): string {
    // Remove trailing slash from baseUrl and leading slash from path
    const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

    return `${normalizedBaseUrl}/${normalizedPath}`;
}


export function getMLTasksAPIURL(path: string): string {
    const apiHost = process.env['ML_API_URL'] ?? 'http://localhost:8000';
    return joinUrlAndPath(apiHost, path);
}
