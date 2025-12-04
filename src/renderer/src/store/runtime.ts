import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'
import { AppLogo, UserAvatar } from '@renderer/config/env'
import type { MinAppType, Topic, WebSearchStatus } from '@renderer/types'
import type { ChatTab } from '@renderer/types/chat'
import type { ChatTabStatus } from '@renderer/types/chat'
import type { UpdateInfo } from 'builder-util-runtime'

type ChatTabPayload = Omit<ChatTab, 'status' | 'pendingRequests' | 'hasPendingError'> &
  Partial<Pick<ChatTab, 'status' | 'pendingRequests' | 'hasPendingError'>>

type ChatTabResult = 'success' | 'error' | 'cancelled'

const createChatTab = (tab: ChatTabPayload): ChatTab => ({
  ...tab,
  status: tab.status ?? 'idle',
  pendingRequests: tab.pendingRequests ?? 0,
  hasPendingError: tab.hasPendingError ?? false
})

const resetCompletedStatus = (tab?: ChatTab | null) => {
  if (tab && (tab.status === 'success' || tab.status === 'error')) {
    tab.status = 'idle'
    tab.hasPendingError = false
  }
}

export interface ChatState {
  isMultiSelectMode: boolean
  selectedMessageIds: string[]
  activeTopic: Topic | null
  /** UI state. null represents no active agent */
  activeAgentId: string | null
  /** UI state. Map agent id to active session id.
   *  null represents no active session  */
  activeSessionIdMap: Record<string, string | null>
  /** meanwhile active Assistants or Agents */
  activeTopicOrSession: 'topic' | 'session'
  /** topic ids that are currently being renamed */
  renamingTopics: string[]
  /** topic ids that are newly renamed */
  newlyRenamedTopics: string[]
  /** is a session waiting for updating/deleting. undefined and false share same semantics.  */
  sessionWaiting: Record<string, boolean>
  /** opened chat tabs for quick navigation */
  tabs: ChatTab[]
  /** currently active chat tab id */
  activeTabId: string | null
  /** map assistant message id to chat tab */
  messageTabMap: Record<string, string>
}

export interface WebSearchState {
  activeSearches: Record<string, WebSearchStatus>
}

export interface UpdateState {
  info: UpdateInfo | null
  checking: boolean
  downloading: boolean
  downloaded: boolean
  downloadProgress: number
  available: boolean
}

export interface RuntimeState {
  avatar: string
  generating: boolean
  translating: boolean
  translateAbortKey?: string
  /** whether the minapp popup is shown */
  minappShow: boolean
  /** the minapps that are opened and should be keep alive */
  openedKeepAliveMinapps: MinAppType[]
  /** the minapp that is opened for one time */
  openedOneOffMinapp: MinAppType | null
  /** the current minapp id */
  currentMinappId: string
  searching: boolean
  filesPath: string
  resourcesPath: string
  update: UpdateState
  export: ExportState
  chat: ChatState
  websearch: WebSearchState
}

export interface ExportState {
  isExporting: boolean
}

const initialState: RuntimeState = {
  avatar: UserAvatar,
  generating: false,
  translating: false,
  minappShow: false,
  openedKeepAliveMinapps: [],
  openedOneOffMinapp: null,
  currentMinappId: '',
  searching: false,
  filesPath: '',
  resourcesPath: '',
  update: {
    info: null,
    checking: false,
    downloading: false,
    downloaded: false,
    downloadProgress: 0,
    available: false
  },
  export: {
    isExporting: false
  },
  chat: {
    isMultiSelectMode: false,
    selectedMessageIds: [],
    activeTopic: null,
    activeAgentId: null,
    activeTopicOrSession: 'topic',
    activeSessionIdMap: {},
    renamingTopics: [],
    newlyRenamedTopics: [],
    sessionWaiting: {},
    tabs: [],
    activeTabId: null,
    messageTabMap: {}
  },
  websearch: {
    activeSearches: {}
  }
}

