[**minigame-std**](../README.md) • **Docs**

***

[minigame-std](../README.md) / addErrorListener

# Function: addErrorListener()

```ts
function addErrorListener(listener): () => void
```

添加错误监听器，用于监听标准的错误事件。

## Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `listener` | (`ev`) => `void` | 错误事件的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Defined in

[src/std/event/mod.ts:18](https://github.com/JiangJie/minigame-std/blob/d842b492eda479274cfeb38a06f4c4255b5493bc/src/std/event/mod.ts#L18)
