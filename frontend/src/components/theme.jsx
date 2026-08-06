import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    typography: {
        fontFamily: `'Inter', 'Epilogue', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`,
        h1: {
            fontFamily: `'Inter', 'Epilogue', sans-serif`,
            fontWeight: 800,
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            letterSpacing: '-0.02em',
        },
        h2: {
            fontFamily: `'Inter', 'Epilogue', sans-serif`,
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
            letterSpacing: '-0.01em',
        },
        h3: {
            fontFamily: `'Inter', 'Epilogue', sans-serif`,
            fontWeight: 600,
            fontSize: '1.25rem',
        },
        h4: {
            fontFamily: `'Inter', 'Epilogue', sans-serif`,
            fontWeight: 600,
            fontSize: '1.1rem',
        },
        body1: {
            fontFamily: `'Inter', sans-serif`,
            fontWeight: 400,
            fontSize: '1rem',
            lineHeight: 1.6,
        },
        body2: {
            fontFamily: `'Inter', sans-serif`,
            fontWeight: 400,
            fontSize: '0.875rem',
            lineHeight: 1.5,
        },
        button: {
            fontFamily: `'Inter', 'Epilogue', sans-serif`,
            fontWeight: 600,
            textTransform: 'none',
        },
        subtitle1: {
            fontFamily: `'Pinyon Script', cursive`,
            fontSize: '2rem',
        },
        subtitle2: {
            fontFamily: `'Pinyon Script', cursive`,
            fontSize: '1.4rem',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    fontFamily: `'Inter', 'Epilogue', sans-serif`,
                    textTransform: 'none',
                    borderRadius: '12px',
                    padding: '12px 28px',
                    fontWeight: 600,
                    fontSize: '0.95rem',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                        transform: 'translateY(-3px) scale(1.02)',
                        boxShadow: '0 12px 28px rgba(255, 107, 53, 0.4)',
                    },
                    '&:active': {
                        transform: 'translateY(-1px) scale(0.98)',
                    },
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        width: 0,
                        height: 0,
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.3)',
                        transform: 'translate(-50%, -50%)',
                        transition: 'width 0.6s ease, height 0.6s ease',
                    },
                    '&:active::after': {
                        width: '300px',
                        height: '300px',
                    },
                },
                containedPrimary: {
                    background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
                    color: '#fff',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #ff8c5a 0%, #ffaa4d 100%)',
                        boxShadow: '0 0 30px rgba(255, 107, 53, 0.6)',
                    },
                },
                outlinedPrimary: {
                    borderColor: '#ff6b35',
                    color: '#ff6b35',
                    borderWidth: 2,
                    '&:hover': {
                        borderColor: '#f7931e',
                        backgroundColor: 'rgba(255, 107, 53, 0.12)',
                        boxShadow: '0 0 20px rgba(255, 107, 53, 0.3)',
                    },
                },
                textPrimary: {
                    color: '#ff6b35',
                    '&:hover': {
                        backgroundColor: 'rgba(255, 107, 53, 0.12)',
                    },
                },
            },
            variants: [
                {
                    props: { variant: 'hint' },
                    style: {
                        backgroundColor: 'rgba(255, 255, 255, 0.12)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255,255,255,0.2)',
                        width: '35vw',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.18)',
                            borderColor: 'rgba(255,255,255,0.3)',
                        },
                    },
                },
                {
                    props: { variant: 'answer' },
                    style: {
                        backgroundColor: 'rgba(247, 147, 30, 0.9)',
                        color: '#FFFFFF',
                        border: '1px solid rgba(255,255,255,0.15)',
                        width: '35vw',
                        backdropFilter: 'blur(10px)',
                        '&:hover': {
                            backgroundColor: 'rgba(247, 147, 30, 1)',
                        },
                    },
                },
                {
                    props: { variant: 'glass' },
                    style: {
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#fff',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.15)',
                            border: '1px solid rgba(255, 255, 255, 0.3)',
                        },
                    },
                },
            ],
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                variant: 'outlined',
            },
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        },
                        '&.Mui-focused': {
                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        },
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.2)',
                    },
                    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#ff6b35',
                        borderWidth: 2,
                    },
                },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: '20px',
                    backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.04) 100%)',
                    backdropFilter: 'blur(24px)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
                    },
                },
            },
        },
    },
    palette: {
        mode: 'dark',
        primary: {
            main: '#ff6b35',
            light: '#ff8c5a',
            dark: '#e55a2b',
            contrastText: '#fff',
        },
        secondary: {
            main: '#f7931e',
            light: '#ffaa4d',
            dark: '#d67f1a',
            contrastText: '#fff',
        },
        success: {
            main: '#00d9a5',
            light: '#4debc4',
            dark: '#00a67f',
        },
        error: {
            main: '#ff6b6b',
            light: '#ff9e9e',
            dark: '#d94545',
        },
        warning: {
            main: '#ffd93d',
            light: '#ffe670',
            dark: '#d4b025',
        },
        info: {
            main: '#4facfe',
            light: '#7fc4fe',
            dark: '#3a8ad4',
        },
        background: {
            default: '#1a0f0a',
            paper: '#2d1a12',
            gradient: `
            linear-gradient(
                135deg,
                #1a0f0a 0%,
                #3d1f0f 30%,
                #5c2d10 60%,
                #2d1a12 100%
            )
            `,
        },
        text: {
            primary: '#ffffff',
            secondary: '#b8b8d0',
        },
    },
    shadows: [
        'none',
        '0 2px 8px rgba(0,0,0,0.08)',
        '0 4px 16px rgba(0,0,0,0.12)',
        '0 8px 24px rgba(0,0,0,0.16)',
        '0 12px 32px rgba(0,0,0,0.2)',
        '0 16px 40px rgba(0,0,0,0.24)',
        '0 20px 48px rgba(0,0,0,0.28)',
        '0 24px 56px rgba(0,0,0,0.32)',
        '0 28px 64px rgba(0,0,0,0.36)',
        '0 32px 72px rgba(0,0,0,0.4)',
        '0 36px 80px rgba(0,0,0,0.44)',
        '0 40px 88px rgba(0,0,0,0.48)',
        '0 44px 96px rgba(0,0,0,0.52)',
        '0 48px 104px rgba(0,0,0,0.56)',
        '0 52px 112px rgba(0,0,0,0.6)',
        '0 56px 120px rgba(0,0,0,0.64)',
        '0 60px 128px rgba(0,0,0,0.68)',
        '0 64px 136px rgba(0,0,0,0.72)',
        '0 68px 144px rgba(0,0,0,0.76)',
        '0 72px 152px rgba(0,0,0,0.8)',
        '0 76px 160px rgba(0,0,0,0.84)',
        '0 80px 168px rgba(0,0,0,0.88)',
        '0 84px 176px rgba(0,0,0,0.92)',
        '0 88px 184px rgba(0,0,0,0.96)',
        '0 92px 192px rgba(0,0,0,1)',
    ],
});

export default theme;