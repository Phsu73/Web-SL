import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  TextField,
  Card,
  CardContent,
  CircularProgress,
  Fade,
  Alert,
  Chip,
} from '@mui/material';
import {
  School,
  CheckCircle,
  Error as ErrorIcon,
  Logout,
} from '@mui/icons-material';
import Background from '../components/background';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MentorVerification = () => {
  const navigate = useNavigate();
  const [mentorCode, setMentorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [gameStatus, setGameStatus] = useState({ started: false });

  useEffect(() => {
    // Check if user is logged in
    const teamID = localStorage.getItem('team_id');
    if (!teamID) {
      navigate('/login', { replace: true });
      return;
    }

    // Check if already verified as mentor
    const mentorVerified = localStorage.getItem('mentor_verified');
    if (mentorVerified === 'true') {
      navigate('/question', { replace: true });
      return;
    }

    // Check game status
    checkGameStatus();

    // Poll game status every 3 seconds
    const interval = setInterval(checkGameStatus, 3000);
    return () => clearInterval(interval);
  }, [navigate]);

  const checkGameStatus = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/game/status`);
      if (res.ok) {
        const data = await res.json();
        setGameStatus(data);
      }
    } catch (err) {
      console.error('Failed to check game status:', err);
    }
  };

  const handleVerifyMentorCode = async () => {
    if (!mentorCode.trim()) {
      setMessage('Vui lòng nhập mentor code.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/mentor/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': localStorage.getItem('team_id'),
        },
        body: JSON.stringify({ mentorCode: mentorCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('mentor_verified', 'true');
        localStorage.setItem('mentor_team_id', data.teamID);
        localStorage.setItem('mentor_team_name', data.teamName);

        setMessage(`Xác nhận thành công! Chào mừng mentor của đội ${data.teamName}`);
        setMessageType('success');

        setTimeout(() => {
          navigate('/question', { replace: true });
        }, 1500);
      } else {
        setMessage(data.message || 'Mentor code không hợp lệ.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error verifying mentor code:', error);
      setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleVerifyMentorCode();
    }
  };

  return (
    <Background>
      <Box
        sx={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          zIndex: 1000,
        }}
      >
        <Button
          onClick={handleLogout}
          sx={{
            color: 'rgba(255,255,255,0.8)',
            backgroundColor: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '10px',
            transition: 'all 0.3s ease',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.2)',
              transform: 'translateY(-2px)',
            },
          }}
          startIcon={<Logout />}
        >
          Đăng xuất
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '40px',
          paddingTop: '100px',
          minHeight: '100vh',
        }}
      >
        <Fade in timeout={1000}>
          <Card sx={{ maxWidth: 500, width: '100%' }}>
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <School sx={{ fontSize: 60, color: '#667eea', mb: 2 }} />
                <Typography
                  variant="h2"
                  sx={{
                    mb: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                  }}
                >
                  Xác Thực Mentor
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '1rem',
                  }}
                >
                  Nhập mentor code để tiếp tục vào thử thách
                </Typography>
              </Box>

              {/* Game Status */}
              <Box sx={{ mb: 3 }}>
                <Chip
                  icon={gameStatus.started ? <CheckCircle /> : <ErrorIcon />}
                  label={gameStatus.started ? 'Game đã bắt đầu' : 'Chờ bắt đầu'}
                  sx={{
                    backgroundColor: gameStatus.started
                      ? 'rgba(0, 217, 165, 0.15)'
                      : 'rgba(255, 107, 107, 0.15)',
                    color: gameStatus.started ? '#00d9a5' : '#ff6b6b',
                    border: gameStatus.started
                      ? '1px solid rgba(0, 217, 165, 0.3)'
                      : '1px solid rgba(255, 107, 107, 0.3)',
                    fontWeight: 600,
                  }}
                />
              </Box>

              {!gameStatus.started && (
                <Alert severity="info" sx={{ mb: 3 }}>
                  Game chưa bắt đầu. Vui lòng đợi host khởi động game.
                </Alert>
              )}

              <TextField
                fullWidth
                value={mentorCode}
                onChange={(e) => setMentorCode(e.target.value)}
                placeholder="Nhập mentor code..."
                variant="outlined"
                disabled={loading || !gameStatus.started}
                onKeyPress={handleKeyPress}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-input': {
                    color: 'white',
                    padding: '16px',
                    fontSize: '1rem',
                  },
                }}
              />

              <Button
                variant="contained"
                onClick={handleVerifyMentorCode}
                disabled={loading || !gameStatus.started || !mentorCode.trim()}
                fullWidth
                sx={{
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Xác Nhập'}
              </Button>

              {message && (
                <Fade in timeout={500}>
                  <Alert
                    severity={messageType}
                    sx={{ mt: 3 }}
                    onClose={() => setMessage('')}
                  >
                    {message}
                  </Alert>
                </Fade>
              )}

              <Box sx={{ mt: 4, textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.85rem',
                  }}
                >
                  Mentor code được cấp cho từng đội khi game bắt đầu.
                  <br />
                  Vui lòng liên hệ host để nhận code nếu chưa có.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Background>
  );
};

export default MentorVerification;
