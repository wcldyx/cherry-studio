import { useAppDispatch, useAppSelector } from '@renderer/store'
import {
  closeChatTabAction,
  openChatTabAction,
  reorderChatTabsAction,
  setActiveChatTabAction,
  updateChatTabMetaAction
} from '@renderer/store/runtime'
import type { Assistant, Topic } from '@renderer/types'
import type { ChatTab } from '@renderer/types/chat'
import { useCallback } from 'react'

export const getTopicTabId = (topicId: string) => `topic:${topicId}`
export const getSessionTabId = (agentId: string, sessionId: string) => `session:${agentId}:${sessionId}`

export const useChatTabs = () => {
  const dispatch = useAppDispatch()
  const tabs = useAppSelector((state) => state.runtime.chat.tabs)
  const activeTabId = useAppSelector((state) => state.runtime.chat.activeTabId)

  const openTopicTab = useCallback(
    (assistant: Assistant, topic: Topic, options?: { activate?: boolean }) => {
      const prevActive = activeTabId
      dispatch(
        openChatTabAction({
          id: getTopicTabId(topic.id),
          assistantId: assistant.id,
          topicId: topic.id,
          type: 'topic',
          title: topic.name || assistant.name
        })
      )
      if (options?.activate === false && prevActive && prevActive !== getTopicTabId(topic.id)) {
        dispatch(setActiveChatTabAction(prevActive))
      }
    },
    [activeTabId, dispatch]
  )

  const openSessionTab = useCallback(
    (assistantId: string, sessionId: string, options: { title?: string; activate?: boolean } = {}) => {
      const prevActive = activeTabId
      dispatch(
        openChatTabAction({
          id: getSessionTabId(assistantId, sessionId),
          assistantId,
          sessionId,
          type: 'session',
          title: options.title || 'Session'
        })
      )
      if (options.activate === false && prevActive && prevActive !== getSessionTabId(assistantId, sessionId)) {
        dispatch(setActiveChatTabAction(prevActive))
      }
    },
    [activeTabId, dispatch]
  )

  const setActiveTab = useCallback(
    (tabId: string | null) => {
      dispatch(setActiveChatTabAction(tabId))
    },
    [dispatch]
  )

  const closeTab = useCallback(
    (tabId: string) => {
      dispatch(closeChatTabAction(tabId))
    },
    [dispatch]
  )

  const reorderTabs = useCallback(
    (nextTabs: ChatTab[]) => {
      dispatch(reorderChatTabsAction(nextTabs))
    },
    [dispatch]
  )

  const updateTabMeta = useCallback(
    (payload: { id: string } & Partial<ChatTab>) => {
      dispatch(updateChatTabMetaAction(payload))
    },
    [dispatch]
  )

  return {
    tabs,
    activeTabId,
    openTopicTab,
    openSessionTab,
    setActiveTab,
    closeTab,
    reorderTabs,
    updateTabMeta
  }
}
