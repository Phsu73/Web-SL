import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function ProjectCard({ title, subtitle, buttonText, onClick, /* imageUrl */ }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: 280,
        borderRadius: '20px',
        background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.15) 0%, rgba(247, 147, 30, 0.08) 100%)',
        border: '1px solid rgba(255, 200, 100, 0.2)',
        color: 'white',
        cursor: 'pointer',
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        '&:hover': {
          transform: 'translateY(-8px) scale(1.02)',
          boxShadow: '0 16px 48px rgba(255, 107, 53, 0.3)',
          border: '1px solid rgba(255, 200, 100, 0.4)',
          background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(247, 147, 30, 0.15) 100%)',
        },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '-100%',
          width: '100%',
          height: '100%',
          background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent)',
          transform: 'skewX(-25deg)',
          transition: 'left 0.6s ease',
        },
        '&:hover::before': {
          left: '100%',
        },
      }}
    >
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Typography variant="body2" sx={{ opacity: 0.9 }} fontSize={14}>
          {subtitle}
        </Typography>

        <Typography gutterBottom variant="h5" component="div" fontWeight={700} fontSize={20}>
          {title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: '12px', paddingTop: '30px' }}>
          <IconButton
            sx={{
              backgroundColor: 'rgba(255, 200, 100, 0.9)',
              color: '#1a0f0a',
              borderRadius: '50%',
              width: 36,
              height: 36,
              transition: 'all 0.3s ease',
              transform: 'rotate(45deg)',
              pointerEvents: 'none',
              boxShadow: '0 4px 12px rgba(255, 150, 50, 0.3)',
            }}
          >
            <ArrowForwardIcon sx={{ transform: 'rotate(-90deg)', fontSize: '20px' }} />
          </IconButton>

          <Typography
            variant="button"
            fontWeight={600}
            sx={{
              textTransform: 'none',
              fontSize: '0.95rem',
              letterSpacing: '0.5px',
            }}
          >
            {buttonText}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}

export default ProjectCard;
