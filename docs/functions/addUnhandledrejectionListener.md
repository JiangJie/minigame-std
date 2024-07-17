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
| ------ | ------ | ------ |
| `listener` | (`ev`) => `void` | 未处理的 Promise 拒绝事件的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Defined in

[event/mod.ts:38](https://github.com/JiangJie/minigame-std/blob/1187f9b62000e3d29782e461fb54ceb4107f512c/src/std/event/mod.ts#L38)
