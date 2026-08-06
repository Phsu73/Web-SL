import { Typography, Button } from '@mui/material';
import Background from '../components/background';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Waiting = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Đang chờ quản trò bắt đầu trò chơi...');
  const [starting, setStarting] = useState(false);
  const [hostMessage, setHostMessage] = useState('');
  const isHost = localStorage.getItem('user_role') === 'host';

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/game/status`);
        if (!res.ok) {
          throw new Error('Không thể kiểm tra trạng thái');
        }
        const data = await res.json();
        setStarted(data.started);
        setLoading(false);
        if (data.started) {
          if (data.startTime) {
            localStorage.setItem('game_start_time', data.startTime);
          }
          setMessage('Trò chơi đã bắt đầu! Bạn có thể vào trạm.');
        }
      } catch {
        setMessage('Không thể kết nối tới server. Vui lòng thử lại.');
        setLoading(false);
      }
    };

    const checkSession = async () => {
      const teamID = localStorage.getItem('team_id');
      if (!teamID) return;

      try {
        const res = await fetch(`${API_BASE_URL}/game/sessioncheck`, {
          headers: {
            'X-Team-ID': teamID,
          },
        });

        if (res.status === 401) {
          // Session expired or kicked - logout immediately
          localStorage.clear();
          navigate('/login', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    checkStatus();
    checkSession(); // Check immediately on mount

    const statusInterval = setInterval(checkStatus, 3000);
    const sessionInterval = setInterval(checkSession, 2000); // Check every 2 seconds

    return () => {
      clearInterval(statusInterval);
      clearInterval(sessionInterval);
    };
  }, [navigate]);

  const handleContinue = () => {
    // Check if already verified as mentor
    const mentorVerified = localStorage.getItem('mentor_verified');
    if (mentorVerified === 'true') {
      navigate('/question');
    } else {
      navigate('/mentor-verification');
    }
  };

  const handleStartGame = async () => {
    if (!isHost) return;

    setStarting(true);
    setHostMessage('Đang kích hoạt trò chơi...');

    try {
      const teamID = localStorage.getItem('team_id');
      const res = await fetch(`${API_BASE_URL}/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        setHostMessage(text || 'Không thể kích hoạt trò chơi.');
      } else {
        setStarted(true);
        setMessage('Trò chơi đã bắt đầu! Bạn có thể vào trạm.');
        setHostMessage('Đã kích hoạt trò chơi thành công.');
      }
    } catch {
      setHostMessage('Lỗi kết nối server. Vui lòng thử lại.');
    }

    setStarting(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Background>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center',
          padding: '0 20px',
          gap: '20px',
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Đăng xuất
        </button>
        <Typography variant="h3" sx={{ color: '#fff' }}>
          Màn chờ khởi động
        </Typography>
        <Typography variant="body1" sx={{ color: '#ddd', maxWidth: 500 }}>
          {message}
        </Typography>
        {isHost && (
          <Button variant="contained" color="secondary" onClick={handleStartGame} disabled={starting || started}>
            {starting ? 'Đang kích hoạt...' : started ? 'Trò chơi đã bắt đầu' : 'Kích hoạt trò chơi'}
          </Button>
        )}
        {hostMessage && (
          <Typography variant="body2" sx={{ color: '#8fe7ff' }}>
            {hostMessage}
          </Typography>
        )}
        {started && (
          <Button variant="contained" color="primary" onClick={handleContinue}>
            Vào trạm ngay
          </Button>
        )}
        {!started && loading && (
          <Typography variant="subtitle1" sx={{ color: '#aaa' }}>
            Đang kiểm tra trạng thái...
          </Typography>
        )}
      </div>
    </Background>
  );
};

export default Waiting;
