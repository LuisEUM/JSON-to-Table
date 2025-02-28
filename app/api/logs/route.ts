import { clients, messageQueue } from "@/app/services/log-stream";

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
