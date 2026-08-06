import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import StarProgressBar from '../components/progress';
import { Typography, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { logout } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOTAL_STATIONS = 7;
const LONG_PRESS_DURATION = 800; // milliseconds

const ProgressPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [solvedCount, setSolvedCount] = useState(0);
  const [nextStation, setNextStation] = useState('');
  let pressTimer = null;

  // Debug logging
  console.log('Current state:', { solvedCount, nextStation, isNaN: isNaN(solvedCount) });

  useEffect(() => {
    const fetchProgress = async () => {
      const teamID = localStorage.getItem("team_id");
      if (!teamID) return;

      try {
        const response = await fetch(`${API_BASE_URL}/loadprogress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Team-ID': teamID,
          },
          body: JSON.stringify({
            teamID: parseInt(teamID),
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full API response:', JSON.stringify(data, null, 2)); // Debug log
        
        // Backend returns stationNum (not Progress) and nextStation
        if (data.stationNum !== undefined) {
          setSolvedCount(data.stationNum);
          setNextStation(data.nextStation || '');
        } else {
          console.error('Unexpected API response structure:', data);
          setSolvedCount(0);
          setNextStation('');
        }

        console.log('Final state values - solvedCount:', data.stationNum, 'nextStation:', data.nextStation);
      } catch (error) {
        console.error('Error fetching progress:', error);
      }
    };

    fetchProgress();
    
    // Refresh progress every 3 seconds
    const interval = setInterval(fetchProgress, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const handleLongPressStart = () => {
    pressTimer = setTimeout(() => {
      navigate('/message');
    }, LONG_PRESS_DURATION);
  };

  const handleLongPressEnd = () => {
    clearTimeout(pressTimer);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        background: theme.palette.background.gradient,
        backgroundAttachment: 'fixed',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
      onMouseDown={handleLongPressStart}
      onMouseUp={handleLongPressEnd}
      onMouseLeave={handleLongPressEnd}
      onTouchStart={handleLongPressStart}
      onTouchEnd={handleLongPressEnd}
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
          zIndex: 10,
        }}
      >
        Đăng xuất
      </Button>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Star Progress Bar */}
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 1,
          }}
        >
          <StarProgressBar stars={solvedCount} totalStars={TOTAL_STATIONS} />
        </div>

        {/* Center Text with progress count */}
        <div
          style={{
            position: 'absolute',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 2,
          }}
        >
          <Typography variant="subtitle1" fontSize={52} gutterBottom sx={{ mb: 0.5 }}>
            {isNaN(solvedCount) ? '0' : solvedCount}/{TOTAL_STATIONS}
          </Typography>

          <Typography variant="h4" fontSize={16} gutterBottom sx={{ mb: 0.25 }}>
            mật ngữ cổ xưa
          </Typography>
          <Typography variant="h4" fontSize={16} gutterBottom>
            đã được giải
          </Typography>
        </div>

        {/* Next Station Info */}
        {nextStation && !isNaN(solvedCount) && solvedCount < TOTAL_STATIONS && (
          <div
            style={{
              position: 'absolute',
              top: '75%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            <Typography variant="h5" fontSize={16} gutterBottom sx={{ mb: 0.5, color: 'white' }}>
              Trạm tiếp theo:
            </Typography>
            <Typography variant="h4" fontSize={18} gutterBottom sx={{ color: 'white', fontWeight: 'bold' }}>
              {nextStation}
            </Typography>
          </div>
        )}

        {/* Completion message when all stations are done */}
        {!isNaN(solvedCount) && solvedCount >= TOTAL_STATIONS && (
          <div
            style={{
              position: 'absolute',
              top: '85%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              zIndex: 2,
            }}
          >
            <Typography variant="h4" fontSize={18} gutterBottom sx={{ color: theme.palette.primary.main, fontWeight: 'bold' }}>
              🎉 Hoàn thành tất cả! 🎉
            </Typography>
          </div>
        )}

        {/* Bottom "Giữ tay để tiếp tục" message */}
        <Typography
          variant="body2"
          fontSize={14}
          color="white"
          sx={{
            position: 'absolute',
            bottom: '30px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          Giữ để mở thông điệp
        </Typography>

        {/* Nút điều hướng */}
        <div
          style={{
            position: 'absolute',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 2,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate('/question')}
            sx={{ px: 3, py: 1.2, fontWeight: 700, borderColor: 'rgba(255,255,255,0.4)', color: 'white' }}
          >
            Về question
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProgressPage;