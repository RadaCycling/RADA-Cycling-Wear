export type Badge = {
    name: string,
    href: string,
    backgroundColor?: string;
}
export type Cell = {
    type: 'image' | 'string' | 'switch' | 'badgeArray' | 'link';
    content: string | boolean | Badge[];
    link?: string;
    callback?: (...args: any[]) => any;
    alt?: string;
};
export type Row = Cell[];
export type Head = string[];