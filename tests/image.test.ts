import { afterAll, beforeAll, expect, test } from 'vitest';
import { fs, image } from 'minigame-std';

// 1x1 red PNG image as base64
const RED_PIXEL_PNG_BASE64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';

// Convert base64 to ArrayBuffer
function base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
}

const TEST_DIR = '/image-test';

beforeAll(async () => {
    await fs.remove(TEST_DIR);
    await fs.mkdir(TEST_DIR);
});

afterAll(async () => {
    await fs.remove(TEST_DIR);
});

test('createImageFromUrl creates an image element with the given URL', () => {
    const url = 'https://example.com/image.png';
    const img = image.createImageFromUrl(url);

    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img.src).toBe(url);
});

test('createImageFromUrl creates image with relative URL', () => {
    const url = '/images/test.png';
    const img = image.createImageFromUrl(url);

    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img.src).toContain('/images/test.png');
});

test('createImageFromUrl creates image with data URL', () => {
    // 1x1 transparent PNG as data URL
    const dataUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const img = image.createImageFromUrl(dataUrl);

    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img.src).toBe(dataUrl);
});

test('createImageFromFile returns Err for non-existent file', async () => {
    const result = await image.createImageFromFile('/non-existent-path/image.png');

    // Should return an error since the file doesn't exist
    expect(result.isErr()).toBe(true);
});

test('createImageFromFile creates image from file', async () => {
    const filePath = `${TEST_DIR}/test-image.png`;

    // Write a valid PNG image to OPFS
    const imageData = base64ToArrayBuffer(RED_PIXEL_PNG_BASE64);
    const writeResult = await fs.writeFile(filePath, imageData);
    expect(writeResult.isOk()).toBe(true);

    // Create image from file
    const result = await image.createImageFromFile(filePath);
    expect(result.isOk()).toBe(true);

    const img = result.unwrap();
    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img.src).toContain('blob:');
});

test('createImageFromUrl with empty string', () => {
    const img = image.createImageFromUrl('');
    expect(img).toBeInstanceOf(HTMLImageElement);
});

test('createImageFromUrl with blob URL format', () => {
    // Create a blob URL
    const blob = new Blob(['test'], { type: 'image/png' });
    const blobUrl = URL.createObjectURL(blob);

    const img = image.createImageFromUrl(blobUrl);
    expect(img).toBeInstanceOf(HTMLImageElement);
    expect(img.src).toBe(blobUrl);

    URL.revokeObjectURL(blobUrl);
});
