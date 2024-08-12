[**minigame-std**](../../../README.md) • **Docs**

***

[minigame-std](../../../README.md) / [audio](../README.md) / playWebAudioFromArrayBuffer

# Function: playWebAudioFromArrayBuffer()

```ts
function playWebAudioFromArrayBuffer(buffer, options?): Promise<AudioBufferSourceNode>
```

使用 ArrayBuffer 进行解码播放。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `buffer` | `ArrayBuffer` | 需要解码的 ArrayBuffer。 |
| `options`? | [`PlayOptions`](../interfaces/PlayOptions.md) | 播放选项。 |

## Returns

`Promise`\<`AudioBufferSourceNode`\>

正在播放的 AudioBufferSourceNode。

## Defined in

[src/std/web\_audio/mod.ts:85](https://github.com/JiangJie/minigame-std/blob/22787d0fd0cff776ed579de48ccf7523d9e4ce53/src/std/web_audio/mod.ts#L85)
