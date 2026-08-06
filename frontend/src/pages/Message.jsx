import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { logout } from '../utils/session';

const ScanQRScreen = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        background: theme.palette.background.gradient,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        overflow: 'hidden',
        userSelect: 'none',
        touchAction: 'manipulation',
      }}
    >
      <Button
        onClick={handleLogout}
        sx={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          color: 'white',
          border: '1px solid rgba(255,255,255,0.2)',
          px: 2,
          py: 0.5,
          borderRadius: '12px',
          fontSize: '14px',
        }}
      >
        Đăng xuất
      </Button>
      
        <>
          <Typography
            variant="h5"
            sx={{
              color: 'white',
              textAlign: 'center',
              maxWidth: '80%',
              mb: 4,
            }}
          >
            Chuyển trạm thủ công
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/checkpoint')}
            sx={{ backgroundColor: '#ffffff22', color: 'white', px: 4, py: 1.5, mb: 2 }}
          >
            Nhập mã trạm
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/question')}
            sx={{ borderColor: 'rgba(255,255,255,0.5)', color: 'white', px: 4, py: 1.5 }}
          >
            Quay về danh sách câu hỏi
          </Button>
        </>
    </div>
  );
};

export default ScanQRScreen;
