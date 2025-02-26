// Cola de mensajes compartida entre todas las conexiones
const messageQueue: string[] = [];
const clients = new Set<ReadableStreamController<Uint8Array>>();

// Función para enviar un mensaje a todos los clientes conectados
export function sendLogToClients(message: string) {
  const formattedMessage = `data: ${message}\n\n`;
  messageQueue.push(formattedMessage);

  // Enviar a todos los clientes conectados
  clients.forEach((client) => {
    try {
      if (client.desiredSize !== null) {
        client.enqueue(new TextEncoder().encode(formattedMessage));
      }
    } catch (error) {
      console.error("Error al enviar mensaje al cliente:", error);
      try {
        client.error(
          error instanceof Error ? error : new Error("Error desconocido")
        );
        clients.delete(client);
      } catch (closeError) {
        console.error("Error al cerrar el cliente:", closeError);
      }
    }
  });
}

export async function GET() {
  // Limpiar la cola al iniciar una nueva conexión
  messageQueue.length = 0;

  let controller: ReadableStreamController<Uint8Array>;

  const stream = new ReadableStream({
    start(ctrl) {
      controller = ctrl;
      clients.add(controller);

      // Enviar un mensaje inicial para confirmar la conexión
      const initialMessage = "data: Conexión establecida\n\n";
      controller.enqueue(new TextEncoder().encode(initialMessage));
    },
    cancel() {
      console.log("Cliente desconectado");
      if (controller) {
        clients.delete(controller);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
