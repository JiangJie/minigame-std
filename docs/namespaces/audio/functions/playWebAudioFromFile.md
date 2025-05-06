[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromFile

# Function: playWebAudioFromFile()

```ts
function playWebAudioFromFile(filePath, options?): AsyncIOResult<AudioBufferSourceNode>
```

Defined in: [src/std/audio/web\_audio.ts:97](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/audio/web_audio.ts#L97)

读取文件并播放。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `filePath` | `string` | 文件路径。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`AsyncIOResult`\<`AudioBufferSourceNode`\>

正在播放的 AudioBufferSourceNode。
