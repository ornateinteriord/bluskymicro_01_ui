import React, { useState } from 'react';
import { TextField, Button, Card, CardContent, InputAdornment, Box, Typography, IconButton } from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useUpdateMember } from '../../../api/Memeber';
import { toast } from 'react-toastify';
import { LoadingComponent } from '../../../App';

const ChangePassword: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const updateMember = useUpdateMember();

  const handleSubmit = () => {
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error("All fields are required!");
      return;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }
    updateMember.mutate({ oldPassword: formData.oldPassword, newPassword: formData.newPassword });
  };

  const inputStyles = {
    bgcolor: '#FFF8F0',
    borderRadius: '16px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#f0d0d8',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E5989B',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#6D214F',
      borderWidth: '2px',
    },
    '& .MuiInputBase-input': {
      color: '#2d0f1e',
      fontWeight: 600,
    },
    '& .MuiInputLabel-root': {
      color: '#8c6b7d',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#6D214F',
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      bgcolor: '#FFF8F0', 
      minHeight: '100vh',
      maxWidth: '480px',
      margin: '0 auto',
      pb: 10
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            bgcolor: '#ffffff', 
            border: '1.5px solid #f0d0d8',
            color: '#6D214F',
            p: 1,
            '&:hover': { bgcolor: '#fdf2f4' }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#6D214F', letterSpacing: '-0.5px' }}>
            Change Password
          </Typography>
          <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 600 }}>
            Update your account security password
          </Typography>
        </Box>
      </Box>

      <Card sx={{ 
        width: '100%', 
        bgcolor: '#ffffff', 
        border: '1.5px solid #f0d0d8', 
        boxShadow: "0 8px 24px rgba(109,33,79,0.06)", 
        borderRadius: '24px', 
      }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <form style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Box>
              <Typography variant="caption" sx={{ mb: 0.8, color: '#6D214F', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Current Password
              </Typography>
              <TextField
                name="oldPassword"
                type="password"
                value={formData.oldPassword}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter current password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon sx={{ color: '#8c6b7d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ mb: 0.8, color: '#6D214F', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase' }}>
                New Password
              </Typography>
              <TextField
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter new password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <KeyIcon sx={{ color: '#8c6b7d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>

            <Box>
              <Typography variant="caption" sx={{ mb: 0.8, color: '#6D214F', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase' }}>
                Confirm New Password
              </Typography>
              <TextField
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Re-enter new password"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#8c6b7d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={updateMember.isPending}
              sx={{
                background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: '#FFF8F0',
                py: 1.5,
                fontWeight: 900,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(109, 33, 79, 0.25)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  bgcolor: '#f0d0d8',
                  color: '#8c6b7d'
                },
                transition: 'all 0.2s'
              }}
            >
              Update Password
            </Button>
          </form>
        </CardContent>
        {updateMember.isPending && <LoadingComponent />}
      </Card>
    </Box>
  );
};

export default ChangePassword;
