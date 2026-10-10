import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import TokenService from '../../../api/token/tokenService';
import { useGetWalletOverview } from '../../../api/Memeber';
import { useRequestAddOnMutation, useGetLoadFundConfig, useUploadPaymentScreenshot } from '../../../api/Packages';
import { toast } from 'react-toastify';
import ecashScannerImage from '../../../assets/E-cashScanner.jpeg';

const LoadFundPage: React.FC = () => {
  const navigate = useNavigate();
  const memberId = TokenService.getMemberId();
  const { isLoading: isConfigLoading } = useGetLoadFundConfig();
  const { data: walletOverview } = useGetWalletOverview(memberId || '');

  const requestAddOn = useRequestAddOnMutation();
  const uploadScreenshot = useUploadPaymentScreenshot(memberId || '');

  const [amount, setAmount] = useState<string>('');
  const [txNo, setTxNo] = useState<string>('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // For viewing screenshot history
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveScreenshot = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!txNo.trim()) {
      toast.error('Please enter the transaction number (TX No)');
      return;
    }

    if (!screenshotFile) {
      toast.error('Please upload your payment screenshot');
      return;
    }

    try {
      setIsSubmitting(true);
      const uploadRes = await uploadScreenshot.mutateAsync(screenshotFile);
      const screenshotUrl = uploadRes?.url || '';

      await requestAddOn.mutateAsync({
        member_id: memberId || '',
        requested_amount: Number(amount),
        tx_no: txNo.trim(),
        screenshot_url: screenshotUrl,
        payment_method: 'UPI/QR',
      });

      setAmount('');
      setTxNo('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
    } catch (err: any) {
      console.error('Load fund error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        pb: 8,
        bgcolor: '#FFF8F0',
        minHeight: '100vh',
        px: { xs: 2, sm: 3 },
        pt: { xs: 2.5, sm: 3.5 },
        maxWidth: '480px',
        margin: '0 auto',
      }}
    >
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
            Load Funds
          </Typography>
          <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 600 }}>
            Top up your wallet via instant UPI transfer
          </Typography>
        </Box>
      </Box>

      {isConfigLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#6D214F' }} />
        </Box>
      ) : (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            bgcolor: '#ffffff',
            borderRadius: '24px',
            border: '1.5px solid #f0d0d8',
            boxShadow: '0 4px 20px rgba(109,33,79,0.06)',
          }}
        >
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Balance Badge */}
            <Box sx={{ p: 2, borderRadius: '16px', bgcolor: '#FFF8F0', border: '1px solid #f0d0d8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 700, textTransform: 'uppercase' }}>Current Top Up Balance</Typography>
              <Typography variant="subtitle1" sx={{ color: '#6D214F', fontWeight: 900 }}>
                ₹{Number(walletOverview?.topUpBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            {/* E-Cash Scanner QR Card */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                p: { xs: 2, sm: 2.5 },
                bgcolor: '#FFF8F0',
                borderRadius: '20px',
                border: '1.5px dashed #E5989B',
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 800,
                  color: '#6D214F',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  mb: 1.5,
                }}
              >
                Scan & Pay via UPI / PhonePe
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 240,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  bgcolor: '#ffffff',
                  p: 1.2,
                  boxShadow: '0 4px 16px rgba(109,33,79,0.1)',
                  border: '1px solid #f0d0d8',
                }}
              >
                <Box
                  component="img"
                  src={ecashScannerImage}
                  alt="E-Cash Scanner QR Code"
                  sx={{
                    width: '100%',
                    height: 'auto',
                    maxHeight: '360px',
                    objectFit: 'contain',
                    display: 'block',
                    borderRadius: '10px',
                  }}
                />
              </Box>
            </Box>

            <TextField
              fullWidth
              label="Amount (₹)"
              variant="outlined"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              type="number"
              placeholder="e.g. 5000"
              slotProps={{
                inputLabel: {
                  sx: { color: '#8c6b7d', '&.Mui-focused': { color: '#6D214F' } }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#2d0f1e',
                  fontWeight: 700,
                  bgcolor: '#FFF8F0',
                  borderRadius: '16px',
                  '& fieldset': { borderColor: '#f0d0d8' },
                  '&:hover fieldset': { borderColor: '#E5989B' },
                  '&.Mui-focused fieldset': { borderColor: '#6D214F', borderWidth: '2px' },
                },
              }}
            />

            <TextField
              fullWidth
              label="UTR / Transaction Reference No."
              variant="outlined"
              value={txNo}
              onChange={(e) => setTxNo(e.target.value)}
              placeholder="Enter 12-digit UTR or Txn Ref"
              helperText="Must be a unique transaction reference number (UTR / Txn ID)"
              slotProps={{
                inputLabel: {
                  sx: { color: '#8c6b7d', '&.Mui-focused': { color: '#6D214F' } }
                },
                formHelperText: {
                  sx: { color: '#8c6b7d', fontWeight: 600, fontSize: '0.72rem', mt: 0.5 }
                }
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  color: '#2d0f1e',
                  fontWeight: 700,
                  bgcolor: '#FFF8F0',
                  borderRadius: '16px',
                  '& fieldset': { borderColor: '#f0d0d8' },
                  '&:hover fieldset': { borderColor: '#E5989B' },
                  '&.Mui-focused fieldset': { borderColor: '#6D214F', borderWidth: '2px' },
                },
              }}
            />

            {/* Receipt Image upload */}
            <Box>
              <Typography variant="caption" sx={{ color: '#6D214F', mb: 1, fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
                Upload Payment Screenshot
              </Typography>

              {screenshotPreview ? (
                <Box
                  sx={{
                    position: 'relative',
                    width: '100%',
                    height: 180,
                    borderRadius: '16px',
                    overflow: 'hidden',
                    border: '1.5px solid #E5989B',
                    bgcolor: '#FFF8F0',
                  }}
                >
                  <Box
                    component="img"
                    src={screenshotPreview}
                    alt="Screenshot Preview"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                  <IconButton
                    onClick={handleRemoveScreenshot}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      bgcolor: '#6D214F',
                      color: '#FFF8F0',
                      '&:hover': { bgcolor: '#4e1739' },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon sx={{ color: '#6D214F' }} />}
                  sx={{
                    width: '100%',
                    py: 3,
                    borderRadius: '16px',
                    border: '2px dashed #E5989B',
                    color: '#6D214F',
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    bgcolor: '#FFF8F0',
                    '&:hover': {
                      borderColor: '#6D214F',
                      bgcolor: '#fdf2f4',
                    },
                  }}
                >
                  Upload Payment Screenshot
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Button>
              )}
            </Box>

            <Button
              type="submit"
              disabled={isSubmitting}
              sx={{
                background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: '#FFF8F0',
                textTransform: 'none',
                fontWeight: 900,
                fontSize: '1rem',
                py: 1.5,
                borderRadius: '16px',
                boxShadow: '0 8px 24px rgba(109, 33, 79, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  transform: 'translateY(-1px)'
                },
                '&.Mui-disabled': {
                  bgcolor: '#f0d0d8',
                  color: '#8c6b7d',
                },
                transition: 'all 0.2s'
              }}
            >
              {isSubmitting ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#FFF8F0' }} />
                  Submitting...
                </Box>
              ) : (
                'Submit Load Request'
              )}
            </Button>
          </Box>
        </Paper>
      )}

      {/* Screenshot Viewer Dialog */}
      <Dialog
        open={!!selectedScreenshot}
        onClose={() => setSelectedScreenshot(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #f0d0d8',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#6D214F' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Payment Screenshot</Typography>
          <IconButton onClick={() => setSelectedScreenshot(null)} sx={{ color: '#8c6b7d', '&:hover': { color: '#6D214F' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', bgcolor: '#FFF8F0', height: '60vh' }}>
          {selectedScreenshot && (
            <Box
              component="img"
              src={selectedScreenshot}
              alt="Payment Transaction Receipt"
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default LoadFundPage;
