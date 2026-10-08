import React, { useState, useEffect, useContext } from "react";
import { Box, Typography, TextField, Button, Avatar, Card, CardContent, IconButton } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
      padding: '14px 18px',
      fontSize: '1rem',
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
      bgcolor: '#FFF8F0',
      maxWidth: '480px',
      margin: '0 auto',
      pb: 10
    }}>
      {/* Header Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 1.5, mb: 3 }}>
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
            My Profile
          </Typography>
          <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 600 }}>
            Personal account details & information
          </Typography>
        </Box>
      </Box>
      
      <Card sx={{ 
        width: '100%', 
        bgcolor: '#FFFFFF', 
        border: '1.5px solid #f0d0d8', 
        borderRadius: '24px', 
        color: '#2d0f1e',
        boxShadow: "0 8px 24px rgba(109,33,79,0.06)"
      }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <form onSubmit={handleSubmit}>
            
            {/* Top Banner - Photo, Name, ID */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 60%, #8f2f68 100%)',
              p: 2.5,
              borderRadius: '20px',
              border: '1px solid rgba(244, 201, 93, 0.25)',
              mb: 3.5,
              boxShadow: '0 8px 20px rgba(109, 33, 79, 0.2)',
              gap: 2.5
            }}>
              <Avatar sx={{ 
                width: 68, 
                height: 68, 
                border: '3px solid #F4C95D', 
                bgcolor: '#FFF8F0',
                boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
                color: '#6D214F',
                fontSize: '1.8rem',
                fontWeight: 900
              }}>
                {formData.Name ? formData.Name.charAt(0).toUpperCase() : <PersonIcon sx={{ fontSize: 40 }} />}
              </Avatar>
              
              <Box sx={{ color: '#FFF8F0' }}>
                <Typography variant="overline" sx={{ color: '#E5989B', letterSpacing: '1.5px', display: 'block', lineHeight: 1.1, fontWeight: 700 }}>
                  VERIFIED MEMBER
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: '#FFF8F0', lineHeight: 1.2, mb: 0.5 }}>
                  {formData.Name || 'Member'}
                </Typography>
                <Box sx={{ 
                  display: 'inline-flex', 
                  alignItems: 'center',
                  bgcolor: 'rgba(244, 201, 93, 0.2)',
                  border: '1px solid rgba(244, 201, 93, 0.4)',
                  borderRadius: '8px',
                  px: 1.2,
                  py: 0.25,
                }}>
                  <Typography variant="caption" sx={{ color: '#F4C95D', fontWeight: 800, letterSpacing: '1px' }}>
                    ID: {user?.member_code || user?.Member_id || 'N/A'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Form Fields Section */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mb: 3.5 }}>
              <Box>
                <Typography variant="caption" sx={{ mb: 0.8, color: '#6D214F', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</Typography>
                <TextField
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ mb: 0.8, color: '#6D214F', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date of Birth</Typography>
                <TextField
                  name="dob"
                  type="text"
                  value={formData.dob}
                  onChange={handleInputChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ mb: 0.8, color: '#6D214F', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</Typography>
                <TextField
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Box>

              <Box>
                <Typography variant="caption" sx={{ mb: 0.8, color: '#6D214F', fontWeight: 800, ml: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Country</Typography>
                <TextField
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  fullWidth
                  sx={inputStyles}
                />
              </Box>
            </Box>

            <Button
              type="submit"
              fullWidth
              disabled={updateMember.isPending}
              sx={{
                background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: '#FFF8F0',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 900,
                textTransform: 'none',
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(109, 33, 79, 0.25)',
                "&:hover": { 
                  background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  transform: 'translateY(-1px)'
                },
                "&:disabled": { 
                  bgcolor: '#f0d0d8',
                  color: '#8c6b7d'
                },
                transition: 'all 0.2s'
              }}
            >
              Update Profile
            </Button>

          </form>
        </CardContent>
        {updateMember.isPending && <LoadingComponent />}
      </Card>
    </Box>
  );
};

export default Profile;
