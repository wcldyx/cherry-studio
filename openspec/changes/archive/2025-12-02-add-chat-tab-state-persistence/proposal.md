# Change: 聊天标签页状态持久化

## Why
- 用户关闭并重新打开 Cherry Studio 时，目前的聊天标签页会重置，无法快速回到之前处理的多个话题或 Agent Session。
- 需要持久化标签状态（顺序、激活项、关联的会话信息），减少重新整理上下文的时间成本。

## What Changes
- 在本地存储当前标签集合、顺序、激活标签以及任何固定/临时态，以便应用启动时恢复。
- 启动后根据持久化数据重建标签栏，并在缺失会话或资源失效时执行安全降级（移除无效标签）。
- 补充聊天 UI 规格以覆盖「标签状态持久化」的需求。

## Impact
- Affected specs: chat-ui
- Affected code: src/renderer/modules/chat/tabs、会话状态管理、持久化存储层
