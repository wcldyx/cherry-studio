import type { RootState } from '@renderer/store'
import { hydrateChatTabsAction } from '@renderer/store/runtime'
import type { ChatTab } from '@renderer/types/chat'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  buildPersistedChatTabsState,
  CHAT_TABS_STORAGE_KEY,
  ChatTabsPersistenceService,
  normalizePersistedChatTabs
} from '../ChatTabsPersistenceService'

const createMockState = (chatOverride?: Partial<RootState['runtime']['chat']>): RootState => {
  return {
    runtime: {
      chat: {
        isMultiSelectMode: false,
        selectedMessageIds: [],
        activeTopic: null,
        activeAgentId: null,
        activeSessionIdMap: {},
        activeTopicOrSession: 'topic',
        renamingTopics: [],
        newlyRenamedTopics: [],
        sessionWaiting: {},
        tabs: [],
        activeTabId: null,
        ...chatOverride
      }
    }
  } as unknown as RootState
}

const createMockStore = (state: RootState) => {
  let listener: (() => void) | null = null
  return {
    getState: () => state,
    dispatch: vi.fn(),
    subscribe: (next: () => void) => {
      listener = next
      return () => {
        if (listener === next) {
          listener = null
        }
      }
    },
    notify: () => {
      listener?.()
    }
  }
}

const buildTab = (overrides: Partial<ChatTab>): ChatTab => ({
  id: overrides.id ?? 'topic:1',
  title: overrides.title ?? 'Topic',
  type: overrides.type ?? 'topic',
  assistantId: overrides.assistantId ?? 'assistant-1',
  topicId: overrides.topicId,
  sessionId: overrides.sessionId
})

describe('ChatTabsPersistenceService helpers', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('normalizes persisted data and drops invalid entries', () => {
    const normalized = normalizePersistedChatTabs({
      version: 1,
      activeTabId: 'session:missing',
      tabs: [
        null,
        { id: 'topic:1', title: 'Valid Topic', assistantId: 'assistant-1', type: 'topic', topicId: 't1' },
        { id: 'session:missing', assistantId: 'assistant-2', type: 'session' },
        { id: 'session:1', title: 'Session', assistantId: 'assistant-2', type: 'session', sessionId: 's1' },
        { id: 'topic:1', title: 'Duplicate', assistantId: 'assistant-1', type: 'topic', topicId: 't1' }
      ]
    })

    expect(normalized).toEqual({
      tabs: [
        {
          id: 'topic:1',
          title: 'Valid Topic',
          assistantId: 'assistant-1',
          type: 'topic',
          topicId: 't1'
        },
        {
          id: 'session:1',
          title: 'Session',
          assistantId: 'assistant-2',
          type: 'session',
          sessionId: 's1'
        }
      ],
      activeTabId: 'topic:1'
    })
  })

  it('returns null when payload cannot be parsed', () => {
    expect(normalizePersistedChatTabs('invalid')).toBeNull()
    expect(normalizePersistedChatTabs({})).toEqual({ tabs: [], activeTabId: null })
  })

  it('builds a persisted snapshot with version metadata', () => {
    const snapshot = buildPersistedChatTabsState([buildTab({})], 'topic:1')
    expect(snapshot.version).toBeGreaterThan(0)
    expect(snapshot.tabs).toHaveLength(1)
    expect(snapshot.activeTabId).toBe('topic:1')
  })
})

describe('ChatTabsPersistenceService', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('hydrates state from storage when available', () => {
    const service = new ChatTabsPersistenceService()
    const persisted = buildPersistedChatTabsState(
      [buildTab({ id: 'topic:seed', title: 'Seed Topic', topicId: 'topic-1' })],
      'topic:seed'
    )
    window.localStorage.setItem(CHAT_TABS_STORAGE_KEY, JSON.stringify(persisted))

    const state = createMockState()
    const store = createMockStore(state)
    service.init(store as any)

    expect(store.dispatch).toHaveBeenCalledWith(
      hydrateChatTabsAction({
        tabs: persisted.tabs,
        activeTabId: 'topic:seed'
      })
    )
    service.dispose()
  })

  it('persists chat tab updates when store changes', () => {
    const service = new ChatTabsPersistenceService()
    const state = createMockState()
    const store = createMockStore(state)

    service.init(store as any)

    state.runtime.chat.tabs = [buildTab({ id: 'topic:99', topicId: 'topic-99', title: 'Restored' })]
    state.runtime.chat.activeTabId = 'topic:99'
    store.notify()

    const savedRaw = window.localStorage.getItem(CHAT_TABS_STORAGE_KEY)
    expect(savedRaw).toBeTruthy()
    const parsed = JSON.parse(savedRaw || '')
    expect(parsed.tabs).toHaveLength(1)
    expect(parsed.activeTabId).toBe('topic:99')
    service.dispose()
  })
})
