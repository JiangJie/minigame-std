[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / addUnhandledrejectionListener

# Function: addUnhandledrejectionListener()

```ts
function addUnhandledrejectionListener(listener): () => void
```

添加未处理的 Promise 拒绝事件监听器。

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `listener` | (`ev`) => `void` | 未处理的 Promise 拒绝事件的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Source

[src/std/event/mod.ts:38](https://github.com/JiangJie/minigame-std/blob/1bf3ee8cf3321353e47e032c8721e63dd3e21497/src/std/event/mod.ts#L38)
