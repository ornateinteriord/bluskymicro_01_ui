import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Paper, Button, IconButton, Avatar, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import PaymentsIcon from '@mui/icons-material/Payments';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SendIcon from '@mui/icons-material/Send';
import InventoryIcon from '@mui/icons-material/Inventory';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import AddIcon from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import LogoutIcon from '@mui/icons-material/Logout';
import GroupsIcon from '@mui/icons-material/Groups';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import { toast } from 'react-toastify';

import TokenService from '../../../api/token/tokenService';
import { useVerifyPayment, parsePaymentRedirectParams, useGetTransactionDetails, useGetWalletOverview, useGetMemberDetails, useGetDailyPayout } from '../../../api/Memeber';

import ProductsContainer from './ProductsContainer';
import ReTopupDialog from './ReTopupDialog';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const carouselSlides = [
  {
    id: 1,
    title: '⚡ Instant Add Credit',
    desc: 'Zero fees on deposit requests. Fast credit approval.',
    badge: 'PAYTM WALLET',
    actionText: 'Add Fund',
    route: '/user/load-fund',
    bg: 'linear-gradient(135deg, #002244 0%, #004b99 55%, #0099ff 100%)',
    accent: '#00e5ff',
  },
  {
    id: 2,
    title: '🎁 Refer & Earn Rewards',
    desc: 'Share your referral link with friends and earn rewards.',
    badge: 'CASHBACK',
    actionText: 'Invite',
    route: '/user/team/new-register',
    bg: 'linear-gradient(135deg, #001e3d 0%, #003366 55%, #0077cc 100%)',
    accent: '#ffea79',
  },
  {
    id: 3,
    title: '🛡️ Member P2P Transfer',
    desc: 'Send wallet funds instantly to any member via QR Code.',
    badge: '0% FEES',
    actionText: 'Transfer',
    route: '/user/p2p-transfer',
    bg: 'linear-gradient(135deg, #002952 0%, #005299 55%, #00b4d8 100%)',
    accent: '#a7f3d0',
  },
];

