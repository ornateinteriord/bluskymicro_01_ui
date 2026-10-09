import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItemButton,
  Avatar,
  Divider,
  Chip,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useGetMemberDetails,
  useGetWalletOverview,
  useLookupMemberForTransfer,
  useTransferP2PWallet,
} from '../../../api/Memeber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import FlipCameraIosIcon from '@mui/icons-material/FlipCameraIos';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PersonIcon from '@mui/icons-material/Person';
import { motion, AnimatePresence } from 'framer-motion';
import jsQR from 'jsqr';
import { toast } from 'react-toastify';
import { get, post } from '../../../api/Api';
import { jwtDecode } from 'jwt-decode';
import TokenService from '../../../api/token/tokenService';

const decoder = (jsQR as any).default || jsQR;

const getCurrentUserId = () => {
  const tId = TokenService.getMemberId();
  if (tId) return tId;
  try {
    const token = TokenService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.Member_id || decoded.memberId || decoded.id || '';
    }
  } catch (e) {}
  return '';
};

const MyQR: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentUserId = getCurrentUserId();
  const { data: memberDetails, isLoading } = useGetMemberDetails(currentUserId);
  const { data: walletOverview } = useGetWalletOverview(currentUserId);
  const lookupMutation = useLookupMemberForTransfer();
  const transferMutation = useTransferP2PWallet();

  // Active Tab: default to 'scanner' if ?tab=scan or on scan & pay route, else 'scanner'
  const initialTab = searchParams.get('tab') === 'qr' ? 'my_qr' : 'scanner';
  const [activeTab, setActiveTab] = useState<'scanner' | 'my_qr'>(initialTab);

  // Scanner States
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const animFrameId = useRef<number | null>(null);

  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [torchOn, setTorchOn] = useState<boolean>(false);
  const [hasTorch, setHasTorch] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState<string>('');

  // Payment / Transfer Dialog States
  const [recipient, setRecipient] = useState<any>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>('');
  const [sourceWallet, setSourceWallet] = useState<'Top Up Wallet' | 'Earning Wallet'>('Top Up Wallet');

  // Chat Share Modal State
  const [shareOpen, setShareOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [searchMobile, setSearchMobile] = useState('');
  const [searchingMember, setSearchingMember] = useState(false);
  const [foundMember, setFoundMember] = useState<any>(null);
  const [sendingRoomId, setSendingRoomId] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setTorchOn(false);
  }, []);

  const handleLookup = useCallback(
    async (scannedData: string) => {
      let cleanId = scannedData.trim();
      if (!cleanId) return;

      if (cleanId.startsWith('Ecash-P2P:')) {
        cleanId = cleanId.replace('Ecash-P2P:', '').trim();
      }

      const myId = memberDetails?.Member_id || memberDetails?.member_id || currentUserId || '';
      if (cleanId.toUpperCase() === myId.toUpperCase()) {
        toast.error('You cannot transfer funds to your own account');
        return;
      }

      stopCamera();

      try {
        const result = await lookupMutation.mutateAsync({ identifier: cleanId });
        if (result) {
          setRecipient(result);
          setPaymentDialogOpen(true);
        } else {
          toast.error('Member not found. Please verify the ID/QR.');
        }
      } catch (err: any) {
        toast.error(err?.response?.data?.message || 'Member lookup failed.');
      }
    },
    [currentUserId, memberDetails, lookupMutation, stopCamera]
  );

  const tick = useCallback(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.height = videoRef.current.videoHeight;
          canvas.width = videoRef.current.videoWidth;
          ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = decoder(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            handleLookup(code.data);
            return;
          }
        }
      }
    }
    animFrameId.current = requestAnimationFrame(tick);
  }, [handleLookup]);

  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: cameraFacing,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          await videoRef.current.play();

          const track = stream.getVideoTracks()[0];
          const capabilities = (track.getCapabilities ? track.getCapabilities() : {}) as any;
          setHasTorch(Boolean(capabilities?.torch));

          animFrameId.current = requestAnimationFrame(tick);
        }
      } else {
        setCameraError('Camera not supported in this browser.');
      }
    } catch (err) {
      setCameraError('Unable to access camera. Please allow permissions or upload an image.');
    }
  }, [cameraFacing, tick]);

  useEffect(() => {
    if (activeTab === 'scanner' && !paymentDialogOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, paymentDialogOpen, startCamera, stopCamera]);

  const toggleTorch = async () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const track = stream.getVideoTracks()[0];
      if (track) {
        try {
          await (track as any).applyConstraints({
            advanced: [{ torch: !torchOn }],
          });
          setTorchOn(!torchOn);
        } catch (e) {
          toast.info('Flashlight not available on this device');
        }
      }
    }
  };

  const toggleCameraFacing = () => {
    stopCamera();
    setCameraFacing((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = decoder(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            handleLookup(code.data);
          } else {
            toast.error('No valid QR code detected in the selected image.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualInput.trim()) {
      toast.error('Please enter a Member ID');
      return;
    }
    handleLookup(manualInput);
  };

  const handleSendPayment = async () => {
    const numAmount = parseFloat(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    const availableBalance =
      sourceWallet === 'Top Up Wallet'
        ? Number(walletOverview?.topUpBalance || 0)
        : Number(walletOverview?.balance || 0);

    if (numAmount > availableBalance) {
      toast.error(`Insufficient balance in ${sourceWallet}`);
      return;
    }

    try {
      await transferMutation.mutateAsync({
        senderId: memberDetails?.Member_id || memberDetails?.member_id || currentUserId || '',
        recipientId: recipient?.Member_id || recipient?.member_id || '',
        sourceWallet: sourceWallet,
        amount: numAmount,
        idToken: 'BYPASS_TOKEN',
      });

      toast.success(`₹${numAmount.toLocaleString()} successfully transferred to ${recipient?.Name || 'Member'}!`);
      setPaymentDialogOpen(false);
      setAmount('');
      setRecipient(null);
      navigate('/user/transactions?type=P2P');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Transfer failed. Please try again.');
    }
  };

  // Share handlers
  const handleOpenShare = async () => {
    setShareOpen(true);
    setLoadingRooms(true);
    try {
      const res = await get('/chat/rooms');
      if (res.success) {
        setChatRooms(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch chat rooms', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSearchMember = async () => {
    if (!searchMobile.trim()) {
      toast.error('Please enter a mobile number');
      return;
    }
    setSearchingMember(true);
    setFoundMember(null);
    try {
      const res = await get(`/chat/search-member?mobile=${encodeURIComponent(searchMobile.trim())}`);
      if (res.success && res.data) {
        const roomRes = await post('/chat/room', {
          targetMemberId: res.data.Member_id || res.data.memberId || res.data.id,
          targetRole: res.data.role || 'Member',
        });
        if (roomRes.success && roomRes.data) {
          setFoundMember({
            ...res.data,
            chatRoom: roomRes.data,
          });
        }
      } else {
        toast.error('No member found with this mobile number');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Member not found');
    } finally {
      setSearchingMember(false);
    }
  };

  const handleSendQRToRoom = async (roomId: string, targetName: string) => {
    const memberId = TokenService.getMemberId() || memberDetails?.Member_id || memberDetails?.member_id || 'UNKNOWN';
    const memberName = memberDetails?.Name || memberDetails?.name || memberDetails?.username || 'Member';
    const qrData = `Ecash-P2P:${memberId}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&margin=10`;

    setSendingRoomId(roomId);
    try {
      const res = await post('/chat/message', {
        roomId,
        content: `Here is my Ecash P2P QR Code for transfers.\nMember: ${memberName}\nID: ${memberId}`,
        attachments: [qrImageUrl],
      });
      if (res.success) {
        toast.success(`QR Code sent directly to ${targetName}!`);
        setShareOpen(false);
      }
    } catch (err) {
      toast.error('Failed to send QR code to chat');
    } finally {
      setSendingRoomId(null);
    }
  };

  const memberId = TokenService.getMemberId() || memberDetails?.Member_id || memberDetails?.member_id || 'UNKNOWN';
  const memberName = memberDetails?.Name || memberDetails?.name || memberDetails?.username || 'Member';
  const qrData = `Ecash-P2P:${memberId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData);
    toast.success('QR Code data copied to clipboard!');
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ecash-QR-${memberId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR Code downloaded!');
    } catch (err) {
      toast.error('Failed to download QR code image.');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#F1F5F9' }}>
        <CircularProgress sx={{ color: '#00BAF2' }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: '520px',
        mx: 'auto',
        minHeight: '100vh',
        bgcolor: '#F1F5F9',
        pb: 10,
      }}
    >
      {/* Hidden processing canvas & file input */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />

      {/* Header Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
        <IconButton
          onClick={() => navigate(-1)}
          sx={{
            bgcolor: '#ffffff',
            border: '1.5px solid #E2E8F0',
            color: '#0F172A',
            p: 1,
            boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
            '&:hover': { bgcolor: '#F8FAFC' },
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#0F172A', letterSpacing: '-0.5px' }}>
            E-cash Scanner & QR
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
            Scan to pay other members or receive payments
          </Typography>
        </Box>
      </Box>

      {/* Paytm Style Tab Switcher */}
      <Box
        sx={{
          display: 'flex',
          bgcolor: '#E2E8F0',
          borderRadius: '16px',
          p: 0.6,
          mb: 3,
        }}
      >
        <Button
          fullWidth
          onClick={() => setActiveTab('scanner')}
          startIcon={<QrCodeScannerIcon />}
          sx={{
            py: 1.2,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '0.9rem',
            bgcolor: activeTab === 'scanner' ? '#00BAF2' : 'transparent',
            color: activeTab === 'scanner' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'scanner' ? '0 4px 12px rgba(0, 186, 242, 0.35)' : 'none',
            '&:hover': {
              bgcolor: activeTab === 'scanner' ? '#0082CD' : 'rgba(255,255,255,0.4)',
            },
            transition: 'all 0.2s',
          }}
        >
          Scan & Pay
        </Button>

        <Button
          fullWidth
          onClick={() => setActiveTab('my_qr')}
          startIcon={<QrCode2Icon />}
          sx={{
            py: 1.2,
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 900,
            fontSize: '0.9rem',
            bgcolor: activeTab === 'my_qr' ? '#00BAF2' : 'transparent',
            color: activeTab === 'my_qr' ? '#FFFFFF' : '#475569',
            boxShadow: activeTab === 'my_qr' ? '0 4px 12px rgba(0, 186, 242, 0.35)' : 'none',
            '&:hover': {
              bgcolor: activeTab === 'my_qr' ? '#0082CD' : 'rgba(255,255,255,0.4)',
            },
            transition: 'all 0.2s',
          }}
        >
          My QR Code
        </Button>
      </Box>

      {/* TAB 1: SCANNER VIEWPORT */}
      {activeTab === 'scanner' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '24px',
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #1E293B',
              boxShadow: '0 12px 32px rgba(15, 23, 42, 0.15)',
              overflow: 'hidden',
              p: { xs: 2.5, sm: 3 },
              textAlign: 'center',
            }}
          >
            {/* Top Camera Controls */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography sx={{ fontWeight: 800, fontSize: '0.95rem', color: '#38BDF8' }}>
                📷 Live QR Scanner
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {hasTorch && (
                  <IconButton
                    size="small"
                    onClick={toggleTorch}
                    sx={{
                      bgcolor: torchOn ? '#00BAF2' : 'rgba(255,255,255,0.15)',
                      color: '#FFFFFF',
                    }}
                  >
                    {torchOn ? <FlashOnIcon fontSize="small" /> : <FlashOffIcon fontSize="small" />}
                  </IconButton>
                )}
                <IconButton
                  size="small"
                  onClick={toggleCameraFacing}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: '#FFFFFF',
                  }}
                >
                  <FlipCameraIosIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Camera Viewport Frame */}
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                maxWidth: '280px',
                height: '280px',
                mx: 'auto',
                borderRadius: '24px',
                overflow: 'hidden',
                bgcolor: '#000000',
                border: '2px solid #00BAF2',
                boxShadow: '0 0 25px rgba(0, 186, 242, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2.5,
              }}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Laser Line Scanning Animation */}
              <motion.div
                animate={{
                  top: ['5%', '90%', '5%'],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                style={{
                  position: 'absolute',
                  left: '6%',
                  right: '6%',
                  height: '3px',
                  background: 'linear-gradient(90deg, transparent 0%, #00BAF2 50%, transparent 100%)',
                  boxShadow: '0 0 16px 3px #00BAF2',
                  borderRadius: '50%',
                  zIndex: 2,
                }}
              />

              {/* Corner Brackets */}
              <Box sx={{ position: 'absolute', top: 0, left: 0, width: 28, height: 28, borderTop: '4px solid #00BAF2', borderLeft: '4px solid #00BAF2', borderTopLeftRadius: '14px', zIndex: 2 }} />
              <Box sx={{ position: 'absolute', top: 0, right: 0, width: 28, height: 28, borderTop: '4px solid #00BAF2', borderRight: '4px solid #00BAF2', borderTopRightRadius: '14px', zIndex: 2 }} />
              <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: 28, height: 28, borderBottom: '4px solid #00BAF2', borderLeft: '4px solid #00BAF2', borderBottomLeftRadius: '14px', zIndex: 2 }} />
              <Box sx={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderBottom: '4px solid #00BAF2', borderRight: '4px solid #00BAF2', borderBottomRightRadius: '14px', zIndex: 2 }} />
            </Box>

            {cameraError && (
              <Typography variant="caption" sx={{ color: '#F87171', display: 'block', mb: 2 }}>
                {cameraError}
              </Typography>
            )}

            {/* Gallery Upload & Manual Search */}
            <Stack spacing={2}>
              <Button
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                startIcon={<PhotoLibraryIcon />}
                fullWidth
                sx={{
                  color: '#FFFFFF',
                  borderColor: 'rgba(255, 255, 255, 0.25)',
                  borderRadius: '14px',
                  py: 1.2,
                  fontWeight: 800,
                  fontSize: '0.9rem',
                  textTransform: 'none',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.16)',
                    borderColor: '#00BAF2',
                  },
                }}
              >
                Upload QR Image from Gallery
              </Button>

              <Paper
                component="form"
                onSubmit={handleManualSearch}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '14px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  p: '4px 8px 4px 14px',
                }}
              >
                <TextField
                  fullWidth
                  placeholder="Or enter Member ID directly"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: {
                      color: '#FFFFFF',
                      fontSize: '0.9rem',
                      fontWeight: 600,
                      '& input::placeholder': {
                        color: '#94A3B8',
                        opacity: 1,
                      },
                    },
                  }}
                />
                <Button
                  type="submit"
                  disabled={lookupMutation.isPending}
                  sx={{
                    bgcolor: '#00BAF2',
                    color: '#FFFFFF',
                    borderRadius: '10px',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    px: 2,
                    py: 0.8,
                    textTransform: 'none',
                    '&:hover': { bgcolor: '#0082CD' },
                  }}
                >
                  {lookupMutation.isPending ? <CircularProgress size={18} sx={{ color: '#FFFFFF' }} /> : 'Search'}
                </Button>
              </Paper>
            </Stack>
          </Paper>
        </motion.div>
      )}

      {/* TAB 2: MY QR CODE */}
      {activeTab === 'my_qr' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: '24px',
              bgcolor: '#ffffff',
              border: '1px solid #E2E8F0',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                display: 'inline-flex',
                p: 1.2,
                borderRadius: '14px',
                bgcolor: '#E0F2FE',
                color: '#00BAF2',
                mb: 1.5,
              }}
            >
              <QrCode2Icon sx={{ fontSize: 36 }} />
            </Box>

            <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 900, mb: 0.5 }}>
              Scan to Pay Me
            </Typography>
            <Typography variant="caption" sx={{ color: '#64748B', mb: 2.5, display: 'block', maxWidth: '320px', mx: 'auto', lineHeight: 1.4 }}>
              Share your QR code with members to receive instant wallet transfers.
            </Typography>

            <Box
              sx={{
                p: 2.5,
                bgcolor: '#F8FAFC',
                borderRadius: '20px',
                display: 'inline-block',
                border: '2px dashed #00BAF2',
                boxShadow: '0 4px 16px rgba(0, 186, 242, 0.1)',
                mb: 2.5,
              }}
            >
              <img
                src={qrImageUrl}
                alt="My P2P QR Code"
                style={{ width: '200px', height: '200px', display: 'block', borderRadius: '12px' }}
              />
            </Box>

            <Box sx={{ mb: 3, p: 2, borderRadius: '16px', bgcolor: '#F0F9FF', border: '1px solid #BAE6FD' }}>
              <Typography variant="caption" sx={{ color: '#0369A1', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block' }}>
                Account Holder
              </Typography>
              <Typography variant="subtitle1" sx={{ color: '#002970', fontWeight: 900 }}>
                {memberName}
              </Typography>
              <Box sx={{ bgcolor: '#00BAF2', color: '#FFFFFF', px: 1.5, py: 0.3, borderRadius: '8px', display: 'inline-block', mt: 0.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 800 }}>
                  MEMBER ID: {memberId}
                </Typography>
              </Box>
            </Box>

            <Stack spacing={1.5}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<ContentCopyIcon />}
                onClick={handleCopy}
                sx={{
                  background: 'linear-gradient(135deg, #00BAF2 0%, #0082CD 100%)',
                  color: '#FFFFFF',
                  borderRadius: '14px',
                  py: 1.4,
                  fontWeight: 900,
                  textTransform: 'none',
                  fontSize: '0.92rem',
                  boxShadow: '0 8px 24px rgba(0, 186, 242, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0082CD 0%, #0052cc 100%)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s',
                }}
              >
                Copy QR Data
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<ChatBubbleOutlineIcon sx={{ color: '#00BAF2' }} />}
                onClick={handleOpenShare}
                sx={{
                  borderColor: '#00BAF2',
                  color: '#0082CD',
                  borderRadius: '14px',
                  py: 1.3,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.92rem',
                  '&:hover': {
                    borderColor: '#0082CD',
                    bgcolor: '#F0F9FF',
                  },
                }}
              >
                Share to Chat
              </Button>

              <Button
                variant="outlined"
                fullWidth
                startIcon={<DownloadIcon sx={{ color: '#64748B' }} />}
                onClick={handleDownload}
                sx={{
                  borderColor: '#CBD5E1',
                  color: '#64748B',
                  borderRadius: '14px',
                  py: 1.3,
                  fontWeight: 700,
                  textTransform: 'none',
                  fontSize: '0.92rem',
                  '&:hover': {
                    borderColor: '#94A3B8',
                    bgcolor: '#F8FAFC',
                  },
                }}
              >
                Download QR Code
              </Button>
            </Stack>
          </Paper>
        </motion.div>
      )}

      {/* Instant Payment Dialog */}
      <AnimatePresence>
        {paymentDialogOpen && recipient && (
          <Dialog
            open={paymentDialogOpen}
            onClose={() => {
              setPaymentDialogOpen(false);
            }}
            PaperProps={{
              sx: {
                bgcolor: '#FFFFFF',
                borderRadius: '24px',
                p: 1,
                maxWidth: '420px',
                width: '100%',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              },
            }}
          >
            <DialogContent sx={{ p: 2.5 }}>
              {/* Recipient Profile Header */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  p: 2,
                  borderRadius: '18px',
                  background: 'linear-gradient(135deg, #002970 0%, #0052cc 60%, #00BAF2 100%)',
                  color: '#FFFFFF',
                  mb: 3,
                }}
              >
                <Avatar
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: '#FFFFFF',
                    color: '#002970',
                    fontWeight: 900,
                    fontSize: '1.4rem',
                    border: '2px solid #38BDF8',
                  }}
                >
                  {recipient?.Name ? recipient.Name.charAt(0).toUpperCase() : <PersonIcon />}
                </Avatar>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 900, fontSize: '1.1rem', lineHeight: 1.2 }}>
                      {recipient?.Name || 'Member'}
                    </Typography>
                    <CheckCircleIcon sx={{ fontSize: 16, color: '#38BDF8' }} />
                  </Box>
                  <Typography variant="caption" sx={{ color: '#E0F2FE', fontWeight: 700 }}>
                    ID: {recipient?.Member_id || recipient?.member_id || recipient?.id || 'N/A'}
                  </Typography>
                  {recipient?.mobile && (
                    <Typography variant="caption" sx={{ display: 'block', color: '#BAE6FD', fontSize: '0.72rem' }}>
                      📱 {recipient.mobile}
                    </Typography>
                  )}
                </Box>
              </Box>

              {/* Source Wallet Selector */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, mb: 0.8, display: 'block', textTransform: 'uppercase' }}>
                  Pay From Wallet
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                  <Box
                    onClick={() => setSourceWallet('Top Up Wallet')}
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      border: `2px solid ${sourceWallet === 'Top Up Wallet' ? '#00BAF2' : '#E2E8F0'}`,
                      bgcolor: sourceWallet === 'Top Up Wallet' ? '#F0F9FF' : '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#002970' }}>
                      Top Up Wallet
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A' }}>
                      ₹{Number(walletOverview?.topUpBalance || 0).toLocaleString()}
                    </Typography>
                  </Box>

                  <Box
                    onClick={() => setSourceWallet('Earning Wallet')}
                    sx={{
                      p: 1.5,
                      borderRadius: '14px',
                      border: `2px solid ${sourceWallet === 'Earning Wallet' ? '#00BAF2' : '#E2E8F0'}`,
                      bgcolor: sourceWallet === 'Earning Wallet' ? '#F0F9FF' : '#F8FAFC',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#002970' }}>
                      Payout Balance
                    </Typography>
                    <Typography sx={{ fontSize: '0.95rem', fontWeight: 900, color: '#0F172A' }}>
                      ₹{Number(walletOverview?.balance || 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Amount Input */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" sx={{ color: '#475569', fontWeight: 800, mb: 0.8, display: 'block', textTransform: 'uppercase' }}>
                  Enter Amount (₹)
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography sx={{ fontSize: '1.4rem', fontWeight: 900, color: '#00BAF2' }}>
                          ₹
                        </Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    bgcolor: '#F8FAFC',
                    borderRadius: '14px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#E2E8F0',
                      borderWidth: '1.5px',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00BAF2',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#00BAF2',
                      borderWidth: '2px',
                      boxShadow: '0 0 0 4px rgba(0, 186, 242, 0.12)',
                    },
                    '& .MuiInputBase-input': {
                      color: '#0F172A',
                      padding: '14px 16px',
                      fontSize: '1.25rem',
                      fontWeight: 900,
                    },
                  }}
                />
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, pt: 0, gap: 1 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setPaymentDialogOpen(false)}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  fontWeight: 800,
                  textTransform: 'none',
                  color: '#64748B',
                  borderColor: '#CBD5E1',
                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                fullWidth
                onClick={handleSendPayment}
                disabled={transferMutation.isPending}
                startIcon={<SendIcon />}
                sx={{
                  py: 1.4,
                  borderRadius: '14px',
                  fontWeight: 900,
                  fontSize: '1rem',
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #00BAF2 0%, #0082CD 100%)',
                  color: '#FFFFFF',
                  boxShadow: '0 8px 20px rgba(0, 186, 242, 0.35)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0082CD 0%, #0052cc 100%)',
                    boxShadow: '0 10px 24px rgba(0, 186, 242, 0.45)',
                  },
                }}
              >
                {transferMutation.isPending ? 'Processing...' : 'Pay Now'}
              </Button>
            </DialogActions>
          </Dialog>
        )}
      </AnimatePresence>

      {/* Share to Chat Dialog */}
      <Dialog open={shareOpen} onClose={() => setShareOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: '24px', p: 1 } }}>
        <DialogTitle sx={{ fontWeight: 900, color: '#0F172A', pb: 1 }}>
          Share QR to Chat
        </DialogTitle>
        <DialogContent sx={{ p: 2.5 }}>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Send your P2P QR directly to a contact in your chat rooms.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by Mobile No..."
              value={searchMobile}
              onChange={(e) => setSearchMobile(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: '#64748B' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                bgcolor: '#F8FAFC',
                borderRadius: '12px',
                '& fieldset': { borderColor: '#E2E8F0' },
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearchMember}
              disabled={searchingMember}
              sx={{
                bgcolor: '#00BAF2',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 800,
                textTransform: 'none',
                px: 2.5,
                '&:hover': { bgcolor: '#0082CD' },
              }}
            >
              {searchingMember ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : 'Find'}
            </Button>
          </Box>

          {foundMember && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                mb: 2,
                borderRadius: '14px',
                bgcolor: '#F0F9FF',
                border: '1.5px solid #BAE6FD',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#00BAF2', fontSize: '0.9rem', fontWeight: 800 }}>
                  {(foundMember.Name || 'M').charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                    {foundMember.Name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748B' }}>
                    {foundMember.mobile}
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="contained"
                disabled={sendingRoomId === foundMember.chatRoom?._id}
                onClick={() => handleSendQRToRoom(foundMember.chatRoom?._id, foundMember.Name)}
                startIcon={<SendIcon sx={{ fontSize: '14px !important' }} />}
                sx={{
                  bgcolor: '#00BAF2',
                  color: '#FFFFFF',
                  borderRadius: '10px',
                  fontWeight: 800,
                  fontSize: '0.75rem',
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#0082CD' },
                }}
              >
                Send
              </Button>
            </Paper>
          )}

          <Divider sx={{ my: 2 }}>
            <Chip label="Or Select Recent Chat" size="small" sx={{ fontSize: '0.7rem', fontWeight: 700 }} />
          </Divider>

          {loadingRooms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ color: '#00BAF2' }} />
            </Box>
          ) : chatRooms.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#94A3B8', textAlign: 'center', display: 'block', py: 2 }}>
              No recent chat conversations found.
            </Typography>
          ) : (
            <List sx={{ maxHeight: 200, overflowY: 'auto', p: 0 }}>
              {chatRooms.map((room) => {
                const other = room.participants?.find((p: any) => p._id !== currentUserId) || {};
                const name = other.Name || other.name || other.username || 'Member';
                return (
                  <ListItemButton
                    key={room._id}
                    onClick={() => handleSendQRToRoom(room._id, name)}
                    disabled={sendingRoomId === room._id}
                    sx={{
                      borderRadius: '12px',
                      mb: 0.8,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      '&:hover': { bgcolor: '#F0F9FF', borderColor: '#00BAF2' },
                    }}
                  >
                    <Avatar sx={{ width: 34, height: 34, mr: 1.5, bgcolor: '#00BAF2', fontSize: '0.85rem', fontWeight: 800 }}>
                      {name.charAt(0).toUpperCase()}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: '#0F172A' }}>
                        {name}
                      </Typography>
                    </Box>
                    <SendIcon sx={{ color: '#00BAF2', fontSize: 18 }} />
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setShareOpen(false)} sx={{ color: '#64748B', fontWeight: 700, textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyQR;
