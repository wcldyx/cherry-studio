export type Tab = 'assistants' | 'topic' | 'settings'

export type ChatTabType = 'topic' | 'session'

export interface ChatTab {
  id: string
  title: string
  type: ChatTabType
  assistantId: string
  topicId?: string
  sessionId?: string
}

export type InputBarToolType =
  | 'new_topic'
  | 'attachment'
  | 'thinking'
  | 'web_search'
  | 'url_context'
  | 'knowledge_base'
  | 'mcp_tools'
  | 'generate_image'
  | 'mention_models'
  | 'quick_phrases'
  | 'clear_topic'
  | 'toggle_expand'
  | 'new_context'
  // Agent Session tools
  | 'create_session'
  | 'slash_commands'
  | 'activity_directory'
