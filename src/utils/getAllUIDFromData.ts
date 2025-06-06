interface UserData {
    id: number;
    UID: string;
    'news-terms': string;
}

export function getAllUIDFromData(data: UserData[]): string[] {
    const uniqueUIDs = new Set(data.map(item => item.UID));
    return Array.from(uniqueUIDs);
}
