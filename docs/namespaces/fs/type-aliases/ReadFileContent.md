[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / ReadFileContent

# Type Alias: ReadFileContent

```ts
type ReadFileContent = Exclude<OPFSReadFileContent, Blob>;
```

Defined in: [src/std/fs/fs\_define.ts:12](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/fs/fs_define.ts#L12)

File content type for read result, support `ArrayBuffer` `string`.
