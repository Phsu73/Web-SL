import React, { useState } from "react";
import { Typography, Button, TextField, Box } from '@mui/material';
import Background from "../components/background";
import { useNavigate } from "react-router-dom";
import { logout } from '../utils/session';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Checkpoint = () => {
  const [stationID, setStationID] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const id = parseInt(stationID);
    if (isNaN(id) || id < 1 || id > 7) {
      setMessage("Vui lòng nhập ID trạm từ 1 đến 7");
      return;
    }

    const teamID = localStorage.getItem("team_id");

    try {
      const res = await fetch(`${API_BASE_URL}/checkpoint`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Team-ID": teamID,
        },
        body: JSON.stringify({
          teamID: parseInt(teamID),
          stationID: id,
        }),
      });

      const data = await res.json();

      if (data.isUpdated) {
        navigate("/question");
      } else {
        setMessage("Trạm này không hợp lệ hoặc đã hoàn thành.");
      }
    } catch (err) {
      console.error("Backend error:", err);
      setMessage("Lỗi kết nối server.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <Background>
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
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          textAlign: "center",
          gap: "20px",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            color: "white",
            mb: 2,
          }}
        >
          Chuyển Trạm
        </Typography>

        <Typography
          variant="body1"
          sx={{ color: "rgba(255,255,255,0.8)", mb: 2 }}
        >
          Nhập ID trạm (1-7) để xác nhận hoàn thành
        </Typography>

        <TextField
          type="number"
          value={stationID}
          onChange={(e) => setStationID(e.target.value)}
          placeholder="Nhập ID trạm (1-7)"
          inputProps={{ min: 1, max: 7 }}
          sx={{
            width: "200px",
            backgroundColor: "rgba(255,255,255,0.1)",
            borderRadius: "8px",
            "& .MuiInputBase-input": {
              color: "white",
              textAlign: "center",
              fontSize: "18px",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(255,255,255,0.3)",
            },
          }}
        />

        {message && (
          <Typography
            variant="body2"
            sx={{
              color: message.includes("Lỗi") ? "#ff6b6b" : "#51cf66",
              mt: 1,
            }}
          >
            {message}
          </Typography>
        )}

        <Box sx={{ display: "flex", gap: "10px", mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            sx={{
              backgroundColor: "#4dabf7",
              color: "white",
              px: 3,
              py: 1,
            }}
          >
            Xác Nhận
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate("/question")}
            sx={{
              borderColor: "rgba(255,255,255,0.5)",
              color: "white",
              px: 3,
              py: 1,
            }}
          >
            Quay Lại
          </Button>
        </Box>
      </div>
    </Background>
  );
};

export default Checkpoint;
