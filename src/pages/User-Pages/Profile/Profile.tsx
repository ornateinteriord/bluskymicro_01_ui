import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, TextField, Button, Avatar, Card, CardContent, IconButton, InputAdornment } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SaveIcon from '@mui/icons-material/Save';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import UserContext from "../../../context/user/userContext";
import { useUpdateMember } from '../../../api/Memeber';
import { LoadingComponent } from '../../../App';

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);

  const [formData, setFormData] = useState({
    Name: "",
    gender: "",
    email: "",
    country: "",
    dob: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        Name: user.Name ?? "",
        gender: user.gender ?? "Male",
        email: user.email ?? "",
        country: user.country ?? "India",
        dob: user.dob ?? "",
      });
    }
  }, [user]);

  const updateMember = useUpdateMember();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMember.mutate(formData);
  };

  const modernInputStyles = {
    bgcolor: '#F8FAFC',
    borderRadius: '14px',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0',
      borderWidth: '1.5px',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#94A3B8',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#2563EB',
      borderWidth: '2px',
      boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.1)',
    },
    '& .MuiInputBase-input': {
      color: '#0F172A',
      padding: '14px 16px',
      fontSize: '0.95rem',
      fontWeight: 600,
    },
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      minHeight: '100vh',
      bgcolor: '#F1F5F9',
      maxWidth: '520px',
      margin: '0 auto',
      pb: 10
    }}>
      {/* Animated Header Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ width: '100%' }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5, mb: 3 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ 
              bgcolor: '#FFFFFF', 
              border: '1.5px solid #E2E8F0',
              color: '#0F172A',
              p: 1,
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              '&:hover': { bgcolor: '#F8FAFC', transform: 'translateX(-2px)' },
              transition: 'all 0.15s ease'
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
              Account Profile
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
              Manage your personal identity & contact details
            </Typography>
          </Box>
        </Box>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05 }}
        style={{ width: '100%' }}
      >
        <Card sx={{ 
          width: '100%', 
          bgcolor: '#FFFFFF', 
          border: '1px solid #E2E8F0', 
          borderRadius: '24px', 
          color: '#0F172A',
          boxShadow: "0 12px 32px rgba(15, 23, 42, 0.06)",
          overflow: 'hidden'
        }}>
          <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
            <form onSubmit={handleSubmit}>
              
              {/* Top Identity Hero Card */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)',
                p: 2.5,
                borderRadius: '20px',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                mb: 3.5,
                boxShadow: '0 10px 25px rgba(37, 99, 235, 0.25)',
                gap: 2.5,
                position: 'relative',
                overflow: 'hidden'
              }}>
                <motion.div
                  initial={{ scale: 0.85 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Avatar sx={{ 
                    width: 68, 
                    height: 68, 
                    border: '3px solid #38BDF8', 
                    bgcolor: '#FFFFFF',
                    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                    color: '#1E3A8A',
                    fontSize: '1.8rem',
                    fontWeight: 900
                  }}>
                    {formData.Name ? formData.Name.charAt(0).toUpperCase() : <PersonIcon sx={{ fontSize: 40 }} />}
                  </Avatar>
                </motion.div>
                
                <Box sx={{ color: '#FFFFFF', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                    <CheckCircleIcon sx={{ fontSize: 15, color: '#38BDF8' }} />
                    <Typography variant="overline" sx={{ color: '#93C5FD', letterSpacing: '1px', fontWeight: 800, lineHeight: 1 }}>
                      VERIFIED MEMBER
                    </Typography>
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFFFFF', lineHeight: 1.2, mb: 0.6 }}>
                    {formData.Name || 'Member Profile'}
                  </Typography>
                  <Box sx={{ 
                    display: 'inline-flex', 
                    alignItems: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '8px',
                    px: 1.2,
                    py: 0.3,
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Typography variant="caption" sx={{ color: '#FCD34D', fontWeight: 800, letterSpacing: '1px' }}>
                      LOGIN ID: {user?.member_code || user?.Member_id || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Form Fields Section */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3.5 }}>
                
                {/* Field 1: Full Name */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Account Holder Full Name
                  </Typography>
                  <TextField
                    name="Name"
                    value={formData.Name}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Enter full name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeOutlinedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                {/* Field 2: Date of Birth */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Date of Birth (DOB)
                  </Typography>
                  <TextField
                    name="dob"
                    type="text"
                    value={formData.dob}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="DD/MM/YYYY"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CakeOutlinedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                {/* Field 3: Email Address */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Registered Email Address
                  </Typography>
                  <TextField
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="name@example.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailOutlinedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>

                {/* Field 4: Country */}
                <Box>
                  <Typography variant="caption" sx={{ mb: 0.8, color: '#334155', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Country / Region
                  </Typography>
                  <TextField
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="e.g. India"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PublicOutlinedIcon sx={{ color: '#64748B' }} />
                        </InputAdornment>
                      ),
                    }}
                    sx={modernInputStyles}
                  />
                </Box>
              </Box>

              {/* Save Button */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  fullWidth
                  disabled={updateMember.isPending}
                  startIcon={<SaveIcon />}
                  sx={{
                    background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                    color: '#FFFFFF',
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 900,
                    textTransform: 'none',
                    borderRadius: '14px',
                    boxShadow: '0 8px 20px rgba(37, 99, 235, 0.3)',
                    "&:hover": { 
                      background: 'linear-gradient(135deg, #1D4ED8 0%, #1E40AF 100%)',
                      boxShadow: '0 10px 24px rgba(37, 99, 235, 0.4)',
                    },
                    "&:disabled": { 
                      bgcolor: '#CBD5E1',
                      color: '#94A3B8'
                    },
                    transition: 'all 0.2s'
                  }}
                >
                  {updateMember.isPending ? 'Saving Profile...' : 'Save & Update Profile'}
                </Button>
              </motion.div>

            </form>
          </CardContent>
          {updateMember.isPending && <LoadingComponent />}
        </Card>
      </motion.div>
    </Box>
  );
};

export default Profile;
