import React, { useState } from 'react';
import { Box, Typography, Paper, Grid, TextField, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent,  } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import TokenService from '../../../api/token/tokenService';
import { useGetWalletOverview } from '../../../api/Memeber';
import { useRequestAddOnMutation, useGetLoadFundConfig, useUploadPaymentScreenshot } from '../../../api/Packages';
import { toast } from 'react-toastify';
import jeeScImage from '../../../assets/jee_sc.png';

const LoadFundPage: React.FC = () => {
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

    // No need to check for balance here since we are loading funds

    if (!txNo.trim()) {
      toast.error('Please enter the transaction number (TX No)');
      return;
    }

    if (!screenshotFile) {
      toast.error('Please upload your payment screenshot');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadResult = await uploadScreenshot.mutateAsync(screenshotFile);
      await requestAddOn.mutateAsync({
        member_id: memberId || '',
        requested_amount: Number(amount),
        tx_no: txNo,
        screenshot_url: uploadResult.url,
      });

      setAmount('');
      setTxNo('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
    } catch (err: any) {
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        pb: 6,
        bgcolor: '#F8FAFC',
        minHeight: '100vh',
        px: { xs: 2.5, md: 5, lg: 10 },
        pt: { xs: 4, md: 4 },
        maxWidth: '1800px',
        margin: '0 auto',
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', mb: 1 }}>
          Load Fund
        </Typography>
      </Box>

      {isConfigLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: '#0284C7' }} />
        </Box>
      ) : (
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs={12} md={8}>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                bgcolor: '#F8FAFC',
                borderRadius: '24px',
                border: '1px solid #E2E8F0',
                height: '100%',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 3, textAlign: 'center' }}>
                Load Fund Request
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
                <Box>
                  <TextField
                    fullWidth
                    label="Top Up Balance"
                    variant="outlined"
                    value={`${Number(walletOverview?.topUpBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    disabled
                    sx={{
                      mb: 2,
                      '& .MuiOutlinedInput-root': {
                        color: '#0F172A',
                        fontWeight: 900,
                        fontSize: '1.2rem',
                        borderRadius: '14px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&.Mui-disabled': { color: '#0F172A', WebkitTextFillcolor: '#0F172A' },
                        '& input.Mui-disabled': { color: '#0F172A', WebkitTextFillcolor: '#0F172A' }
                      },
                      '& .MuiInputLabel-root': {
                        color: '#475569',
                        '&.Mui-disabled': { color: '#475569' }
                      }
                    }}
                  />

                  <TextField
                    fullWidth
                    label="Amount (Ecash / ₹)"
                    variant="outlined"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    type="number"
                    placeholder="Enter amount loaded"
                    slotProps={{
                      inputLabel: {
                        sx: { color: '#475569', '&.Mui-focused': { color: '#0284C7' } }
                      }
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#0F172A',
                        borderRadius: '14px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { borderColor: '#E2E8F0' },
                        '&.Mui-focused fieldset': { bordercolor: '#0284C7' },
                      },
                    }}
                  />

                </Box>

                <TextField
                  fullWidth
                  label="TX No / Transaction Hash"
                  variant="outlined"
                  value={txNo}
                  onChange={(e) => setTxNo(e.target.value)}
                  placeholder="Enter transaction receipt hash"
                  slotProps={{
                    inputLabel: {
                      sx: { color: '#475569', '&.Mui-focused': { color: '#0284C7' } }
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#0F172A',
                      borderRadius: '14px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { borderColor: '#E2E8F0' },
                      '&.Mui-focused fieldset': { bordercolor: '#0284C7' },
                    },
                  }}
                />

                {/* Scan to Pay QR Code */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', p: 3, border: '1px solid #E2E8F0', borderRadius: '20px', bgcolor: '#FFFFFF', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: '#0F172A' }}>
                    Scan to Pay
                  </Typography>
                  <Box sx={{ width: '100%', maxWidth: 280, bgcolor: '#FFFFFF', borderRadius: '16px', p: 2, boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #E2E8F0' }}>
                    <Box component="img" src={jeeScImage} alt="Payment QR Code" sx={{ width: '100%', height: 'auto', objectFit: 'contain' }} />
                  </Box>
                  <Typography variant="h6" sx={{ color: '#0284C7', fontWeight: 800 }}>
                    UPI ID: ecash01qr@fbl
                  </Typography>
                </Box>

                {/* Receipt Image upload */}
                <Box>
                  <Typography variant="body2" sx={{ color: '#475569', mb: 1.5, fontWeight: 700 }}>
                    Upload Payment Screenshot
                  </Typography>

                  {screenshotPreview ? (
                    <Box
                      sx={{
                        position: 'relative',
                        width: '100%',
                        height: 200,
                        borderRadius: '14px',
                        overflow: 'hidden',
                        border: '1px solid #E2E8F0',
                        bgcolor: '#F8FAFC',
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
                          bgcolor: 'rgba(239, 68, 68, 0.95)',
                          color: '#0F172A',
                          '&:hover': { bgcolor: 'rgba(239, 68, 68, 1)' },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<CloudUploadIcon />}
                      sx={{
                        width: '100%',
                        py: 4,
                        borderRadius: '14px',
                        border: '2px dashed rgba(255, 255, 255, 0.12)',
                        color: '#475569',
                        textTransform: 'none',
                        fontSize: '0.95rem',
                        '&:hover': {
                          bordercolor: '#0284C7',
                          color: '#0284C7',
                          bgcolor: 'rgba(2, 132, 199, 0.02)',
                        },
                      }}
                    >
                      Drag & Drop or Click to Upload Payment Screenshot
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
                    bgcolor: '#0284C7',
                    color: '#FFFFFF',
                    textTransform: 'none',
                    fontWeight: 900,
                    fontSize: '1rem',
                    py: 1.75,
                    borderRadius: '14px',
                    boxShadow: '0 6px 20px rgba(2, 132, 199, 0.35)',
                    '&:hover': {
                      bgcolor: '#0369A1',
                      boxShadow: '0 8px 26px rgba(2, 132, 199, 0.5)',
                    },
                    '&.Mui-disabled': {
                      bgcolor: '#F1F5F9',
                      color: '#64748B',
                    },
                  }}
                >
                  {isSubmitting ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} sx={{ color: '#FFFFFF' }} />
                      Submitting...
                    </Box>
                  ) : (
                    'Submit'
                  )}
                </Button>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Screenshot Viewer Dialog */}
      <Dialog
        open={!!selectedScreenshot}
        onClose={() => setSelectedScreenshot(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#0F172A' }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>Payment Screenshot</Typography>
          <IconButton onClick={() => setSelectedScreenshot(null)} sx={{ color: '#475569', '&:hover': { color: '#0F172A' } }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0, display: 'flex', justifyContent: 'center', bgcolor: '#F8FAFC', height: '70vh' }}>
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
