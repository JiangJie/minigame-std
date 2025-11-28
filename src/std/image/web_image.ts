import { readBlobFile } from 'happy-opfs';
import { Ok, type AsyncIOResult } from 'happy-rusty';

export function createImageFromUrl(url: string): HTMLImageElement {
    const img = new Image();
    img.src = url;

    return img;
}

export async function createImageFromFile(filePath: string): AsyncIOResult<HTMLImageElement> {
    const readRes = await readBlobFile(filePath);

    return readRes.andThen(blob => {
        const url = URL.createObjectURL(blob);

        const img = new Image();
        img.src = url;

        img.addEventListener('load', () => {
            URL.revokeObjectURL(url);
        });
        img.addEventListener('error', () => {
            URL.revokeObjectURL(url);
        });

        return Ok(img);
    });
}