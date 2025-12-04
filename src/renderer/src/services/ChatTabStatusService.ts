import type { Store } from '@reduxjs/toolkit'
import { EVENT_NAMES, EventEmitter } from '@renderer/services/EventService'
import type { RootState } from '@renderer/store'
import { completeChatTabTaskAction } from '@renderer/store/runtime'
import type { AssistantMessageStatus } from '@renderer/types/newMessage'

type Listener = () => void

class ChatTabStatusService {
  private unsubscribe?: Listener

  init(store: Store<RootState>) {
    if (this.unsubscribe) {
      return
    }
    this.unsubscribe = EventEmitter.on(EVENT_NAMES.MESSAGE_COMPLETE, ({ id, status }) => {
      const result = this.mapStatus(status as AssistantMessageStatus | 'pause')
      store.dispatch(completeChatTabTaskAction({ messageId: id, result }))
    })
  }

  dispose() {
    if (this.unsubscribe) {
      this.unsubscribe()
      this.unsubscribe = undefined
    }
  }

  private mapStatus(status: AssistantMessageStatus | 'pause') {
    if (status === 'error') {
      return 'error'
    }
    if (status === 'pause') {
      return 'cancelled'
    }
    return 'success'
  }
}

const chatTabStatusService = new ChatTabStatusService()

export default chatTabStatusService
