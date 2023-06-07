import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // main: '#6200EE',
      // main: '#B1B695',
      main: '#b9dcf2',
      light: 'red',
      dark: '#0085d8',
      contrastText: '#596175',
    },
    secondary: {
      main: '#f6cfbe',
      light: '#f6cfbe',
      dark: '#f6cfbe',
      contrastText: '#f6cfbe',
    },
    background: '#f5f5f5',
    liked: {
      main: 'red',
    },
    text: {
      primary: '#000000',
      secondary: '#888888',
    },

  },
});

export default theme;