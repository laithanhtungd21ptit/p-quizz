// src/pages/ChatTest.jsx
import React from 'react';
import Chat from '../components/Chat';

const ChatTest = () => {
  return (
    <div className="p-4">
      <Chat
        // sender="Nguyễn Quỳnh"
        // message="Chào bạn! Bạn đã sẵn sàng tham gia quiz chưa?"
        // time="10:35"
        // isCurrentUser={false} // hoặc true để test tin nhắn của chính mình
      />
    </div>
  );
};

export default ChatTest;