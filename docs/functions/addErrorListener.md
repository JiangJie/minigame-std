[**minigame-std**](../index.md) • **Docs**

***

[minigame-std](../index.md) / addErrorListener

# Function: addErrorListener()

```ts
function addErrorListener(listener): () => void
```

添加错误监听器，用于监听标准的错误事件。

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `listener` | (`ev`) => `void` | 错误事件的回调函数。 |

## Returns

`Function`

返回一个函数，调用该函数可以移除监听器。

### Returns

`void`

## Source

[src/std/event/mod.ts:10](https://github.com/JiangJie/minigame-std/blob/fe87039c9bf9e09f2936bdac3b9a02fcf5e4b50c/src/std/event/mod.ts#L10)
