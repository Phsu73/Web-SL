import { CssBaseline, ThemeProvider } from '@mui/material';
import theme from './components/theme';
import Start from './pages/Start';
import Question from './pages/Question';
import Login from './pages/Login';
import ProgressPage from './pages/Progress';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Message from './pages/Message';
import Waiting from './pages/Waiting';
import Hint from './pages/Hint';
import Station from './pages/Station';
import Checkpoint from './pages/Checkpoint';

// 1. IMPORT TRANG SCOREBOARD VÀO ĐÂY
import Scoreboard from './pages/Scoreboard';
import Mentor from './pages/Mentor';
import MentorCodeManagement from './pages/MentorCodeManagement';
import MentorVerification from './pages/MentorVerification';

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
        <Router>
        <Routes>
          <Route path="/" element={<Start />} />
          <Route path="/question" element={<Question />} />
          <Route path="/login" element={<Login />} />

          {/* ======================================================== */}
          {/* 2. CHÈM ROUTE SCOREBOARD Ở ĐÂY (TRÊN TRẠM ĐỘNG /:room) */}
          {/* ======================================================== */}
          <Route path="/scoreboard" element={<Scoreboard />} />
          <Route path="/mentor" element={<Mentor />} />
          <Route path="/mentor-management" element={<MentorCodeManagement />} />
          <Route path="/mentor-verification" element={<MentorVerification />} />
          <Route path="/waiting" element={<Waiting />} />

          <Route path="/station" element={<Station />} />

          {/* Define routes for other pages */}
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/message" element={<Message />} />
          <Route path="/checkpoint" element={<Checkpoint />} />

          <Route path="/hint/:hintCode" element={<Hint />} />

        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
