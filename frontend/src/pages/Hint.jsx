import { useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import CardHint from '../components/cardHint';
import { logout } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const hintMap = {
  'P5L3I43E': { questionID: 1, title: 'Toán học' },
  'TSOWG706': { questionID: 2, title: 'Kỹ thuật' },
  'JYFWNRUS': { questionID: 3, title: 'Sinh học' },
  'YS50YQTV': { questionID: 4, title: 'Hoá học' },
  'TT6QY3N7': { questionID: 5, title: 'An ninh mạng' },

};

export default function Hint() {
  const [revealed, setRevealed] = useState([false, false, false]);
  const [hints, setHints] = useState([null, null, null]);
  const navigate = useNavigate();
  const theme = useTheme();
  const { hintCode } = useParams(); // e.g. P5L3I43E
  const teamID = localStorage.getItem("team_id");
  const stationInfo = hintMap[hintCode];
  const questionID = stationInfo.questionID;
  const title = stationInfo.title;
  if (!stationInfo) {
    return <Typography>Gợi ý không tồn tại hoặc sai mã!</Typography>;
  }

  // const { questionID, title } = stationInfo;


  const revealHint = async (index) => {
    if (index > 0 && !revealed[index - 1]) {
      alert(`Bạn cần mở Gợi Ý ${index} trước!`);
      return;
    }

    if (revealed[index] || hints[index]) return;

    try {
      const res = await fetch(`${API_BASE_URL}/hint`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Team-ID': teamID },
        body: JSON.stringify({
          teamID: parseInt(teamID),
          questionID: questionID,
          hintNum: index + 1,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch hint");
      const data = await res.json();

      const newHints = [...hints];
      newHints[index] = data.hint;
      setHints(newHints);

      const newRevealed = [...revealed];
      newRevealed[index] = true;
      setRevealed(newRevealed);
    } catch {
      alert("Không thể lấy gợi ý.");
    }
  };

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
        flexDirection: 'column',
        overflow: 'hidden',
        padding: '30px 30px 40px 40px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          color="white"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{ p: 0, minWidth: 0, justifyContent: 'flex-start' }}
        >
          Quay lại mật ngữ
        </Button>
        <Button
          onClick={handleLogout}
          sx={{
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
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', paddingTop: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Typography variant="h7" fontSize={14}>Bạn đang giải mật ngữ</Typography>
          <div style={{ display: 'flex', gap: '8px' }}>
            {Array(3).fill(null).map((_, index) => (
              <LightbulbIcon
                key={index}
                style={{
                  opacity: index < revealed.filter(r => r).length ? 0.2 : 1,
                  transition: 'opacity 0.3s',
                  color: '#FFFFFF',
                }}
              />
            ))}
          </div>
        </div>
        <Typography variant="h1" fontSize={32}>{title}</Typography>
      </div>

      <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mt: 4 }}>
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{ my: 2, cursor: 'pointer' }}
            onClick={() => revealHint(index)}
          >
            <CardHint
              title={`Gợi Ý ${index + 1}`}
              buttonText="Mở Gợi Ý"
              hint={hints[index] || ''}
              revealed={revealed[index]}
              onClick={() => {}}
            />
          </Box>
        ))}
      </Box>
    </div>
  );
}