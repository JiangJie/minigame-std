[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / WriteFileContent

# Type Alias: WriteFileContent

```ts
type WriteFileContent = Exclude<OPFSWriteFileContent, Blob>;
```

Defined in: [src/std/fs/fs\_define.ts:7](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/fs/fs_define.ts#L7)

File content type for write, support `ArrayBuffer` `TypedArray` `string`.
