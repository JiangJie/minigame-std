[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / addResizeListener

# Function: addResizeListener()

```ts
function addResizeListener(listener): () => void
```

添加窗口大小变化监听器。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | `OnWindowResizeCallback` | 窗口大小变化的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Defined in

[src/std/event/mod.ts:49](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/event/mod.ts#L49)
