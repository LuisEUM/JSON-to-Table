"use client";

import { useEffect, useState, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LogEntry {
  timestamp: string;
  message: string;
  type?: "info" | "success" | "error" | "warning";
}

interface LoadingLogsProps {
  isVisible: boolean;
}

export function LoadingLogs({ isVisible }: LoadingLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const formatTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  const addLog = (message: string, type: LogEntry["type"] = "info") => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: formatTimestamp(),
        message,
        type,
      },
    ]);
  };

  useEffect(() => {
    let sse: EventSource | null = null;

    const connectSSE = () => {
      if (sse) return;

      try {
        sse = new EventSource("/api/logs");

        sse.onopen = () => {
          console.log("Conexión SSE establecida");
          addLog("Conexión establecida con el servidor", "success");
          addLog("Esperando datos...", "info");
        };

        sse.onmessage = (event) => {
          // Determinar el tipo de mensaje basado en su contenido
          let type: LogEntry["type"] = "info";
          const message = event.data;

          if (message.includes("✓") || message.includes("✅")) {
            type = "success";
          } else if (message.includes("⚠️")) {
            type = "warning";
          } else if (message.toLowerCase().includes("error")) {
            type = "error";
          }

          addLog(message, type);

          // Auto-scroll al último mensaje
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
          }
        };

        sse.onerror = (error) => {
          console.error("Error en la conexión SSE:", error);
          addLog("Error en la conexión. Reintentando...", "error");
          sse?.close();
          setTimeout(connectSSE, 2000);
        };
      } catch (error) {
        console.error("Error al crear conexión SSE:", error);
        addLog("Error al conectar con el servidor de logs", "error");
      }
    };

    if (isVisible) {
      connectSSE();
    }

    return () => {
      if (sse) {
        console.log("Cerrando conexión SSE");
        sse.close();
      }
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <Card className='fixed bottom-4 right-4 w-96 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50'>
      <CardHeader className='py-3'>
        <CardTitle className='text-sm font-medium'>Logs del Sistema</CardTitle>
      </CardHeader>
      <CardContent className='p-0'>
        <ScrollArea className='h-64 w-full rounded-md border' ref={scrollRef}>
          <div className='space-y-1 font-mono text-sm p-4'>
            {logs.map((log, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 whitespace-pre-wrap break-words ${
                  log.type === "error"
                    ? "text-red-500"
                    : log.type === "success"
                    ? "text-green-500"
                    : log.type === "warning"
                    ? "text-yellow-500"
                    : "text-muted-foreground"
                }`}
              >
                <span className='text-xs text-muted-foreground'>
                  [{log.timestamp}]
                </span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
