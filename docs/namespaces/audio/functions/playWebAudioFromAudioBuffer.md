[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromAudioBuffer

# Function: playWebAudioFromAudioBuffer()

```ts
function playWebAudioFromAudioBuffer(buffer, options?): AudioBufferSourceNode
```

Defined in: [src/std/audio/web\_audio.ts:54](https://github.com/JiangJie/minigame-std/blob/fdb22241c47c2e98329a4c62befde728957e03ee/src/std/audio/web_audio.ts#L54)

播放一个 AudioBuffer。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `AudioBuffer` | 解码后的 AudioBuffer。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`AudioBufferSourceNode`

正在播放的 AudioBufferSourceNode。
