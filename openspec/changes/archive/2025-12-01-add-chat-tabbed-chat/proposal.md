# Change: 为聊天界面引入浏览器式标签栏

## Why
- 目前每次只能查看一个话题/Session，需要频繁展开侧栏查找，切换成本高。
- 用户希望像浏览器一样快速打开多个对话并在顶部自由切换，标签可关闭/拖拽。

## What Changes
- 在聊天主区域新增“聊天标签栏”组件，承载多个话题或 Agent Session。
- 扩展 runtime/chat 状态，记录已打开标签、活动标签及其排序，支持拖拽、关闭、未读标记。
- Topics/Sessions 列表点击改为在标签栏打开，提供固定/关闭操作；快捷键支持 Ctrl+Tab、Ctrl+W 等操作。
- 标签栏跨顶部/左侧导航模式都可用，并与 existing Inputbar/Messages 逻辑兼容。

## Impact
- Affected specs: chat-ui
- Affected code: src/renderer/src/pages/home/, src/renderer/src/store/runtime.ts, src/renderer/src/components/Tab/, hooks/useTopic.ts, 及相关快捷键/服务
