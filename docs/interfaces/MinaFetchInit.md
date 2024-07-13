[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / MinaFetchInit

# Interface: MinaFetchInit

微信小游戏网络请求初始化配置接口，继承自微信小游戏请求选项，除去'url'和'responseType'。

## Extends

- `Omit`\<`WechatMinigame.RequestOption`, `"url"` \| `"responseType"`\>

## Properties

| Property | Type | Description | Inherited from | Defined in |
| ------ | ------ | ------ | ------ | ------ |
| `abortable?` | `boolean` | - | - | [src/std/fetch/fetch\_defines.ts:7](https://github.com/JiangJie/minigame-std/blob/b22fceadbb04574df41eed36a50100fba3cc5e73/src/std/fetch/fetch_defines.ts#L7) |
| `complete?` | `RequestCompleteCallback` | 接口调用结束的回调函数（调用成功、失败都会执行） | `Omit.complete` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5890 |
| `data?` | `string` \| `ArrayBuffer` \| `IAnyObject` | 请求的参数 | `Omit.data` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5892 |
| `dataType?` | `"json"` \| `"其他"` | 返回的数据格式 可选值： - 'json': 返回的数据为 JSON，返回后会对返回的数据进行一次 JSON.parse; - '其他': 不对返回的内容进行 JSON.parse; | `Omit.dataType` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5898 |
| `enableCache?` | `boolean` | 需要基础库： `2.10.4` 开启 cache | `Omit.enableCache` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5902 |
| `enableChunked?` | `boolean` | 需要基础库： `2.20.2` 开启 transfer-encoding chunked。 | `Omit.enableChunked` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5906 |
| `enableHttp2?` | `boolean` | 需要基础库： `2.10.4` 开启 http2 | `Omit.enableHttp2` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5910 |
| `enableHttpDNS?` | `boolean` | 需要基础库： `2.19.1` 是否开启 HttpDNS 服务。如开启，需要同时填入 httpDNSServiceId 。 HttpDNS 用法详见 [移动解析HttpDNS](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/HTTPDNS.html) | `Omit.enableHttpDNS` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5914 |
| `enableQuic?` | `boolean` | 需要基础库： `2.10.4` 开启 quic | `Omit.enableQuic` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5918 |
| `fail?` | `RequestFailCallback` | 接口调用失败的回调函数 | `Omit.fail` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5920 |
| `forceCellularNetwork?` | `boolean` | 需要基础库： `2.21.0` 强制使用蜂窝网络发送请求 | `Omit.forceCellularNetwork` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5924 |
| `header?` | `IAnyObject` | 设置请求的 header，header 中不能设置 Referer。 `content-type` 默认为 `application/json` | `Omit.header` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5928 |
| `httpDNSServiceId?` | `string` | 需要基础库： `2.19.1` HttpDNS 服务商 Id。 HttpDNS 用法详见 [移动解析HttpDNS](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/HTTPDNS.html) | `Omit.httpDNSServiceId` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5932 |
| `method?` | \| `"OPTIONS"` \| `"GET"` \| `"HEAD"` \| `"POST"` \| `"PUT"` \| `"DELETE"` \| `"TRACE"` \| `"CONNECT"` | HTTP 请求方法 可选值： - 'OPTIONS': HTTP 请求 OPTIONS; - 'GET': HTTP 请求 GET; - 'HEAD': HTTP 请求 HEAD; - 'POST': HTTP 请求 POST; - 'PUT': HTTP 请求 PUT; - 'DELETE': HTTP 请求 DELETE; - 'TRACE': HTTP 请求 TRACE; - 'CONNECT': HTTP 请求 CONNECT; | `Omit.method` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5944 |
| `redirect?` | `"follow"` \| `"manual"` | 需要基础库： `3.2.2` 重定向拦截策略。（目前仅安卓和iOS端支持，开发者工具和PC端将在后续支持） 可选值： - 'follow': 不拦截重定向，即客户端自动处理重定向; - 'manual': 拦截重定向。开启后，当 http 状态码为 3xx 时客户端不再自动重定向，而是触发 onHeadersReceived 回调，并结束本次 request 请求。可通过 onHeadersReceived 回调中的 header.Location 获取重定向的 url; | `Omit.redirect` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5960 |
| `responseType?` | `"arraybuffer"` \| `"text"` \| `"json"` | - | - | [src/std/fetch/fetch\_defines.ts:8](https://github.com/JiangJie/minigame-std/blob/b22fceadbb04574df41eed36a50100fba3cc5e73/src/std/fetch/fetch_defines.ts#L8) |
| `success?` | `RequestSuccessCallback`\<`string` \| `ArrayBuffer` \| `IAnyObject`\> | 接口调用成功的回调函数 | `Omit.success` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5970 |
| `timeout?` | `number` | 需要基础库： `2.10.0` 超时时间，单位为毫秒。默认值为 60000 | `Omit.timeout` | node\_modules/.pnpm/minigame-api-typings@3.8.4/node\_modules/minigame-api-typings/types/wx/lib.wx.api.d.ts:5974 |
