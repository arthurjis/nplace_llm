import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Grid, Link, InputAdornment, IconButton, Box } from '@material-ui/core';
import EditIcon from '@mui/icons-material/Edit';
import { Link as RouterLink } from 'react-router-dom';
import { isValidEmail } from '../utils/EmailUtils';
import ErrorIcon from '@mui/icons-material/Error';

function Signup({ onLogin }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1);
    const [emailError, setEmailError] = useState(null);
    const [passwordError, setPasswordError] = useState(null);
    const [accountExistError, setAccountExistError] = useState(null);

    const HelperText = ({ error, children }) => (
        <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', color: error ? 'red' : 'inherit', marginLeft: '-12px' }}>
          {error && <ErrorIcon color="error" style={{ fontSize: '16px', marginRight: '8px' }}/> }
          {children}
        </span>
      );

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
            if (password.length < 8) {
                setPasswordError('Password must be at least 8 characters long.');
                return;
            }
            const SERVER_URL = process.env.REACT_APP_SERVER_URL;
            try {
                await axios.post(`${SERVER_URL}/register`, { email, password });
                const loginResponse = await axios.post(`${SERVER_URL}/login`, { email, password });
                onLogin(loginResponse.data.access_token);

            } catch (error) {
                if (error.response.data.msg === 'User already exists') {
                    setAccountExistError('The user already exists.');
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
                            Create your account
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
                                error={!!accountExistError}
                                helperText={<HelperText error={!!accountExistError}>{accountExistError}</HelperText>}
                            />
                            <TextField
                                variant="outlined"
                                margin="none"
                                required
                                fullWidth
                                label="Password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                InputProps={{
                                    style: { height: "52px", borderRadius: 2 }
                                }}
                                error={!!passwordError}
                                helperText={<HelperText error={!!passwordError}>{passwordError}</HelperText>}
                            />
                        </>
                    )}
                    <Box pt={4}>
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
                            Already have an account?{' '}
                            <Link component={RouterLink} to="/login" variant="body2" color="secondary" style={{ textTransform: 'none', backgroundColor: 'transparent', textDecoration: 'none' }}>
                                Log In
                            </Link>
                        </Typography>
                    </Box>
                </form>
            </div>
        </Grid>
    );
}

export default Signup;

