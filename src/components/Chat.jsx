import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMessages, sendMessage } from '../api/chatApi';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { Client } from '@stomp/stompjs';

// --- Sticker asset loading (unchanged) ---
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

/**
 * Chat component
 * Props:
 *  - groupName (optional): preferred group/pin to join
 *
 * Behavior:
 *  - Determine effective groupName from multiple sources (prop, location.state, route param, localStorage per-room, generic localStorage)
 *  - Load history for that group, aborting stale requests
 *  - Subscribe to WS topic `/topic/chat/{groupName}` and ignore stale subscription messages
 *  - Ensure messages for other groups (if server includes groupName in payload) are ignored
 */
const Chat = ({ groupName: propGroupName }) => {
  const location = useLocation();
  const params = useParams(); // expect route to possibly contain :id (roomId)
  const roomId = params?.id || params?.roomId || null;

  const { user, getAccessToken } = useAuth();

  // UI state
  const [isOpen, setIsOpen] = useState(false);
  const [showStickers, setShowStickers] = useState(false);
  const [activeFolder, setActiveFolder] = useState(defaultFolder);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  // effective group used for fetch/subscribe
  const [groupName, setGroupName] = useState(null);

  // refs for concurrency control & websocket
  const messagesEndRef = useRef(null);
  const stompClientRef = useRef(null);
  const subscriptionRef = useRef(null);

  const historyAbortRef = useRef(null);
  const loadRequestIdRef = useRef(0);
  const subscriptionVersionRef = useRef(0);
  const groupNameRef = useRef(null);

  // keep groupNameRef in sync
  useEffect(() => { groupNameRef.current = groupName; }, [groupName]);

  // Determine groupName from multiple sources:
  useEffect(() => {
    // 1. propGroupName
    if (propGroupName) {
      setGroupName(propGroupName);
      console.debug('[Chat] using propGroupName ->', propGroupName);
      return;
    }

    // 2. location.state (if navigate(..., { state: { pinCode } }))
    const pinFromState = location?.state?.pinCode || location?.state?.pin;
    if (pinFromState) {
      setGroupName(pinFromState);
      console.debug('[Chat] using pin from location.state ->', pinFromState);
      return;
    }

    // 3. per-room localStorage key currentRoom_<roomId>
    if (roomId) {
      try {
        const saved = JSON.parse(localStorage.getItem(`currentRoom_${roomId}`) || '{}');
        const pin = saved?.pinCode || saved?.pin || saved?.joinCode;
        if (pin) {
          setGroupName(pin);
          console.debug(`[Chat] using pin from localStorage currentRoom_${roomId} ->`, pin);
          return;
        }
      } catch (e) {
        console.warn('Error reading currentRoom_<id> from localStorage', e);
      }
    }

    // 4. generic localStorage.currentRoom
    try {
      const savedGen = JSON.parse(localStorage.getItem('currentRoom') || '{}');
      const pinGen = savedGen?.pinCode || savedGen?.pin || savedGen?.joinCode;
      if (pinGen) {
        setGroupName(pinGen);
        console.debug('[Chat] using pin from generic currentRoom ->', pinGen);
        return;
      }
    } catch (e) {
      // ignore parse errors
    }

    // 5. not found -> null (don't fall back to 'default')
    setGroupName(null);
    console.debug('[Chat] no groupName found (prop/location/localStorage)');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propGroupName, location?.state, roomId]);

  // scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper: sanitize topic only if you must. By default use raw groupName.
  const sanitizeTopic = (g) => {
    if (!g) return '';
    // Default: return raw. If your server encodes topic differently, adapt here.
    return g;
    // e.g. return encodeURIComponent(String(g));
  };

  // Load history with abort and request-id to avoid races
  const loadHistory = async () => {
    if (!groupNameRef.current) {
      setMessages([]);
      return;
    }

    const reqId = ++loadRequestIdRef.current;
    // clear UI immediately when switching group
    setMessages([]);

    // abort previous fetch
    try { historyAbortRef.current?.abort?.(); } catch (e) {}
    historyAbortRef.current = new AbortController();
    const signal = historyAbortRef.current.signal;

    console.debug('[Chat] fetchMessages for ->', groupNameRef.current);
    try {
      // fetchMessages should accept signal as second param (best-effort)
      const history = await fetchMessages(groupNameRef.current, { signal });
      if (reqId !== loadRequestIdRef.current) {
        console.debug('[Chat] ignored stale history response (reqId mismatch)');
        return;
      }
      setMessages(Array.isArray(history) ? history : []);
    } catch (err) {
      if (reqId !== loadRequestIdRef.current) return;
      if (err?.name === 'AbortError') {
        // expected when aborted
        return;
      }
      console.error('Failed to load messages', err);
      setMessages([]);
    }
  };

  // create/activate stomp client when chat opens
  useEffect(() => {
    const toHttpIfWs = (url) => {
      if (!url) return url;
      if (url.startsWith('ws://')) return 'http://' + url.slice(5);
      if (url.startsWith('wss://')) return 'https://' + url.slice(6);
      return url;
    };

    const createAndActivateClient = (token) => {
      const WS_URL_BASE = import.meta.env.VITE_WS_URL || null;
      const WS_ENDPOINT = import.meta.env.VITE_WS_ENDPOINT || '/ws';
      const WS_AUTH_METHOD = import.meta.env.VITE_WS_AUTH_METHOD || 'header';

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
          // safe subscribe to current group
          try {
            // use subscribe utility below
            subscribeToGroup(client, groupNameRef.current);
          } catch (e) {
            console.error('subscribe onConnect failed', e);
          }
        },
        onStompError: (frame) => console.error('STOMP error', frame),
        onWebSocketClose: () => setConnected(false),
      });

      stompClientRef.current = client;
      client.activate();
    };

    if (!isOpen) {
      // cleanup if closed
      try { subscriptionRef.current?.unsubscribe?.(); } catch (e) {}
      try { stompClientRef.current?.deactivate?.(); } catch (e) {}
      stompClientRef.current = null;
      subscriptionRef.current = null;
      setConnected(false);
      try { historyAbortRef.current?.abort(); } catch (e) {}
      return;
    }

    // if already have client active and connected, do nothing here
    if (stompClientRef.current && connected) return;

    const token = (typeof getAccessToken === 'function') ? getAccessToken() : localStorage.getItem('token');
    if (!token) {
      console.warn('No access token - websocket will not connect until logged in.');
      return;
    }

    createAndActivateClient(token);

    return () => {
      try { subscriptionRef.current?.unsubscribe?.(); } catch (e) {}
      try { stompClientRef.current?.deactivate?.(); } catch (e) {}
      stompClientRef.current = null;
      subscriptionRef.current = null;
      setConnected(false);
      try { historyAbortRef.current?.abort(); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // subscription utility with versioning
  const subscribeToGroup = (client, group) => {
    // bump version so old handlers ignore
    subscriptionVersionRef.current++;
    const myVersion = subscriptionVersionRef.current;

    // unsubscribe old
    try { subscriptionRef.current?.unsubscribe?.(); } catch (e) {}

    if (!group) {
      console.debug('[Chat] subscribeToGroup called without group, skipping');
      subscriptionRef.current = null;
      return;
    }

    const topic = `/topic/chat/${sanitizeTopic(group)}`;
    console.debug('[Chat] subscribing to topic ->', topic, 'version=', myVersion);

    try {
      subscriptionRef.current = client.subscribe(topic, (msg) => {
        // ignore stale handler
        if (myVersion !== subscriptionVersionRef.current) {
          // console.debug('[Chat] ignored stale subscription message (version mismatch)');
          return;
        }

        let body;
        try {
          body = JSON.parse(msg.body);
        } catch (e) {
          console.error('Invalid STOMP message', e, msg.body);
          return;
        }

        // If server includes groupName in payload, ensure it matches current group
        if (body && typeof body.groupName === 'string' && body.groupName !== groupNameRef.current) {
          // console.debug('Ignored inbound for different group', body.groupName, 'current', groupNameRef.current);
          return;
        }

        // Append
        setMessages(prev => [...prev, body]);
      });
    } catch (e) {
      console.error('Subscribe failed', e);
      subscriptionRef.current = null;
    }
  };

  // When groupName changes, ensure we load history and resubscribe if connected
  useEffect(() => {
    // always update ref
    groupNameRef.current = groupName;

    // clear messages immediately
    setMessages([]);

    // cancel any previous history fetch and load new one
    loadHistory();

    // if connected, resubscribe to new topic
    const client = stompClientRef.current;
    if (client && client.connected) {
      subscribeToGroup(client, groupNameRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupName]);

  // resubscribe when connection state changes and we have a groupName
  useEffect(() => {
    if (!connected) return;
    const client = stompClientRef.current;
    if (!client) return;
    subscribeToGroup(client, groupNameRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // helper to render message content (kept from your original)
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

  // render time helper
  const renderTime = (timestamp) => {
    if (!timestamp) return '';
    try {
      const d = new Date(timestamp);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // send handler uses current groupNameRef
  const handleSend = async (content) => {
    if (!String(content || '').trim()) return;
    if (!groupNameRef.current) {
      console.warn('No groupName - cannot send message');
      return;
    }
    try {
      // sendMessage expected to POST to API with content & groupName
      await sendMessage({ content, groupName: groupNameRef.current });
      setInput('');
      // optional optimistic UI:
      // setMessages(prev => [...prev, { id: `temp-${Date.now()}`, senderUsername: user?.username, content, timestamp: Date.now(), groupName: groupNameRef.current }])
    } catch (e) {
      console.error('Send failed', e);
    }
  };

  const toggleChat = () => {
    setIsOpen(v => !v);
    setShowStickers(false);
  };

  return (
    <div className="fixed z-15 right-4 top-[72px] font-content">
      {/* Toggle */}
      <button onClick={toggleChat} className={`w-12 h-12 bg-white border-2 border-[var(--pink)] rounded-lg shadow-md flex items-center justify-center transition-transform duration-300 ${isOpen ? 'translate-x-full' : 'translate-x-0'}`} title={isOpen ? 'Đóng chat' : 'Mở chat'}>
        <img src="/open_chat.png" alt="Open chat" className="w-6 h-6" />
      </button>

      {/* Panel */}
      <div className={`fixed top-[56px] right-0 z-20 w-[300px] max-w-[90vw] bg-white shadow-xl flex flex-col h-[calc(100vh-56px)] transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* Header: show current groupName obviously */}
        <div className="flex items-center justify-between p-2">
          <div className="text-xs text-gray-500">Room: <strong>{groupName ?? '—'}</strong></div>
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
              const key = msg.id ?? msg.timestamp ?? idx;
              return (
                <div key={key} className={`mb-3 flex ${isMe ? 'justify-end' : 'justify-start'}`}>
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