import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Collapse,
  Fade,
  Grid,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  EmojiEvents,
  Wifi,
  WifiOff,
  Logout,
  Settings,
  ExpandLess,
  ExpandMore,
  PlayArrow,
  Refresh,
  PersonOff,
  TrendingUp,
  LockOpen,
  Visibility,
  School,
} from '@mui/icons-material';
import Background from '../components/background';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Scoreboard = () => {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [connectionStatus, setConnectionStatus] = useState('LOCKED');
  const [gameStarted, setGameStarted] = useState(false);
  const [starting, setStarting] = useState(false);
  const [startMessage, setStartMessage] = useState('');
  const [resetting, setResetting] = useState(false);
  const [kicking, setKicking] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [pointsChange, setPointsChange] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjusting, setAdjusting] = useState(false);
  const [unlockStationId, setUnlockStationId] = useState('');
  const [unlocking, setUnlocking] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [teamProgress, setTeamProgress] = useState(null);
  const [mentorCodes, setMentorCodes] = useState([]);
  const [generatingCodes, setGeneratingCodes] = useState(false);
  const [resettingCodes, setResettingCodes] = useState(false);
  const authorized = localStorage.getItem('user_role') === 'host';

  useEffect(() => {
    if (!authorized) {
      const destination = localStorage.getItem('team_id') ? '/question' : '/login';
      navigate(destination, { replace: true });
      return;
    }

    const checkGameStatus = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/game/status`);
        if (!res.ok) return;
        const data = await res.json();
        setGameStarted(data.started);
      } catch (err) {
        console.error('Không thể kiểm tra trạng thái game:', err);
      }
    };

    checkGameStatus();

    setConnectionStatus('Connecting...');

    // Dynamic WebSocket URL from environment variable
    const wsUrl = API_BASE_URL.replace(/^https:\/\//, 'wss://').replace(/^http:\/\//, 'ws://') + '/ws/scoreboard';

    let socket;

    const connectWebSocket = () => {
      socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        setConnectionStatus('LIVE');
        console.log('⚡ Đã kết nối hệ thống Scoreboard Real-time!');
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (!data) return;

          const sorted = data.sort((a, b) => {
            if (b.correct_count !== a.correct_count) {
              return b.correct_count - a.correct_count;
            }
            return b.score - a.score;
          });

          setLeaderboard(sorted);
        } catch (err) {
          console.error('Lỗi giải mã gói tin điểm:', err);
        }
      };

      socket.onclose = () => {
        setConnectionStatus('DISCONNECTED');
        console.log('Mất kết nối server. Đang thử kết nối lại sau 2 giây...');
        setTimeout(connectWebSocket, 2000);
      };

      socket.onerror = (err) => {
        console.error('Lỗi kết nối mạng:', err);
        socket.close();
      };
    };

    connectWebSocket();

    return () => {
      if (socket) socket.close();
    };
  }, [authorized, navigate]);

  const handleHostLogout = () => {
    localStorage.removeItem('user_role');
    localStorage.removeItem('team_id');
    localStorage.removeItem('login_time');
    localStorage.removeItem('expires_at');
    navigate('/login', { replace: true });
  };

  const handleStartGame = async () => {
    setStarting(true);
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/game/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        setStartMessage(text || 'Không thể bắt đầu game.');
      } else {
        const data = await res.json();
        setGameStarted(data.started);
        setStartMessage('Trò chơi đã được khởi động.');
      }
    } catch {
      setStartMessage('Lỗi kết nối server. Hãy thử lại.');
    }

    setStarting(false);
  };

  const handleResetGame = async () => {
    if (!confirm('Bạn có chắc muốn reset cuộc thi? Tất cả điểm số và tiến độ sẽ bị xóa.')) {
      return;
    }

    if (!confirm('Xác nhận lần cuối: Hành động này không thể hoàn tác. Bạn có chắc chắn muốn reset?')) {
      return;
    }

    setResetting(true);
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/game/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        setAdminMessage(`Reset thất bại: ${text}`);
      } else {
        setAdminMessage('Đã reset cuộc thi. Tất cả điểm số và tiến độ đã bị xóa.');
        setGameStarted(false);
        localStorage.removeItem('game_start_time'); // Clear game timer
      }
    } catch {
      setAdminMessage('Lỗi kết nối server. Vui lòng thử lại.');
    }

    setResetting(false);
  };

  const handleKickAll = async () => {
    if (!confirm('Bạn có chắc muốn đăng xuất tất cả đội? Tất cả người chơi sẽ bị buộc đăng nhập lại.')) {
      return;
    }

    if (!confirm('Xác nhận lần cuối: Hành động này sẽ buộc tất cả người chơi đăng xuất. Bạn có chắc chắn?')) {
      return;
    }

    setKicking(true);
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/game/kickall`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        setAdminMessage(`Đăng xuất thất bại: ${text}`);
      } else {
        const data = await res.json();
        setAdminMessage(`Đã đăng xuất ${data.count} đội.`);
      }
    } catch {
      setAdminMessage('Lỗi kết nối server. Vui lòng thử lại.');
    }

    setKicking(false);
  };

  const handleAdjustScore = async () => {
    if (!selectedTeam || !pointsChange) {
      setAdminMessage('Vui lòng chọn đội và nhập số điểm.');
      return;
    }

    setAdjusting(true);
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/adjust-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
        body: JSON.stringify({
          teamID: parseInt(selectedTeam),
          pointsChange: parseInt(pointsChange),
          reason: adjustReason || 'Không có lý do',
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        setAdminMessage(`Điều chỉnh điểm thất bại: ${text}`);
      } else {
        const data = await res.json();
        setAdminMessage(`Đã điều chỉnh điểm đội ${selectedTeam}. Điểm mới: ${data.newScore}`);
        setPointsChange('');
        setAdjustReason('');
        setSelectedTeam('');
      }
    } catch {
      setAdminMessage('Lỗi kết nối server. Vui lòng thử lại.');
    }

    setAdjusting(false);
  };

  const handleUnlockChallenge = async () => {
    if (!selectedTeam || !unlockStationId) {
      setAdminMessage('Vui lòng chọn đội và nhập số trạm cần mở.');
      return;
    }

    setUnlocking(true);
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/unlock-challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
        body: JSON.stringify({
          teamID: parseInt(selectedTeam),
          stationID: parseInt(unlockStationId),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        setAdminMessage(`Mở khóa thất bại: ${text}`);
      } else {
        setAdminMessage(`Đã mở khóa trạm ${unlockStationId} cho đội ${selectedTeam}`);
        setUnlockStationId('');
      }
    } catch {
      setAdminMessage('Lỗi kết nối server. Vui lòng thử lại.');
    }

    setUnlocking(false);
  };

  const handleViewProgress = async () => {
    if (!selectedTeam) {
      setAdminMessage('Vui lòng chọn đội để xem tiến độ.');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/team-progress?teamID=${selectedTeam}`);
      if (!res.ok) {
        const text = await res.text();
        setAdminMessage(`Không thể tải tiến độ: ${text}`);
        return;
      }

      const data = await res.json();
      setTeamProgress(data);
    } catch {
      setAdminMessage('Lỗi kết nối server. Vui lòng thử lại.');
    }
  };

  const handleGenerateMentorCodes = async () => {
    if (!confirm('Bạn có chắc muốn tạo mentor codes cho tất cả đội? Codes cũ sẽ bị thay thế.')) {
      return;
    }

    setGeneratingCodes(true);
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
        setAdminMessage(`Đã tạo ${data.codes?.length || 0} mentor codes thành công!`);
      } else {
        const text = await res.text();
        setAdminMessage(`Tạo mentor codes thất bại: ${text}`);
      }
    } catch {
      setAdminMessage('Lỗi kết nối server. Vui lòng thử lại.');
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
      }
    } catch (err) {
      console.error('Failed to load mentor codes:', err);
    }
  };

  const handleResetStationCodes = async () => {
    if (!confirm('Bạn có chắc muốn reset tất cả station codes? Mọi code đã dùng sẽ được đánh dấu chưa dùng.')) {
      return;
    }

    setResettingCodes(true);
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
        setAdminMessage('Đã reset tất cả station codes thành công!');
      } else {
        const text = await res.text();
        setAdminMessage(`Reset station codes thất bại: ${text}`);
      }
    } catch {
      setAdminMessage('Lỗi kết nối server. Vui lòng thử lại.');
    }

    setResettingCodes(false);
  };

  if (!authorized) {
    return null;
  }

  return (
    <Background>
      <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: '100vh' }}>
        <Fade in timeout={800}>
          <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <EmojiEvents sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ffd700' }} />
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
                    Bảng Điểm Hackathon
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Theo dõi tiến độ thi đấu theo thời gian thực
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Chip
                  icon={connectionStatus === 'LIVE' ? <Wifi /> : <WifiOff />}
                  label={connectionStatus}
                  sx={{
                    backgroundColor: connectionStatus === 'LIVE' ? 'rgba(0, 217, 165, 0.15)' : 'rgba(255, 107, 107, 0.15)',
                    color: connectionStatus === 'LIVE' ? '#00d9a5' : '#ff6b6b',
                    border: connectionStatus === 'LIVE' ? '1px solid rgba(0, 217, 165, 0.3)' : '1px solid rgba(255, 107, 107, 0.3)',
                    fontWeight: 600,
                  }}
                />
                <Button
                  variant="outlined"
                  onClick={handleHostLogout}
                  startIcon={<Logout />}
                  sx={{ borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Đăng xuất
                </Button>
              </Box>
            </Box>

            {/* Control Buttons */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="success"
                      onClick={handleStartGame}
                      disabled={starting || gameStarted}
                      startIcon={<PlayArrow />}
                      sx={{ py: 1.5 }}
                    >
                      {gameStarted ? 'Game đã bắt đầu' : starting ? 'Đang bắt đầu...' : 'Bắt đầu game'}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      onClick={handleResetGame}
                      disabled={resetting}
                      startIcon={<Refresh />}
                      sx={{ py: 1.5 }}
                    >
                      {resetting ? 'Đang reset...' : 'Reset cuộc thi'}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="error"
                      onClick={handleKickAll}
                      disabled={kicking}
                      startIcon={<PersonOff />}
                      sx={{ py: 1.5 }}
                    >
                      {kicking ? 'Đang đăng xuất...' : 'Đăng xuất tất cả'}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => setShowAdminPanel(!showAdminPanel)}
                      startIcon={showAdminPanel ? <ExpandLess /> : <ExpandMore />}
                      sx={{ py: 1.5 }}
                    >
                      {showAdminPanel ? 'Ẩn Admin Panel' : 'Hiện Admin Panel'}
                    </Button>
                  </Grid>
                </Grid>

                {(startMessage || adminMessage) && (
                  <Alert 
                    severity={startMessage?.includes('thất bại') || adminMessage?.includes('thất bại') ? 'error' : 'success'}
                    sx={{ mt: 2 }}
                  >
                    {startMessage || adminMessage}
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Admin Panel */}
            <Collapse in={showAdminPanel}>
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                    <Settings sx={{ color: '#764ba2' }} />
                    <Typography variant="h5" sx={{ color: '#764ba2' }}>
                      Admin Panel
                    </Typography>
                  </Box>

                  {/* Score Adjustment */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                      <TrendingUp sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.2rem' }} />
                      Điều chỉnh điểm
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={3}>
                        <Select
                          fullWidth
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">Chọn đội</MenuItem>
                          {leaderboard.map((team) => (
                            <MenuItem key={team.team_id} value={team.team_id}>
                              {team.team_name} (ID: {team.team_id})
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <TextField
                          fullWidth
                          type="number"
                          placeholder="Điểm (+/-)"
                          value={pointsChange}
                          onChange={(e) => setPointsChange(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          placeholder="Lý do (tùy chọn)"
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={2}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleAdjustScore}
                          disabled={adjusting}
                          sx={{ py: 1.5 }}
                        >
                          {adjusting ? 'Đang điều chỉnh...' : 'Điều chỉnh'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {/* Unlock Challenge */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                      <LockOpen sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.2rem' }} />
                      Mở khóa thử thách
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Select
                          fullWidth
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">Chọn đội</MenuItem>
                          {leaderboard.map((team) => (
                            <MenuItem key={team.team_id} value={team.team_id}>
                              {team.team_name} (ID: {team.team_id})
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          type="number"
                          placeholder="Số trạm (1-7)"
                          value={unlockStationId}
                          onChange={(e) => setUnlockStationId(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleUnlockChallenge}
                          disabled={unlocking}
                          sx={{ py: 1.5 }}
                        >
                          {unlocking ? 'Đang mở khóa...' : 'Mở khóa'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {/* View Progress */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                      <Visibility sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.2rem' }} />
                      Xem tiến độ đội
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Select
                          fullWidth
                          value={selectedTeam}
                          onChange={(e) => setSelectedTeam(e.target.value)}
                          displayEmpty
                        >
                          <MenuItem value="">Chọn đội</MenuItem>
                          {leaderboard.map((team) => (
                            <MenuItem key={team.team_id} value={team.team_id}>
                              {team.team_name} (ID: {team.team_id})
                            </MenuItem>
                          ))}
                        </Select>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={handleViewProgress}
                          sx={{ py: 1.5 }}
                        >
                          Xem tiến độ
                        </Button>
                      </Grid>
                    </Grid>
                    {teamProgress && (
                      <Card sx={{ mt: 3, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                        <CardContent>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Đội:</strong> {teamProgress.teamName || 'N/A'}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Điểm:</strong> {teamProgress.score ?? 0}
                          </Typography>
                          <Typography variant="body1" sx={{ mb: 1 }}>
                            <strong>Trạm hiện tại:</strong> {teamProgress.currentStation === 0 || teamProgress.currentStation === null
                              ? 'Hoàn thành tất cả'
                              : teamProgress.currentStation}
                          </Typography>
                          <Typography variant="body1">
                            <strong>Đã hoàn thành:</strong> {Array.isArray(teamProgress.finishedStations) && teamProgress.finishedStations.length > 0
                              ? teamProgress.finishedStations.join(', ')
                              : 'Chưa có'}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                  </Box>

                  <Divider sx={{ my: 3, borderColor: 'rgba(255,255,255,0.1)' }} />

                  {/* Mentor Codes Management */}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 2, color: 'rgba(255,255,255,0.8)' }}>
                      <School sx={{ verticalAlign: 'middle', mr: 1, fontSize: '1.2rem' }} />
                      Quản lý Mentor Codes
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          onClick={() => navigate('/mentor-management')}
                          sx={{ py: 1.5 }}
                        >
                          Mở trang quản lý Mentor Codes
                        </Button>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="warning"
                          onClick={handleResetStationCodes}
                          disabled={resettingCodes}
                          sx={{ py: 1.5 }}
                        >
                          {resettingCodes ? 'Đang reset...' : 'Reset Station Codes'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
            </Collapse>

            {/* Leaderboard Table */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '80px', textAlign: 'center', fontWeight: 'bold' }}>
                          Hạng
                        </TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Tên Đội Thi</TableCell>
                        <TableCell sx={{ width: '150px', textAlign: 'center', fontWeight: 'bold' }}>
                          Số Câu Đúng
                        </TableCell>
                        <TableCell sx={{ width: '150px', textAlign: 'center', fontWeight: 'bold' }}>
                          Điểm
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leaderboard.map((team, index) => (
                        <TableRow
                          key={team.team_id}
                          sx={{
                            backgroundColor: index === 0 ? 'rgba(255, 215, 0, 0.08)' : 'transparent',
                            '&:hover': {
                              backgroundColor: 'rgba(255,255,255,0.05)',
                            },
                          }}
                        >
                          <TableCell sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                            {index === 0 && <EmojiEvents sx={{ color: '#ffd700', mr: 0.5, verticalAlign: 'middle' }} />}
                            {index + 1}
                          </TableCell>
                          <TableCell sx={{ fontWeight: index < 3 ? 600 : 'normal' }}>
                            {team.team_name}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', color: '#00d9a5', fontWeight: 'bold', fontSize: '1.1rem' }}>
                            {team.correct_count}
                          </TableCell>
                          <TableCell sx={{ textAlign: 'center', color: '#667eea', fontWeight: 'bold' }}>
                            {team.score}
                          </TableCell>
                        </TableRow>
                      ))}
                      {leaderboard.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8, color: 'rgba(255,255,255,0.5)' }}>
                            Đang đợi dữ liệu cập nhật từ các trạm thi...
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        </Fade>
      </Box>
    </Background>
  );
};

export default Scoreboard;