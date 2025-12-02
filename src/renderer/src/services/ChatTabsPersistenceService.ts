import { loggerService } from '@logger'
import type { Store } from '@reduxjs/toolkit'
import type { RootState } from '@renderer/store'
import { hydrateChatTabsAction } from '@renderer/store/runtime'
import type { ChatTab } from '@renderer/types/chat'

const logger = loggerService.withContext('ChatTabsPersistenceService')

export const CHAT_TABS_STORAGE_KEY = 'chat-tabs-state'
const CHAT_TABS_STORAGE_VERSION = 1

export interface PersistedChatTabsState {
  version: number
  tabs: ChatTab[]
  activeTabId: string | null
}

export interface NormalizedPersistedChatTabsState {
  tabs: ChatTab[]
  activeTabId: string | null
}

export const normalizePersistedChatTabs = (raw: unknown): NormalizedPersistedChatTabsState | null => {
  if (!raw || typeof raw !== 'object') return null
  const candidate = raw as Partial<PersistedChatTabsState>
  const rawTabs = Array.isArray(candidate.tabs) ? candidate.tabs : []

  const seen = new Set<string>()
  const tabs: ChatTab[] = []

  for (const tab of rawTabs) {
    if (!tab || typeof tab !== 'object') continue
    const tabCandidate = tab as Partial<ChatTab>
    if (typeof tabCandidate.id !== 'string' || typeof tabCandidate.title !== 'string') continue
    if (tabCandidate.type !== 'topic' && tabCandidate.type !== 'session') continue
    if (typeof tabCandidate.assistantId !== 'string') continue
    if (seen.has(tabCandidate.id)) continue

    const normalized: ChatTab = {
      id: tabCandidate.id,
      title: tabCandidate.title,
      type: tabCandidate.type,
      assistantId: tabCandidate.assistantId
    }

    if (tabCandidate.topicId && typeof tabCandidate.topicId === 'string') {
      normalized.topicId = tabCandidate.topicId
    }
    if (tabCandidate.sessionId && typeof tabCandidate.sessionId === 'string') {
      normalized.sessionId = tabCandidate.sessionId
    }

    tabs.push(normalized)
    seen.add(normalized.id)
  }

  if (tabs.length === 0) {
    return {
      tabs: [],
      activeTabId: null
    }
  }

  const activeInList =
    typeof candidate.activeTabId === 'string' && tabs.some((tab) => tab.id === candidate.activeTabId)
      ? candidate.activeTabId
      : (tabs[0]?.id ?? null)

  return {
    tabs,
    activeTabId: activeInList
  }
}

export const buildPersistedChatTabsState = (tabs: ChatTab[], activeTabId: string | null): PersistedChatTabsState => ({
  version: CHAT_TABS_STORAGE_VERSION,
  tabs,
  activeTabId
})

export class ChatTabsPersistenceService {
  private initialized = false
  private unsubscribe: (() => void) | null = null
  private lastSerialized = ''

  init(store: Store<RootState>) {
    if (this.initialized) return
    this.initialized = true

    try {
      this.hydrate(store)
    } catch (error) {
      logger.error('Failed to hydrate chat tabs from storage', error as Error)
    }

    this.unsubscribe = store.subscribe(() => {
      try {
        this.persist(store.getState())
      } catch (error) {
        logger.error('Failed to persist chat tabs state', error as Error)
      }
    })
  }

  dispose() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = null
    }
    this.initialized = false
    this.lastSerialized = ''
  }

  private hydrate(store: Store<RootState>) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    const stored = window.localStorage.getItem(CHAT_TABS_STORAGE_KEY)
    if (!stored) return

    let parsed: PersistedChatTabsState | null = null
    try {
      parsed = JSON.parse(stored) as PersistedChatTabsState
    } catch (error) {
      logger.warn('Invalid chat tabs state payload, clearing storage', error as Error)
      window.localStorage.removeItem(CHAT_TABS_STORAGE_KEY)
      return
    }

    if (!parsed || parsed.version !== CHAT_TABS_STORAGE_VERSION) {
      window.localStorage.removeItem(CHAT_TABS_STORAGE_KEY)
      return
    }

    const normalized = normalizePersistedChatTabs(parsed)
    if (!normalized) {
      window.localStorage.removeItem(CHAT_TABS_STORAGE_KEY)
      return
    }

    const state = store.getState()
    if (state.runtime.chat.tabs.length > 0) {
      return
    }

    store.dispatch(hydrateChatTabsAction(normalized))
  }

  private persist(state: RootState) {
    if (typeof window === 'undefined' || !window.localStorage) {
      return
    }
    const snapshot = buildPersistedChatTabsState(state.runtime.chat.tabs, state.runtime.chat.activeTabId)
    const serialized = JSON.stringify(snapshot)
    if (serialized === this.lastSerialized) {
      return
    }
    this.lastSerialized = serialized
    window.localStorage.setItem(CHAT_TABS_STORAGE_KEY, serialized)
  }
}

const chatTabsPersistenceService = new ChatTabsPersistenceService()

export default chatTabsPersistenceService
