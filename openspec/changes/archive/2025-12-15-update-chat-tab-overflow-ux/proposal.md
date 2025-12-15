# Change: 更新聊天标签栏溢出体验

## Why
- 标签过多时当前布局没有类似 Chrome 的层叠与压缩，阅读和点击成本高。
- 缺少鼠标悬停滚轮横向滚动，超出后操作不便。

## What Changes
- 为聊天标签栏补充 Chrome 式层叠/压缩展示规则，保证激活/关闭操作仍易点。
- 当压缩后仍溢出时，支持悬停时用鼠标滚轮进行水平滚动以浏览全部标签。
- 在 chat-ui 规格中补充对应要求，指导后续实现与验证。

## Impact
- Affected specs: chat-ui
- Affected code: `src/renderer/src/pages/home/ChatTabsBar.tsx`、标签栏样式与滚动/交互逻辑
