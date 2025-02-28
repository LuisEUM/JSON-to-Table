// Cola de mensajes compartida entre todas las conexiones
export const messageQueue: string[] = [];
export const clients = new Set<ReadableStreamController<Uint8Array>>();

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
