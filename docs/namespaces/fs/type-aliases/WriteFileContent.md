[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / WriteFileContent

# Type Alias: WriteFileContent

```ts
type WriteFileContent = Exclude<OPFSWriteFileContent, Blob>;
```

Defined in: [src/std/fs/fs\_define.ts:7](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/fs/fs_define.ts#L7)

File content type for write, support `ArrayBuffer` `TypedArray` `string`.
