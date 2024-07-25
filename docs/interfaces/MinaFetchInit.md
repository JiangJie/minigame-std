[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / MinaFetchInit

# Interface: MinaFetchInit

微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。

## Extends

- `Omit`\<`WechatMinigame.RequestOption`, 
  \| `"url"`
  \| `"dataType"`
  \| `"responseType"`
  \| `"success"`
  \| `"fail"`\>

## Properties

| Property | Type | Defined in |
| ------ | ------ | ------ |
| `abortable?` | `boolean` | [fetch/fetch\_defines.ts:7](https://github.com/JiangJie/minigame-std/blob/1fb9a762786cb461df809682ecf1703bbcf00b3a/src/std/fetch/fetch_defines.ts#L7) |
| `responseType?` | `"arraybuffer"` \| `"text"` \| `"json"` | [fetch/fetch\_defines.ts:8](https://github.com/JiangJie/minigame-std/blob/1fb9a762786cb461df809682ecf1703bbcf00b3a/src/std/fetch/fetch_defines.ts#L8) |
