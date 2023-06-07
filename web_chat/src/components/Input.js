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
        margin: '0.5em 1.5em 0.5em',   // To finetune
        borderStyle: 'none',
        borderRadius: '24pt',   // To finetune
        backgroundColor: '#F4E8D9',   // To finetune
      }}
    >
      <IconButton
        onClick={handleMenuClick}
        disableRipple
        sx={{
          color: 'black',   // To finetune
          ml: '8px',   // To finetune
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
        maxRows={10}   // To finetune
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'transparent',
            padding: '0px',
            '& fieldset': {
              border: 'none',
            },
          },
          '& .MuiInputBase-input': {
            fontWeight: '500',   // To finetune
            fontSize: '1em',
            color: 'black',   // To finetune
            padding: '0px',
            '&::placeholder': {
              color: 'gray',   // To finetune
            },
          },
          '& .MuiInputBase-inputMultiline': {
            lineHeight: 'normal',
            whiteSpace: 'pre-wrap',
            padding: '12px 12px',   // To finetune
          },
        }}
      />
      <IconButton type="submit"
        disableRipple
        sx={{
          color: 'black',   // To finetune
          mr: '8px',   // To finetune
          mb: '1px',
          alignSelf: 'flex-end',
        }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}

export default Input;
