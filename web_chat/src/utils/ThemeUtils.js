import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // main: '#6200EE',
      // main: '#B1B695',
      main: '#b9dcf2',
      light: '#bae6f8',
      dark: '#0085d8',
      contrastText: '#596175',
    },
    secondary: {
      main: '#f6cfbe',
      light: '#f8cebc',
      dark: '#f2793d',
      contrastText: '#596175',
    },
    background: {
      light: '#e1e1e1',
      dark: '#000000',
      sidePanel: '#f6ebbe',
      chatPanel: '#fcfaf5',
    },
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