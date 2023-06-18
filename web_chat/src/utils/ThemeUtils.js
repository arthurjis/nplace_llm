import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#D2CCC2',
      light: '#EDEBE6',
      dark: '#C9C8C3',
      contrastText: '#596175',
    },
    secondary: {
      main: '#82d862',
      light: '#B4F39A',
      dark: '#f2793d',
      contrastText: '#596175',
    },
    background: {
      light: '#F3F5EE',
      dark: '#000000',
      sidePanel: '#D2CCC2',
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