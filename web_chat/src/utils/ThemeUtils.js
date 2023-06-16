import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      // main: '#6200EE',
      // main: '#B1B695',
      main: '#b9dcf2',
      light: '#EDEBE6',
      dark: '#C9C8C3',
      contrastText: '#596175',
    },
    secondary: {
      main: '#f6cfbe',
      light: '#B4F39A',
      dark: '#f2793d',
      contrastText: '#596175',
    },
    background: {
      light: '#E6E4DF',
      dark: '#000000',
      sidePanel: '#EFEDAF',
      chatPanel: '#FCFAF5',
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