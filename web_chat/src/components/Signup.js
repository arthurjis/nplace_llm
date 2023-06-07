import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Grid, Link, InputAdornment, IconButton, Box, OutlinedInput } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
import { isValidEmail } from '../utils/EmailUtils';
import ErrorIcon from '@mui/icons-material/Error';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useTranslation } from 'react-i18next';


function Signup({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [accountExistError, setAccountExistError] = useState(null);
    const [passwordTouched, setPasswordTouched] = useState(false);
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
                setEmailError(t('signup.emailError'));
            } else {
                setEmailError(null);
                setStep(2);
            }
            setIsLoading(false);
        } else {
            if (password.length < 8) {
                setPasswordError(t('signup.passwordError'));
                return;
            }
            const SERVER_URL = process.env.REACT_APP_SERVER_URL;
            try {
                await axios.post(`${SERVER_URL}/register`, { email, password });
                const loginResponse = await axios.post(`${SERVER_URL}/login`, { email, password });
                onLogin(loginResponse.data.access_token);
                navigate('/chat');
            } catch (error) {
                if (error.response.data.msg === 'User already exists') {
                    setAccountExistError(t('signup.accountExistError'));
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
                            {t('signup.createYourAccount')}
                        </Typography>
                    </Box>
                    {step === 1 ? (
                        <>
                            <TextField
                                variant="outlined"
                                margin="none"
                                fullWidth
                                required
                                label={t('signup.emailAddress')}
                                autoFocus
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setAccountExistError(false);
                                }}
                                InputProps={{
                                    style: { height: "52px", borderRadius: 2 }
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
                                label={t('signup.emailAddress')}
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
                                                    setPasswordError(false);
                                                    setPasswordTouched(false);
                                                }}
                                                style={{ backgroundColor: 'transparent', position: 'relative', right: '-10px' }}>
                                                <EditIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    style: { height: "52px", borderRadius: 2 }
                                }}
                                error={!!accountExistError}
                                helperText={<HelperText error={!!accountExistError}>{accountExistError}</HelperText>}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                autoFocus
                                label={t('signup.password')}
                                value={password}
                                autoComplete="new-password"
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setPasswordTouched(true);
                                    if (e.target.value.length === 8) {
                                        setPasswordError(false);
                                    }
                                }}
                                type={showPassword ? 'text' : 'password'}
                                InputProps={{
                                    style: { height: "52px", borderRadius: 2 },
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
                                error={!!passwordError}
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
                            {passwordTouched && (
                                <Box pt={1.5}>
                                    <OutlinedInput
                                        notched
                                        readOnly
                                        fullWidth
                                        value={
                                            t('signup.passwordRules')
                                        }
                                        multiline
                                        style={{ fontSize: 14, lineHeight: 1.75, height: "78px", borderRadius: 2 }}
                                    />
                                </Box>
                            )}
                        </>
                    )}
                    <Box pt={3}>
                    <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={isLoading}
                            sx={{
                                height: '52px',
                                borderRadius: '2pt',
                                textTransform: 'none',
                                fontSize: '16px',
                                bgcolor: 'primary.main',
                            }}
                        >
                            {t('signup.continue')}
                        </Button>
                    </Box>
                    <Box pt={2}>
                        <Typography variant="body2">
                            {t('signup.alreadyHaveAccount')}{' '}
                            <Link component={RouterLink} to={`/${lang}/login`} variant="body2" color="primary.contrastText" style={{ textTransform: 'none', backgroundColor: 'transparent', textDecoration: 'none', fontWeight: 500  }}>
                                {t('signup.logIn')}
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </div>
        </Grid>
    );
}

export default Signup;
