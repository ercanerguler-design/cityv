const WS_URL = process.env.NEXT_PUBLIC_WS_URL || (
  typeof window !== 'undefined'
    ? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}://${window.location.hostname}:8000`
    : 'ws://localhost:8000'
)

type MessageHandler = (data: unknown) => void

class CityWebSocket {
  private ws: WebSocket | null = null
  private handlers: Set<MessageHandler> = new Set()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null

  connect() {
    if (typeof window === 'undefined') return
    if (this.ws?.readyState === WebSocket.OPEN) return

    try {
      this.ws = new WebSocket(`${WS_URL}/ws`)

      this.ws.onopen = () => {
        console.log('[City-V WS] Connected')
      }

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handlers.forEach((h) => h(data))
        } catch {
          // ignore parse errors
        }
      }

      this.ws.onclose = () => {
        console.log('[City-V WS] Disconnected, reconnecting in 3s...')
        this.scheduleReconnect()
      }

      this.ws.onerror = () => {
        this.ws?.close()
      }
    } catch {
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, 3000)
  }

  subscribe(handler: MessageHandler): () => void {
    this.handlers.add(handler)
    this.connect()
    return () => this.handlers.delete(handler)
  }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer)
    this.ws?.close()
  }
}

export const cityWS = new CityWebSocket()
