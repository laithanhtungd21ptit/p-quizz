import React, { useState, useEffect } from 'react';
import RankingTable from '../components/RankingTable';
import Chat from "../components/Chat";
import { savePlayerHistory } from '../services/api';

export default function GameResult({ joinCode = '682868' }) {
  const [rankingData, setRankingData] = useState([]);
  const [roomInfo, setRoomInfo] = useState(null);
  const [finalQuestionData, setFinalQuestionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Check xem user có phải là host không (host không có clientSessionId)
  const isHost = () => {
    const currentRoom = localStorage.getItem('currentRoom');
    const user = localStorage.getItem('user');
    const clientSessionId = localStorage.getItem('clientSessionId');
    
    // Nếu không có clientSessionId thì có thể là host
    if (!clientSessionId) {
      console.log('🏠 No clientSessionId found - likely a host');
      return true;
    }
    
    if (!currentRoom || !user) return false;
    
    try {
      const roomData = JSON.parse(currentRoom);
      const userData = JSON.parse(user);
      
      // Host thường là creator của room, hoặc có thể check theo username
      const isRoomHost = roomData.hostUsername === userData.username || 
                        roomData.createdBy === userData.username ||
                        roomData.host === userData.username;
      
      console.log('🔍 Host check:', {
        hasClientSessionId: !!clientSessionId,
        hostUsername: roomData.hostUsername,
        currentUser: userData.username,
        isRoomHost
      });
      
      return isRoomHost;
    } catch (error) {
      console.error('Error checking host status:', error);
      return false;
    }
  };

  // Load dữ liệu từ localStorage khi component mount
  useEffect(() => {
    console.log('🏁 GameResult: Đang load dữ liệu từ localStorage...');
    
    try {
      // Load dữ liệu ranking cuối cùng
      const finalRanking = localStorage.getItem('finalRankingData');
      if (finalRanking) {
        const parsedRanking = JSON.parse(finalRanking);
        console.log('📊 Ranking data từ localStorage:', parsedRanking);
        setRankingData(parsedRanking);
      } else {
        console.log('⚠️ Không tìm thấy finalRankingData trong localStorage');
      }

      // Load thông tin phòng
      const roomInfoData = localStorage.getItem('roomInfo');
      if (roomInfoData) {
        const parsedRoomInfo = JSON.parse(roomInfoData);
        console.log('🏠 Room info từ localStorage:', parsedRoomInfo);
        setRoomInfo(parsedRoomInfo);
      } else {
        console.log('⚠️ Không tìm thấy roomInfo trong localStorage');
      }

      // Load dữ liệu câu hỏi cuối cùng
      const finalQuestion = localStorage.getItem('finalQuestionData');
      if (finalQuestion) {
        const parsedQuestion = JSON.parse(finalQuestion);
        console.log('🎯 Final question data từ localStorage:', parsedQuestion);
        setFinalQuestionData(parsedQuestion);
      } else {
        console.log('⚠️ Không tìm thấy finalQuestionData trong localStorage');
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Lỗi khi load dữ liệu từ localStorage:', error);
      setLoading(false);
    }
  }, []);

  // Sắp xếp ranking theo điểm số giảm dần
  const sortedRanking = [...rankingData].sort((a, b) => b.score - a.score);
  const [first, second, third] = sortedRanking;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 font-content">
      {/* Join Code */}
      <div
        className="mt-8 mb-6 bg-white rounded-lg px-4 py-2 text-black text-2xl text-center z-10"
        style={{ border: '2px solid var(--pink)' }}
      >
        {roomInfo ? roomInfo.pinCode : joinCode}
      </div>

      {/* Podium wrapper (relative) */}
      <div className="relative w-full max-w-4xl flex justify-center items-end">
        {/* Podium image */}
        <img
          src="/top3.png"
          alt="Podium"
          className="relative z-10 w-[70%] h-auto max-w-[760px] mt-[140px]"
        />

        {/* Avatars: name (bold) + score + avatar below */}
        {second && (
          <div
            className="absolute z-20 flex flex-col items-center text-center"
            style={{ left: '22%', top: '20%' }}
          >
            <span className="text-white font-bold truncate w-28 block">{second.firstName || second.name || 'Player 2'}</span>
            <span className="text-white">{second.score}</span>
            {/* avatar nằm dưới name & score, không bo tròn, giữ tỉ lệ (h-auto) */}
            <img src={second.avatar || '/avatar/avatar_2.png'} alt={second.firstName || second.name || 'Player 2'} className="w-24 h-auto mt-2" />
          </div>
        )}

        {first && (
          <div
            className="absolute z-20 flex flex-col items-center text-center"
            style={{ left: '50%', top: '3%', transform: 'translateX(-50%)' }}
          >
            <span className="text-white font-bold truncate w-36 block">{first.firstName || first.name || 'Player 1'}</span>
            <span className="text-white text-lg">{first.score}</span>

            <div className="relative mt-2">
              <img src={first.avatar || '/avatar/avatar_1.png'} alt={first.firstName || first.name || 'Player 1'} className="w-28 h-auto" />
              {/* Crown nếu dùng, kích thước có thể tinh chỉnh ở đây */}
              {/* <img
                src="/top1_crown.png"
                alt="Crown"
                className="absolute -top-10 left-1/2 transform -translate-x-1/2"
                style={{ width: '96px', height: 'auto' }} // tăng kích thước crown
              /> */}
            </div>
          </div>
        )}

        {third && (
          <div
            className="absolute z-20 flex flex-col items-center text-center"
            style={{ left: '65%', top: '27%' }}
          >
            <span className="text-white font-bold truncate w-28 block">{third.firstName || third.name || 'Player 3'}</span>
            <span className="text-white">{third.score}</span>
            <img src={third.avatar || '/avatar/avatar_3.png'} alt={third.firstName || third.name || 'Player 3'} className="w-24 h-auto mt-2" />
          </div>
        )}
      </div>



      {/* Detailed ranking table */}
      <div className="w-full max-w-4xl mt-12">
        {loading ? (
          <div className="text-center text-gray-500 py-20">
            <div className="text-2xl mb-2">📊</div>
            <div>Đang tải bảng xếp hạng...</div>
          </div>
        ) : rankingData.length > 0 ? (
          <RankingTable data={rankingData} totalQuestions={finalQuestionData ? 1 : 15} />
        ) : (
          <div className="text-center text-gray-500 py-20">
            <div className="text-2xl mb-2">📊</div>
            <div>Không có dữ liệu xếp hạng</div>
          </div>
        )}
      </div>

      {/* Buttons: Lưu kết quả & Thoát */}
      <div className="w-full max-w-4xl my-6 flex justify-center gap-4">
        {/* Chỉ hiển thị nút "Lưu kết quả" cho player, không phải host */}
        {!isHost() && (
        <button
          type="button"
          className={`px-6 py-2 rounded-md text-white font-medium ${
            saved 
              ? 'bg-green-500' 
              : saving 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-[var(--pink)] hover:bg-pink-600'
          }`}
          disabled={saving || saved}
          onClick={async () => {
            try {
              setSaving(true);
              
              // Lấy thông tin cần thiết từ localStorage
              const currentRoom = localStorage.getItem('currentRoom');
              const clientSessionId = localStorage.getItem('clientSessionId');
              
              if (!currentRoom || !clientSessionId) {
                throw new Error('Không tìm thấy thông tin phòng hoặc session');
              }
              
              const roomData = JSON.parse(currentRoom);
              const pinCode = roomData.pinCode;
              
              console.log('💾 Đang lưu lịch sử chơi:', {
                pinCode,
                clientSessionId,
                roomInfo,
                finalQuestionData,
                rankingData
              });
              
              // Kiểm tra token trước khi gọi API
              const token = localStorage.getItem('token');
              if (!token) {
                throw new Error('Không tìm thấy token đăng nhập. Vui lòng đăng nhập lại.');
              }
              
              // Kiểm tra token expired
              try {
                const tokenPayload = JSON.parse(atob(token.split('.')[1]));
                console.log('🔍 Token payload:', tokenPayload);
                console.log('🔍 Token exp:', new Date(tokenPayload.exp * 1000));
                console.log('🔍 Current time:', new Date());
                
                const isExpired = tokenPayload.exp * 1000 < Date.now();
                console.log('🔍 Token expired?', isExpired);
                
                if (isExpired) {
                  throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để lưu lịch sử.');
                }
              } catch (e) {
                if (e.message.includes('Phiên đăng nhập')) {
                  throw e; // Re-throw custom error
                }
                throw new Error('Token không hợp lệ. Vui lòng đăng nhập lại.');
              }
              
              // Gọi API lưu lịch sử
              console.log('🔐 Token hợp lệ, đang gọi API...');
              const result = await savePlayerHistory(pinCode, clientSessionId);
              
              console.log('✅ Lưu lịch sử thành công:', result);
              setSaved(true);
              
              // Hiện thông báo thành công
              alert('Đã lưu lịch sử chơi thành công!');
              
            } catch (error) {
              console.error('❌ Lỗi khi lưu lịch sử:', error);
              
              // Nếu là lỗi token expired, hỏi user có muốn đăng nhập lại không
              if (error.message.includes('Phiên đăng nhập') || error.message.includes('Token không hợp lệ')) {
                const shouldRedirect = window.confirm(
                  `${error.message}\n\nBạn có muốn chuyển đến trang đăng nhập không?`
                );
                
                if (shouldRedirect) {
                  // Clear localStorage và redirect
                  localStorage.clear();
                  window.location.href = '/login';
                  return;
                }
              } else {
                alert(`Lỗi khi lưu lịch sử: ${error.message}`);
              }
            } finally {
              setSaving(false);
            }
          }}
        >
          {saved ? '✅ Đã lưu' : saving ? 'Đang lưu...' : 'Lưu kết quả'}
        </button>
        )}
        <button
          type="button"
          className="px-6 py-2 rounded-md text-white font-medium bg-[var(--pink)] hover:bg-pink-600"
          onClick={() => {
            // Xóa dữ liệu game và quay về trang chủ
            console.log('🚪 Thoát khỏi game result');
            
            // Xóa dữ liệu game khỏi localStorage
            localStorage.removeItem('finalQuestionData');
            localStorage.removeItem('finalRankingData');
            localStorage.removeItem('roomInfo');
            localStorage.removeItem('currentQuestionData');
            localStorage.removeItem('finalAnswerResult');
            
            // Quay về trang chủ
            window.location.href = '/';
          }}
        >
          Thoát
        </button>
      </div>

      <div className="w-full max-w-3xl mx-auto">
        <Chat />
      </div>
    </div>
  );
}
