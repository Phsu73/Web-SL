import { Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ProjectCard from '../components/card';
import Background from '../components/background';
import Snackbar from '@mui/material/Snackbar';
import { useEffect, useState } from 'react';
import { logout } from '../utils/session';



const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function Question() {
  const navigate = useNavigate();
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [currentStation, setCurrentStation] = useState(1);
  const [finishedCount, setFinishedCount] = useState(0);
  const teamID = localStorage.getItem('team_id');

  useEffect(() => {
    const loadProgress = async () => {
      if (!teamID) return;

      try {
        const res = await fetch(`${API_BASE_URL}/loadprogress`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Team-ID': teamID,
          },
          body: JSON.stringify({ teamID: parseInt(teamID) }),
        });

        if (res.ok) {
          const data = await res.json();
          // Backend returns stationNum as JSON key (not Progress)
          console.log('Question loadProgress - data.stationNum:', data.stationNum, 'FinishedStations:', data.finishedStations);
          setCurrentStation(data.stationNum);
          // Calculate finished count from FinishedStations array
          setFinishedCount(data.finishedStations ? data.finishedStations.length : 0);
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
      }
    };

    const checkGameStarted = async () => {
      if (!teamID) return;
      try {
        const res = await fetch(`${API_BASE_URL}/game/status`);
        if (!res.ok) return;
        const data = await res.json();
        if (!data.started) {
          navigate('/waiting');
        }
      } catch (err) {
        console.error('Không thể kiểm tra trạng thái game', err);
      }
    };

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

    loadProgress();
    checkGameStarted();
    checkSession();

    const gameInterval = setInterval(checkGameStarted, 3000);
    const sessionInterval = setInterval(checkSession, 2000);

    return () => {
      clearInterval(gameInterval);
      clearInterval(sessionInterval);
    };
  }, [navigate, teamID]);

  const handleStartChallenge = () => {
    if (finishedCount >= 7) {
      navigate('/progress');
    } else {
      navigate('/station');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Background>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          height: '100vh',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            padding: '10px 18px',
            borderRadius: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'transparent',
            color: 'white',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
          }}
        >
          Đăng xuất
        </button>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            marginTop: '80px',
          }}
        >
          <Typography variant="h2" fontSize={'1.5rem'} fontWeight={'700'} style={{ color: 'white' }}>
            Hackathon Game
          </Typography>
          <Typography variant="h5" fontSize={'0.85rem'} style={{ color: 'rgba(255,255,255,0.8)' }}>
            Hoàn thành {finishedCount}/7 thử thách
          </Typography>

          {finishedCount >= 7 ? (
            <div style={{ textAlign: 'center', marginTop: '40px' }}>
              <Typography variant="h4" style={{ color: 'white', marginBottom: '20px' }}>
                🎉 Chúc mừng! Bạn đã hoàn thành tất cả thử thách!
              </Typography>
              <ProjectCard
                subtitle="Xem kết quả"
                title="Bảng điểm"
                buttonText="Xem bảng xếp hạng"
                onClick={() => navigate('/progress')}
              />
            </div>
          ) : (
            <div style={{ width: '100%', maxWidth: 600, marginTop: '40px' }}>
              <ProjectCard
                subtitle={`Thử thách ${currentStation}`}
                title={`Thử thách ${currentStation}`}
                buttonText="Bắt đầu"
                onClick={handleStartChallenge}
              />
            </div>
          )}
        </div>
      </div>
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message={snackMsg}
      />
    </Background>
  );
}

export default Question;
