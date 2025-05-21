[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [fs](../README.md) / DownloadFileOptions

# Interface: DownloadFileOptions

Defined in: [src/std/fs/fs\_define.ts:34](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/fs/fs_define.ts#L34)

Options for downloading files.

## Extends

- `Omit`\<`WechatMinigame.DownloadFileOption`, `"url"` \| `"filePath"` \| `"success"` \| `"fail"`\>

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="onprogress"></a> `onProgress?` | (`progressResult`: `IOResult`\<`FetchProgress`\>) => `void` | [src/std/fs/fs\_define.ts:35](https://github.com/JiangJie/minigame-std/blob/ff3594872b1efbdbc13aabe99588385e855b50dc/src/std/fs/fs_define.ts#L35) |
