import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import ChatIcon from '@mui/icons-material/Chat';
import { useNavigate, useLocation } from 'react-router-dom';

import { useGetMemberDetails } from '../../api/Memeber';
import TokenService from '../../api/token/tokenService';

const MobileBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [value, setValue] = React.useState('');

  const memberId = TokenService.getMemberId();
  useGetMemberDetails(memberId);


  // Sync state with current path
  React.useEffect(() => {
    if (location.pathname.includes('/user/dashboard')) setValue('/user/dashboard');
    else if (location.pathname.includes('/user/wallet')) setValue('/user/wallet');
    else if (location.pathname.includes('/user/chat')) setValue('/user/chat');
    else if (location.pathname.includes('/user/account/profile')) setValue('/user/account/profile');
  }, [location.pathname]);

  if (location.pathname.includes('/user/chat')) return null;

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Paper
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          borderTop: '1px solid #fce8ec',
          boxShadow: '0 -4px 16px rgba(109, 33, 79, 0.08)'
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={value}
          onChange={(_event, newValue) => {
            setValue(newValue);
            navigate(newValue);
          }}
          sx={{
            height: 70,
            backgroundColor: '#ffffff',
            '& .MuiBottomNavigationAction-root': {
              color: '#b08090',
              minWidth: 0,
              padding: '6px 0',
            },
            '& .Mui-selected': {
              color: '#6D214F !important',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 800,
                fontSize: '0.75rem',
                mt: 0.5
              },
              '& .MuiBottomNavigationAction-iconOnly': {
                paddingTop: '16px',
              },
              '& .indicator': {
                backgroundColor: '#6D214F',
                color: 'white',
                borderRadius: '12px',
                padding: '4px',
                width: '40px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5
              }
            }
          }}
        >
          <BottomNavigationAction
            value="/user/dashboard"
            label="Home"
            icon={<Box className={value === "/user/dashboard" ? "indicator" : ""}>{<HomeIcon />}</Box>}
          />
          <BottomNavigationAction
            value="/user/chat"
            label="Chat"
            icon={<Box className={value === "/user/chat" ? "indicator" : ""}>{<ChatIcon />}</Box>}
          />
          <BottomNavigationAction
            value="/user/account/profile"
            label="Profile"
            icon={<Box className={value === "/user/account/profile" ? "indicator" : ""}>{<PersonIcon />}</Box>}
          />
        </BottomNavigation>
      </Paper>
      {/* Spacer to prevent content from being hidden behind nav — Skip on Chat page */}
      {!location.pathname.includes('/user/chat') && <Box sx={{ height: 64 }} />}
    </Box>
  );
};

export default MobileBottomNav;
