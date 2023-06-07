import React, { useState } from 'react';
import { IconButton, TextField, Box } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SendIcon from '@mui/icons-material/Send';


function Input({ onSendMessage, handleMenuClick }) {
  const [message, setMessage] = useState('');
  const [inputActive, setInputActive] = useState(false);
  const handleSubmit = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      return;
    }
    if (e.key === 'Enter' || e.type === 'submit') {
      e.preventDefault();
      onSendMessage(message);
      setMessage('');
      setInputActive(false);
    }
  };
  const handleBlur = () => {
    setInputActive(false);
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        margin: '20px 40px 20px', // Finetune
        borderStyle: 'none',
        borderRadius: '30px', // Finetune
        backgroundColor: 'primary.light', // Finetune
      }}
    >
      <IconButton
        onClick={handleMenuClick}
        disableRipple
        sx={{
          color: 'primary.contrastText', // Finetune
          ml: '8px',   // Finetune
          alignSelf: 'flex-end',
          mb: '1px',
          transform: inputActive ? 'none' : 'none',
          // transform: inputActive ? 'translateX(-100%)' : 'none',
          // transition: 'transform 0.3s ease-out',
        }}
      >
        <MenuIcon />
      </IconButton>
      <TextField
        value={message}
        onClick={() => setInputActive(true)}
        onBlur={handleBlur}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleSubmit}
        multiline
        placeholder="Type your message......"   // To finetune
        variant="outlined"
        fullWidth
        minRows={1}
        maxRows={10}   // Finetune
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'transparent',
            padding: '0px',
            '& fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputBase-input': {
            fontWeight: '500',   // Finetune
            fontSize: '1em',
            color: 'text.primary',   // Finetune
            padding: '0px',
            '&::placeholder': {
              color: 'text.secondary',   // Finetune
            },
          },
          '& .MuiInputBase-inputMultiline': {
            lineHeight: 'normal',
            whiteSpace: 'pre-wrap',
            padding: '12px 12px',   // Finetune
          },
        }}
      />
      <IconButton type="submit"
        disableRipple
        sx={{
          color: 'primary.contrastText', // Finetune
          mr: '8px', // Finetune
          mb: '1px', // Finetune
          alignSelf: 'flex-end',
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}

export default Input;
