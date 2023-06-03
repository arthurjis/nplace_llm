import React from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ChatSessionList from './ChatSessionList';

function SidePanel({ token, onChatSessionSelect, refreshChatSessionsSignal, onStartChat, userEmail }) {
  const [anchorEl, setAnchorEl] = React.useState(null);

  // This handles the click on the three-dot button.
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // This handles closing the dropdown menu.
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className="side-panel">
      <ChatSessionList
        token={token}
        onChatSessionSelect={onChatSessionSelect}
        refreshChatSessionsSignal={refreshChatSessionsSignal}
      />

      <Button variant="contained" onClick={onStartChat}>
        Start Chat
      </Button>

      <div>
        {userEmail}
        <Button
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleClick}
        >
          <MoreVertIcon />
        </Button>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem onClick={handleClose}>Logout</MenuItem>
          <MenuItem onClick={handleClose}>Billing</MenuItem>
          {/* Add more menu items as needed */}
        </Menu>
      </div>
    </div>
  );
}

export default SidePanel;
