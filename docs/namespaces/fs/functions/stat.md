[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / stat

# Function: stat()

获取文件或目录的状态信息。

## Param

文件或目录的路径。

## Param

可选选项。

## Call Signature

```ts
function stat(path): AsyncIOResult<Stats>
```

Defined in: [src/std/fs/fs\_async.ts:108](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fs/fs_async.ts#L108)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |

### Returns

`AsyncIOResult`\<`Stats`\>

## Call Signature

```ts
function stat(path, options): AsyncIOResult<FileStats[]>
```

Defined in: [src/std/fs/fs\_async.ts:109](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fs/fs_async.ts#L109)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options` | [`StatOptions`](../interfaces/StatOptions.md) & \{ `recursive`: `true`; \} |

### Returns

`AsyncIOResult`\<`FileStats`[]\>

## Call Signature

```ts
function stat(path, options?): AsyncIOResult<Stats | FileStats[]>
```

Defined in: [src/std/fs/fs\_async.ts:112](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fs/fs_async.ts#L112)

### Parameters

| Parameter | Type |
| ------ | ------ |
| `path` | `string` |
| `options`? | [`StatOptions`](../interfaces/StatOptions.md) |

### Returns

`AsyncIOResult`\<`Stats` \| `FileStats`[]\>
