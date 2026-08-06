import { Box, Button, IconButton, InputAdornment, Paper, Stack, TextField, Typography, Fade, Card, CardContent } from '@mui/material';
import { Visibility, VisibilityOff, Lock, Person } from '@mui/icons-material';
import Background from '../components/background';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getCurrentTeam } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Login() {
  const navigate = useNavigate();
  const [teamName, setTeamName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const currentTeam = getCurrentTeam();
    if (currentTeam) {
      const role = localStorage.getItem('user_role');
      if (role === 'host') {
        navigate('/scoreboard', { replace: true });
      } else {
        navigate('/question', { replace: true });
      }
    }
  }, [navigate]);

  const handleClick = async () => {
    if (!teamName.trim() || !password.trim()) {
      setMessage('Vui lòng nhập tên đội và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamName: teamName, loginCode: password }),
      });

      const rawText = await response.text();
      let data = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (response.ok && data?.correct) {
        localStorage.setItem('team_id', data.teamID?.toString() || teamName);
        localStorage.setItem('login_time', data.loginTime || new Date().toISOString());
        localStorage.setItem('expires_at', data.expiresAt || new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString());
        localStorage.setItem('user_role', data.role || 'player');

        if (data.role === 'host') {
          navigate('/scoreboard');
        } else {
          navigate('/question');
        }
      } else if (response.ok && data && !data.correct) {
        setMessage('Tên đội hoặc mật khẩu không đúng.');
      } else {
        setMessage(rawText || 'Đăng nhập thất bại. Vui lòng thử lại.');
      }
    } catch (error) {
      setMessage(error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Background>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: { xs: 2, sm: 3 },
          py: 6,
        }}
      >
        <Fade in timeout={800}>
          <Card
            sx={{
              width: '100%',
              maxWidth: 480,
              p: { xs: 3, sm: 5 },
            }}
          >
            <CardContent>
              <Stack spacing={3} alignItems="center">
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Typography 
                    variant="h1" 
                    sx={{ 
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                      mb: 1,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Chào mừng trở lại
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: 'rgba(255,255,255,0.7)', 
                      textAlign: 'center',
                      fontSize: '1rem',
                    }}
                  >
                    Đăng nhập để bắt đầu hành trình khám phá
                  </Typography>
                </Box>

                {message && (
                  <Box
                    sx={{
                      width: '100%',
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255, 107, 107, 0.1)',
                      border: '1px solid rgba(255, 107, 107, 0.3)',
                    }}
                  >
                    <Typography variant="body2" sx={{ color: '#ff6b6b', textAlign: 'center', fontSize: '0.875rem' }}>
                      {message}
                    </Typography>
                  </Box>
                )}

                <TextField
                  fullWidth
                  label="Tên đội"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Person sx={{ color: 'rgba(255,255,255,0.5)' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'rgba(255,255,255,0.5)' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((prev) => !prev)}
                          edge="end"
                          sx={{ color: 'rgba(255,255,255,0.5)' }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleClick} 
                  fullWidth 
                  sx={{ 
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 600,
                  }}
                  disabled={loading}
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </Button>

                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'rgba(255,255,255,0.5)', 
                    textAlign: 'center',
                    fontSize: '0.8rem',
                    mt: 1,
                  }}
                >
                  Phiên bản 2.0 • Hackathon Game
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Fade>
      </Box>
    </Background>
  );
}

export default Login;