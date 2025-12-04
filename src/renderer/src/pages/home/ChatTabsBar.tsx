import { Sortable, useDndReorder } from '@renderer/components/dnd'
import HorizontalScrollContainer from '@renderer/components/HorizontalScrollContainer'
import { useAssistants } from '@renderer/hooks/useAssistant'
import { useChatTabs } from '@renderer/hooks/useChatTabs'
import { useRuntime } from '@renderer/hooks/useRuntime'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/EventService'
import type { ChatTab } from '@renderer/types/chat'
import { classNames } from '@renderer/utils'
import { Plus, X } from 'lucide-react'
import type { FC } from 'react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

interface ChatTabsBarProps {
  onCreateSession?: () => void
  onCloseTab?: (tab: ChatTab) => void
}

const ChatTabsBar: FC<ChatTabsBarProps> = ({ onCreateSession, onCloseTab }) => {
  const { assistants } = useAssistants()
  const { tabs, activeTabId, closeTab, reorderTabs, setActiveTab } = useChatTabs()
  const { chat } = useRuntime()
  const { t } = useTranslation()

  const { onSortEnd } = useDndReorder<ChatTab>({
    originalList: tabs,
    filteredList: tabs,
    onUpdate: reorderTabs,
    itemKey: 'id'
  })

  const handleActivateTab = useCallback(
    (tab: ChatTab) => {
      if (!tabs.find((item) => item.id === tab.id)) return
      setActiveTab(tab.id)
    },
    [setActiveTab, tabs]
  )

  const tabsWithAssistant = useMemo(() => {
    return tabs.map((tab) => {
      const assistant = assistants.find((item) => item.id === tab.assistantId)
      return {
        ...tab,
        assistantEmoji: assistant?.emoji,
        assistantName: assistant?.name
      }
    })
  }, [assistants, tabs])

  const handleCloseTab = useCallback(
    (tab: ChatTab) => {
      onCloseTab?.(tab)
      closeTab(tab.id)
    },
    [closeTab, onCloseTab]
  )

  const handleAddTab = useCallback(() => {
    if (chat.activeTopicOrSession === 'session') {
      onCreateSession?.()
    } else {
      EventEmitter.emit(EVENT_NAMES.ADD_NEW_TOPIC)
    }
  }, [chat.activeTopicOrSession, onCreateSession])

  if (tabs.length === 0) {
    return null
  }

  return (
    <TabsBar>
      <HorizontalScrollContainer
        dependencies={[tabsWithAssistant]}
        gap="6px"
        className="chat-tabs-scroll"
        classNames={{ content: 'chat-tabs-scroll-content' }}>
        <Sortable
          items={tabsWithAssistant}
          itemKey="id"
          layout="list"
          horizontal
          gap="6px"
          onSortEnd={onSortEnd}
          className="chat-tabs-sortable"
          renderItem={(tab) => (
            <TabButton
              key={tab.id}
              active={tab.id === activeTabId}
              className={classNames('chat-tab', { 'is-session': tab.type === 'session' })}
              onClick={() => handleActivateTab(tab)}
              onAuxClick={(event) => {
                if (event.button === 1) {
                  event.preventDefault()
                  event.stopPropagation()
                  handleCloseTab(tab)
                }
              }}>
              <TabLabel>
                {tab.assistantEmoji && <span className="emoji">{tab.assistantEmoji}</span>}
                <span className="title">{tab.title || tab.assistantName || t('chat.default.topic.name')}</span>
              </TabLabel>
              {tab.status !== 'idle' && (
                <StatusBadge
                  status={tab.status}
                  title={
                    tab.status === 'running'
                      ? t('chat.tabs.status.running')
                      : tab.status === 'success'
                        ? t('chat.tabs.status.success')
                        : t('chat.tabs.status.error')
                  }
                />
              )}
              <CloseButton
                className="close-button"
                data-no-dnd
                onClick={(event) => {
                  event.stopPropagation()
                  handleCloseTab(tab)
                }}>
                <X size={12} />
              </CloseButton>
            </TabButton>
          )}
        />
        <AddButton onClick={handleAddTab}>
          <Plus size={14} />
        </AddButton>
      </HorizontalScrollContainer>
    </TabsBar>
  )
}

const TabsBar = styled.div`
  display: flex;
  align-items: flex-end;
  padding: 6px 12px;
  padding-bottom: 0;
  gap: 8px;
  background: var(--color-background);
  position: relative;
  border-bottom: 1px solid var(--color-border);
  .chat-tabs-scroll {
    flex: 1;
    padding-bottom: 0;
  }
  .chat-tabs-scroll-content {
    overflow: visible !important;
    padding-bottom: 0;
  }
`

const TabButton = styled.button<{ active?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid transparent;
  border-bottom: none;
  background: transparent;
  color: ${(props) => (props.active ? 'var(--color-text)' : 'var(--color-text-2)')};
  border-top-left-radius: var(--list-item-border-radius);
  border-top-right-radius: var(--list-item-border-radius);
  cursor: pointer;
  padding: 6px 12px;
  height: 32px;
  min-width: 90px;
  transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  .close-button {
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  &:hover {
    background: var(--color-list-item);
    color: var(--color-text);
    border-color: var(--color-border);
    .close-button {
      opacity: 1;
    }
  }
  ${(props) =>
    props.active &&
    css`
      background: var(--color-background);
      border-color: var(--color-border);
      color: var(--color-text);
      z-index: 2;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
    `}
`

const TabLabel = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  .emoji {
    font-size: 15px;
  }
  .title {
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const CloseButton = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 14px;
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--color-text-2);
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    color: var(--color-text);
    background: var(--color-list-item);
  }
`

const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const StatusBadge = styled.span<{ status: ChatTab['status'] }>`
  width: 10px;
  height: 10px;
  border-radius: 999px;
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  ${(props) =>
    props.status === 'running' &&
    css`
      border: 2px solid var(--color-text-3);
      border-top-color: transparent;
      border-right-color: transparent;
      background: transparent;
      animation: ${spin} 0.8s linear infinite;
    `}
  ${(props) =>
    props.status === 'success' &&
    css`
      background: var(--color-primary);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
    `}
  ${(props) =>
    props.status === 'error' &&
    css`
      background: var(--color-error);
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
    `}
`

export default ChatTabsBar
