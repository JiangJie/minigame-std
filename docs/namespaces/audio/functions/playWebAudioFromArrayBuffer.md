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

[src/std/web\_audio/mod.ts:86](https://github.com/JiangJie/minigame-std/blob/0b3f4c24a764d15c8d4cfbfab659d3f6c53dfd93/src/std/web_audio/mod.ts#L86)
