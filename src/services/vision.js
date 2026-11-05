// The session consumes events; replace this source when FastAPI is ready.
// Server event: {type:'rep', sessionId:string, exerciseId:string, sequence:number}
// Tracking event: {type:'tracking', visible:boolean}
export function createDemoSource(onEvent) {
  let count = 0;
  const timer = setInterval(() => {
    count++;
    onEvent({ type: "tick", sequence: count });
  }, 1000);
  return () => clearInterval(timer);
}
export function connectVision(url, onEvent, onError) {
  const socket = new WebSocket(url);
  let sequence = -1;
  socket.onmessage = ({ data }) => {
    try {
      const event = JSON.parse(data);
      if (
        event.type === "rep" &&
        Number.isInteger(event.sequence) &&
        event.sequence > sequence
      ) {
        sequence = event.sequence;
        onEvent(event);
      } else if (
        event.type === "tracking" &&
        typeof event.visible === "boolean"
      )
        onEvent(event);
    } catch {
      onError?.("Invalid vision event");
    }
  };
  socket.onerror = () => onError?.("Vision connection unavailable");
  socket.onclose = () => onError?.("Vision connection closed");
  return () => {
    socket.onclose = null;
    socket.close();
  };
}
