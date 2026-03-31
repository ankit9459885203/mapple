import { api } from "./api";

// USER SIDE
export const createChat = () => api.post("/chat/createChat");

export const getUserChat = (chatId) =>
  api.get(`/chat/getUserChat/${chatId}`);

export const sendUserMessage = (chatId, formData) =>
  api.post(`/chat/sendUserMessage/${chatId}`,  formData );    // pehle formData ki jgh {messages} thaa likhaa yhaan, now its formData.

// ADMIN SIDE
export const getAdminChats = () =>
  api.get("/chat/getAdminChats");

export const sendAdminMessage = (chatId, formData) =>
  api.post(`/chat/adminSendMessage/${chatId}`, formData );
