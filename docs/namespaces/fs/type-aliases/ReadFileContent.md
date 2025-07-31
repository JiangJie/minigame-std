[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / ReadFileContent

# Type Alias: ReadFileContent

```ts
type ReadFileContent = Exclude<OPFSReadFileContent, Blob>;
```

Defined in: [src/std/fs/fs\_define.ts:12](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_define.ts#L12)

File content type for read result, support `ArrayBuffer` `string`.
