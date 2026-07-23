export interface EntryConfig {
    name: string;
    file: string;
}

/** Public subpath entries declared in package.json and jsr.json exports. */
export const PUBLIC_ENTRIES: readonly EntryConfig[] = [
    { name: 'main', file: 'src/mod.ts' },
    { name: 'audio', file: 'src/std/audio/mod.ts' },
    { name: 'clipboard', file: 'src/std/clipboard/mod.ts' },
    { name: 'codec', file: 'src/std/codec/mod.ts' },
    { name: 'cryptos', file: 'src/std/crypto/mod.ts' },
    { name: 'event', file: 'src/std/event/mod.ts' },
    { name: 'fetch', file: 'src/std/fetch/mod.ts' },
    { name: 'fs', file: 'src/std/fs/mod.ts' },
    { name: 'image', file: 'src/std/image/mod.ts' },
    { name: 'lbs', file: 'src/std/lbs/mod.ts' },
    { name: 'logger', file: 'src/std/logger/mod.ts' },
    { name: 'network', file: 'src/std/network/mod.ts' },
    { name: 'path', file: 'src/std/path/mod.ts' },
    { name: 'performance', file: 'src/std/performance/mod.ts' },
    { name: 'platform', file: 'src/std/platform/mod.ts' },
    { name: 'socket', file: 'src/std/socket/mod.ts' },
    { name: 'storage', file: 'src/std/storage/mod.ts' },
    { name: 'utils', file: 'src/std/utils/mod.ts' },
    { name: 'video', file: 'src/std/video/mod.ts' },
];
