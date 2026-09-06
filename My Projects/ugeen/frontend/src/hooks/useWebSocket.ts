import { useState, useEffect, useRef, useCallback } from 'react';
import { WSMessage, LogEntry, StatusPayload, CodePayload } from '../types';

interface UseWebSocketReturn {
  isConnected: boolean;
  logs: LogEntry[];
  status: StatusPayload;
  latestCode: CodePayload | null;
  clearLogs: () => void;
}

const DEFAULT_STATUS: StatusPayload = {
  status: 'idle',
  currentStep: null,
  runId: null,
  lastCode: null,
};

const MAX_LOGS = 500;

export function useWebSocket(): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [status, setStatus] = useState<StatusPayload>(DEFAULT_STATUS);
  const [latestCode, setLatestCode] = useState<CodePayload | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const connect = useCallback(() => {
    // Determine WebSocket URL
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('🔌 WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const message: WSMessage = JSON.parse(event.data);

          switch (message.type) {
            case 'log':
              setLogs((prev) => {
                const next = [...prev, message.payload as LogEntry];
                return next.length > MAX_LOGS ? next.slice(-MAX_LOGS) : next;
              });
              break;

            case 'status':
              setStatus(message.payload as StatusPayload);
              break;

            case 'code':
              setLatestCode(message.payload as CodePayload);
              break;

            case 'connected':
              console.log('Server:', message.payload.message);
              break;

            case 'error':
              console.error('Server error:', message.payload);
              break;
          }
        } catch (err) {
          console.error('Failed to parse WS message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('🔌 WebSocket disconnected');

        // Auto-reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('🔌 Reconnecting...');
          connect();
        }, 3000);
      };

      ws.onerror = (err) => {
        console.error('WebSocket error:', err);
        ws.close();
      };
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      reconnectTimeoutRef.current = setTimeout(connect, 5000);
    }
  }, []);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  return {
    isConnected,
    logs,
    status,
    latestCode,
    clearLogs,
  };
}
