import { Box, Typography, IconButton } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { useState } from 'react';



function Message({ message, isLocal, likedByRemote }) {
  // const profilePhotoUrl = isLocal ? '/logo192.png' : '/logo192.png';
  const [liked, setLiked] = useState(false);
  const handleLike = () => {
    setLiked(!liked);
  }

  return (
    <Box sx={{
      display: 'flex',
      margin: '1em 0',    // Finetune: Modify "m" for vertical padding between message bubbles
      flexDirection: 'row',
      alignSelf: isLocal ? 'flex-end' : 'flex-start',
    }}>
      {isLocal && likedByRemote && (
        <IconButton disabled sx={{
          alignSelf: 'flex-end',
          '&.Mui-disabled': {
            color: 'liked.main',
          },
          marginLeft: '10pt',
        }}>
          <FavoriteIcon />
        </IconButton>
      )}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'flex-start',
          backgroundColor: isLocal ? 'primary.light' : 'secondary.light',  // Finetune: bg color
          color: isLocal ? 'text.primary' : 'text.primary', // Finetune: font color
          padding: isLocal ? '1em 2em 1em 2em': '2em 2em 1em 2em',    // Finetune: Modify "p" for padding around message text 
          borderRadius: '15px',  // Finetune
          maxWidth: '280pt', // Finetune: Change this for bubble max-width
          wordBreak: 'break-word',
          alignSelf: isLocal ? 'flex-end' : 'flex-start',
          borderBottomLeftRadius: isLocal ? '15px' : 0,
          borderBottomRightRadius: isLocal ? 0 : '15px',
        }}
      >
        {/* {!isLocal && (
          <Box component="img" src={profilePhotoUrl} alt={message.username}
            sx={{
              width: 40,  // Finetune Change this for profile pic size
              height: 40, //Finetune  Change this for profile pic size
              borderRadius: '50%',
              mr: 1,
              objectFit: 'cover',
              alignSelf: 'flex-end',
              // border: 1,
              // borderStyle: 'solid'
            }}
          />
        )} */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            alignItems: isLocal ? 'flex-end' : 'flex-start',
          }}
        >
          {!isLocal && (
            <Typography variant="body1" component="span"
              sx={{
                fontWeight: '500',  // Finetune
                fontSize: '0.75em',  // Finetune
                mb: '0.75em',   // Finetune
                alignSelf: 'flex-start',
                color: 'primary.contrastText',
              }}
            >
              {/* {message.username} */}
              {'Chatbot'}
            </Typography>
          )}
          <Typography
            variant="body2"
            component="p"
            align="left"
            sx={{
              m: 0,  // Finetune
              fontWeight: 500,  // Finetune
              fontSize: '1em'  // Finetune
            }}>
            {message.text}
          </Typography>
        </Box>
      </Box>

      {!isLocal && (
        <IconButton
          onClick={handleLike}
          sx={{
            alignSelf: 'flex-end',
            marginRight: '10pt',
          }}>
          {
            liked
              ? <FavoriteIcon sx={{ color: 'liked.main' }} />  // Finetune
              : <FavoriteBorderIcon />
          }
        </IconButton>
      )}
    </Box>
  );
}

export default Message;
