## ADDED Requirements
### Requirement: 标签激活自动聚焦
聊天标签栏 SHALL 在通过任何入口切换到某个话题或 Session 时，自动确保对应标签被激活并滚动到可视范围，无需用户手动滚动查找。

#### Scenario: 切换话题自动聚焦
- **WHEN** 用户通过侧栏、搜索、快捷键或其他入口切换到某个话题
- **THEN** 标签栏 MUST 激活对应标签，并在标签被遮挡时自动滚动，使其进入视口且可点击。

#### Scenario: 切换 Session 自动聚焦
- **WHEN** 用户在 Session 视图切换或跳转到某个 Agent Session
- **THEN** 标签栏 MUST 激活对应 Session 标签，并在溢出时自动滚动至可视区域，保持现有拖拽/中键关闭等交互不受影响。
