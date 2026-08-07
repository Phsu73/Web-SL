import { useState, useEffect } from 'react';
import { Typography, Button, CircularProgress, TextField, Box, Card, CardContent, Fade, Chip, IconButton } from '@mui/material';
import { Logout, CheckCircle, Error, Lock } from '@mui/icons-material';
import Background from '../components/background';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Station() {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStation, setCurrentStation] = useState(1);
  const [nextStation, setNextStation] = useState(null);
  const teamID = localStorage.getItem('team_id');

  const loadProgress = async () => {
    if (!teamID) {
      navigate('/login', { replace: true });
      return;
    }

    try {
      const statusRes = await fetch(`${API_BASE_URL}/game/status`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        if (!statusData.started) {
          navigate('/waiting', { replace: true });
          return;
        }
      }
    } catch (err) {
      console.warn('Không thể kiểm tra trạng thái game:', err);
    }

    try {
      const res = await fetch(`${API_BASE_URL}/loadprogress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
        body: JSON.stringify({ teamID: parseInt(teamID) }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          navigate('/login', { replace: true });
        }
        return;
      }

      const data = await res.json();
      // Backend returns stationNum as JSON key (not Progress)
      console.log('Station loadProgress - data.stationNum:', data.stationNum, 'FinishedStations:', data.finishedStations);
      setCurrentStation(data.stationNum || 1);
    } catch (err) {
      console.error('Failed to load progress:', err);
    }
  };

  useEffect(() => {
    loadProgress();
  }, [teamID, navigate, location]);

  useEffect(() => {
    const checkSession = async () => {
      if (!teamID) return;

      try {
        const res = await fetch(`${API_BASE_URL}/game/sessioncheck`, {
          headers: {
            'X-Team-ID': teamID,
          },
        });

        if (res.status === 401) {
          localStorage.clear();
          navigate('/login', { replace: true });
          return;
        }
      } catch (err) {
        console.error('Session check error:', err);
      }
    };

    checkSession();
    const sessionInterval = setInterval(checkSession, 2000);

    return () => clearInterval(sessionInterval);
  }, [teamID, navigate]);

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setMessage('Vui lòng nhập mã.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
        body: JSON.stringify({
          teamID: parseInt(teamID),
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Chính xác! +${data.points} điểm`);
        setCode('');
        // Don't auto-redirect, let user click button to move to next station
        setNextStation(data.nextStation);
      } else {
        setMessage(data.message || 'Mã không đúng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const handleNextStation = () => {
    if (nextStation === 0) {
      navigate('/progress');
    } else {
      // Navigate to question page first, then to station
      navigate('/question');
    }
  };

  const isSuccess = message.includes('Chính xác');

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
        <IconButton
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
        >
          <Logout />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', paddingTop: '100px', minHeight: '100vh' }}>
        <Fade in timeout={1000}>
          <Card sx={{ maxWidth: 500, width: '100%' }}>
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Chip
                  label={`Thử thách ${currentStation}/7`}
                  sx={{
                    mb: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    px: 2,
                    py: 0.5,
                  }}
                />
                
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
                  Nhập mã code
                </Typography>
                
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.7)',
                    fontSize: '1rem',
                  }}
                >
                  Hãy nhập code Ban Tổ chức đã gửi cho bạn
                </Typography>
              </Box>

              <TextField
                fullWidth
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Nhập mã code..."
                variant="outlined"
                disabled={loading}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSubmitCode();
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
                      <Lock sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '1.2rem' }} />
                    </Box>
                  ),
                }}
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
                onClick={handleSubmitCode}
                disabled={loading || !code.trim()}
                fullWidth
                sx={{ 
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  mb: 3,
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Gửi mã'}
              </Button>

              {message && (
                <Fade in timeout={500}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 1,
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: isSuccess 
                        ? 'rgba(0, 217, 165, 0.1)' 
                        : 'rgba(255, 107, 107, 0.1)',
                      border: isSuccess 
                        ? '1px solid rgba(0, 217, 165, 0.3)' 
                        : '1px solid rgba(255, 107, 107, 0.3)',
                    }}
                  >
                    {isSuccess ? (
                      <CheckCircle sx={{ color: '#00d9a5', fontSize: '1.2rem' }} />
                    ) : (
                      <Error sx={{ color: '#ff6b6b', fontSize: '1.2rem' }} />
                    )}
                    <Typography
                      variant="body1"
                      sx={{
                        color: isSuccess ? '#00d9a5' : '#ff6b6b',
                        fontWeight: 500,
                        fontSize: '0.95rem',
                      }}
                    >
                      {message}
                    </Typography>
                  </Box>
                </Fade>
              )}

              {isSuccess && nextStation !== null && (
                <Fade in timeout={500}>
                  <Button
                    variant="contained"
                    onClick={handleNextStation}
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    }}
                  >
                    {!nextStation || nextStation === 0 || nextStation > 7
                      ? '🎉 Hoàn thành tất cả thử thách!'
                      : `Chuyển sang thử thách ${nextStation}`}
                  </Button>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Background>
  );
}

export default Station;
