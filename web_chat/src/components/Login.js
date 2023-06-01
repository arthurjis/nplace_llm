import React, { useState } from 'react';
import axios from 'axios';
import { Button, TextField, Typography, Grid, Link, InputAdornment, IconButton } from '@material-ui/core';
import EditIcon from '@mui/icons-material/Edit';
import { Link as RouterLink } from 'react-router-dom';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);

  const handleContinue = async (event) => {
    event.preventDefault();
    if (step === 1) {
      setStep(2);
    } else {
      const SERVER_URL = process.env.REACT_APP_SERVER_URL;
      try {
        const response = await axios.post(`${SERVER_URL}/login`, { email, password });
        onLogin(response.data.access_token);
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Grid container justifyContent="center" alignItems="center" style={{ minHeight: '100vh' }}>
      <Grid item xs={12} sm={4} md={3}> 
        <form onSubmit={handleContinue}>
          <Typography variant="h5" component="h2" gutterBottom>
            {step === 1 ? 'Welcome back' : 'Enter your password'}
          </Typography>
          {step === 1 ? (
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Email Address"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          ) : (
            <>
              <TextField
                variant="outlined"
                margin="normal"
                fullWidth
                label="Email Address"
                value={email}
                disabled
                InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setStep(1)}>
                          <EditIcon />
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            Continue
          </Button>
          {step === 2 && (
            <Link component={Button} color="secondary">
              Forgot password?
            </Link>
          )}
          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" variant="body2" color="secondary">
              Sign Up
            </Link>
          </Typography>
        </form>
      </Grid>
    </Grid>
  );
}

export default Login;
