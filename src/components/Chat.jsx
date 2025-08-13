// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchMessages, sendMessage } from '../api/chatApi';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

// --- Sticker asset loading ---
const modules = import.meta.globEager('/src/assets/stickers/*/*.png');
const stickerFoldersMap = {};
for (const path in modules) {
  const parts = path.split('/');
  const folder = parts[parts.length - 2];
  if (!stickerFoldersMap[folder]) stickerFoldersMap[folder] = [];
  stickerFoldersMap[folder].push(modules[path].default);
}
const folderNames = Object.keys(stickerFoldersMap);
const defaultFolder = folderNames[0] || '';

const Chat = ({ groupName = 'default' }) => {
  const { user, getAccessToken } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [activeFolder, setActiveFolder] = useState(defaultFolder);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);

  const loadHistory = async () => {
    try {
      const history = await fetchMessages(groupName);
      setMessages(Array.isArray(history) ? history : []);
    } catch (e) {
      console.error('Failed to load messages', e);
    }
  };

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupName]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Connect when chat is opened and token exists
  useEffect(() => {
    if (!isOpen) {
      if (stompClientRef.current) {
        try { stompClientRef.current.deactivate(); } catch (e) {}
        stompClientRef.current = null;
        setConnected(false);
      }
      return;
    }

    if (stompClientRef.current && connected) return;

    const token = (typeof getAccessToken === 'function') ? getAccessToken() : localStorage.getItem('accessToken');
    if (!token) {
      console.warn('No access token - websocket will not connect until logged in.');
      return;
    }

    const WS_URL_BASE = import.meta.env.VITE_WS_URL || null;
    const WS_ENDPOINT = import.meta.env.VITE_WS_ENDPOINT || '/ws';
    const WS_AUTH_METHOD = import.meta.env.VITE_WS_AUTH_METHOD || 'header';

    const toHttpIfWs = (url) => {
      if (!url) return url;
      if (url.startsWith('ws://')) return 'http://' + url.slice(5);
      if (url.startsWith('wss://')) return 'https://' + url.slice(6);
      return url;
    };

    let wsUrl = '';
    if (WS_URL_BASE) {
      const baseForSock = toHttpIfWs(WS_URL_BASE.replace(/\/$/, ''));
      wsUrl = `${baseForSock}${WS_ENDPOINT}`;
    } else {
      const apiBase = import.meta.env.VITE_API_URL || window.location.origin;
      const apiBaseNoSlash = apiBase.replace(/\/$/, '');
      const baseForSock = apiBaseNoSlash.replace(/^ws:/, 'http:').replace(/^wss:/, 'https:');
      wsUrl = `${baseForSock}${WS_ENDPOINT}`;
    }

    const sockJsUrl = (WS_AUTH_METHOD === 'query' && token)
      ? `${wsUrl}?token=${encodeURIComponent(token)}`
      : wsUrl;

    const client = new Client({
      webSocketFactory: () => new SockJS(sockJsUrl),
      reconnectDelay: 5000,
      connectHeaders: (WS_AUTH_METHOD === 'header' && token) ? { Authorization: `Bearer ${token}` } : {},
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/chat/${groupName}`, (msg) => {
          try {
            const body = JSON.parse(msg.body);
            setMessages(prev => [...prev, body]);
          } catch (err) {
            console.error('Invalid STOMP message', err);
          }
        });
      },
      onStompError: (frame) => console.error('STOMP error', frame),
      onWebSocketClose: () => setConnected(false),
    });

    stompClientRef.current = client;
    client.activate();

    loadHistory();

    return () => {
      try { client.deactivate(); } catch (e) {}
      stompClientRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, groupName]);

  const toggleChat = () => {
    setIsOpen(open => !open);
    setShowStickers(false);
  };

  const renderTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      // show only hour:minute in user's locale
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  const renderContent = (content) => {
    if (content === null || content === undefined) return null;

    if (typeof content === 'object') {
      if (content.type === 'sticker' && content.url) {
        return <img src={content.url} alt="sticker" className="max-w-full max-h-36 rounded-md" />;
      }
      return <span className="whitespace-pre-wrap break-words">{String(content)}</span>;
    }

    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        if (parsed && parsed.type === 'sticker' && parsed.url) {
          return <img src={parsed.url} alt="sticker" className="max-w-full max-h-36 rounded-md" />;
        }
      } catch (_) {}

      if (content.startsWith('[sticker]')) {
        const url = content.slice('[sticker]'.length);
        return <img src={url} alt="sticker" className="max-w-full max-h-36 rounded-md" />;
      }

      if (/(https?:\/\/.*\.(png|jpg|jpeg|gif|webp))|\/assets\/|^\/src\/assets\//i.test(content)) {
        return <img src={content} alt="img" className="max-w-full max-h-36 rounded-md" />;
      }

      return <span className="whitespace-pre-wrap break-words">{content}</span>;
    }

    return <span className="whitespace-pre-wrap break-words">{String(content)}</span>;
  };

  const handleSend = async (content) => {
    if (!String(content || '').trim()) return;
    try {
      await sendMessage({ content, groupName }); // ensure using groupName
      setInput('');
    } catch (e) {
      console.error('Send failed', e);
    }
  };

  return (
    <div className="fixed z-15 right-4 top-[72px] font-content">
      {/* Toggle */}
      <button onClick={toggleChat} className={`w-12 h-12 bg-white border-2 border-[var(--pink)] rounded-lg shadow-md flex items-center justify-center transition-transform duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'}`} title={isOpen ? 'Đóng chat' : 'Mở chat'}>
        <img src="/open_chat.png" alt="Open chat" className="w-6 h-6" />
      </button>

      {/* Panel */}
      <div className={`fixed top-[56px] right-0 z-20 w-[300px] max-w-[90vw] bg-white shadow-xl flex flex-col h-[calc(100vh-56px)] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header */}
        <div className="flex justify-end p-2">
          <button onClick={toggleChat}><img src="/close_chat.png" alt="Close chat" className="w-6 h-6" /></button>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 text-sm text-black" onClick={() => showStickers && setShowStickers(false)}>
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có tin nhắn nào</p>
          ) : (
            messages.map((msg, idx) => {
              const name = msg.senderUsername || msg.sender || 'System';
              const isMe = user && name === (user.username || user?.name);
              const timeStr = renderTime(msg.timestamp);
              return (
                <div key={idx} className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isMe ? 'text-right' : 'text-left'}`}>
                    <div className={`text-xs text-gray-500 mb-1 flex items-center gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <strong className="mr-1">{name}</strong>
                      <span>{timeStr}</span>
                    </div>
                    <div className="text-sm">
                      {renderContent(msg.content)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="bg-white">
          <div className="p-3">
            <div className="flex items-center border border-gray-400 rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-[var(--pink)] transition-all w-full">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Soạn tin nhắn..." className="flex-1 min-w-0 outline-none text-gray-700 placeholder-gray-500 text-sm" onKeyDown={(e) => e.key === 'Enter' && handleSend(input)} aria-label="Soạn tin nhắn" />
              <div className="flex items-center gap-2 text-gray-400 shrink-0">
                <button onClick={() => setShowStickers(v => !v)} className="shrink-0" aria-label="Chọn sticker"><img src="/choose_emoji.png" alt="Emoji" className="w-5 h-5" /></button>
                <span className="text-gray-300">|</span>
                <button onClick={() => handleSend(input)} className="shrink-0" aria-label="Gửi"><img src="/send.png" alt="Send" className="w-6 h-6" /></button>
              </div>
            </div>
          </div>

          {showStickers && (
            <div className="w-full bg-white px-3 py-1">
              <div className="flex justify-start gap-2 mb-3 overflow-x-auto">
                {folderNames.length === 0 ? (
                  <div className="text-xs text-gray-500">Không có sticker</div>
                ) : folderNames.map(folder => (
                  <button key={folder} onClick={() => setActiveFolder(folder)} className={`p-1 rounded-lg border ${activeFolder === folder ? 'border-[var(--pink)]' : 'border-transparent'}`} title={folder}>
                    <img src={stickerFoldersMap[folder][0] ?? ''} alt={folder} className="w-6 h-6 object-contain" />
                  </button>
                ))}
              </div>

              <div className="w-full h-px bg-gray-200 mb-2" />

              <div className="grid grid-cols-5 gap-2 max-h-28 overflow-y-auto mb-2">
                {(stickerFoldersMap[activeFolder] ?? []).map(src => (
                  <button key={src} onClick={() => { handleSend(`[sticker]${src}`); setShowStickers(false); }} className="group relative w-12 h-12 flex items-center justify-center cursor-pointer bg-white" aria-label="Gửi sticker">
                    <img src={src} alt="sticker" className="max-w-full max-h-full" />
                    <div className="absolute inset-0 border-2 border-transparent group-hover:border-[var(--pink)] rounded-lg" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
