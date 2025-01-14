export interface BlockType {
    name: string;
    color: number;
    hp: number;
}

export const blockTypes: BlockType[] = [
    { name: 'DirtBlock', color: 0x8B4513, hp: 1 },
    { name: 'StoneBlock', color: 0xA9A9A9, hp: 2 },
    { name: 'WoodBlock', color: 0x8B0000, hp: 3 },
    { name: 'IronBlock', color: 0xC0C0C0, hp: 4 },
    { name: 'GoldBlock', color: 0xFFD700, hp: 5 },
    { name: 'EmeraldBlock', color: 0x50C878, hp: 6 },
    { name: 'RubyBlock', color: 0xE0115F, hp: 7 },
    { name: 'SapphireBlock', color: 0x0F52BA, hp: 8 },
    { name: 'QuartzBlock', color: 0xFFFFFF, hp: 9 },
    { name: 'ObsidianBlock', color: 0x101820, hp: 10 },
    { name: 'DiamondBlock', color: 0xB9FBC0, hp: 11 },
    // Add more block types as needed...
]; 