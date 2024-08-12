[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromFile

# Function: playWebAudioFromFile()

```ts
function playWebAudioFromFile(filePath, options?): AsyncIOResult<AudioBufferSourceNode>
```

读取文件并播放。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 文件路径。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`AsyncIOResult`\<`AudioBufferSourceNode`\>

正在播放的 AudioBufferSourceNode。

## Defined in

[src/std/web\_audio/mod.ts:98](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/web_audio/mod.ts#L98)
