[**minigame-std**](../../../README.md)

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromArrayBuffer

# Function: playWebAudioFromArrayBuffer()

```ts
function playWebAudioFromArrayBuffer(buffer, options?): Promise<AudioBufferSourceNode>
```

Defined in: [src/std/audio/web\_audio.ts:84](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/audio/web_audio.ts#L84)

使用 Buffer 进行解码播放。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `BufferSource` | 需要解码的 Buffer。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`Promise`\<`AudioBufferSourceNode`\>

正在播放的 AudioBufferSourceNode。
