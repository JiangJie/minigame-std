import { expect, test } from 'vitest';
import { basename, dirname, normalize, SEPARATOR } from '../src/std/path/mod.ts';

// ============ SEPARATOR ============

test('SEPARATOR is forward slash', () => {
    expect(SEPARATOR).toBe('/');
});

// ============ basename ============

test('basename extracts filename from absolute path', () => {
    expect(basename('/usr/local/file.txt')).toBe('file.txt');
});

test('basename extracts last segment', () => {
    expect(basename('/a/b/c')).toBe('c');
});

test('basename handles root path', () => {
    expect(basename('/')).toBe('/');
});

test('basename handles filename only', () => {
    expect(basename('file.txt')).toBe('file.txt');
});

test('basename strips trailing slashes', () => {
    expect(basename('/usr/local/')).toBe('local');
    expect(basename('/usr/local///')).toBe('local');
});

test('basename with suffix removes extension', () => {
    expect(basename('/path/to/file.txt', '.txt')).toBe('file');
});

test('basename with non-matching suffix keeps full name', () => {
    expect(basename('/path/to/file.txt', '.md')).toBe('file.txt');
});

test('basename with suffix equal to filename keeps full name', () => {
    expect(basename('/path/to/file.txt', 'file.txt')).toBe('file.txt');
});

test('basename handles dotfiles', () => {
    expect(basename('/home/user/.bashrc')).toBe('.bashrc');
});

test('basename handles multiple dots', () => {
    expect(basename('/path/to/archive.tar.gz')).toBe('archive.tar.gz');
    expect(basename('/path/to/archive.tar.gz', '.gz')).toBe('archive.tar');
});

test('basename handles empty string', () => {
    expect(basename('')).toBe('');
});

test('basename handles single segment no slash', () => {
    expect(basename('hello')).toBe('hello');
});

test('basename handles relative path', () => {
    expect(basename('foo/bar/baz')).toBe('baz');
});

test('basename handles double slashes in path', () => {
    expect(basename('//usr//local//file')).toBe('file');
});

// ============ dirname ============

test('dirname extracts directory from absolute path', () => {
    expect(dirname('/usr/local/file.txt')).toBe('/usr/local');
});

test('dirname handles root file', () => {
    expect(dirname('/file.txt')).toBe('/');
});

test('dirname handles root path', () => {
    expect(dirname('/')).toBe('/');
});

test('dirname handles filename only', () => {
    expect(dirname('file.txt')).toBe('.');
});

test('dirname handles empty string', () => {
    expect(dirname('')).toBe('.');
});

test('dirname strips trailing slashes before processing', () => {
    expect(dirname('/usr/local/')).toBe('/usr');
    expect(dirname('/usr/local///')).toBe('/usr');
});

test('dirname handles relative path', () => {
    expect(dirname('foo/bar/baz')).toBe('foo/bar');
});

test('dirname handles relative path single level', () => {
    expect(dirname('foo/bar')).toBe('foo');
});

test('dirname handles nested absolute path', () => {
    expect(dirname('/a/b/c/d')).toBe('/a/b/c');
});

test('dirname handles double slashes in middle', () => {
    expect(dirname('/usr//local//file')).toBe('/usr//local');
});

test('dirname handles path with dots', () => {
    expect(dirname('/usr/local/./file')).toBe('/usr/local/.');
});

test('dirname handles absolute single dir', () => {
    expect(dirname('/usr')).toBe('/');
});

// ============ normalize ============

test('normalize resolves double slashes', () => {
    expect(normalize('/foo//bar')).toBe('/foo/bar');
    expect(normalize('/foo///bar///baz')).toBe('/foo/bar/baz');
});

test('normalize resolves single dot', () => {
    expect(normalize('/foo/./bar')).toBe('/foo/bar');
    expect(normalize('./foo/./bar')).toBe('foo/bar');
});

test('normalize resolves double dots', () => {
    expect(normalize('/foo/bar/../baz')).toBe('/foo/baz');
    expect(normalize('/foo/bar/baz/../../quux')).toBe('/foo/quux');
});

test('normalize resolves complex path', () => {
    expect(normalize('/foo/bar//baz/asdf/quux/..')).toBe('/foo/bar/baz/asdf');
});

test('normalize handles empty string', () => {
    expect(normalize('')).toBe('.');
});

test('normalize handles root', () => {
    expect(normalize('/')).toBe('/');
});

test('normalize handles already normalized path', () => {
    expect(normalize('/foo/bar/baz')).toBe('/foo/bar/baz');
});

test('normalize preserves trailing slash', () => {
    expect(normalize('/foo/bar/')).toBe('/foo/bar/');
    expect(normalize('/foo/bar///')).toBe('/foo/bar/');
});

test('normalize handles relative paths', () => {
    expect(normalize('foo/bar/../baz')).toBe('foo/baz');
    expect(normalize('foo/./bar')).toBe('foo/bar');
});

test('normalize handles relative path going above root', () => {
    expect(normalize('../foo/bar')).toBe('../foo/bar');
    expect(normalize('foo/../../bar')).toBe('../bar');
    expect(normalize('../../foo')).toBe('../../foo');
});

test('normalize does not go above root for absolute paths', () => {
    expect(normalize('/foo/../..')).toBe('/');
    expect(normalize('/..')).toBe('/');
    expect(normalize('/foo/../../bar')).toBe('/bar');
});

test('normalize handles only dots', () => {
    expect(normalize('.')).toBe('.');
    expect(normalize('..')).toBe('..');
    expect(normalize('./')).toBe('./');
    expect(normalize('../')).toBe('../');
});

test('normalize handles multiple parent segments', () => {
    expect(normalize('a/b/c/../../d')).toBe('a/d');
    expect(normalize('a/b/../c/../d')).toBe('a/d');
});

test('normalize handles leading dot slash', () => {
    expect(normalize('./foo')).toBe('foo');
    expect(normalize('./foo/bar')).toBe('foo/bar');
});

test('normalize handles single segment', () => {
    expect(normalize('foo')).toBe('foo');
});

test('normalize handles deeply nested resolution', () => {
    expect(normalize('/a/b/c/d/../../../../e')).toBe('/e');
});
