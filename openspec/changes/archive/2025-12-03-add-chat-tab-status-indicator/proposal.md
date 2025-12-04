# Change: 提供聊天标签状态指示

## Why
- 目前只有激活标签能看到模型回复进度，切换到其他标签后无法得知原标签是否仍在生成或已完成，导致用户需要频繁来回切换检查。
- 缺乏直观的状态提示也会让用户误以为任务卡住或结束，影响多任务处理体验。

## What Changes
- 在 Redux runtime store 中为聊天标签扩展运行状态（空闲/生成中/失败），并与消息发送、流式推理生命周期保持同步。
- ChatTabsBar 在每个标签上展示状态角标（旋转、完成、失败），即使标签未激活也可一眼辨识；状态变化需与消息区一致。
- 生成完成或失败时触发微提示/可选提醒，方便用户切回处理；允许未来扩展为点击角标直接定位。
- 更新 chat-ui 规格，新增“标签生成状态提示”要求与场景。

## Impact
- Affected specs: `chat-ui`
- Affected code: runtime store (chat.tabs), message发送/推理 thunk、ChatTabsBar、Chat.tsx 状态同步、可能的通知/提示组件
