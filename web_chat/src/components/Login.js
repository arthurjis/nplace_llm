import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Grid, Link, InputAdornment, IconButton, Box } from '@mui/material';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { isValidEmail } from '../utils/EmailUtils';
import EditIcon from '@mui/icons-material/Edit';
import ErrorIcon from '@mui/icons-material/Error';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';


function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [emailError, setEmailError] = useState(null);
    const [loginError, setLoginError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const { lang } = useParams();
    const validLanguages = ['en', 'zh'];
    const language = validLanguages.includes(lang) ? lang : 'en';  // Fallback to 'en' if invalid
    const { t, i18n } = useTranslation();
    const HelperText = ({ error, children }) => (
        <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', color: error ? 'red' : 'inherit', marginLeft: '-12px' }}>
            {error && <ErrorIcon color="error" style={{ fontSize: '16px', marginRight: '8px' }} />}
            {children}
        </span>
    );
    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };
    const handleContinue = async (event) => {
        event.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        if (step === 1) {
            if (!isValidEmail(email)) {
                setEmailError(t('login.emailError'));
            } else {
                setEmailError(null);
                setStep(2);
            }
            setIsLoading(false);
        } else {
            const SERVER_URL = process.env.REACT_APP_SERVER_URL;
            try {
                const response = await axios.post(`${SERVER_URL}/login`, { email, password });
                onLogin(response.data.access_token);
                navigate('/chat');
            } catch (error) {
                if (error.response.data.msg === 'Bad username or passcode') {
                    setLoginError(t('login.loginError'));
                } else if (error.response.status === 429) {
                    setLoginError(t('login.tooManyAttemptsError'));
                } else {
                    console.error(error);
                }
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Change language based on the URL parameter
    useEffect(() => {
        i18n.changeLanguage(language);
    }, [language, i18n]);

    return (
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '90vh' }}>
            <div style={{ width: '320px' }}>
                <form onSubmit={handleContinue}>
                    <Box pt={2} pb={2}>
                        <Typography variant="h5" component="h2" gutterBottom style={{ fontWeight: 'bold', fontSize: '32px' }}>
                            {step === 1 ? t('login.welcomeBack') : t('login.enterYourPassword')}
                        </Typography>
                    </Box>
                    {step === 1 ? (
                        <>
                            <TextField
                                variant="outlined"
                                margin="none"
                                fullWidth
                                required
                                label={t('login.emailAddress')}
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    style: { height: "52px", borderRadius: '15px' }
                                }}
                                error={!!emailError}
                                helperText={<HelperText error={!!emailError}>{emailError}</HelperText>}
                                sx={{
                                    '.MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.dark',
                                        },
                                    },
                                    '.MuiInputLabel-root': {
                                        color: 'primary.contrastText',
                                    },
                                    '.MuiInputLabel-root.Mui-focused': {
                                        color: 'primary.contrastText',
                                    },
                                }}
                            />
                        </>
                    ) : (
                        <>
                            <TextField
                                variant="outlined"
                                margin="none"
                                fullWidth
                                label={t('login.emailAddress')}
                                value={email}
                                disabled
                                autoComplete="username"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => {
                                                    setStep(1);
                                                    setPassword("");
                                                    setEmailError(false);
                                                    setLoginError(false);
                                                }}
                                                style={{ backgroundColor: 'transparent', position: 'relative', right: '-10px' }}>
                                                <EditIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    style: { height: "52px", borderRadius: '15px' }
                                }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label={t('login.password')}
                                value={password}
                                autoFocus
                                autoComplete="current-password"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    if (e.target.value === '') {
                                        setLoginError(false);
                                    }
                                }}
                                type={showPassword ? 'text' : 'password'}
                                InputProps={{
                                    style: { height: "52px", borderRadius: '15px' },
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={handleClickShowPassword}
                                                style={{ backgroundColor: 'transparent', position: 'relative', right: '-10px' }}
                                                disableRipple
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    )

                                }}
                                error={!!loginError}
                                helperText={<HelperText error={!!loginError}>{loginError}</HelperText>}
                                sx={{
                                    '.MuiOutlinedInput-root': {
                                        '& fieldset': {
                                            borderColor: 'primary.main',
                                        },
                                        '&.Mui-focused fieldset': {
                                            borderColor: 'primary.dark',
                                        },
                                    },
                                    '.MuiInputLabel-root': {
                                        color: 'primary.contrastText',
                                    },
                                    '.MuiInputLabel-root.Mui-focused': {
                                        color: 'primary.contrastText',
                                    },
                                }}
                            />
                        </>
                    )}
                    {step === 2 && (
                        // TODO implement forgot password
                        <Box pt={0.6}>
                            <Link component={RouterLink} to={`/${lang}/register`} color="primary.contrastText" variant="body2" style={{ textTransform: 'none', backgroundColor: 'transparent', textDecoration: 'none', fontWeight: 500 }}>
                                {t('login.forgotPassword')}
                            </Link>
                        </Box>
                    )}
                    <Box pt={3}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                                height: '52px',
                                borderRadius: '30px',
                                textTransform: 'none',
                                fontSize: '16px',
                                bgcolor: 'primary.main',
                            }}
                        >
                            {t('login.continue')}
                        </Button>
                    </Box>
                    <Box pt={2}>
                        <Typography variant="body2">
                            {t('login.dontHaveAccount')}{' '}
                            <Link component={RouterLink} to={`/${lang}/register`} variant="body2" color="primary.contrastText" style={{ textTransform: 'none', backgroundColor: 'transparent', textDecoration: 'none', fontWeight: 500  }}>
                                {t('login.signUp')}
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </div>
        </Grid>
    );
}

export default Login;
