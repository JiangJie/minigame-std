[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromAudioBuffer

# Function: playWebAudioFromAudioBuffer()

```ts
function playWebAudioFromAudioBuffer(buffer, options?): AudioBufferSourceNode
```

Defined in: [src/std/audio/web\_audio.ts:54](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/audio/web_audio.ts#L54)

播放一个 AudioBuffer。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `AudioBuffer` | 解码后的 AudioBuffer。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`AudioBufferSourceNode`

正在播放的 AudioBufferSourceNode。
