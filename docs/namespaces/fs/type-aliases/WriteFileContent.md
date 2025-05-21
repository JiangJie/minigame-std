[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / WriteFileContent

# Type Alias: WriteFileContent

```ts
type WriteFileContent = Exclude<OPFSWriteFileContent, Blob>;
```

Defined in: [src/std/fs/fs\_define.ts:7](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/fs/fs_define.ts#L7)

File content type for write, support `ArrayBuffer` `TypedArray` `string`.
