[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromAudioBuffer

# Function: playWebAudioFromAudioBuffer()

```ts
function playWebAudioFromAudioBuffer(buffer, options?): AudioBufferSourceNode
```

Defined in: [src/std/audio/web\_audio.ts:54](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/audio/web_audio.ts#L54)

播放一个 AudioBuffer。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `AudioBuffer` | 解码后的 AudioBuffer。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`AudioBufferSourceNode`

正在播放的 AudioBufferSourceNode。