const runtimeSlice = createSlice({
  name: 'runtime',
  initialState,
  reducers: {
    setAvatar: (state, action: PayloadAction<string | null>) => {
      state.avatar = action.payload || AppLogo
    },
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.generating = action.payload
    },
    setTranslating: (state, action: PayloadAction<boolean>) => {
      state.translating = action.payload
    },
    setTranslateAbortKey: (state, action: PayloadAction<string>) => {
      state.translateAbortKey = action.payload
    },
    setMinappShow: (state, action: PayloadAction<boolean>) => {
      state.minappShow = action.payload
    },
    setOpenedKeepAliveMinapps: (state, action: PayloadAction<MinAppType[]>) => {
      state.openedKeepAliveMinapps = action.payload
    },
    setOpenedOneOffMinapp: (state, action: PayloadAction<MinAppType | null>) => {
      state.openedOneOffMinapp = action.payload
    },
    setCurrentMinappId: (state, action: PayloadAction<string>) => {
      state.currentMinappId = action.payload
    },
    setSearching: (state, action: PayloadAction<boolean>) => {
      state.searching = action.payload
    },
    setFilesPath: (state, action: PayloadAction<string>) => {
      state.filesPath = action.payload
    },
    setResourcesPath: (state, action: PayloadAction<string>) => {
      state.resourcesPath = action.payload
    },
    setUpdateState: (state, action: PayloadAction<Partial<UpdateState>>) => {
      state.update = { ...state.update, ...action.payload }
    },
    setExportState: (state, action: PayloadAction<Partial<ExportState>>) => {
      state.export = { ...state.export, ...action.payload }
    },
    // Chat related actions
    toggleMultiSelectMode: (state, action: PayloadAction<boolean>) => {
      state.chat.isMultiSelectMode = action.payload
      if (!action.payload) {
        state.chat.selectedMessageIds = []
      }
    },
    setSelectedMessageIds: (state, action: PayloadAction<string[]>) => {
      state.chat.selectedMessageIds = action.payload
    },
    setActiveTopic: (state, action: PayloadAction<Topic>) => {
      // @ts-ignore ts2589 false positive
      state.chat.activeTopic = action.payload
    },
    setActiveAgentId: (state, action: PayloadAction<string | null>) => {
      state.chat.activeAgentId = action.payload
    },
    setActiveSessionIdAction: (state, action: PayloadAction<{ agentId: string; sessionId: string | null }>) => {
      const { agentId, sessionId } = action.payload
      state.chat.activeSessionIdMap[agentId] = sessionId
    },
    setActiveTopicOrSessionAction: (state, action: PayloadAction<'topic' | 'session'>) => {
      state.chat.activeTopicOrSession = action.payload
    },
    setRenamingTopics: (state, action: PayloadAction<string[]>) => {
      state.chat.renamingTopics = action.payload
    },
    setNewlyRenamedTopics: (state, action: PayloadAction<string[]>) => {
      state.chat.newlyRenamedTopics = action.payload
    },
    // WebSearch related actions
    setActiveSearches: (state, action: PayloadAction<Record<string, WebSearchStatus>>) => {
      state.websearch.activeSearches = action.payload
    },
    setWebSearchStatus: (state, action: PayloadAction<{ requestId: string; status: WebSearchStatus }>) => {
      const { requestId, status } = action.payload
      if (status.phase === 'default') {
        delete state.websearch.activeSearches[requestId]
      }
      state.websearch.activeSearches[requestId] = status
    },
    setSessionWaitingAction: (state, action: PayloadAction<{ id: string; value: boolean }>) => {
      const { id, value } = action.payload
      state.chat.sessionWaiting[id] = value
    },
    openChatTabAction: (state, action: PayloadAction<ChatTabPayload>) => {
      const tabPayload = action.payload
      const index = state.chat.tabs.findIndex((item) => item.id === tabPayload.id)
      if (index >= 0) {
        const existing = state.chat.tabs[index]
        state.chat.tabs[index] = {
          ...existing,
          ...tabPayload,
          status: existing.status,
          pendingRequests: existing.pendingRequests,
          hasPendingError: existing.hasPendingError
        }
      } else {
        state.chat.tabs.push(createChatTab(tabPayload))
      }
      state.chat.activeTabId = tabPayload.id
      resetCompletedStatus(state.chat.tabs.find((item) => item.id === tabPayload.id))
    },
    closeChatTabAction: (state, action: PayloadAction<string>) => {
      const tabId = action.payload
      const index = state.chat.tabs.findIndex((item) => item.id === tabId)
      if (index === -1) return
      const closedTabId = state.chat.tabs[index]?.id
      state.chat.tabs.splice(index, 1)
      if (closedTabId) {
        Object.entries(state.chat.messageTabMap).forEach(([messageId, mappedTabId]) => {
          if (mappedTabId === closedTabId) {
            delete state.chat.messageTabMap[messageId]
          }
        })
      }
      if (state.chat.activeTabId === tabId) {
        const fallback = state.chat.tabs[index] || state.chat.tabs[index - 1] || null
        state.chat.activeTabId = fallback ? fallback.id : null
        resetCompletedStatus(fallback || null)
      }
    },
    setActiveChatTabAction: (state, action: PayloadAction<string | null>) => {
      state.chat.activeTabId = action.payload
      if (!action.payload) return
      const tab = state.chat.tabs.find((item) => item.id === action.payload)
      resetCompletedStatus(tab)
    },
    startChatTabTaskAction: (state, action: PayloadAction<{ tabId: string; messageId: string }>) => {
      const { tabId, messageId } = action.payload
      const tab = state.chat.tabs.find((item) => item.id === tabId)
      if (!tab) {
        return
      }
      tab.pendingRequests = (tab.pendingRequests ?? 0) + 1
      if (tab.pendingRequests === 1) {
        tab.hasPendingError = false
      }
      tab.status = 'running'
      state.chat.messageTabMap[messageId] = tab.id
    },
    completeChatTabTaskAction: (state, action: PayloadAction<{ messageId: string; result: ChatTabResult }>) => {
      const { messageId, result } = action.payload
      const tabId = state.chat.messageTabMap[messageId]
      if (!tabId) {
        return
      }
      delete state.chat.messageTabMap[messageId]
      const tab = state.chat.tabs.find((item) => item.id === tabId)
      if (!tab) return
      tab.pendingRequests = Math.max(0, (tab.pendingRequests ?? 0) - 1)
      if (result === 'error') {
        tab.hasPendingError = true
      }
      if (tab.pendingRequests > 0) {
        return
      }
      if (tab.hasPendingError) {
        tab.status = 'error'
      } else if (result === 'cancelled') {
        tab.status = 'idle'
      } else {
        tab.status = 'success'
      }
      tab.hasPendingError = false
    },
    reorderChatTabsAction: (state, action: PayloadAction<ChatTab[]>) => {
      state.chat.tabs = action.payload
    },
    updateChatTabMetaAction: (state, action: PayloadAction<{ id: string } & Partial<ChatTab>>) => {
      const { id, ...rest } = action.payload
      const index = state.chat.tabs.findIndex((tab) => tab.id === id)
      if (index === -1) return
      state.chat.tabs[index] = { ...state.chat.tabs[index], ...rest }
    },
    hydrateChatTabsAction: (
      state,
      action: PayloadAction<{ tabs: ChatTabPayload[]; activeTabId: string | null }>
    ) => {
      const tabs = action.payload.tabs || []
      state.chat.tabs = tabs.map((tab) => createChatTab(tab))
      state.chat.messageTabMap = {}
      const desiredActiveId = action.payload.activeTabId
      const existing = tabs.find((tab) => tab.id === desiredActiveId)
      const nextActive = existing?.id || tabs[0]?.id || null
      state.chat.activeTabId = nextActive
      const activeTab = tabs.find((tab) => tab.id === nextActive) || null
      if (!activeTab) {
        state.chat.activeTopicOrSession = 'topic'
        state.chat.activeAgentId = null
        return
      }
      if (activeTab.type === 'session') {
        state.chat.activeTopicOrSession = 'session'
        state.chat.activeAgentId = activeTab.assistantId
        if (activeTab.sessionId) {
          state.chat.activeSessionIdMap[activeTab.assistantId] = activeTab.sessionId
        }
      } else {
        state.chat.activeTopicOrSession = 'topic'
        state.chat.activeAgentId = null
      }
    }
  }
})

export const {
  setAvatar,
  setGenerating,
  setTranslating,
  setTranslateAbortKey,
  setMinappShow,
  setOpenedKeepAliveMinapps,
  setOpenedOneOffMinapp,
  setCurrentMinappId,
  setSearching,
  setFilesPath,
  setResourcesPath,
  setUpdateState,
  setExportState,
  // Chat related actions
  toggleMultiSelectMode,
  setSelectedMessageIds,
  setActiveTopic,
  setActiveAgentId,
  setActiveSessionIdAction,
  setActiveTopicOrSessionAction,
  setRenamingTopics,
  setNewlyRenamedTopics,
  setSessionWaitingAction,
  // WebSearch related actions
  setActiveSearches,
  setWebSearchStatus,
  openChatTabAction,
  closeChatTabAction,
  setActiveChatTabAction,
  startChatTabTaskAction,
  completeChatTabTaskAction,
  reorderChatTabsAction,
  updateChatTabMetaAction,
  hydrateChatTabsAction
} = runtimeSlice.actions

export default runtimeSlice.reducer
