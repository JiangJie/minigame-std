/**
 * POSIX 路径工具模块，提供 basename、dirname、normalize 等常用路径操作。
 * 仅处理 string 路径，不涉及 URL，确保小游戏平台兼容。
 * @module path
 */

// #region Internal Variables

const CHAR_FORWARD_SLASH = 47;
const CHAR_DOT = 46;

// #endregion

/**
 * 路径分隔符，始终为 '/'。
 * @since 2.4.0
 * @example
 * ```ts
 * import { path } from 'minigame-std';
 *
 * console.log(path.SEPARATOR); // '/'
 * ```
 */
export const SEPARATOR = '/';

/**
 * 提取路径的最后一个片段（文件名）。
 * @param path - 要处理的路径字符串。
 * @param suffix - 可选的后缀，如果文件名以此结尾则去除。
 * @returns 路径中的文件名部分。
 * @since 2.4.0
 * @example
 * ```ts
 * import { path } from 'minigame-std';
 *
 * path.basename('/usr/local/file.txt');         // 'file.txt'
 * path.basename('/usr/local/file.txt', '.txt'); // 'file'
 * path.basename('/usr/local/');                 // 'local'
 * ```
 */
export function basename(path: string, suffix?: string): string {
    if (path.length === 0) return '';

    // 去掉尾部斜杠
    let end = path.length;
    while (end > 1 && path.charCodeAt(end - 1) === CHAR_FORWARD_SLASH) end--;

    // 只有斜杠的路径
    if (end === 1 && path.charCodeAt(0) === CHAR_FORWARD_SLASH) return SEPARATOR;

    // 找最后一个斜杠
    let start = 0;
    for (let i = end - 1; i >= 0; i--) {
        if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            start = i + 1;
            break;
        }
    }

    let base = path.slice(start, end);

    // suffix 不能等于整个文件名
    if (suffix && suffix.length < base.length && base.endsWith(suffix)) {
        base = base.slice(0, -suffix.length);
    }

    return base;
}

/**
 * 提取路径的目录部分。
 * @param path - 要处理的路径字符串。
 * @returns 路径中的目录部分。
 * @since 2.4.0
 * @example
 * ```ts
 * import { path } from 'minigame-std';
 *
 * path.dirname('/usr/local/file.txt'); // '/usr/local'
 * path.dirname('/usr/local/');         // '/usr'
 * path.dirname('file.txt');            // '.'
 * path.dirname('/');                   // '/'
 * ```
 */
export function dirname(path: string): string {
    if (path.length === 0) return '.';

    // 去掉尾部斜杠
    let end = path.length;
    while (end > 1 && path.charCodeAt(end - 1) === CHAR_FORWARD_SLASH) end--;

    // 找最后一个斜杠
    let lastSlash = -1;
    for (let i = end - 1; i >= 0; i--) {
        if (path.charCodeAt(i) === CHAR_FORWARD_SLASH) {
            lastSlash = i;
            break;
        }
    }

    if (lastSlash === -1) return '.';
    if (lastSlash === 0) return SEPARATOR;

    // 去掉结果尾部的连续斜杠
    let dirEnd = lastSlash;
    while (dirEnd > 1 && path.charCodeAt(dirEnd - 1) === CHAR_FORWARD_SLASH) dirEnd--;

    return path.slice(0, dirEnd);
}

/**
 * 规范化路径，解析 '.' 和 '..' 片段，合并多余斜杠。
 * @param path - 要规范化的路径字符串。
 * @returns 规范化后的路径。
 * @since 2.4.0
 * @example
 * ```ts
 * import { path } from 'minigame-std';
 *
 * path.normalize('/foo/bar//baz/asdf/quux/..'); // '/foo/bar/baz/asdf'
 * path.normalize('./foo/../bar/baz');           // 'bar/baz'
 * path.normalize('/foo/bar///baz');             // '/foo/bar/baz'
 * ```
 */
export function normalize(path: string): string {
    if (path.length === 0) return '.';

    const isAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    const trailingSeparator = path.charCodeAt(path.length - 1) === CHAR_FORWARD_SLASH;

    // 解析 . 和 .. 片段
    path = normalizeString(path, !isAbsolute);

    if (path.length === 0 && !isAbsolute) path = '.';
    if (path.length > 0 && trailingSeparator) path += SEPARATOR;
    if (isAbsolute) return `${SEPARATOR}${path}`;

    return path;
}

// #region Internal Functions

/**
 * 解析路径中的 '.' 和 '..' 片段。
 * 移植自 path-browserify。
 */
function normalizeString(path: string, allowAboveRoot: boolean): string {
    let res = '';
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code: number;

    for (let i = 0; i <= path.length; i++) {
        if (i < path.length) {
            code = path.charCodeAt(i);
        } else {
            code = CHAR_FORWARD_SLASH;
        }

        if (code === CHAR_FORWARD_SLASH) {
            if (lastSlash === i - 1 || dots === 1) {
                // NOOP — empty segment or single dot
            } else if (dots === 2) {
                if (
                    res.length < 2
                    || lastSegmentLength !== 2
                    || res.charCodeAt(res.length - 1) !== CHAR_DOT
                    || res.charCodeAt(res.length - 2) !== CHAR_DOT
                ) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(SEPARATOR);
                        if (lastSlashIndex === -1) {
                            res = '';
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(SEPARATOR);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = '';
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${SEPARATOR}..`;
                    else res = '..';
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += `${SEPARATOR}${path.slice(lastSlash + 1, i)}`;
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === CHAR_DOT && dots !== -1) {
            dots++;
        } else {
            dots = -1;
        }
    }

    return res;
}

// #endregion
