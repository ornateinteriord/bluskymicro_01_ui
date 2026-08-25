import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Button, Paper, TextField, MenuItem, CircularProgress, Stack, Avatar, Divider } from '@mui/material';
import { useGetWalletOverview, useGetMemberDetails, useLookupMemberForTransfer, useTransferP2PWallet } from '../../../api/Memeber';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import jsQR from 'jsqr';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import TokenService from '../../../api/token/tokenService';

const decoder = (jsQR as any).default || jsQR;

const getCurrentUserId = () => {
  try {
    const token = TokenService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.Member_id || decoded.memberId || decoded.id || '';
    }
  } catch (e) {}
  return '';
};

const P2PTransfer: React.FC = () => {
  const currentUserId = getCurrentUserId();
  const { data: walletOverview, isLoading: isWalletLoading } = useGetWalletOverview(currentUserId);
  const { data: memberDetails } = useGetMemberDetails(currentUserId);
  const lookupMutation = useLookupMemberForTransfer();
  const transferMutation = useTransferP2PWallet();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [sourceWallet, setSourceWallet] = useState<'Top Up Wallet' | 'Withdrawal Wallet'>('Top Up Wallet');
  const [amount, setAmount] = useState<string>('');
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [manualId, setManualId] = useState<string>('');
  const [recipient, setRecipient] = useState<any>(null);

  // Camera Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);

  const maxBalance = sourceWallet === 'Top Up Wallet' 
    ? Number(walletOverview?.topUpBalance || 0) 
    : Number(walletOverview?.balance || 0);

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid transfer amount greater than 0');
      return;
    }
    if (numAmount > maxBalance) {
      toast.error(`Insufficient balance in your ${sourceWallet === 'Top Up Wallet' ? 'Top Up Wallet' : 'Payouts'}`);
      return;
    }
    setStep(2);
    setScanMode('camera');
    startCamera();
  };

  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.play();
        requestAnimationFrame(tick);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      toast.info('Camera not accessible. Please enter Member ID manually or upload QR image.');
      setScanMode('manual');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    setIsScanning(false);
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  };

  const tick = () => {
    if (!videoRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
      if (isScanning) requestAnimationFrame(tick);
      return;
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = decoder(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' });

      if (code && code.data) {
        stopCamera();
        handleLookup(code.data);
        return;
      }
    }
    if (isScanning) requestAnimationFrame(tick);
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleLookup = async (identifier: string) => {
    if (!identifier.trim()) {
      toast.error('Please enter a valid Member ID or scan QR code');
      return;
    }
    try {
      const res = await lookupMutation.mutateAsync({ identifier: identifier.trim() });
      const memberData = res?.data || res?.member || res;
      if (memberData && (memberData.Member_id || memberData.member_id || memberData.Name || memberData.name)) {
        const targetId = memberData.Member_id || memberData.member_id || memberData.id;
        const targetName = memberData.Name || memberData.name || memberData.username || 'Member';
        const myId = memberDetails?.Member_id || memberDetails?.member_id;

        if (targetId && myId && targetId === myId) {
          toast.error('You cannot transfer funds to yourself!');
          if (scanMode === 'camera') startCamera();
          return;
        }

        setRecipient({
          ...memberData,
          Member_id: targetId,
          member_id: targetId,
          Name: targetName,
          name: targetName,
        });
        setStep(3);
      } else {
        toast.error('Member details could not be retrieved.');
      }
    } catch (err) {
      if (scanMode === 'camera') startCamera();
    }
  };

  const handleManualLookupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLookup(manualId);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Fill canvas with white first to prevent transparent PNGs from turning black-on-black
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          
          let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          let code = decoder(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });

          // If standard size fails, try scaling down/up for better jsQR recognition
          if (!code || !code.data) {
            const targetSize = Math.max(400, Math.min(1000, img.width));
            const scale = targetSize / img.width;
            canvas.width = img.width * scale;
            canvas.height = img.height * scale;
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            code = decoder(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
          }

          if (code && code.data) {
            toast.success('QR Code read successfully!');
            handleLookup(code.data);
          } else {
            toast.error('No valid QR code found in image. Please make sure the QR code is clear.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleConfirmTransfer = async () => {
    if (!recipient) return;
    try {
      let idToken = 'BYPASS_TOKEN';
      // Firebase OTP bypass for P2P as requested
      await transferMutation.mutateAsync({
        senderId: memberDetails?.Member_id || memberDetails?.member_id || '',
        recipientId: recipient.Member_id || recipient.member_id || '',
        sourceWallet: sourceWallet === 'Withdrawal Wallet' ? 'Earning Wallet' : sourceWallet,
        amount: parseFloat(amount),
        idToken,
      });
      // Reset after success
      setStep(1);
      setAmount('');
      setRecipient(null);
      setManualId('');
    } catch (err) {
      // Error handled by mutation onError
    }
  };

  if (isWalletLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#0284C7' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ px: { xs: 1.5, sm: 4 }, py: { xs: 2, sm: 4 }, maxWidth: '650px', mx: 'auto', width: '100%' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 5 },
          borderRadius: { xs: '20px', sm: '28px' },
          bgcolor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        }}
      >
        {step > 1 && (
            <Button
              onClick={() => {
                stopCamera();
                setStep((prev) => (prev - 1) as any);
              }}
              sx={{
                minWidth: 'auto',
                p: { xs: 0.8, sm: 1 },
                borderRadius: '12px',
                mb:2,
                bgcolor: 'rgba(255, 215, 0, 0.1)',
                color: '#0284C7',
                '&:hover': { bgcolor: 'rgba(255, 215, 0, 0.2)' },
              }}
            >
              <ArrowBackIcon sx={{ fontSize: { xs: 20, sm: 24 } }} />
            </Button>
          )}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: { xs: 2.5, sm: 3 }, gap: { xs: 1, sm: 2 } }}>
          <Box sx={{ p: { xs: 1.2, sm: 1.5 }, borderRadius: '16px', bgcolor: 'rgba(255, 215, 0, 0.1)', display: 'flex', flexShrink: 0 }}>
            <SendIcon sx={{ fontSize: { xs: 22, sm: 28 }, color: '#0284C7' }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: 18, sm: 25 }, lineHeight: 1.2 }}>
              P2P TRANSFER
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', fontSize: { xs: 11, sm: 14 }, display: 'block', mt: 0.3, lineHeight: 1.3 }}>
              Instant Member to Member Transfer
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ borderColor: '#E2E8F0', mb: { xs: 2.5, sm: 4 } }} />

        {/* STEP 1: CHOOSE WALLET & AMOUNT */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit}>
            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 700 }}>
                  Select Source Wallet
                </Typography>
                <TextField
                  select
                  fullWidth
                  value={sourceWallet}
                  onChange={(e) => setSourceWallet(e.target.value as any)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#0F172A',
                      bgcolor: '#F8FAFC',
                      borderRadius: '16px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { bordercolor: '#0284C7' },
                      '&.Mui-focused fieldset': { bordercolor: '#0284C7' },
                    },
                    '& .MuiSelect-icon': { color: '#0284C7' },
                  }}
                >
                  <MenuItem value="Top Up Wallet" sx={{ bgcolor: '#F8FAFC', color: '#0F172A', '&:hover': { bgcolor: 'rgba(255,215,0,0.1)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>Top Up Wallet</span>
                      <span style={{ color: '#00E676', fontWeight: 'bold', marginLeft: '10px' }}>
                        {Number(walletOverview?.topUpBalance || 0).toFixed(2)}
                      </span>
                    </Box>
                  </MenuItem>
                  <MenuItem value="Withdrawal Wallet" sx={{ bgcolor: '#F8FAFC', color: '#0F172A', '&:hover': { bgcolor: 'rgba(255,215,0,0.1)' } }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>Payouts</span>
                      <span style={{ color: '#0284C7', fontWeight: 'bold', marginLeft: '10px' }}>
                        {Number(walletOverview?.balance || 0).toFixed(2)}
                      </span>
                    </Box>
                  </MenuItem>
                </TextField>
              </Box>

              <Box sx={{ p: 2, borderRadius: '16px', bgcolor: 'rgba(255, 215, 0, 0.05)', border: '1px dashed rgba(255, 215, 0, 0.3)' }}>
                <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 0.5 ,fontSize:{xs:12,sm:14}}}>
                  Available Balance
                </Typography>
                <Typography variant="h5" sx={{ color: '#0284C7', fontWeight: 900 }}>
                  {maxBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 700,fontSize:{xs:12,sm:14} }}>
                  Enter Amount (?)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputProps={{ step: 'any', min: '0.01', max: maxBalance }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#0F172A',
                      bgcolor: '#F8FAFC',
                      borderRadius: '16px',
                      '& fieldset': { borderColor: '#E2E8F0' },
                      '&:hover fieldset': { bordercolor: '#0284C7' },
                      '&.Mui-focused fieldset': { bordercolor: '#0284C7' },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                fullWidth
                endIcon={<QrCodeScannerIcon />}
                sx={{
                  background: 'linear-gradient(45deg, #0EA5E9 30%, #0284C7 90%)',
                  color: '#FFFFFF',
                  borderRadius: '16px',
                  py: 1.8,
                  fontWeight: 900,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  boxShadow: '0 6px 20px rgba(255, 215, 0, 0.3)',
                  fontSize: { xs: 12, sm: 14 },
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0284C7 30%, #0369A1 90%)',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.5)',
                  },
                }}
              >
                Proceed to Scan / Lookup
              </Button>
            </Stack>
          </form>
        )}

        {/* STEP 2: SCAN QR OR MANUAL LOOKUP */}
        {step === 2 && (
          <Box sx={{ textAlign: 'center' }}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 1, sm: 2 }, mb: 3 }}>
              <Button
                variant={scanMode === 'camera' ? 'contained' : 'outlined'}
                onClick={() => {
                  setScanMode('camera');
                  startCamera();
                }}
                sx={{
                  borderRadius: '999px',
                  px: 2,
                  fontWeight: 800,
                  fontSize:{xs:12,sm:14},
                  textTransform: 'none',
                  bgcolor: scanMode === 'camera' ? '#FFD700' : 'transparent',
                  color: scanMode === 'camera' ? '#050916' : '#0284C7',
                  borderColor: '#0284C7',
                  '&:hover': { bgcolor: scanMode === 'camera' ? '#0369A1' : 'rgba(2,132,199,0.1)' },
                }}
              >
                Scan QR Camera
              </Button>
              <Button
                variant={scanMode === 'manual' ? 'contained' : 'outlined'}
                onClick={() => {
                  stopCamera();
                  setScanMode('manual');
                }}
                sx={{
                  borderRadius: '999px',
                  px: 2,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize:{xs:12,sm:14},
                  bgcolor: scanMode === 'manual' ? '#FFD700' : 'transparent',
                  color: scanMode === 'manual' ? '#050916' : '#0284C7',
                  borderColor: '#0284C7',
                  '&:hover': { bgcolor: scanMode === 'manual' ? '#0369A1' : 'rgba(2,132,199,0.1)' },
                }}
              >
                Enter ID / Upload
              </Button>
            </Box>

            {scanMode === 'camera' && (
              <Box sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: '320px',
                    height: '320px',
                    mx: 'auto',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    border: '2px solid #FFD700',
                    boxShadow: '0 10px 30px rgba(255, 215, 0, 0.2)',
                    position: 'relative',
                    bgcolor: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <canvas ref={canvasRef} style={{ display: 'none' }} />
                  {lookupMutation.isPending && (
                    <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <CircularProgress sx={{ color: '#0284C7' }} />
                    </Box>
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: '#475569', mt: 1.5, display: 'block', mb: 2 ,fontSize:{xs:12,sm:14}}}>
                  Align Member QR Code inside the camera frame
                </Typography>
                <Button
                  type="button"
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  sx={{
                    bordercolor: '#0284C7',
                    color: '#0284C7',
                    borderRadius: '16px',
                    py: 1,
                    fontSize:{xs:12,sm:14},
                    px: 3,
                    fontWeight: 800,
                    '&:hover': { borderColor: '#0369A1', bgcolor: 'rgba(255,215,0,0.1)' },
                  }}
                >
                  Upload QR Image from Desktop
                </Button>
              </Box>
            )}

            {scanMode === 'manual' && (
              <form onSubmit={handleManualLookupSubmit}>
                <Stack spacing={3} sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    placeholder="Enter Member ID (e.g. MEM123456)"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: '#0F172A',
                        bgcolor: '#F8FAFC',
                        borderRadius: '16px',
                        '& fieldset': { borderColor: '#E2E8F0' },
                        '&:hover fieldset': { bordercolor: '#0284C7' },
                        '&.Mui-focused fieldset': { bordercolor: '#0284C7' },
                      },
                    }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    disabled={lookupMutation.isPending}
                    sx={{
                      background: 'linear-gradient(45deg, #0EA5E9 30%, #0284C7 90%)',
                      color: '#FFFFFF',
                      borderRadius: '16px',
                      py: 1.5,
                      fontWeight: 900,
                    }}
                  >
                    {lookupMutation.isPending ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Lookup Member'}
                  </Button>

                  <Divider sx={{ borderColor: '#E2E8F0', my: 1 }}>OR</Divider>

                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                      borderColor: '#E2E8F0',
                      color: '#0F172A',
                      borderRadius: '16px',
                      py: 1.5,
                      fontSize:{xs:12,sm:14},
                      fontWeight: 800,
                      '&:hover': { bordercolor: '#0284C7', bgcolor: 'rgba(255,215,0,0.05)' },
                    }}
                  >
                    Upload QR Image
                  </Button>
                </Stack>
              </form>
            )}
          </Box>
        )}

        {/* STEP 3: CONFIRM & SEND */}
        {step === 3 && recipient && (
          <Box>
            <Box
              sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: { xs: '16px', sm: '20px' },
                bgcolor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                mb: { xs: 2.5, sm: 3 },
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Avatar sx={{ width: { xs: 54, sm: 64 }, height: { xs: 54, sm: 64 }, bgcolor: '#0284C7', color: '#FFFFFF', mx: 'auto', mb: 1, fontWeight: 900, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>
                  {(recipient.name || recipient.username || 'U')[0].toUpperCase()}
                </Avatar>
                <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: 16, sm: 20 }, wordBreak: 'break-word' }}>
                  {recipient.name || recipient.username}
                </Typography>
                <Typography variant="caption" sx={{ color: '#0284C7', fontWeight: 700, display: 'block', mt: 0.2, fontSize: { xs: 11, sm: 13 } }}>
                  Member ID: {recipient.member_id}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: '#E2E8F0', my: { xs: 1.5, sm: 2 } }} />

              <Stack spacing={1.5}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: { xs: 13, sm: 14 }, flexShrink: 0 }}>
                    Transfer Amount:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: 13, sm: 15 }, textAlign: 'right', wordBreak: 'break-word' }}>
                    {parseFloat(amount).toFixed(2)}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ gap: 1 }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: { xs: 13, sm: 14 }, flexShrink: 0 }}>
                    From Wallet:
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 800, fontSize: { xs: 13, sm: 15 }, textAlign: 'right' }}>
                    {sourceWallet === 'Top Up Wallet' ? 'Top Up Wallet' : 'Payouts'}
                  </Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ gap: 1, pt: 1, borderTop: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                  <Typography variant="body2" sx={{ color: '#475569', fontSize: { xs: 13, sm: 14 }, flexShrink: 0, pt: 0.3 }}>
                    Recipient Gets:
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: '#0284C7', fontWeight: 900, fontSize: { xs: 14, sm: 16 } }}>
                      {parseFloat(amount).toFixed(2)}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 215, 0, 0.8)', fontWeight: 700, fontSize: { xs: 11, sm: 12 }, display: 'block' }}>
                      (Top Up Wallet)
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleConfirmTransfer}
              disabled={transferMutation.isPending}
              endIcon={transferMutation.isPending ? null : <CheckCircleOutlineIcon />}
              sx={{
                background: 'linear-gradient(45deg, #0EA5E9 30%, #0284C7 90%)',
                color: '#FFFFFF',
                borderRadius: '16px',
                py: { xs: 1.5, sm: 1.8 },
                fontWeight: 900,
                textTransform: 'uppercase',
                fontSize: { xs: '0.9rem', sm: '1rem' },
                letterSpacing: '0.5px',
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #0284C7 30%, #0369A1 90%)',
                  boxShadow: '0 8px 25px rgba(2, 132, 199, 0.5)',
                },
              }}
            >
              {transferMutation.isPending ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : `Confirm & Send ${parseFloat(amount).toFixed(2)}`}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default P2PTransfer;