const DashboardCarousel: React.FC<{ navigate: (to: string) => void }> = ({ navigate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = carouselSlides[currentSlide];

  return (
    <Box sx={{ mb: 3, width: '100%', maxWidth: '420px' }}>
      <Paper
        elevation={0}
        onClick={() => navigate(slide.route)}
        sx={{
          position: 'relative',
          borderRadius: '18px',
          background: slide.bg,
          color: '#ffffff',
          p: { xs: 1.8, sm: 2 },
          boxShadow: '0 8px 24px rgba(0, 51, 102, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          minHeight: '105px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 12px 28px rgba(0, 51, 102, 0.35)',
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: -25,
            right: -25,
            width: 90,
            height: 90,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255, 255, 255, 0.25) 0%, transparent 70%)',
          }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <Typography
            sx={{
              fontSize: '0.65rem',
              fontWeight: 800,
              color: slide.accent,
              letterSpacing: '0.8px',
              bgcolor: 'rgba(0,0,0,0.3)',
              px: 1,
              py: 0.3,
              borderRadius: '6px',
              textTransform: 'uppercase',
            }}
          >
            {slide.badge}
          </Typography>
        </Box>

        <Box sx={{ zIndex: 1, my: 0.4 }}>
          <Typography sx={{ fontWeight: 800, fontSize: { xs: '0.92rem', sm: '0.98rem' }, color: '#ffffff', mb: 0.2 }}>
            {slide.title}
          </Typography>
          <Typography sx={{ fontSize: '0.74rem', color: '#e0f2fe', lineHeight: 1.3, opacity: 0.95 }}>
            {slide.desc}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1, pt: 0.4 }}>
          <Box sx={{ display: 'flex', gap: 0.8 }}>
            {carouselSlides.map((_, idx) => (
              <Box
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentSlide(idx);
                }}
                sx={{
                  width: currentSlide === idx ? 16 : 6,
                  height: 6,
                  borderRadius: '3px',
                  bgcolor: currentSlide === idx ? slide.accent : 'rgba(255, 255, 255, 0.4)',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Box>
          <Typography
            sx={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: slide.accent,
            }}
          >
            {slide.actionText} →
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [reTopupDialogOpen, setReTopupDialogOpen] = useState(false);
  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails } = useGetMemberDetails(memberId);
  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();
  const { refetch: refetchTransactions } = useGetTransactionDetails("all");
  useGetDailyPayout(memberId);

  // Backend provides whether user has an initial investment (canReTopup / hasInvestment)
  const hasInvestment = Boolean(
    walletOverview?.hasInvestment ??
    walletOverview?.data?.hasInvestment ??
    memberDetails?.hasInvestment ??
    memberDetails?.data?.hasInvestment ??
    ((Number(walletOverview?.totalPackages ?? walletOverview?.data?.totalPackages ?? memberDetails?.totalPackages ?? memberDetails?.package_value ?? 0)) > 0)
  );

  const handleCopyReferralLink = () => {
    const code = memberDetails?.Member_id || memberDetails?.member_id || memberId;
    if (!code) return;
    const referralLink = `${window.location.origin}/register?ref=${code}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => toast.success('Referral link copied to clipboard!'))
      .catch(() => toast.error('Failed to copy link'));
  };

  const handleShareReferral = async () => {
    const code = memberDetails?.Member_id || memberDetails?.member_id || memberId;
    if (!code) return;
    const referralLink = `${window.location.origin}/register?ref=${code}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join Blusky & Start Earning',
          text: `Join Blusky with my referral code ${code} and unlock direct commissions & brokerage rewards!`,
          url: referralLink,
        });
      } catch (err) {
        // User dismissed share dialog
      }
    } else {
      handleCopyReferralLink();
    }
  };

  const handleLogout = () => {
    setLogoutDialogOpen(false);
    TokenService.removeToken();
    window.dispatchEvent(new Event("storage"));
    navigate("/login");
  };

  useEffect(() => {
    const paymentParams = parsePaymentRedirectParams(searchParams);
    if (paymentParams.order_id && paymentParams.payment_status && !paymentProcessed) {
      setPaymentProcessed(true);
      verifyPayment(paymentParams.order_id, {
        onSuccess: () => {
          setSearchParams({});
          refetchTransactions();
          refetchMemberDetails();
        },
        onError: () => setSearchParams({})
      });
    }
  }, [searchParams, paymentProcessed, verifyPayment, setSearchParams, refetchTransactions, refetchMemberDetails]);

  const quickAccessGroups = [
    {
      title: "PROFILE & SECURITY",
      items: [
        { label: "Profile", icon: <AccountCircleIcon />, route: "/user/account/profile", color: '#2563EB' },
        { label: "KYC Verify", icon: <VerifiedUserIcon />, route: "/user/account/kyc", color: "#0D9488" },
        { label: "Security", icon: <LockIcon />, route: "/user/account/change-password", color: "#EA580C" },
      ]
    },
    {
      title: "TEAM & NETWORK",
      items: [
        { label: "New Member", icon: <PersonAddAltIcon />, route: "/user/team/new-register", color: "#8B5CF6" },
      ]
    }
  ];

  const quickAccessServices = [
    { label: "Transfer", icon: <SyncAltIcon />, route: "/user/transfer", color: "#6D214F" },
    { label: "Scan & Pay", icon: <QrCode2Icon />, route: "/user/my-qr", color: "#6D214F" },
    { label: "P2P Transfer", icon: <SendIcon />, route: "/user/p2p-transfer", color: "#6D214F" },
    { label: "Invest Amount", icon: <InventoryIcon />, route: "/user/new-subscription", color: "#6D214F" },
    { label: "My Investments", icon: <ReceiptLongIcon />, route: "/user/my-subscriptions", color: "#6D214F" },
  ];

  return (
    <Box sx={{
      pb: 8,
      bgcolor: '#FFF8F0',
      minHeight: '100vh',
      px: { xs: 2, sm: 3, md: 5, lg: 8 },
      pt: { xs: 2, md: 3 },
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {isVerifyingPayment && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(45,15,30,0.7)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={60} sx={{ color: '#F4C95D', mb: 2 }} />
          <Typography variant="h6" sx={{ color: '#FFF8F0', fontWeight: 700 }}>Verifying payment...</Typography>
        </Box>
      )}

      {/* Top Paytm Style Plain App Header */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '420px',
        mb: 2.5,
        mt: 0.5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            onClick={() => navigate('/user/account/profile')}
            sx={{
              width: 44,
              height: 44,
              bgcolor: '#6D214F',
              color: '#FFF8F0',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(109,33,79,0.2)',
              border: '2px solid #E5989B'
            }}
          >
            {(memberDetails?.Name || 'U').charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '0.72rem', color: '#7a5060', fontWeight: 600 }}>
              Welcome back 👋
            </Typography>
            <Typography sx={{ fontSize: '1rem', fontWeight: 900, color: '#2d0f1e', lineHeight: 1.2 }}>
              {memberDetails?.Name || 'Member'}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => navigate('/user/my-qr')}
            sx={{
              bgcolor: '#ffffff',
              color: '#6D214F',
              border: '1px solid #f0d0d8',
              borderRadius: '12px',
              p: 1,
              '&:hover': { bgcolor: '#FFF8F0' }
            }}
          >
            <QrCodeScannerIcon sx={{ fontSize: 22 }} />
          </IconButton>
          <IconButton
            onClick={() => setLogoutDialogOpen(true)}
            sx={{
              bgcolor: '#ffffff',
              color: '#c97579',
              border: '1px solid #f0d0d8',
              borderRadius: '12px',
              p: 1,
              '&:hover': { bgcolor: '#ffeef0' }
            }}
          >
            <LogoutIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Box>
      </Box>

      {/* Small Blue Slideshow Container (Paytm style) */}
      <DashboardCarousel navigate={navigate} />

      {/* User Virtual Card with Member ID & User ID */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        height: '210px',
        mb: 3.5,
        borderRadius: '24px',
        background: 'linear-gradient(135deg, #3d1030 0%, #6D214F 60%, #8f2f68 100%)',
        boxShadow: '0 16px 36px rgba(109, 33, 79, 0.35)',
        overflow: 'hidden',
        color: '#FFF8F0',
        p: 2.8,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        border: '1px solid rgba(244, 201, 93, 0.3)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(244, 201, 93, 0.2) 0%, transparent 70%)',
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: -30,
          left: -30,
          width: 140,
          height: 140,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(229, 152, 155, 0.2) 0%, transparent 70%)',
        }
      }}>
        {/* Card Header: Chip & ECASH Logo */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 32,
              height: 24,
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #F4C95D 0%, #e6be4e 100%)',
              border: '1px solid #d4a83a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 6px rgba(244,201,93,0.3)'
            }}>
              <Box sx={{ width: 14, height: 10, border: '1px solid rgba(45,15,30,0.3)', borderRadius: '2px' }} />
            </Box>
            <Typography
              sx={{
                fontWeight: 900,
                fontSize: '1.25rem',
                letterSpacing: '2px',
                color: '#F4C95D',
                textShadow: '0 2px 8px rgba(0,0,0,0.4)',
                userSelect: 'none'
              }}
            >
              ECASH
            </Typography>
          </Box>
        </Box>

        {/* Middle Section: Login ID (Left) & User ID (Right) */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          zIndex: 1,
          px: 0.5 
        }}>
          <Box>
            <Typography sx={{ color: '#E5989B', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              Login ID
            </Typography>
            <Typography sx={{ 
              fontFamily: 'monospace', 
              fontSize: { xs: '1.05rem', sm: '1.2rem' }, 
              fontWeight: 800, 
              color: '#FFF8F0',
              letterSpacing: '1px',
              textShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }}>
              {memberDetails?.Member_id || memberDetails?.member_id || memberId || 'N/A'}
            </Typography>
          </Box>

          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ color: '#E5989B', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
              User ID
            </Typography>
            <Typography sx={{ 
              fontFamily: 'monospace', 
              fontSize: { xs: '1.05rem', sm: '1.2rem' }, 
              fontWeight: 800, 
              color: '#F4C95D',
              letterSpacing: '1px',
              textShadow: '0 2px 6px rgba(0,0,0,0.4)'
            }}>
              {memberDetails?.member_code || memberDetails?.user_id || memberDetails?.reference_id || '0101'}
            </Typography>
          </Box>
        </Box>

        {/* Bottom Section: Name */}
        <Box sx={{ zIndex: 1 }}>
          <Typography sx={{ color: '#E5989B', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
            Name
          </Typography>
          <Typography sx={{ 
            fontSize: { xs: '1rem', sm: '1.1rem' }, 
            fontWeight: 800, 
            textTransform: 'uppercase', 
            letterSpacing: '1.5px', 
            color: '#FFF8F0',
            textShadow: '0 2px 6px rgba(0,0,0,0.4)'
          }}>
            {memberDetails?.Name || memberDetails?.name || 'Member'}
          </Typography>
        </Box>
      </Box>

      {/* Profile Settings (Quick Access Grid) immediately after Card */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <Typography sx={{ color: '#6D214F', fontWeight: 900, mb: 2, textAlign: 'left', px: 0.5, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '1rem' }}>
          Profile Settings
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: { xs: 1.5, sm: 2.5 } }}>
          {quickAccessGroups.flatMap(group => group.items).map((item: any, i: number) => (
            <Box
              key={i}
              onClick={() => item.onClick ? item.onClick() : navigate(item.route)}
              sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                cursor: 'pointer', p: 1, borderRadius: '16px', transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{
                width: { xs: 54, sm: 62 },
                height: { xs: 54, sm: 62 },
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #00BAF2 0%, #0082CD 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 186, 242, 0.35)',
                '&:hover': { 
                  background: 'linear-gradient(135deg, #0082CD 0%, #0052cc 100%)',
                  boxShadow: '0 6px 18px rgba(0, 186, 242, 0.5)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}>
                {React.cloneElement(item.icon, { sx: { fontSize: { xs: 26, sm: 30 }, color: '#FFFFFF' } })}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.72rem', sm: '0.8rem' }, textAlign: 'center', color: '#2d0f1e' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Quick Access (Out of container) below Profile Settings */}
      <Box sx={{ mb: 4, width: '100%' }}>
        {/* Header with Title & View All */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          px: 0.5
        }}>
          <Typography sx={{
            color: '#6D214F',
            fontWeight: 900,
            fontSize: '1rem',
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            Quick Access
          </Typography>
        </Box>

        {/* Quick Access Horizontal Scrollable Icons */}
        <Box sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: { xs: 1.5, sm: 2.5 },
          py: 0.5,
          px: 0.5,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {quickAccessServices.map((item, i) => (
            <Box
              key={i}
              onClick={() => navigate(item.route)}
              sx={{
                flex: { xs: '0 0 calc(25% - 12px)', sm: '0 0 calc(25% - 18px)' },
                minWidth: { xs: '70px', sm: '78px' },
                scrollSnapAlign: 'start',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 0.5,
                borderRadius: '16px',
                transition: 'all 0.2s',
                '&:hover': { transform: 'translateY(-2px)' }
              }}
            >
              <Box sx={{
                width: { xs: 54, sm: 62 },
                height: { xs: 54, sm: 62 },
                borderRadius: '18px',
                background: 'linear-gradient(135deg, #00BAF2 0%, #0082CD 100%)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0, 186, 242, 0.35)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0082CD 0%, #0052cc 100%)',
                  boxShadow: '0 6px 18px rgba(0, 186, 242, 0.5)',
                  transform: 'scale(1.05)'
                },
                transition: 'all 0.2s ease'
              }}>
                {React.cloneElement(item.icon, { sx: { fontSize: { xs: 26, sm: 30 }, color: '#FFFFFF' } })}
              </Box>
              <Typography sx={{
                fontWeight: 700,
                fontSize: { xs: '0.72rem', sm: '0.8rem' },
                textAlign: 'center',
                color: '#2d0f1e',
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                width: '100%'
              }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            p: 1,
            bgcolor: '#ffffff',
            boxShadow: '0 16px 40px rgba(109,33,79,0.18)'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#2d0f1e' }}>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#7a5060' }}>
            Are you sure you want to log out of your Ecash account?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setLogoutDialogOpen(false)}
            sx={{ color: '#7a5060', fontWeight: 700, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            sx={{
              bgcolor: '#6D214F',
              color: '#FFF8F0',
              fontWeight: 800,
              borderRadius: '12px',
              textTransform: 'none',
              '&:hover': { bgcolor: '#4e1739' }
            }}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invest Amount */}
      <ProductsContainer />

      {/* Credits Card */}
      <Paper elevation={0} sx={{
        p: { xs: 2.2, sm: 3.2, md: 3.8 },
        mb: 4,
        borderRadius: { xs: '24px', sm: '28px' },
        bgcolor: '#FFF8F0',
        border: '1.5px solid #fce8ec',
        boxShadow: '0 10px 30px rgba(109, 33, 79, 0.06)',
        width: '100%'
      }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch',
          justifyContent: 'space-between',
          gap: { xs: 2, sm: 3, md: 4 },
          width: '100%'
        }}>
          {/* Left Side: Wallet Balance & Credits info (Parallel Left) */}
          <Box 
            onClick={() => navigate('/user/transactions?type=credits')}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minWidth: 0,
              gap: { xs: 1.2, sm: 1.6, md: 2 },
              bgcolor: '#ffffff',
              border: '1.5px solid #f0d0d8',
              borderRadius: { xs: '20px', sm: '24px' },
              p: { xs: 2.2, sm: 3.2, md: 3.8 },
              minHeight: { xs: '170px', sm: '200px', md: '220px' },
              boxShadow: '0 6px 20px rgba(109, 33, 79, 0.05)',
              transition: 'all 0.2s ease',
              position: 'relative',
              overflow: 'hidden',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 26px rgba(109, 33, 79, 0.12)',
                borderColor: '#e5a5b5'
              }
            }}
          >
            {/* Icon + Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.2, sm: 1.6 } }}>
              <Box sx={{
                p: { xs: 0.5, sm: 1.1 },
                borderRadius: '12px',
                bgcolor: 'rgba(244, 201, 93, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(244, 201, 93, 0.6)',
                flexShrink: 0
              }}>
                <PaymentsIcon sx={{ fontSize: { xs: 22, sm: 26, md: 30 }, color: '#6D214F' }} />
              </Box>
              <Typography sx={{
                color: '#6D214F',
                fontWeight: 900,
                fontSize: { xs: '1.05rem', sm: '1.2rem', md: '1.35rem' },
                lineHeight: 1.2,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                letterSpacing: '0.8px'
              }}>
                Credits
              </Typography>
            </Box>

            {/* Big Rupee Balance (Main Wallet: for Add Credit, Withdrawal, New Subscription) */}
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: { xs: 0.5, sm: 0.8 }, my: { xs: 0.5, sm: 0.8 } }}>
              <Typography sx={{
                color: '#6D214F',
                fontWeight: 900,
                fontSize: { xs: '1.9rem', sm: '2.6rem', md: '3.2rem' },
                lineHeight: 1,
                letterSpacing: '-0.8px'
              }}>
                ₹{Number(walletOverview?.balance ?? walletOverview?.availableForWithdrawal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Typography>
            </Box>

            <Typography sx={{
              color: '#5e3848',
              lineHeight: 1.5,
              fontSize: { xs: '0.88rem', sm: '0.96rem', md: '1.05rem' },
              fontWeight: 500,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              Fund your wallet to invest, unlock returns, and start growing your earnings.
            </Typography>
          </Box>

          {/* Right Side: 3 Action Buttons Stacked Parallel on Right */}
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: { xs: 1.2, sm: 1.6, md: 2 },
            width: { xs: '135px', sm: '175px', md: '210px' },
            flexShrink: 0,
            justifyContent: 'space-between'
          }}>
            {/* 1. Add */}
            <Button
              variant="contained"
              onClick={() => navigate('/user/load-fund')}
              startIcon={<AddIcon sx={{ fontSize: { xs: '20px !important', sm: '23px !important' } }} />}
              fullWidth
              sx={{
                flex: 1,
                minHeight: { xs: '46px', sm: '54px', md: '60px' },
                background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: '#FFF8F0',
                borderRadius: { xs: '12px', sm: '16px' },
                px: { xs: 1.5, sm: 2.2 },
                py: { xs: 1, sm: 1.3 },
                fontWeight: 800,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' },
                textTransform: 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(109, 33, 79, 0.24)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  boxShadow: '0 8px 20px rgba(109, 33, 79, 0.35)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Add
            </Button>

            {/* 2. Withdraw */}
            <Button
              variant="contained"
              onClick={() => navigate('/user/wallet?type=withdrawal')}
              startIcon={<PaymentsIcon sx={{ fontSize: { xs: '20px !important', sm: '23px !important' } }} />}
              fullWidth
              sx={{
                flex: 1,
                minHeight: { xs: '46px', sm: '54px', md: '60px' },
                background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: '#FFF8F0',
                borderRadius: { xs: '12px', sm: '16px' },
                px: { xs: 1.5, sm: 2.2 },
                py: { xs: 1, sm: 1.3 },
                fontWeight: 800,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.05rem' },
                textTransform: 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(109, 33, 79, 0.24)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  boxShadow: '0 8px 20px rgba(109, 33, 79, 0.35)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Withdraw
            </Button>

            {/* 3. Activation */}
            <Button
              variant="contained"
              onClick={() => navigate('/user/new-subscription')}
              startIcon={<BoltIcon sx={{ fontSize: { xs: '20px !important', sm: '23px !important' } }} />}
              fullWidth
              sx={{
                flex: 1,
                minHeight: { xs: '46px', sm: '54px', md: '60px' },
                background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: '#FFF8F0',
                borderRadius: { xs: '12px', sm: '16px' },
                px: { xs: 1.5, sm: 2.2 },
                py: { xs: 1, sm: 1.3 },
                fontWeight: 800,
                fontSize: { xs: '0.88rem', sm: '0.98rem', md: '1.02rem' },
                textTransform: 'none',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(109, 33, 79, 0.24)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  boxShadow: '0 8px 20px rgba(109, 33, 79, 0.35)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.2s ease'
              }}
            >
              Activation
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Simple & Sleek Refer & Earn Bar */}
      <Box sx={{ mt: 2.5, mb: 3.5 }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            p: { xs: '12px 16px', sm: '14px 20px' },
            borderRadius: '16px',
            background: 'linear-gradient(135deg, #0F766E 0%, #0D9488 60%, #14B8A6 100%)',
            boxShadow: '0 8px 20px rgba(13, 148, 136, 0.22)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            color: '#FFFFFF',
          }}
        >
          {/* Left: Icon + Title & Code */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
            <Box
              sx={{
                width: { xs: 38, sm: 42 },
                height: { xs: 38, sm: 42 },
                borderRadius: '12px',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(4px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#FFFFFF',
              }}
            >
              <CardGiftcardIcon sx={{ fontSize: { xs: 22, sm: 24 } }} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: '0.95rem', sm: '1.05rem' },
                  color: '#FFFFFF',
                  lineHeight: 1.2,
                }}
              >
                Refer & Earn
              </Typography>
              <Typography
                noWrap
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.82rem' },
                  color: '#CCFBF1',
                  fontWeight: 500,
                  mt: 0.2,
                }}
              >
                Invite friends and earn rewards
              </Typography>
            </Box>
          </Box>

          {/* Right: Copy & Share Buttons */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
            <Button
              onClick={handleCopyReferralLink}
              startIcon={<ContentCopyIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                bgcolor: '#FFFFFF',
                color: '#0F766E',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: { xs: '0.78rem', sm: '0.84rem' },
                textTransform: 'none',
                px: { xs: 1.4, sm: 1.8 },
                py: 0.7,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                '&:hover': {
                  bgcolor: '#F0FDFA',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.15s ease',
              }}
            >
              Copy Link
            </Button>
            <IconButton
              onClick={handleShareReferral}
              title="Share"
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                color: '#FFFFFF',
                borderRadius: '10px',
                width: 36,
                height: 36,
                border: '1px solid rgba(255, 255, 255, 0.3)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                },
              }}
            >
              <ShareIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Paper>
      </Box>

      {/* Team Performance */}
      <Box sx={{ mb: 3.5 }}>
        <Typography sx={{ color: '#2d0f1e', fontWeight: 900, mb: 1.4, fontSize: { xs: '1rem', sm: '1.15rem' }, letterSpacing: '-0.3px' }}>
          Team Performance
        </Typography>
        
        {/* Compact Brokerage Performance Cards */}
        <Box sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: { xs: 1, sm: 1.5 },
          pb: 1,
          pt: 0.2,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {/* 1. My Member Card */}
          <Box
            onClick={() => navigate('/user/team')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: '1px solid #BFDBFE',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(59, 130, 246, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(59, 130, 246, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#1e3a8a', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                My Member
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Total network
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(30, 58, 138, 0.06)'
              }}>
                <GroupsIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#2563eb' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                py: 0.4,
                px: 1,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(37, 99, 235, 0.08)'
              }}>
                <Typography sx={{ fontWeight: 900, color: '#1e3a8a', fontSize: { xs: '0.95rem', sm: '1.15rem' }, lineHeight: 1 }}>
                  {Math.max(memberDetails?.registration_stats?.total || 0, memberDetails?.total_team || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* 2. My Direct Card */}
          <Box 
            onClick={() => navigate('/user/team/direct')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #FFF7ED 0%, #FFEDD5 100%)',
              border: '1px solid #FED7AA',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(234, 88, 12, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(234, 88, 12, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#7c2d12', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                My Direct
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Sponsored
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(124, 45, 18, 0.06)'
              }}>
                <PersonAddAltIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#ea580c' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #fed7aa',
                borderRadius: '10px',
                py: 0.4,
                px: 1,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(234, 88, 12, 0.08)'
              }}>
                <Typography sx={{ fontWeight: 900, color: '#7c2d12', fontSize: { xs: '0.95rem', sm: '1.15rem' }, lineHeight: 1 }}>
                  {Math.max(memberDetails?.registration_stats?.direct || 0, memberDetails?.direct_referrals?.length || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Earnings Summary - Compact 3 in Row Cards */}
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ color: '#2d0f1e', fontWeight: 900, mb: 1.4, fontSize: { xs: '1rem', sm: '1.15rem' }, letterSpacing: '-0.3px' }}>
          Earnings Summary
        </Typography>

        {/* Scrollable Container (3 cards in row) */}
        <Box sx={{
          display: 'flex',
          overflowX: 'auto',
          gap: { xs: 1, sm: 1.5 },
          pb: 1.2,
          pt: 0.2,
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {/* Card 1: Referral Commission */}
          <Box
            onClick={() => navigate('/user/earnings/referral-bonus')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #E8F8F0 0%, #D5F5E3 100%)',
              border: '1px solid #B7E8D6',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(16, 185, 129, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(16, 185, 129, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#064e3b', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Referral Bonus
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Instant bonus
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(6, 78, 59, 0.06)'
              }}>
                <PaymentsIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#059669' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #a7f3d0',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(5, 150, 105, 0.08)'
              }}>
                <Typography sx={{ color: '#065f46', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number(walletOverview?.directBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 2: Brokerage Override */}
          <Box
            onClick={() => navigate('/user/earnings/level-benefits')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #FEF9E7 0%, #FEF3C7 100%)',
              border: '1px solid #FDE68A',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(217, 119, 6, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#78350f', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Level Bonus
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Level progression
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(120, 53, 15, 0.06)'
              }}>
                <AccountTreeIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#d97706' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #fde68a',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(217, 119, 6, 0.08)'
              }}>
                <Typography sx={{ color: '#92400e', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 3: Direct Commission */}
          <Box
            onClick={() => navigate('/user/earnings/single-level-income-history')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #FDF2F4 0%, #FEE2E2 100%)',
              border: '1px solid #FECACA',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(225, 29, 72, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(225, 29, 72, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#881337', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Daily Incentive
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Structure earnings
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(136, 19, 55, 0.06)'
              }}>
                <TrendingUpIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#e11d48' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(225, 29, 72, 0.08)'
              }}>
                <Typography sx={{ color: '#9f1239', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number((parseFloat(walletOverview?.singleLineIncome) || 0)).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Card 4: Total Withdrawal */}
          <Box
            onClick={() => navigate('/user/transactions?type=Withdrawal')}
            sx={{
              flex: { xs: '0 0 calc(33.33% - 7px)', sm: '0 0 calc(33.33% - 10px)', md: '0 0 160px' },
              minWidth: { xs: '115px', sm: '135px' },
              scrollSnapAlign: 'start',
              borderRadius: { xs: '20px', sm: '22px' },
              background: 'linear-gradient(180deg, #F5F3FF 0%, #EDE9FE 100%)',
              border: '1px solid #DDD6FE',
              p: { xs: 1.4, sm: 1.8 },
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: { xs: '165px', sm: '185px' },
              boxShadow: '0 4px 14px rgba(109, 33, 79, 0.08)',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 8px 18px rgba(109, 33, 79, 0.14)' }
            }}
          >
            <Box>
              <Typography sx={{ color: '#4c1d95', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2, mb: 0.2 }}>
                Withdrawals
              </Typography>
              <Typography sx={{ color: '#475569', fontSize: '9.5px', fontWeight: 600, display: { xs: 'none', sm: 'block' } }}>
                Processed payouts
              </Typography>
            </Box>

            <Box sx={{ mt: 'auto', pt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{
                width: { xs: 52, sm: 62 },
                height: { xs: 52, sm: 62 },
                borderRadius: '18px',
                bgcolor: 'rgba(255,255,255,0.7)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1,
                boxShadow: '0 4px 12px rgba(76, 29, 149, 0.06)'
              }}>
                <AttachMoneyIcon sx={{ fontSize: { xs: 32, sm: 40 }, color: '#7c3aed' }} />
              </Box>
              <Box sx={{
                bgcolor: '#ffffff',
                border: '1px solid #ddd6fe',
                borderRadius: '10px',
                py: 0.4,
                px: 0.8,
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 2px 6px rgba(124, 58, 237, 0.08)'
              }}>
                <Typography sx={{ color: '#5b21b6', fontWeight: 900, fontSize: { xs: '0.8rem', sm: '0.92rem' }, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  ₹{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Re-Topup Section (Only displayed once user has made an initial investment) */}
      {hasInvestment && (
        <>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.4 }}>
              <Typography sx={{ color: '#2d0f1e', fontWeight: 900, fontSize: { xs: '1rem', sm: '1.15rem' }, letterSpacing: '-0.3px' }}>
                Re-Topup
              </Typography>
            </Box>

            {/* Single Re-Topup Container with Re-Topup Button Inside */}
            <Box
              sx={{
                borderRadius: { xs: '20px', sm: '22px' },
                background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                border: '1.5px solid #BAE6FD',
                p: { xs: 2, sm: 2.5 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                boxShadow: '0 4px 16px rgba(0, 186, 242, 0.08)',
                transition: 'all 0.2s ease',
                '&:hover': {
                  boxShadow: '0 6px 20px rgba(0, 186, 242, 0.14)'
                }
              }}
            >
              {/* Left Side: Icon & Info */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
                <Box sx={{
                  width: { xs: 46, sm: 52 },
                  height: { xs: 46, sm: 52 },
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #00BAF2 0%, #0082CD 100%)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 186, 242, 0.3)',
                  flexShrink: 0
                }}>
                  <AutorenewIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: '#FFFFFF' }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#0369a1', fontWeight: 900, fontSize: { xs: '0.85rem', sm: '0.95rem' }, lineHeight: 1.2 }}>
                    Re-Topup
                  </Typography>
                  <Typography sx={{ color: '#64748B', fontWeight: 600, fontSize: { xs: '0.75rem', sm: '0.82rem' }, mt: 0.3 }}>
                    Credit Balance: <strong style={{ color: '#0284c7' }}>₹{Number(walletOverview?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                  </Typography>
                </Box>
              </Box>

              {/* Right Side: Re-Topup Button Inside Container */}
              <Button
                size="small"
                variant="contained"
                onClick={() => setReTopupDialogOpen(true)}
                startIcon={<AutorenewIcon sx={{ fontSize: 18 }} />}
                sx={{
                  background: 'linear-gradient(135deg, #00BAF2 0%, #0082CD 100%)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: { xs: '0.8rem', sm: '0.88rem' },
                  borderRadius: '12px',
                  px: { xs: 2, sm: 2.8 },
                  py: { xs: 0.8, sm: 1 },
                  textTransform: 'none',
                  boxShadow: '0 3px 10px rgba(0, 186, 242, 0.35)',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0082CD 0%, #0052cc 100%)',
                    boxShadow: '0 5px 14px rgba(0, 186, 242, 0.45)'
                  }
                }}
              >
                Re-Topup
              </Button>
            </Box>
          </Box>

          {/* Re-Topup Dialog */}
          <ReTopupDialog open={reTopupDialogOpen} onClose={() => setReTopupDialogOpen(false)} />
        </>
      )}
    </Box>
  );
};

export default UserDashboard;
