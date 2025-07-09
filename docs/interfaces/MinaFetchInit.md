[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / MinaFetchInit

# Interface: MinaFetchInit

Defined in: [src/std/fetch/fetch\_defines.ts:7](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fetch/fetch_defines.ts#L7)

微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。

## Extends

- `Omit`\<`WechatMinigame.RequestOption`, `"url"` \| `"dataType"` \| `"responseType"` \| `"success"` \| `"fail"`\>

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| <a id="onchunk"></a> `onChunk?` | (`chunk`: `Uint8Array`) => `void` | [src/std/fetch/fetch\_defines.ts:9](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fetch/fetch_defines.ts#L9) |
| <a id="responsetype"></a> `responseType?` | `"arraybuffer"` \| `"text"` \| `"json"` | [src/std/fetch/fetch\_defines.ts:8](https://github.com/JiangJie/minigame-std/blob/c702c23d8258d9dd96d873df515d0027c84fb302/src/std/fetch/fetch_defines.ts#L8) |
