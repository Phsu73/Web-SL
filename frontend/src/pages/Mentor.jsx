import { useState, useEffect } from 'react';
import { Typography, Button, TextField, Box, Card, CardContent, CircularProgress, Fade, Chip, Alert } from '@mui/material';
import { School, Logout, CheckCircle, Error } from '@mui/icons-material';
import Background from '../components/background';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Mentor = () => {
  const navigate = useNavigate();
  const [mentorCode, setMentorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [teamData, setTeamData] = useState(null);
  const [code, setCode] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentStation, setCurrentStation] = useState(1);
  const [finishedCount, setFinishedCount] = useState(0);

  useEffect(() => {
    // Check if already logged in as mentor
    const savedTeamID = localStorage.getItem('team_id');
    const userRole = localStorage.getItem('user_role');

    if (savedTeamID && userRole === 'mentor') {
      loadTeamProgress(parseInt(savedTeamID));
    }
  }, []);

  const loadTeamProgress = async (teamID) => {
    try {
      const res = await fetch(`${API_BASE_URL}/loadprogress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
        body: JSON.stringify({ teamID }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentStation(data.stationNum || 1);
        setFinishedCount(data.finishedStations ? data.finishedStations.length : 0);
        setLoggedIn(true);
        setTeamData({ teamID, name: localStorage.getItem('team_name') || 'Team' });
      }
    } catch (err) {
      console.error('Failed to load team progress:', err);
    }
  };

  const handleMentorLogin = async () => {
    if (!mentorCode.trim()) {
      setMessage('Vui lòng nhập mentor code.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/mentor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mentorCode: mentorCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('team_id', data.teamID);
        localStorage.setItem('team_name', data.teamName);
        localStorage.setItem('user_role', 'mentor');
        setLoggedIn(true);
        setTeamData({ teamID: data.teamID, name: data.teamName });
        loadTeamProgress(data.teamID);
        setMessage(`Xin chào Mentor của đội ${data.teamName}!`);
      } else {
        setMessage(data.message || 'Mentor code không hợp lệ.');
      }
    } catch (error) {
      console.error('Error logging in as mentor:', error);
      setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) {
      setMessage('Vui lòng nhập code.');
      return;
    }

    setSubmitting(true);
    setMessage('');

    try {
      const teamID = localStorage.getItem('team_id');
      const response = await fetch(`${API_BASE_URL}/mentor/submit-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
        body: JSON.stringify({
          teamID: parseInt(teamID),
          stationID: currentStation,
          code: code.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Chính xác! +${data.points} điểm`);
        setCode('');
        // Reload progress after successful submission
        setTimeout(() => loadTeamProgress(parseInt(teamID)), 500);
      } else {
        setMessage(data.message || 'Code không đúng. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
      setMessage('Có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user_role');
    navigate('/login', { replace: true });
  };

  const isSuccess = message.includes('Chính xác') || message.includes('điểm');

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

      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', paddingTop: '100px', minHeight: '100vh' }}>
        <Fade in timeout={1000}>
          <Card sx={{ maxWidth: 500, width: '100%' }}>
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              {!loggedIn ? (
                // Login Form
                <>
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
                      Mentor Login
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '1rem',
                      }}
                    >
                      Nhập mentor code để tiếp cận mentor interface
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    value={mentorCode}
                    onChange={(e) => setMentorCode(e.target.value)}
                    placeholder="Nhập mentor code..."
                    variant="outlined"
                    disabled={loading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleMentorLogin();
                      }
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
                    onClick={handleMentorLogin}
                    disabled={loading || !mentorCode.trim()}
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                    }}
                  >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Đăng nhập'}
                  </Button>
                </>
              ) : (
                // Code Submission Form
                <>
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Chip
                      label={`Mentor: ${teamData?.name || 'Team'}`}
                      sx={{
                        mb: 2,
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
                        mb: 1,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
                      }}
                    >
                      Thử thách {currentStation}/7
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255,255,255,0.7)',
                        fontSize: '1rem',
                      }}
                    >
                      Hoàn thành {finishedCount}/7 thử thách • Điểm available: 10, 20, 30, 40, 50
                    </Typography>
                  </Box>

                  <TextField
                    fullWidth
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Nhập code từ BTC..."
                    variant="outlined"
                    disabled={submitting || currentStation > 7}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSubmitCode();
                      }
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
                    disabled={submitting || !code.trim() || currentStation > 7}
                    fullWidth
                    sx={{
                      py: 1.5,
                      fontSize: '1rem',
                      fontWeight: 600,
                      mb: 3,
                    }}
                  >
                    {submitting ? <CircularProgress size={24} color="inherit" /> : 'Nộp code'}
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

                  {currentStation > 7 && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      🎉 Đội đã hoàn thành tất cả 7 thử thách!
                    </Alert>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Background>
  );
};

export default Mentor;
