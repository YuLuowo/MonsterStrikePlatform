export type Monster = {
    number: number;
    name: string | null;
    image_url: string | null;
    element: string | null;
    type: string | null;
    abilities: string[];
}[]

export type MonstersList = {
    data: Monster;
    total: number;
    page: number;
    totalPages: number;
}