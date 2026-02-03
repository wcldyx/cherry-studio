import { Sortable, useDndReorder } from '@renderer/components/dnd'
import HorizontalScrollContainer from '@renderer/components/HorizontalScrollContainer'
import { useAssistants } from '@renderer/hooks/useAssistant'
import { useChatTabs } from '@renderer/hooks/useChatTabs'
import { useRuntime } from '@renderer/hooks/useRuntime'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/EventService'
import type { ChatTab } from '@renderer/types/chat'
import { classNames } from '@renderer/utils'
import { Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import { Plus, X } from 'lucide-react'
import type { FC } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css, keyframes } from 'styled-components'

interface ChatTabsBarProps {
  onCreateSession?: () => void
  onCloseTab?: (tab: ChatTab) => void
}

const ChatTabsBar: FC<ChatTabsBarProps> = ({ onCreateSession, onCloseTab }) => {
  const { assistants } = useAssistants()
  const { tabs, activeTabId, closeTab, closeOtherTabs, reorderTabs, setActiveTab } = useChatTabs()
  const { chat } = useRuntime()
  const { t } = useTranslation()
  const scrollContentRef = useRef<HTMLDivElement>(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const overflowStateRef = useRef(false)
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({})
  const itemGap = isOverflowing ? '0px' : '6px'

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

  useEffect(() => {
    const content = scrollContentRef.current
    if (!content) return

    const measureOverflow = () => {
      const overflowWidth = content.scrollWidth - content.clientWidth
      const nextOverflow = overflowStateRef.current
        ? overflowWidth > -48
        : overflowWidth > 12
      if (overflowStateRef.current !== nextOverflow) {
        overflowStateRef.current = nextOverflow
        setIsOverflowing(nextOverflow)
      }
    }

    measureOverflow()

    const resizeObserver = new ResizeObserver(measureOverflow)
    resizeObserver.observe(content)
    window.addEventListener('resize', measureOverflow)
    content.addEventListener('scroll', measureOverflow)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', measureOverflow)
      content.removeEventListener('scroll', measureOverflow)
    }
  }, [tabsWithAssistant, activeTabId])

  useEffect(() => {
    const ids = new Set(tabs.map((item) => item.id))
    Object.keys(tabRefs.current).forEach((id) => {
      if (!ids.has(id)) {
        delete tabRefs.current[id]
      }
    })
  }, [tabs])

  const handleWheelScroll = useCallback(
    (event: React.WheelEvent<HTMLDivElement>) => {
      if (!isOverflowing) return
      const container = scrollContentRef.current
      if (!container) return
      const dominantDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
      if (dominantDelta === 0) return
      container.scrollBy({ left: dominantDelta, behavior: 'auto' })
      event.preventDefault()
    },
    [isOverflowing]
  )

  useEffect(() => {
    if (!activeTabId) return
    const container = scrollContentRef.current
    const target = tabRefs.current[activeTabId]
    if (!container || !target) return

    const ensureVisible = () => {
      const containerRect = container.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const padding = 12
      const isLeftHidden = targetRect.left < containerRect.left + padding
      const isRightHidden = targetRect.right > containerRect.right - padding
      if (!isLeftHidden && !isRightHidden) return

      try {
        target.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
        return
      } catch {
        // ignore and fallback
      }

      const delta =
        targetRect.left - containerRect.left - container.clientWidth / 2 + targetRect.width / 2
      const nextScrollLeft = container.scrollLeft + delta
      container.scrollTo({
        left: Math.max(0, nextScrollLeft),
        behavior: 'smooth'
      })
    }

    requestAnimationFrame(ensureVisible)
  }, [activeTabId])

  const buildContextMenuItems = useCallback(
    (tab: ChatTab): MenuProps['items'] => [
      {
        key: 'close',
        label: t('chat.tabs.menu.close', '关闭标签'),
        onClick: (info) => {
          info.domEvent.stopPropagation()
          handleCloseTab(tab)
        }
      },
      {
        key: 'close-others',
        label: t('chat.tabs.menu.closeOthers', '关闭其他标签'),
        disabled: tabs.length <= 1,
        onClick: (info) => {
          info.domEvent.stopPropagation()
          setActiveTab(tab.id)
          closeOtherTabs(tab.id)
        }
      }
    ],
    [closeOtherTabs, handleCloseTab, setActiveTab, t, tabs.length]
  )

  if (tabs.length === 0) {
    return null
  }

  return (
    <TabsBar>
      <HorizontalScrollContainer
        allowVisibleOverflow={false}
        contentRef={scrollContentRef}
        onWheel={handleWheelScroll}
        dependencies={[tabsWithAssistant]}
        gap={itemGap}
        className="chat-tabs-scroll"
        classNames={{ content: 'chat-tabs-scroll-content' }}>
        <Sortable
          items={tabsWithAssistant}
          itemKey="id"
          layout="list"
          horizontal
          gap={itemGap}
          onSortEnd={onSortEnd}
          className="chat-tabs-sortable"
          renderItem={(tab) => (
            <Dropdown menu={{ items: buildContextMenuItems(tab) }} trigger={['contextMenu']}>
              <TabButton
                key={tab.id}
                active={tab.id === activeTabId}
                compressed={isOverflowing}
                ref={(node) => {
                  tabRefs.current[tab.id] = node
                }}
                className={classNames('chat-tab', { 'is-session': tab.type === 'session' })}
                onClick={() => handleActivateTab(tab)}
                onAuxClick={(event) => {
                if (event.button === 1) {
                  event.preventDefault()
                  event.stopPropagation()
                  handleCloseTab(tab)
                }
              }}>
              <TabLabel compressed={isOverflowing}>
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
            </Dropdown>
          )}
        />
        <AddButton onClick={handleAddTab} className="chat-tabs-add">
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
    overflow-x: auto !important;
    overflow-y: hidden !important;
    padding-bottom: 0;
  }
`

const TabButton = styled.button<{ active?: boolean; compressed?: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid transparent;
  border-bottom: none;
  background: transparent;
  color: ${(props) => (props.active ? 'var(--color-text)' : 'var(--color-text-2)')};
  border-top-left-radius: var(--list-item-border-radius);
  border-top-right-radius: var(--list-item-border-radius);
  cursor: pointer;
  padding: ${(props) => (props.compressed ? '4px 12px 4px 8px' : '6px 14px 6px 10px')};
  height: 32px;
  min-width: 0;
  transition: color 0.2s ease, background 0.2s ease, transform 0.2s ease;
  white-space: nowrap;
  position: relative;
  z-index: 1;
  margin-left: 0;
  & + & {
    margin-left: ${(props) => (props.compressed ? '-16px' : '0')};
  }
  .close-button {
    opacity: 0;
    width: 16px;
    margin-left: 6px;
    margin-right: -6px;
    pointer-events: none;
    transform: scale(0.9);
  }
  &:hover {
    background: var(--color-list-item);
    color: var(--color-text);
    border-color: var(--color-border);
    .close-button {
      opacity: 1;
      pointer-events: auto;
      transform: scale(1);
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
  ${(props) =>
    props.compressed &&
    css`
      font-size: 12px;
      gap: 2px;
      padding-left: 8px;
      padding-right: 12px;
    `}
  ${(props) =>
    !props.active &&
    css`
      &:not(:first-child) {
        box-shadow: -1px 0 0 ${props.compressed ? 'rgba(0, 0, 0, 0.2)' : 'var(--color-border)'};
      }
    `}
`

const TabLabel = styled.span<{ compressed?: boolean }>`
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: ${(props) => (props.compressed ? '3px' : '6px')};
  font-size: ${(props) => (props.compressed ? '12px' : '13px')};
  .emoji {
    font-size: 15px;
  }
  .title {
    max-width: ${(props) => (props.compressed ? '96px' : '160px')};
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
  pointer-events: auto;
  transition: opacity 0.15s ease, transform 0.15s ease;
`

const AddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border: none;
  background: transparent;
  color: var(--color-text-2);
  border-radius: 8px;
  cursor: pointer;
  position: sticky;
  right: 0;
  margin-left: 6px;
  z-index: 3;
  background-image: linear-gradient(90deg, transparent 0%, var(--color-background) 35%);
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
