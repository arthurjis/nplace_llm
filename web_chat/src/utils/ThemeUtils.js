import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // main: '#6200EE',
      // main: '#B1B695',
      main: '#b9dcf2',
      light: '#e2f1f9',
      dark: '#0085d8',
      contrastText: '#596175',
    },
    secondary: {
      main: '#f6cfbe',
      light: '#f6cfbe',
      dark: '#f6cfbe',
      contrastText: '#f6cfbe',
    },
    background: '#f1f1f1',
    chatPanelBG: '#fcfaf5',
    liked: {
      main: 'red',
    },
    text: {
      primary: '#444444',
      secondary: '#888888',
    },

  },
});

export default theme;