[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / ReadFileContent

# Type Alias: ReadFileContent

```ts
type ReadFileContent = Exclude<OPFSReadFileContent, Blob>;
```

Defined in: [src/std/fs/fs\_define.ts:12](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/fs/fs_define.ts#L12)

File content type for read result, support `ArrayBuffer` `string`.
