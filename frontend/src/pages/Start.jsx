import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import Background from '../components/background';
import { useNavigate } from 'react-router-dom';
import { getCurrentTeam, logout } from '../utils/session';

function Start() {
  const navigate = useNavigate();
  const currentTeam = getCurrentTeam();

  const handleClick = () => {
    if (currentTeam) {
      const role = localStorage.getItem('user_role');
      if (role === 'host') {
        navigate('/scoreboard');
      } else {
        navigate('/question');
      }
      return;
    }

    navigate('/login');
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Background>
      {currentTeam && (
        <Button
          onClick={handleLogout}
          variant="outlined"
          sx={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            color: 'white',
            borderColor: 'rgba(255,255,255,0.24)',
            px: 2,
            py: 0.75,
            borderRadius: '999px',
            fontSize: '14px',
            backdropFilter: 'blur(10px)',
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        >
          Đăng xuất
        </Button>
      )}

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
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 760,
            p: { xs: 3, sm: 5 },
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.08) 100%)',
          }}
        >
          <Stack spacing={2.5} alignItems="center">
            <Chip
              label="Summer STEM • AI Challenge"
              sx={{
                borderRadius: '999px',
                px: 1.5,
                backgroundColor: 'rgba(255,255,255,0.12)',
                color: 'white',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            />

            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', sm: '2.8rem' } }}>
              Khám phá trí tuệ nhân tạo qua trải nghiệm game STEM
            </Typography>

            <Typography
              variant="subtitle1"
              sx={{
                fontSize: { xs: '1.4rem', sm: '1.7rem' },
                color: 'rgba(255,255,255,0.9)',
              }}
            >
              Một hành trình học tập hiện đại nơi công nghệ, tư duy logic và AI chạm tới từng thử thách.
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
              <Chip label="AI & STEM" sx={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }} />
              <Chip label="Học tập tương tác" sx={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }} />
              <Chip label="Thiết kế chuyên nghiệp" sx={{ backgroundColor: 'rgba(255,255,255,0.12)', color: 'white' }} />
            </Stack>

            <Button variant="contained" color="primary" onClick={handleClick} sx={{ mt: 1, px: 4, py: 1.2 }}>
              Bắt đầu hành trình
            </Button>
          </Stack>
        </Paper>
      </Box>
    </Background>
  );
}

export default Start;

