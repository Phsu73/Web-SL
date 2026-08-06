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
  TextField,
  IconButton,
  Fade,
  Grid,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  School,
  ArrowBack,
  Add,
  ContentCopy,
  Delete,
  Refresh,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import Background from '../components/background';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const MentorCodeManagement = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingForAll, setGeneratingForAll] = useState(false);
  const [generatingForTeam, setGeneratingForTeam] = useState(null);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('success');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);

  // Check authorization
  const authorized = localStorage.getItem('user_role') === 'host';

  useEffect(() => {
    if (!authorized) {
      const destination = localStorage.getItem('team_id') ? '/question' : '/login';
      navigate(destination, { replace: true });
      return;
    }

    loadTeams();
  }, [authorized, navigate]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/mentor-codes`, {
        headers: {
          'X-Team-ID': localStorage.getItem('team_id'),
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTeams(data.codes || []);
      }
    } catch (err) {
      console.error('Failed to load teams:', err);
      showMessage('Không thể tải danh sách đội', 'error');
    }
    setLoading(false);
  };

  const showMessage = (msg, type = 'success') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000);
  };

  const handleGenerateForAll = async () => {
    if (!confirm('Bạn có chắc muốn tạo mentor codes cho tất cả đội? Codes cũ sẽ bị thay thế.')) {
      return;
    }

    setGeneratingForAll(true);
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
        setTeams(data.codes || []);
        showMessage(`Đã tạo ${data.codes?.length || 0} mentor codes thành công!`, 'success');
      } else {
        const text = await res.text();
        showMessage(`Tạo mentor codes thất bại: ${text}`, 'error');
      }
    } catch {
      showMessage('Lỗi kết nối server. Vui lòng thử lại.', 'error');
    }

    setGeneratingForAll(false);
  };

  const handleGenerateForTeam = async (teamId) => {
    setGeneratingForTeam(teamId);
    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/generate-mentor-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
        body: JSON.stringify({ teamId }),
      });

      if (res.ok) {
        const data = await res.json();
        // Update the team in the list
        setTeams(teams.map(team =>
          team.team_id === teamId
            ? { ...team, mentor_code: data.mentor_code }
            : team
        ));
        showMessage(`Đã tạo mentor code cho đội ${data.team_name}!`, 'success');
      } else {
        const text = await res.text();
        showMessage(`Tạo mentor code thất bại: ${text}`, 'error');
      }
    } catch {
      showMessage('Lỗi kết nối server. Vui lòng thử lại.', 'error');
    }

    setGeneratingForTeam(null);
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code).then(() => {
      showMessage('Đã copy mentor code!', 'success');
    }).catch(() => {
      showMessage('Không thể copy code', 'error');
    });
  };

  const handleDeleteClick = (team) => {
    setTeamToDelete(team);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    const teamID = localStorage.getItem('team_id');

    try {
      const res = await fetch(`${API_BASE_URL}/admin/delete-mentor-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Team-ID': teamID,
        },
        body: JSON.stringify({ teamId: teamToDelete.team_id }),
      });

      if (res.ok) {
        setTeams(teams.map(team =>
          team.team_id === teamToDelete.team_id
            ? { ...team, mentor_code: null }
            : team
        ));
        showMessage(`Đã xóa mentor code của đội ${teamToDelete.team_name}`, 'success');
      } else {
        const text = await res.text();
        showMessage(`Xóa mentor code thất bại: ${text}`, 'error');
      }
    } catch {
      showMessage('Lỗi kết nối server. Vui lòng thử lại.', 'error');
    }

    setDeleteDialogOpen(false);
    setTeamToDelete(null);
  };

  const handleResetStationCodes = async () => {
    if (!confirm('Bạn có chắc muốn reset tất cả station codes? Mọi code đã dùng sẽ được đánh dấu chưa dùng.')) {
      return;
    }

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
        showMessage('Đã reset tất cả station codes thành công!', 'success');
      } else {
        const text = await res.text();
        showMessage(`Reset station codes thất bại: ${text}`, 'error');
      }
    } catch {
      showMessage('Lỗi kết nối server. Vui lòng thử lại.', 'error');
    }
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
                    Quản Lý Mentor Codes
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.6)' }}>
                    Tạo và quản lý mentor codes cho từng đội
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/scoreboard')}
                  startIcon={<ArrowBack />}
                  sx={{ borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Về Scoreboard
                </Button>
              </Box>
            </Box>

            {/* Control Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="h6" sx={{ color: '#667eea' }}>
                        Tạo Codes Hàng Loạt
                      </Typography>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        onClick={handleGenerateForAll}
                        disabled={generatingForAll}
                        startIcon={generatingForAll ? <CircularProgress size={20} color="inherit" /> : <Add />}
                        sx={{ py: 1.5 }}
                      >
                        {generatingForAll ? 'Đang tạo...' : 'Tạo tất cả mentor codes'}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="h6" sx={{ color: '#00d9a5' }}>
                        Làm Mới Dữ Liệu
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        onClick={loadTeams}
                        startIcon={<Refresh />}
                        sx={{ py: 1.5 }}
                      >
                        Tải lại danh sách
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Typography variant="h6" sx={{ color: '#ff6b6b' }}>
                        Reset Station Codes
                      </Typography>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="warning"
                        onClick={handleResetStationCodes}
                        sx={{ py: 1.5 }}
                      >
                        Reset station codes
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Message Alert */}
            {message && (
              <Alert
                severity={messageType}
                sx={{ mb: 3 }}
                onClose={() => setMessage('')}
              >
                {message}
              </Alert>
            )}

            {/* Teams Table */}
            <Card>
              <CardContent sx={{ p: 0 }}>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ width: '100px', fontWeight: 'bold' }}>Team ID</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Tên Đội</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Mentor Code</TableCell>
                        <TableCell sx={{ width: '200px', textAlign: 'center', fontWeight: 'bold' }}>
                          Hành Động
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8 }}>
                            <CircularProgress />
                          </TableCell>
                        </TableRow>
                      ) : teams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} sx={{ textAlign: 'center', py: 8, color: 'rgba(255,255,255,0.5)' }}>
                            Không tìm thấy đội nào
                          </TableCell>
                        </TableRow>
                      ) : (
                        teams.map((team) => (
                          <TableRow
                            key={team.team_id}
                            sx={{
                              '&:hover': {
                                backgroundColor: 'rgba(255,255,255,0.05)',
                              },
                            }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>{team.team_id}</TableCell>
                            <TableCell>{team.team_name}</TableCell>
                            <TableCell>
                              {team.mentor_code ? (
                                <Chip
                                  label={team.mentor_code}
                                  sx={{
                                    fontFamily: 'monospace',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    backgroundColor: 'rgba(0, 217, 165, 0.15)',
                                    color: '#00d9a5',
                                    border: '1px solid rgba(0, 217, 165, 0.3)',
                                  }}
                                />
                              ) : (
                                <Chip
                                  label="Chưa tạo"
                                  sx={{
                                    backgroundColor: 'rgba(255, 107, 107, 0.15)',
                                    color: '#ff6b6b',
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }}>
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                {/* Generate/Regenerate button */}
                                <Tooltip title={team.mentor_code ? "Tạo lại code" : "Tạo code mới"}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleGenerateForTeam(team.team_id)}
                                    disabled={generatingForTeam === team.team_id}
                                    sx={{
                                      backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                      '&:hover': {
                                        backgroundColor: 'rgba(102, 126, 234, 0.2)',
                                      },
                                    }}
                                  >
                                    {generatingForTeam === team.team_id ? (
                                      <CircularProgress size={16} />
                                    ) : (
                                      <Add sx={{ fontSize: '1.1rem', color: '#667eea' }} />
                                    )}
                                  </IconButton>
                                </Tooltip>

                                {/* Copy button */}
                                {team.mentor_code && (
                                  <Tooltip title="Copy code">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleCopyCode(team.mentor_code)}
                                      sx={{
                                        backgroundColor: 'rgba(0, 217, 165, 0.1)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(0, 217, 165, 0.2)',
                                        },
                                      }}
                                    >
                                      <ContentCopy sx={{ fontSize: '1.1rem', color: '#00d9a5' }} />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {/* Delete button */}
                                {team.mentor_code && (
                                  <Tooltip title="Xóa code">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleDeleteClick(team)}
                                      sx={{
                                        backgroundColor: 'rgba(255, 107, 107, 0.1)',
                                        '&:hover': {
                                          backgroundColor: 'rgba(255, 107, 107, 0.2)',
                                        },
                                      }}
                                    >
                                      <Delete sx={{ fontSize: '1.1rem', color: '#ff6b6b' }} />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
              <DialogTitle>Xác nhận xóa mentor code</DialogTitle>
              <DialogContent>
                <Typography>
                  Bạn có chắc muốn xóa mentor code của đội <strong>{teamToDelete?.team_name}</strong>?
                </Typography>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteDialogOpen(false)}>Hủy</Button>
                <Button onClick={handleDeleteConfirm} color="error" variant="contained">
                  Xóa
                </Button>
              </DialogActions>
            </Dialog>
          </Box>
        </Fade>
      </Box>
    </Background>
  );
};

export default MentorCodeManagement;
