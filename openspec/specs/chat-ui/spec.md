# chat-ui Specification

## Purpose
TBD - created by archiving change add-chat-tabbed-chat. Update Purpose after archive.
## Requirements
### Requirement: 聊天标签栏管理
聊天主区域 SHALL 提供浏览器式标签栏，让用户可以同时打开多个话题或 Agent Session，并在标签中快速切换、关闭、拖拽排序，且标签状态需与侧栏/快捷键保持同步。

#### Scenario: 打开并切换话题
- **WHEN** 用户在话题列表点击某个话题或通过快捷键/新建操作
- **THEN** 系统必须在标签栏中创建/激活对应标签，并在标签切换时同步消息区显示、输入区上下文

#### Scenario: 管理 Session 标签
- **WHEN** 用户切换到 Session 视图并选择某个 Agent Session
- **THEN** 该 Session 也必须以标签形式打开，支持关闭、拖拽和重新激活；关闭后若当前标签被关闭，需要自动切换到相邻标签或默认话题

#### Scenario: 状态同步
- **WHEN** 某个标签对应的话题被删除/移动或 Session 失效
- **THEN** 标签栏必须自动移除或更新该标签，防止显示空状态，并保持激活标签指向有效会话

### Requirement: 标签状态持久化
聊天界面 SHALL 持久化标签集合、顺序、激活标签以及关联会话元数据，使用户重新打开应用时可回到原本的多标签情境。

#### Scenario: 应用重启后恢复标签
- **WHEN** 用户关闭并重新打开 Cherry Studio
- **THEN** 系统必须读取上次记录的标签集合，按原顺序创建标签并激活先前聚焦的标签，同时恢复其对应会话内容与输入状态

#### Scenario: 清理失效标签
- **WHEN** 持久化记录中的话题已被删除或 Session 不再有效
- **THEN** 系统必须在恢复过程中跳过该标签并在必要时激活下一个可用标签，确保不会呈现空白或无效的会话

