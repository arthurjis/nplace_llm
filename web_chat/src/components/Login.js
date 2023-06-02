import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Grid, Link, InputAdornment, IconButton, Box } from '@material-ui/core';
import EditIcon from '@mui/icons-material/Edit';
import { Link as RouterLink } from 'react-router-dom';
import { isValidEmail } from '../utils/EmailUtils';
import ErrorIcon from '@mui/icons-material/Error';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';


function Login({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [emailError, setEmailError] = useState(null);
    const [loginError, setLoginError] = useState(null);
    const [showPassword, setShowPassword] = useState(false);


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
        if (step === 1) {
            if (!isValidEmail(email)) {
                setEmailError('Email is not valid.');
            } else {
                setEmailError(null);
                setStep(2);
            }
        } else {
            const SERVER_URL = process.env.REACT_APP_SERVER_URL;
            try {
                const response = await axios.post(`${SERVER_URL}/login`, { email, password });
                onLogin(response.data.access_token);
            } catch (error) {
                if (error.response.data.msg === 'Bad id or passcode') {
                    setLoginError('Wrong email or password.');
                } else {
                    console.error(error);
                }
            }
        }
    };

    return (
        <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
            <div style={{ width: '320px' }}>
                <form onSubmit={handleContinue}>
                    <Box pt={2} pb={2}>
                        <Typography variant="h5" component="h2" gutterBottom style={{ fontWeight: 'bold', fontSize: '32px' }}>
                            {step === 1 ? 'Welcome back' : 'Enter your password'}
                        </Typography>
                    </Box>
                    {step === 1 ? (
                        <>
                            <TextField
                                variant="outlined"
                                margin="none"
                                fullWidth
                                required
                                label="Email Address"
                                autoFocus
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                InputProps={{
                                    style: { height: "52px", borderRadius: 2 }
                                }}
                                error={!!emailError}
                                helperText={<HelperText error={!!emailError}>{emailError}</HelperText>}
                            />
                        </>
                    ) : (
                        <>
                            <TextField
                                variant="outlined"
                                margin="none"
                                fullWidth
                                label="Email Address"
                                value={email}
                                disabled
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton onClick={() => setStep(1)} style={{ backgroundColor: 'transparent', position: 'relative', right: '-10px' }}>
                                                <EditIcon />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    style: { height: "52px", borderRadius: 2 }
                                }}
                            />
                            <TextField
                                variant="outlined"
                                margin="normal"
                                required
                                fullWidth
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                error={!!loginError}
                                helperText={<HelperText error={!!loginError}>{loginError}</HelperText>}
                            />
                        </>
                    )}
                    {step === 2 && (
                        // TODO implement forgot password
                        <Box pt={0.6}>
                            <Link component={RouterLink} to="/register" color="secondary" variant="body2" style={{ textTransform: 'none', backgroundColor: 'transparent', textDecoration: 'none' }}>
                                Forgot password?
                            </Link>
                        </Box>
                    )}
                    <Box pt={3}>
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            color="primary"
                            style={{ height: "52px", borderRadius: 2, textTransform: 'none', fontSize: '16px' }}
                        >
                            Continue
                        </Button>
                    </Box>
                    <Box pt={2}>
                        <Typography variant="body2">
                            Don't have an account?{' '}
                            <Link component={RouterLink} to="/register" variant="body2" color="secondary" style={{ textTransform: 'none', backgroundColor: 'transparent', textDecoration: 'none' }}>
                                Sign Up
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </div>
        </Grid>
    );
}

export default Login;
