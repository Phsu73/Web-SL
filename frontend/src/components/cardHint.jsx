import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function CardHint({ title, buttonText, hint, revealed }) {
  return (
    <Card
      sx={{
        borderRadius: '20px',
        background: revealed
          ? 'lavender'
          : 'linear-gradient(135deg, #12142D 0%, #392FA9 100%)',
        border: '0.5px solid #ffffff',
        color: revealed ? '#000000' : '#ffffff',
        transition: 'all 0.3s ease',
        minHeight: revealed ? 'auto' : 80, // 👈 shorter before reveal
        '&:hover': {
          transform: 'translateY(-5px)',
        },
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>

        <Typography
          gutterBottom
          variant="h5"
          component="div"
          fontWeight={700}
          fontSize={20}
        >
          {title}
        </Typography>
    
        {!revealed && (
          <Typography
            sx={{
              fontSize: '0.9rem',
              opacity: 1,
              color: '#fff',
            }}
          >
            Lưu ý: Mỗi gợi ý sẽ mất 30 điểm
          </Typography>
        )}
        
        {revealed && (
          <Typography
            sx={{
              paddingTop: '20px',
              mt: 1,
              fontSize: '0.95rem',
              color: '#000',
            }}
          >
            {hint}
          </Typography>
        )}
        {!revealed && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            paddingTop: '30px',
          }}
        >
          <IconButton
            sx={{
              backgroundColor: '#ffffff',
              color: '#000000',
              borderRadius: '50%',
              width: 30,
              height: 30,
              '&:hover': {
                backgroundColor: '#f0f0f0',
              },
              transform: 'rotate(45deg)',
            }}
          >
            <ArrowForwardIcon sx={{ transform: 'rotate(-90deg)' }} />
          </IconButton>

          <Typography
            variant="button"
            fontWeight={400}
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
            }}
          >
            {buttonText}
          </Typography>
        </Box>
      )}

      </CardContent>
    </Card>
  );
}

export default CardHint;
