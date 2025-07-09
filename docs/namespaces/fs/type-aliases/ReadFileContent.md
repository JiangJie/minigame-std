[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / ReadFileContent

# Type Alias: ReadFileContent

```ts
type ReadFileContent = Exclude<OPFSReadFileContent, Blob>;
```

Defined in: [src/std/fs/fs\_define.ts:12](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fs/fs_define.ts#L12)

File content type for read result, support `ArrayBuffer` `string`.
