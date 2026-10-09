import React from 'react';
import { BottomNavigation, BottomNavigationAction, Paper, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
// import ChatIcon from '@mui/icons-material/Chat';
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
          borderTop: '1px solid #E2E8F0',
          boxShadow: '0 -4px 16px rgba(0, 186, 242, 0.08)'
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
              color: '#94A3B8',
              minWidth: 0,
              padding: '6px 0',
            },
            '& .Mui-selected': {
              color: '#0082CD !important',
              '& .MuiBottomNavigationAction-label': {
                fontWeight: 800,
                fontSize: '0.75rem',
                mt: 0.5,
                color: '#0082CD',
              },
              '& .MuiBottomNavigationAction-iconOnly': {
                paddingTop: '16px',
              },
              '& .indicator': {
                background: 'linear-gradient(135deg, #00BAF2 0%, #0082CD 100%)',
                color: '#FFFFFF',
                borderRadius: '12px',
                padding: '4px',
                width: '42px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 0.5,
                boxShadow: '0 2px 8px rgba(0, 186, 242, 0.35)',
              }
            }
          }}
        >
          <BottomNavigationAction
            value="/user/dashboard"
            label="Home"
            icon={<Box className={value === "/user/dashboard" ? "indicator" : ""}>{<HomeIcon />}</Box>}
          />
          {/* <BottomNavigationAction
            value="/user/chat"
            label="Chat"
            icon={<Box className={value === "/user/chat" ? "indicator" : ""}>{<ChatIcon />}</Box>}
          /> */}
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
