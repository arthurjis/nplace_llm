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
      <div style={{ width: '320px' }}>
        <form onSubmit={handleContinue}>
          <Typography variant="h5" component="h2" gutterBottom style={{ fontWeight: 'bold' }}>
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
              InputProps={{
                style: { height: "52px", borderRadius: 2 }
              }}
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
                        <IconButton onClick={() => setStep(1)} style={{ backgroundColor: 'transparent', position: 'relative', right: '-10px' }}>
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

          {step === 2 && (
            // TODO implement forgot password
            <Link component={RouterLink} to="/register" color="secondary" variant="body2" style={{ textTransform: 'none', backgroundColor: 'transparent', textDecoration: 'none' }}>
              Forgot password?
            </Link>
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            style={{ height: "52px", borderRadius: 2 }}
          >
            Continue
          </Button>

          <Typography variant="body2">
            Don't have an account?{' '}
            <Link component={RouterLink} to="/register" variant="body2" color="secondary" style={{ textTransform: 'none', backgroundColor: 'transparent', textDecoration: 'none' }}>
              Sign Up
            </Link>
          </Typography>
        </form>
      </div>
    </Grid>
  );
}

export default Login;
