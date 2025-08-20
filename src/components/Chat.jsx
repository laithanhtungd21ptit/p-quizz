import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMessages, sendMessage } from '../api/chatApi';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

// sticker loading (giữ nguyên)
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

const Chat = ({ groupName: propGroupName }) => {
  const location = useLocation();
  const params = useParams();
  const roomId = params?.id || params?.roomId || null;

  const { user, getAccessToken } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [activeFolder, setActiveFolder] = useState(defaultFolder);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [groupName, setGroupName] = useState(null);

  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const historyAbortRef = useRef(null);
  const loadRequestIdRef = useRef(0);
  const subscriptionVersionRef = useRef(0);
  const groupNameRef = useRef(null);

  // pending keys for optimistic UI dedupe
  const pendingKeysRef = useRef(new Set());

  // If a saved room in localStorage contains clientSessionId, restore it so WS can connect.
  useEffect(() => {
    try {
      // Check per-room key first
      if (roomId) {
        const savedPerRoom = JSON.parse(localStorage.getItem(`currentRoom_${roomId}`) || 'null');
        if (savedPerRoom?.clientSessionId) {
          if (!localStorage.getItem('clientSessionId')) {
            localStorage.setItem('clientSessionId', savedPerRoom.clientSessionId);
            console.debug('[Chat] restored clientSessionId from currentRoom_<id>');
          }
        }
      }
      // Fallback to generic currentRoom
      const savedGen = JSON.parse(localStorage.getItem('currentRoom') || 'null');
      if (savedGen?.clientSessionId) {
        if (!localStorage.getItem('clientSessionId')) {
          localStorage.setItem('clientSessionId', savedGen.clientSessionId);
          console.debug('[Chat] restored clientSessionId from currentRoom');
        }
      }
    } catch (e) {
      // ignore parse errors
    }
  // run once on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for a custom event 'roomSaved' so other parts of app can notify Chat immediately
  useEffect(() => {
    const handler = (ev) => {
      const room = ev?.detail;
      if (!room) return;
      try {
        if (room.clientSessionId) {
          localStorage.setItem('clientSessionId', room.clientSessionId);
          console.debug('[Chat] saved clientSessionId from event roomSaved');
        }
        if (room.pinCode) {
          setGroupName(room.pinCode);
          console.debug('[Chat] set groupName from event roomSaved', room.pinCode);
        }
        // optional: also persist generic/currentRoom
        localStorage.setItem('currentRoom', JSON.stringify(room));
        if (room.roomId) localStorage.setItem(`currentRoom_${room.roomId}`, JSON.stringify(room));
      } catch (e) {
        console.error('Failed handling roomSaved event', e);
      }
    };
    window.addEventListener('roomSaved', handler);
    return () => window.removeEventListener('roomSaved', handler);
  }, []);

  useEffect(() => { groupNameRef.current = groupName; }, [groupName]);

  // determine groupName (same logic, but now will pick up localStorage restored above)
  useEffect(() => {
    if (propGroupName) {
      setGroupName(propGroupName);
      return;
    }
    const pinFromState = location?.state?.pinCode || location?.state?.pin;
    if (pinFromState) {
      setGroupName(pinFromState);
      return;
    }
    if (roomId) {
      try {
        const saved = JSON.parse(localStorage.getItem(`currentRoom_${roomId}`) || '{}');
        const pin = saved?.pinCode || saved?.pin || saved?.joinCode;
        if (pin) {
          setGroupName(pin);
          return;
        }
      } catch (e) {
        console.warn('Error reading currentRoom_<id> from localStorage', e);
      }
    }
    try {
      const savedGen = JSON.parse(localStorage.getItem('currentRoom') || '{}');
      const pinGen = savedGen?.pinCode || savedGen?.pin || savedGen?.joinCode;
      if (pinGen) {
        setGroupName(pinGen);
        return;
      }
    } catch (e) {
      // ignore parse errors
    }
    setGroupName(null);
  }, [propGroupName, location?.state, roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sanitizeTopic = (g) => (g ? g : '');

  const loadHistory = async () => {
    if (!groupNameRef.current) {
      setMessages([]);
      return;
    }
    const reqId = ++loadRequestIdRef.current;
    setMessages([]);
    try { historyAbortRef.current?.abort?.(); } catch {}
    historyAbortRef.current = new AbortController();
    const signal = historyAbortRef.current.signal;
    try {
      const history = await fetchMessages(groupNameRef.current, { signal });
      if (reqId !== loadRequestIdRef.current) return;
      setMessages(Array.isArray(history) ? history : []);
    } catch (err) {
      if (reqId !== loadRequestIdRef.current) return;
      if (err?.name === 'AbortError') return;
      console.error('Failed to load messages', err);
      setMessages([]);
    }
  };

  // ---- create client with logging ----
  const createAndActivateClient = (token) => {
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

    const clientSessionId = localStorage.getItem('clientSessionId');
    const pinCode = groupNameRef.current;
    if (!clientSessionId || !pinCode) {
      console.warn('[Chat] missing clientSessionId or pinCode — not opening WebSocket', { clientSessionId, pinCode });
      return;
    }

    // If an existing client exists, deactivate it first
    try {
      if (stompClientRef.current) {
        try { stompClientRef.current.deactivate(); } catch (e) {}
        stompClientRef.current = null;
        subscriptionRef.current = null;
        setConnected(false);
      }
    } catch (e) {
      // ignore
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(sockJsUrl),
      reconnectDelay: 5000,
      connectHeaders: {
        ...(WS_AUTH_METHOD === 'header' && token ? { Authorization: `Bearer ${token}` } : {}),
        clientSessionId,
        pinCode,
      },
      onConnect: (frame) => {
        console.info('[Chat] STOMP connected', { frame });
        setConnected(true);
        try {
          subscribeToGroup(client, groupNameRef.current);
        } catch (e) {
          console.error('subscribe onConnect failed', e);
        }
      },
      onStompError: (frame) => {
        const msg = frame?.headers?.message || '<no message header>';
        console.error('STOMP error (server):', msg, 'frame.body=', frame?.body);
      },
      onWebSocketClose: () => {
        console.warn('[Chat] WebSocket closed');
        setConnected(false);
      },
    });

    stompClientRef.current = client;
    client.activate();
  };

  // ---- subscription: log & dedupe ----
  const subscribeToGroup = (client, group) => {
    subscriptionVersionRef.current++;
    const myVersion = subscriptionVersionRef.current;
    try { subscriptionRef.current?.unsubscribe?.(); } catch {}

    if (!group) {
      subscriptionRef.current = null;
      return;
    }

    const topic = `/topic/chat/${sanitizeTopic(group)}`;
    console.debug('[Chat] subscribing to topic ->', topic, 'version=', myVersion);

    try {
      subscriptionRef.current = client.subscribe(topic, (msg) => {
        if (myVersion !== subscriptionVersionRef.current) return;

        let body;
        try { body = JSON.parse(msg.body); } catch (e) {
          console.error('Invalid STOMP message', e, msg.body);
          return;
        }

        console.debug('[Chat] received STOMP message on topic', topic, body);

        // dedupe: if we had optimistic pending matching sender+content => remove optimistic and skip duplication
        try {
          const key = `${body.senderUsername || body.sender}:::${body.content}`;
          if (pendingKeysRef.current.has(key)) {
            // remove optimistic message(s) that match this key
            setMessages(prev => prev.filter(m => {
              if (m?.isLocal && `${m.senderUsername || m.sender}:::${m.content}` === key) {
                return false; // drop optimistic
              }
              return true;
            }));
            pendingKeysRef.current.delete(key);
          }
        } catch (e) {
          // ignore dedupe errors
        }

        // append server message
        setMessages(prev => [...prev, body]);
      });
    } catch (e) {
      console.error('Subscribe failed', e);
      subscriptionRef.current = null;
    }
  };

  // when groupName changes
  useEffect(() => {
    groupNameRef.current = groupName;
    setMessages([]);
    loadHistory();

    // If client exists and connected, resubscribe to new group
    const client = stompClientRef.current;
    if (client && client.connected) {
      subscribeToGroup(client, groupNameRef.current);
    }
  }, [groupName]);

  // resubscribe when connected
  useEffect(() => {
    if (!connected) return;
    const client = stompClientRef.current;
    if (!client) return;
    subscribeToGroup(client, groupNameRef.current);
  }, [connected]);

  // --------------------------
  // Connect when groupName is ready (important: NOT waiting for isOpen)
  // This ensures all participants subscribe as soon as they join the room.
  // --------------------------
  useEffect(() => {
    // if no groupName yet, don't connect
    if (!groupName) return;

    // deactivate old client if exists (we'll recreate with new headers)
    if (stompClientRef.current) {
      try { subscriptionRef.current?.unsubscribe?.(); } catch {}
      try { stompClientRef.current.deactivate(); } catch {}
      stompClientRef.current = null;
      subscriptionRef.current = null;
      setConnected(false);
    }

    const token = (typeof getAccessToken === 'function') ? getAccessToken() : localStorage.getItem('token');
    const clientSessionId = localStorage.getItem('clientSessionId');
    const pinCode = groupName;

    if (!token) {
      console.warn('[Chat] No token — WS will not open until logged in.');
      return;
    }
    if (!clientSessionId) {
      console.warn('[Chat] missing clientSessionId in localStorage - cannot open WS');
      return;
    }
    if (!pinCode) {
      console.warn('[Chat] missing groupName/pinCode - cannot open WS yet');
      return;
    }

    // create and activate
    createAndActivateClient(token);

    // cleanup on unmount or groupName change
    return () => {
      try { subscriptionRef.current?.unsubscribe?.(); } catch {}
      try { stompClientRef.current?.deactivate?.(); } catch {}
      stompClientRef.current = null;
      subscriptionRef.current = null;
      setConnected(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupName]);

  // render helpers (giữ nguyên)
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

  const renderTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch { return ''; }
  };

  // ---- handleSend: optimistic UI + POST to REST (server will broadcast) ----
  const handleSend = async (content) => {
    if (!String(content || '').trim()) return;
    if (!groupNameRef.current) {
      console.warn('No groupName - cannot send message');
      return;
    }

    // optimistic temporary message
    const tempId = `local-${Date.now()}`;
    const tempMsg = {
      id: tempId,
      senderUsername: user?.username || 'You',
      content,
      timestamp: Date.now(),
      isLocal: true, // marker for optimistic
    };

    // add pending key for dedupe (simple key: sender::content)
    const pendingKey = `${tempMsg.senderUsername}:::${content}`;
    pendingKeysRef.current.add(pendingKey);

    // show optimistic immediately
    setMessages(prev => [...prev, tempMsg]);

    try {
      // still call REST (backend will broadcast convertAndSend)
      await sendMessage({ content, groupName: groupNameRef.current });
      setInput('');
    } catch (e) {
      console.error('Send failed', e);
      // remove optimistic if fail
      pendingKeysRef.current.delete(pendingKey);
      setMessages(prev => prev.filter(m => m.id !== tempId));
    }
  };

  const toggleChat = () => {
    setIsOpen(v => !v);
    setShowStickers(false);
  };

  // UI JSX (giữ gần như nguyên bản)
  return (
    <div className="fixed z-15 right-4 top-[72px] font-content">
      <button onClick={toggleChat} className={`w-12 h-12 bg-white border-2 border-[var(--pink)] rounded-lg shadow-md flex items-center justify-center transition-transform duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'}`} title={isOpen ? 'Đóng chat' : 'Mở chat'}>
        <img src="/open_chat.png" alt="Open chat" className="w-6 h-6" />
      </button>

      <div className={`fixed top-[56px] right-0 z-20 w-[300px] max-w-[90vw] bg-white shadow-xl flex flex-col h-[calc(100vh-56px)] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-2">
          <div className="text-xs text-gray-500">Room: <strong>{groupName ?? '—'}</strong></div>
          <button onClick={toggleChat}><img src="/close_chat.png" alt="Close chat" className="w-6 h-6" /></button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 text-sm text-black" onClick={() => showStickers && setShowStickers(false)}>
          {messages.length === 0 ? (
            <p className="text-center text-gray-500">Chưa có tin nhắn nào</p>
          ) : (
            messages.map((msg, idx) => {
              const name = msg.senderUsername || msg.sender || 'System';
              const isMe = user && name === (user.username || user?.name);
              const timeStr = renderTime(msg.timestamp);
              const key = msg.id ?? msg.timestamp ?? idx;
              // give optimistic UI a subtle style
              const optimisticClass = msg.isLocal ? 'opacity-80 italic' : '';
              return (
                <div key={key} className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] ${isMe ? 'text-right' : 'text-left'} ${optimisticClass}`}>
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
