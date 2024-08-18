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

[src/std/web\_audio/mod.ts:99](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/web_audio/mod.ts#L99)
