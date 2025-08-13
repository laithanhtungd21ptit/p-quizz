// src/api/chatApi.js
import api from './api'; // axios instance đã config sẵn

export async function fetchMessages(groupName) {
  const res = await api.get(`/chat/group/${groupName}`);
  return res.data;
}

export async function sendMessage(dto) {
  const res = await api.post('/chat/send', dto);
  return res.data;
}