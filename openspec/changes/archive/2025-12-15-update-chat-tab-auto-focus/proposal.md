# Change: 更新聊天标签自动聚焦与滚动定位

## Why
- 当前切换话题或通过侧栏/快捷键打开某个对话时，标签栏可能未滚到该标签位置，用户需要手动滚动查找，流程多一步。

## What Changes
- 当通过任意入口切换到某个话题/Session 时，聊天标签栏应自动激活对应标签并滚动到可视区域。
- 在 chat-ui 规格中补充自动聚焦与滚动定位的场景要求，避免用户手动查找标签。

## Impact
- Affected specs: chat-ui
- Affected code: 聊天标签栏激活/滚动逻辑（ChatTabsBar 等），切换话题/Session 的调度逻辑
