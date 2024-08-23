[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromArrayBuffer

# Function: playWebAudioFromArrayBuffer()

```ts
function playWebAudioFromArrayBuffer(buffer, options?): Promise<AudioBufferSourceNode>
```

使用 Buffer 进行解码播放。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `BufferSource` | 需要解码的 Buffer。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`Promise`\<`AudioBufferSourceNode`\>

正在播放的 AudioBufferSourceNode。

## Defined in

[src/std/audio/web\_audio.ts:84](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/audio/web_audio.ts#L84)
