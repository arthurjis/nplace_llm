import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EE',
    },
    secondary: {
      main: '#6200EE',
    },
    background: '#f5f5f5'
  },
  sizes: {
    sidePanelWidth: '300px',
    chatPanelWidth: '650px'
  },
});

export default theme;