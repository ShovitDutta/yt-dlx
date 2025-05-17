import { Socket } from "socket.io";
export default function setupMessageHandlers(socket: Socket): void {
    console.log(`[MessageHandlers] Setting up message handlers for socket ${socket.id}`);
    socket.on("send_message", (data: { conversationId: string; text: string }) => {
        console.log(`[MessageHandlers] Received message from ${socket.id} for conversation ${data.conversationId}: "${data.text}"`);
        if (!data || typeof data.conversationId !== "string" || typeof data.text !== "string" || data.text.trim() === "") {
            console.warn(`[MessageHandlers] Invalid message data received from ${socket.id}`);
            socket.emit("message_error", { error: "Invalid message format." });
            return;
        }
        const messagePayload = {
            conversationId: data.conversationId,
            senderId: socket.id,
            text: data.text,
            timestamp: new Date().toISOString(),
        };
        socket.to(data.conversationId).emit("new_message", messagePayload);
        socket.emit("message_sent_confirmation", { success: true, messageId: "some-id" });
        console.log(`[MessageHandlers] Processed message from ${socket.id} in conversation ${data.conversationId}`);
    });
    socket.on("join_conversation", (data: { conversationId: string }) => {
        console.log(`[MessageHandlers] ${socket.id} attempting to join conversation ${data.conversationId}`);
        if (!data || typeof data.conversationId !== "string") {
            console.warn(`[MessageHandlers] Invalid join_conversation data from ${socket.id}`);
            socket.emit("join_conversation_error", { error: "Invalid conversation ID." });
            return;
        }
        socket.join(data.conversationId);
        console.log(`[MessageHandlers] ${socket.id} joined room: ${data.conversationId}`);
        socket.emit("joined_conversation", { conversationId: data.conversationId, success: true });
    });
    socket.on("leave_conversation", (data: { conversationId: string }) => {
        console.log(`[MessageHandlers] ${socket.id} attempting to leave conversation ${data.conversationId}`);
        if (!data || typeof data.conversationId !== "string") {
            console.warn(`[MessageHandlers] Invalid leave_conversation data from ${socket.id}`);
            socket.emit("leave_conversation_error", { error: "Invalid conversation ID." });
            return;
        }
        socket.leave(data.conversationId);
        console.log(`[MessageHandlers] ${socket.id} left room: ${data.conversationId}`);
        socket.emit("left_conversation", { conversationId: data.conversationId, success: true });
    });
    socket.on("typing", (data: { conversationId: string }) => {
        if (data && typeof data.conversationId === "string") {
            socket.to(data.conversationId).emit("user_typing", { conversationId: data.conversationId, userId: socket.id });
        }
    });
    socket.on("stop_typing", (data: { conversationId: string }) => {
        if (data && typeof data.conversationId === "string") {
            socket.to(data.conversationId).emit("user_stop_typing", { conversationId: data.conversationId, userId: socket.id });
        }
    });
    console.log(`[MessageHandlers] Finished setting up message handlers for socket ${socket.id}`);
}
