import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

function CipherCard({ cipherContent, answer, onAnswerChange, message }) {
  return (
    <Card
      sx={{
        width: '82vw',
        height: '58vh',
        borderRadius: '20px',
        background: 'linear-gradient(135deg, #12142D 0%, #392FA9 100%)', // Card background gradient
        border: '1px solid #ffffff', // white border
        color: 'white', // make text white or adjust if needed
      }}
    >

      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '100%',
          paddingTop: 3.5,
          paddingBottom: 2,
        }}>

          <Typography variant="header1" 
                      sx={{ opacity: 0.9, flexShrink: 0, }} 
                      style={{padding: '14px'}}>
            Nội dung mật ngữ
          </Typography>
          <Box
          sx={{
            flex: 1,
            overflow: 'auto',
          }}>
          <Typography gutterBottom variant="body1" component="div" fontWeight={500} fontSize={15.5} style={{padding: '14px'}}>
            {cipherContent}
            
            </Typography>
          </Box>
          
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            flexShrink: 0,
            paddingTop: 3,
            alignContent: 'center',
            alignItems: 'center',
          }}> 
          <input
            placeholder="Nhập câu trả lời"
            value={answer}
            onChange={(e) => onAnswerChange(e.target.value)}
            style={{
            backgroundColor: 'rgb(255, 255, 255)',
            color: 'black',
            borderRadius: '20px',
            border: '0.5px solid #ffffff',
            height: '4.5vh',
            width: '70vw',
            padding: '0 15px',
          }}/>
          <Typography
              variant="body2"
              sx={{ color: 'red', marginTop: '5px', paddingLeft: '10px', fontSize: '8px' }}
            >
              {message}
          </Typography>
        </Box>

      </CardContent>
    </Card>
  );
}

export default CipherCard;