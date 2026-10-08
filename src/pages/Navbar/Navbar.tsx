import { ChevronDown, LogOutIcon, Menu as MenuIcon, Settings, User, Headphones, Home, MessageCircle } from 'lucide-react';
import "./navbar.scss";
import { AppBar, Avatar, Box, Divider, Menu, MenuItem, Toolbar, Typography, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { IconButton } from '@mui/material';
import useAuth from "../../hooks/use-auth";
import TokenService from "../../api/token/tokenService";

import { useState } from 'react';
import { useGetMemberDetails } from '../../api/Memeber';


interface NavbarProps {
  shouldHide?: boolean;
  onToggleSidebar?: () => void;
}

const Navbar = ({ shouldHide, onToggleSidebar }: NavbarProps) => {
  const navigate = useNavigate();
  const { isLoggedIn, userRole } = useAuth();
  const isAdmin = userRole === "ADMIN" || userRole === "ADMIN_01" || userRole === "AGENT";
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);

  // Always call hooks before any early return (Rules of Hooks)
  const userId = TokenService.getMemberId();
  const { data: memberDetails } = useGetMemberDetails(userId);

  // If we should hide the navbar (on public/auth pages), return null
  if (shouldHide) return null;

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setLogoutDialogOpen(true);
    setAnchorEl(null);
  };

  const confirmLogout = () => {
    setLogoutDialogOpen(false);
    navigate("/");
    TokenService.removeToken();
    window.dispatchEvent(new Event("storage"));
  };

  const cancelLogout = () => {
    setLogoutDialogOpen(false);
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          background: "#FFFFFF", // Light theme background
          borderBottom: '1px solid #E2E8F0',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          zIndex: (theme) => theme.zIndex.drawer + 1
        }}
      >
        <Toolbar sx={{ 
          height: { xs: 56, md: 64 }, 
          px: { xs: 2, md: 3 }, 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {isLoggedIn && userRole === "USER" ? (
            // USER mobile-app style layout
            <>
              <Box 
                onClick={handleMenuOpen} 
                sx={{ 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  padding: '4px 8px',
                  borderRadius: '12px',
                  transition: 'background 0.2s',
                  '&:hover': {
                    bgcolor: '#F1F5F9'
                  }
                }}
              >
                <Avatar
                  sx={{
                    width: { xs: 36, md: 40 },
                    height: { xs: 36, md: 40 },
                    bgcolor: '#0284C7', // Light Blue profile background
                    color: '#ffffff',
                    fontWeight: 900,
                    fontSize: { xs: '0.95rem', md: '1.1rem' },
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  {memberDetails?.Name?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                {/* <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="body2" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.2, fontSize: { xs: '0.85rem', md: '0.95rem' } }}>
                    {memberDetails?.Name || "Member"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: { xs: '0.65rem', md: '0.75rem' } }}>
                    ID: {memberDetails?.Member_id || ""}
                  </Typography>
                </Box> */}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  onClick={() => navigate('/user/support-chat')}
                  sx={{ color: "#1E293B", '&:hover': { bgcolor: '#F1F5F9' } }}
                >
                  <Headphones size={22} />
                </IconButton>
                <IconButton
                  onClick={() => navigate('/user/dashboard')}
                  sx={{ color: "#1E293B", '&:hover': { bgcolor: '#F1F5F9' } }}
                >
                  <Home size={22} />
                </IconButton>
                <IconButton
                  onClick={handleLogout}
                  sx={{ color: "#ef4444", '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                >
                  <LogOutIcon size={22} />
                </IconButton>
              </Box>
            </>
          ) : (
            // Default Admin/Agent/Admin01/Public layout
            <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isAdmin && onToggleSidebar && (
                  <IconButton
                    onClick={onToggleSidebar}
                    sx={{ color: "#1E293B", mr: 1, display: { xs: 'flex', md: 'flex' } }}
                  >
                    <MenuIcon size={24} />
                  </IconButton>
                )}
                <Typography
                  variant="h4"
                  onClick={() => navigate("/")}
                  sx={{
                    fontWeight: 950,
                    fontSize: { xs: '1.4rem', md: '1.85rem' },
                    cursor: "pointer",
                    letterSpacing: '1.5px',
                    color: '#0284C7',
                    textShadow: '0 2px 4px rgba(2, 132, 199, 0.1)'
                  }}
                >
                  Ecash
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                {isLoggedIn && (
                  <Box 
                    onClick={handleMenuOpen} 
                    sx={{ 
                      cursor: 'pointer', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      padding: '4px 8px',
                      borderRadius: '12px',
                      transition: 'background 0.2s',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.1)'
                      }
                    }}
                  >
                    <Avatar
                      sx={{
                        width: { xs: 32, md: 38 },
                        height: { xs: 32, md: 38 },
                        bgcolor: '#FFC000', 
                        color: '#0a2558',
                        fontWeight: 900,
                        fontSize: { xs: '0.85rem', md: '1rem' },
                        border: '2px solid rgba(255,255,255,0.4)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}
                    >
                      {memberDetails?.Name?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    {/* <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left' }}>
                      <Typography variant="body2" sx={{ color: 'white', fontWeight: 800, lineHeight: 1.1 }}>
                        {memberDetails?.Name || "Member"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', fontWeight: 600, fontSize: '0.65rem' }}>
                        {memberDetails?.Member_id || ""}
                      </Typography>
                    </Box> */}
                    <ChevronDown size={18} color="white" style={{ opacity: 0.8 }} />
                  </Box>
                )}
                {isLoggedIn && (
                  <IconButton
                    onClick={handleLogout}
                    sx={{ color: "#ef4444", ml: 1, '&:hover': { bgcolor: 'rgba(239, 68, 68, 0.1)' } }}
                  >
                    <LogOutIcon size={22} />
                  </IconButton>
                )}
              </Box>
            </>
          )}
        </Toolbar>

        {/* Dropdown Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 0,
            sx: {
              bgcolor: 'rgba(232, 218, 119, 1)', // Light blue (AliceBlue) with transparency
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: '16px',
              mt: 1.5,
              p: 0.5,
              minWidth: '240px',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.05)',
              '& .MuiMenuItem-root': {
                py: 1.2,
                px: 2,
                mx: 1,
                my: 0.2,
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.95rem',
                color: '#334155',
                '&:hover': {
                  bgcolor: '#e2e8f0',
                  color: '#0f172a',
                },
              },
              '& .MuiDivider-root': {
                borderColor: '#e2e8f0',
                my: 1,
                mx: 1,
              }
            },
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "16px 0 12px 0",
            }}
          >
            <Avatar
              variant="rounded"
              alt="User"
              sx={{
                width: 60,
                height: 60,
                marginBottom: "12px",
                background: 'linear-gradient(135deg, #0a2558 0%, #2c8786 100%)',
                border: '2px solid rgba(255,255,255,0.8)',
                borderRadius: '14px',
                color: '#ffffff',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}
            >
              {memberDetails?.Name
                ? memberDetails.Name.charAt(0).toUpperCase()
                : ""}
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0a2558', fontSize: '1.1rem' }}>
              {memberDetails?.Name || "Member"}
            </Typography>
            <Typography variant="caption" sx={{ color: '#7c93b3', fontWeight: 600 }}>
               ID: {memberDetails?.Member_id || ""}
            </Typography>
          </div>

          <Divider />

          <MenuItem onClick={() => {
            if (userRole === "USER") navigate("/user/account/profile");
            else if (userRole === "AGENT") navigate("/agent/profile");
            setAnchorEl(null);
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(2, 132, 199, 0.1)', color: '#0284C7', mr: 1.5 }}>
              <User size={18} />
            </Box>
            My Profile
          </MenuItem>

          <MenuItem onClick={() => {
             navigate("/chat");
             setAnchorEl(null);
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(16, 185, 129, 0.1)', color: '#10B981', mr: 1.5 }}>
              <MessageCircle size={18} />
            </Box>
            Chat
          </MenuItem>

          <MenuItem
            onClick={() => {
              if (userRole === "USER") navigate("/user/account/change-password");
              else navigate("/admin/update-password");
              setAnchorEl(null);
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(245, 158, 11, 0.1)', color: '#F59E0B', mr: 1.5 }}>
              <Settings size={18} />
            </Box>
            Change Password
          </MenuItem>
        </Menu>

        <Dialog
          open={logoutDialogOpen}
          onClose={cancelLogout}
          PaperProps={{
            sx: {
              borderRadius: '12px',
              padding: '8px'
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: '#0f172a' }}>Confirm Logout</DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ color: '#475569', fontWeight: 500 }}>
              Are you sure you want to log out of your account?
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ padding: '0 24px 16px 24px' }}>
            <Button onClick={cancelLogout} sx={{ color: '#64748b', fontWeight: 600 }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmLogout} 
              variant="contained" 
              color="error" 
              sx={{ borderRadius: '8px', fontWeight: 600, textTransform: 'none', boxShadow: 'none' }}
              disableElevation
            >
              Log Out
            </Button>
          </DialogActions>
        </Dialog>
      </AppBar >
    </>
  );
};

export default Navbar;
