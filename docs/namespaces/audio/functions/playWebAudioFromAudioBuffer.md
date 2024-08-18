[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromAudioBuffer

# Function: playWebAudioFromAudioBuffer()

```ts
function playWebAudioFromAudioBuffer(buffer, options?): AudioBufferSourceNode
```

播放一个 AudioBuffer。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `AudioBuffer` | 解码后的 AudioBuffer。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`AudioBufferSourceNode`

正在播放的 AudioBufferSourceNode。

## Defined in

[src/std/web\_audio/mod.ts:56](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/web_audio/mod.ts#L56)
