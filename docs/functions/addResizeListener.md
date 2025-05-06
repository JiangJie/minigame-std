[**minigame-std**](../README.md)

***

[minigame-std](../README.md) / addResizeListener

# Function: addResizeListener()

```ts
function addResizeListener(listener): () => void
```

Defined in: [src/std/event/mod.ts:49](https://github.com/JiangJie/minigame-std/blob/8c5db4b9c3dabb4d0435a493922f29b60a730f0d/src/std/event/mod.ts#L49)

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
