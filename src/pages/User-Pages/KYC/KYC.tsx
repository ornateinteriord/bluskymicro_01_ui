import React, { useContext, useEffect, useState } from 'react';
import { Button, Card, CardContent, Box, Typography, Grid, CircularProgress, IconButton, TextField, InputAdornment } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BadgeIcon from '@mui/icons-material/Badge';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../../context/user/userContext';
import { LoadingComponent } from '../../../App';
import { useSubmitKYC, useUploadKYCDocument } from '../../../api/Memeber';
import { toast } from 'react-toastify';

interface DocumentUploadProps {
  label: string;
  icon: React.ReactNode;
  value: string | null;
  onUpload: (file: File) => void;
  onDelete: () => void;
  uploading: boolean;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  icon,
  value,
  onUpload,
  onDelete,
  uploading,
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }
      onUpload(file);
    }
  };

  return (
    <Card sx={{ 
      height: '100%', 
      position: 'relative', 
      bgcolor: '#FFF8F0', 
      borderRadius: '20px', 
      border: '1.5px solid #f0d0d8',
      boxShadow: 'none'
    }}>
      <CardContent sx={{ p: 2 }}>
        <Box display="flex" alignItems="center" mb={1.5}>
          {icon}
          <Typography variant="subtitle2" fontWeight="800" ml={1} sx={{ color: '#6D214F' }}>
            {label}
          </Typography>
        </Box>

        {value ? (
          <Box sx={{ position: 'relative', width: '100%', height: 160, borderRadius: '14px', overflow: 'hidden', border: '1px solid #E5989B' }}>
            <img
              src={value}
              alt={label}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <IconButton
              onClick={onDelete}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: '#6D214F',
                color: '#FFF8F0',
                '&:hover': {
                  bgcolor: '#4e1739',
                },
              }}
              size="small"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        ) : (
          <Box
            sx={{
              border: '2px dashed #E5989B',
              borderRadius: '16px',
              p: 2.5,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: '#ffffff',
              '&:hover': {
                borderColor: '#6D214F',
                bgcolor: '#fdf2f4',
              },
            }}
            component="label"
          >
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {uploading ? (
              <CircularProgress size={28} sx={{ color: '#6D214F' }} />
            ) : (
              <>
                <CloudUploadIcon sx={{ fontSize: 36, color: '#6D214F', mb: 0.5 }} />
                <Typography variant="body2" sx={{ color: '#6D214F', fontWeight: 800 }}>
                  Upload Document
                </Typography>
                <Typography variant="caption" sx={{ color: '#8c6b7d', display: 'block', mt: 0.3 }}>
                  PNG, JPG up to 5MB
                </Typography>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

const KYC: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const submitKYC = useSubmitKYC();
  const uploadDoc = useUploadKYCDocument();

  const [formData, setFormData] = useState({
    accountName: '',
    account_number: '',
    ifsc_code: '',
    bank_name: '',
    upi_id: '',
  });

  const [documents, setDocuments] = useState<{
    panImage: string | null;
    profileImage: string | null;
  }>({
    panImage: null,
    profileImage: null,
  });

  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFormData({
        accountName: user.accountName || user.Name || '',
        account_number: user.bankAccount || '',
        ifsc_code: user.ifsc || '',
        bank_name: user.bankName || '',
        upi_id: user.upiId || '',
      });

      setDocuments({
        panImage: user.panImage || null,
        profileImage: user.profileImage || null,
      });
    }
  }, [user]);

  const handleDocumentUpload = async (docType: string, file: File) => {
    try {
      setUploadingDoc(docType);
      const res = await uploadDoc.mutateAsync({
        memberId: user.Member_id,
        file,
        documentType: docType,
      });

      setDocuments((prev) => ({
        ...prev,
        [docType]: res.url || res.documentUrl,
      }));

      toast.success(`Document uploaded successfully!`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error?.message || 'Failed to upload document');
    } finally {
      setUploadingDoc(null);
    }
  };

  const handleDocumentDelete = (docType: string) => {
    setDocuments((prev) => ({
      ...prev,
      [docType]: null,
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const missingDocs = [];
    if (!documents.panImage) missingDocs.push('PAN / Aadhaar Image');
    if (!documents.profileImage) missingDocs.push('Profile Image');

    if (missingDocs.length > 0) {
      toast.error(`Please upload: ${missingDocs.join(', ')}`);
      return;
    }

    if (!formData.account_number || !formData.ifsc_code || !formData.bank_name || !formData.upi_id) {
      toast.error('Please fill all bank account and UPI details');
      return;
    }

    submitKYC.mutate({
      ref_no: user.Member_id,
      bankAccount: formData.account_number,
      ifsc: formData.ifsc_code,
      bankName: formData.bank_name,
      upiId: formData.upi_id,
      panImage: documents.panImage,
      profileImage: documents.profileImage,
    });
  };

  const documentConfigs = [
    { key: 'panImage', label: 'PAN / Aadhaar Card', icon: <BadgeIcon sx={{ color: '#6D214F' }} /> },
    { key: 'profileImage', label: 'Profile Photo', icon: <ImageIcon sx={{ color: '#6D214F' }} /> },
  ];

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
            KYC Verification
          </Typography>
          <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 600 }}>
            Bank account details & identification
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
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#6D214F', fontWeight: 900, mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Bank Account Details
            </Typography>
            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <TextField
                label="Account Holder Name"
                name="accountName"
                value={formData.accountName}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter name as in bank"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: '#8c6b7d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
              <TextField
                label="Account Number"
                name="account_number"
                value={formData.account_number}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="Enter bank account number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalanceWalletIcon sx={{ color: '#8c6b7d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
              <TextField
                label="IFSC Code"
                name="ifsc_code"
                value={formData.ifsc_code}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="e.g. SBIN0001234"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ConfirmationNumberIcon sx={{ color: '#8c6b7d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
              <TextField
                label="Bank Name"
                name="bank_name"
                value={formData.bank_name}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="e.g. State Bank of India"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalanceIcon sx={{ color: '#8c6b7d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
              <TextField
                label="UPI ID"
                name="upi_id"
                value={formData.upi_id}
                onChange={handleInputChange}
                fullWidth
                variant="outlined"
                placeholder="e.g. yourname@upi"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AccountBalanceWalletIcon sx={{ color: '#8c6b7d' }} />
                    </InputAdornment>
                  ),
                }}
                sx={inputStyles}
              />
            </form>
          </Box>

          {/* KYC Documents */}
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" sx={{ color: '#6D214F', fontWeight: 900, mb: 2, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Upload KYC Documents
            </Typography>
            <Grid container spacing={2}>
              {documentConfigs.map((config) => (
                <Grid item xs={12} key={config.key}>
                  <DocumentUpload
                    label={config.label}
                    icon={config.icon}
                    value={documents[config.key as keyof typeof documents]}
                    onUpload={(file) => handleDocumentUpload(config.key, file)}
                    onDelete={() => handleDocumentDelete(config.key)}
                    uploading={uploadingDoc === config.key}
                  />
                </Grid>
              ))}
            </Grid>

            <Box mt={3.5}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={submitKYC.isPending}
                fullWidth
                sx={{
                  background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                  color: '#FFF8F0',
                  padding: '14px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  borderRadius: '16px',
                  textTransform: 'none',
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
                {submitKYC.isPending ? 'Submitting KYC...' : 'Submit KYC Details'}
              </Button>
            </Box>
          </Box>
        </CardContent>
        {submitKYC.isPending && <LoadingComponent />}
      </Card>
    </Box>
  );
};

export default KYC;
