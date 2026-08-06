import { useState, useEffect } from 'react';
import { Typography, Button, Box, Card, CardContent, CircularProgress, Fade, Chip, Alert, TextField, Grid } from '@mui/material';
import { School, Logout, Refresh, Add, ContentCopy, CheckCircle, ArrowBack } from '@mui/icons-material';
import Background from '../components/background';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Admin = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [mentorCodes, setMentorCodes] = useState([]);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [resettingCodes, setResettingCodes] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const authorized = localStorage.getItem('user_role') === 'host';

  useEffect(() => {
    if (!authorized) {
      navigate('/login', { replace: true });
      return;
    }
  }, [authorized, navigate]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem('user_role');
    navigate('/login', { replace: true });
  };

  const handleGenerateMentorCodes = async () => {
    if (!confirm('Bạn có chắc muốn tạo mentor codes cho tất cả đội? Codes cũ sẽ bị thay thế.')) {
      return;
    }

    setGeneratingCodes(true);
    setAdminMessage('');
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/generate-mentor-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMentorCodes(data.codes || []);
        setAdminMessage(`✅ Đã tạo ${data.codes?.length || 0} mentor codes thành công!`);
      } else {
        const text = await res.text();
        setAdminMessage(`❌ Tạo mentor codes thất bại: ${text}`);
      }
    } catch {
      setAdminMessage('❌ Lỗi kết nối server. Vui lòng thử lại.');
    }

    setGeneratingCodes(false);
  };

  const handleLoadMentorCodes = async () => {
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/mentor-codes`, {
        headers: {
          'X-Team-ID': teamID,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setMentorCodes(data.codes || []);
        setAdminMessage(`✅ Đã tải ${data.codes?.length || 0} mentor codes.`);
      }
    } catch (err) {
      console.error('Failed to load mentor codes:', err);
      setAdminMessage('❌ Lỗi tải mentor codes.');
    }
  };

  const handleResetStationCodes = async () => {
    if (!confirm('Bạn có chắc muốn reset tất cả station codes? Mọi code đã dùng sẽ được đánh dấu chưa dùng.')) {
      return;
    }

    setResettingCodes(true);
    setAdminMessage('');
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/reset-station-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
      });

      if (res.ok) {
        setAdminMessage('✅ Đã reset tất cả station codes thành công!');
      } else {
        const text = await res.text();
        setAdminMessage(`❌ Reset station codes thất bại: ${text}`);
      }
    } catch {
      setAdminMessage('❌ Lỗi kết nối server. Vui lòng thử lại.');
    }

    setResettingCodes(false);
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  if (!authorized) {
    return null;
  }

  return (
    <Background>
      <Box sx={{ position: 'absolute', top: '20px', right: '20px', zIndex: 1000 }}>
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

      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: '100vh' }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <School sx={{ fontSize: { xs: 32, sm: 40 }, color: '#667eea' }} />
                <Box>
                  <Typography
                    variant="h2"
                    sx={{
                      mb: 0.5,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                    }}
                  >
                    Quản lý Mentor Codes
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Tạo và phân phối mentor codes cho các đội
                  </Typography>
                </Box>
              </Box>

              <Button
                variant="outlined"
                onClick={() => navigate('/scoreboard')}
                startIcon={<ArrowBack />}
                sx={{ borderColor: 'rgba(255,255,255,0.2)' }}
              >
                Về Scoreboard
              </Button>
            </Box>

            {/* Action Buttons */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleGenerateMentorCodes}
                      disabled={generatingCodes}
                      startIcon={<Add />}
                      sx={{
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      {generatingCodes ? <CircularProgress size={24} color="inherit" /> : 'Tạo Mentor Codes'}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={handleLoadMentorCodes}
                      startIcon={<Refresh />}
                      sx={{ py: 1.5 }}
                    >
                      Hiển thị Codes
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4}>
                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      onClick={handleResetStationCodes}
                      disabled={resettingCodes}
                      startIcon={resettingCodes ? <CircularProgress size={20} color="inherit" /> : <Refresh />}
                      sx={{ py: 1.5 }}
                    >
                      {resettingCodes ? 'Đang reset...' : 'Reset Station Codes'}
                    </Button>
                  </Grid>
                </Grid>

                {adminMessage && (
                  <Alert
                    severity={adminMessage.includes('✅') ? 'success' : 'error'}
                    sx={{ mt: 2 }}
                  >
                    {adminMessage}
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Mentor Codes List */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                {mentorCodes.length > 0 ? (
                  <>
                    <Box sx={{ p: 3, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                      <Typography variant="h5" sx={{ color: '#667eea', fontWeight: 600 }}>
                        Danh sách Mentor Codes ({mentorCodes.length})
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)', mt: 0.5 }}>
                        Click vào code để copy
                      </Typography>
                    </Box>
                    {mentorCodes.map((mc, index) => (
                      <Box
                        key={mc.team_id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2.5,
                          borderBottom: '1px solid rgba(255,255,255,0.05)',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.03)',
                          },
                          transition: 'background-color 0.2s',
                        }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" sx={{ color: 'white', fontWeight: 600, mb: 0.5 }}>
                            {mc.team_name}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                            Team ID: {mc.team_id}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Typography
                            onClick={() => copyToClipboard(mc.mentor_code || '', index)}
                            sx={{
                              fontFamily: 'monospace',
                              color: '#00d9a5',
                              fontWeight: 'bold',
                              fontSize: '1.1rem',
                              px: 2,
                              py: 1,
                              backgroundColor: 'rgba(0, 217, 165, 0.1)',
                              borderRadius: 1,
                              cursor: 'pointer',
                              border: '1px solid rgba(0, 217, 165, 0.3)',
                              transition: 'all 0.2s',
                              '&:hover': {
                                backgroundColor: 'rgba(0, 217, 165, 0.2)',
                                borderColor: 'rgba(0, 217, 165, 0.5)',
                              },
                            }}
                          >
                            {mc.mentor_code || 'Chưa tạo'}
                          </Typography>
                          {copiedIndex === index && (
                            <CheckCircle sx={{ color: '#00d9a5', fontSize: '1.2rem' }} />
                          )}
                          <Button
                            size="small"
                            onClick={() => copyToClipboard(mc.mentor_code || '', index)}
                            startIcon={<ContentCopy />}
                            sx={{ minWidth: 100 }}
                          >
                            {copiedIndex === index ? 'Đã copy!' : 'Copy'}
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </>
                ) : (
                  <Box sx={{ p: 8, textAlign: 'center' }}>
                    <School sx={{ fontSize: 60, color: 'rgba(255,255,255,0.2)', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                      Chưa có mentor codes nào. Click "Tạo Mentor Codes" để bắt đầu.
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Box>
    </Background>
  );
};

export default Admin;
