declare module 'bonjour-service' {
  import { EventEmitter } from 'events'

  export type Service = {
    name: string
    fqdn?: string
    host?: string
    port: number
    type: string
    protocol: string
    addresses?: string[]
    txt?: Record<string, unknown>
    referer?: {
      address?: string
    }
  }

  export interface Browser extends EventEmitter {
    start(): void
    stop(): void
    removeAllListeners(): void
    on(event: 'up', listener: (service: Service) => void): this
    on(event: 'down', listener: (service: Service) => void): this
    on(event: 'error', listener: (error: unknown) => void): this
  }

  interface FindOptions {
    type: string
    protocol?: string
  }

  class Bonjour {
    constructor(options?: { interface?: string })
    find(options: FindOptions, callback?: (service: Service) => void): Browser
    destroy(): void
  }

  export default Bonjour
}
