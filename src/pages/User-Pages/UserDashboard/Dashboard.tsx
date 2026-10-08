import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Typography, Box, CircularProgress, Paper, Button, IconButton } from '@mui/material';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ChatIcon from '@mui/icons-material/Chat';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { toast } from 'react-toastify';

import TokenService from '../../../api/token/tokenService';
import { useVerifyPayment, parsePaymentRedirectParams, useGetTransactionDetails, useGetWalletOverview, useGetMemberDetails, useGetDailyPayout } from '../../../api/Memeber';

import ProductsContainer from './ProductsContainer';

const UserDashboard = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentProcessed, setPaymentProcessed] = useState(false);
  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails, refetch: refetchMemberDetails } = useGetMemberDetails(memberId);
  const { mutate: verifyPayment, isPending: isVerifyingPayment } = useVerifyPayment();
  const { refetch: refetchTransactions } = useGetTransactionDetails("all");
  useGetDailyPayout(memberId);

  const handleCopyReferralLink = () => {
    if (!memberDetails?.Member_id) return;
    const referralLink = `${window.location.origin}/register?ref=${memberDetails.Member_id}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => toast.success('Referral link copied!'))
      .catch(() => toast.error('Failed to copy link'));
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
      title: "ACCOUNT",
      items: [
        { label: "Profile", icon: <AccountCircleIcon />, route: "/user/account/profile", color: '#6D214F' },
        { label: "KYC", icon: <VerifiedUserIcon />, route: "/user/account/kyc", color: "#E5989B" },
        { label: "Password", icon: <LockIcon />, route: "/user/account/change-password", color: "#F4C95D" },
        { label: "Portfolio", icon: <AccountBalanceWalletIcon />, route: "/user/portfolio", color: "#6D214F" },
      ]
    },
    {
      title: "TEAM & TOOLS",
      items: [
        { label: "New Regi.", icon: <PersonAddAltIcon />, route: "/user/team/new-register", color: "#E5989B" },
        { label: "Chat", icon: <ChatIcon />, route: "/user/chat", color: "#6D214F" },
      ]
    }
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

      {/* User Header - Virtual Debit Card with Plum & Gold Theme */}
      <Box sx={{
        position: 'relative',
        width: '100%',
        maxWidth: '420px',
        height: '210px',
        mb: 3.5,
        mt: 1,
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
          <Typography sx={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '1px', color: '#E5989B', textTransform: 'uppercase' }}>
            VIP Member
          </Typography>
        </Box>

        <Box sx={{ zIndex: 1 }}>
          <Typography sx={{ 
            fontFamily: 'monospace', 
            fontSize: { xs: '1.2rem', sm: '1.35rem' }, 
            letterSpacing: '3px', 
            fontWeight: 700,
            color: '#FFF8F0',
            mb: 1.5,
            textShadow: '0 2px 6px rgba(0,0,0,0.4)'
          }}>
            {memberDetails?.virtual_card_number || '4638 2926 4400 0000'}
          </Typography>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <Box>
              <Typography sx={{ color: '#E5989B', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Cardholder Name
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: '#FFF8F0' }}>
                {memberDetails?.Name || 'Loading...'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ color: '#E5989B', fontSize: '0.62rem', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600 }}>
                Valid
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'monospace', color: '#F4C95D' }}>
                {(() => {
                  const joinDateStr = memberDetails?.createdAt || memberDetails?.Created_at || memberDetails?.JoiningDate || null;
                  const joinDate = joinDateStr ? new Date(joinDateStr) : new Date();
                  if (isNaN(joinDate.getTime())) return "01/24 - 01/27";
                  const validThru = new Date(joinDate);
                  validThru.setFullYear(validThru.getFullYear() + 3);
                  
                  const formatDt = (dt: Date) => `${String(dt.getMonth() + 1).padStart(2, '0')}/${String(dt.getFullYear()).slice(-2)}`;
                  
                  return `${formatDt(joinDate)} - ${formatDt(validThru)}`;
                })()}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Package Deposit */}
      <ProductsContainer />

      {/* Credits Card */}
      <Paper elevation={0} sx={{
        p: { xs: 2.5, sm: 3.5 },
        mb: 3.5,
        borderRadius: '24px',
        bgcolor: '#ffffff',
        border: '1px solid #f0d0d8',
        boxShadow: '0 8px 24px rgba(109, 33, 79, 0.05)',
        width: '100%'
      }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2, 
          width: '100%'
        }}>
          {/* Credits Box */}
          <Box onClick={() => navigate('/user/top-up-wallet')} sx={{
            display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 2.5 },
            borderRadius: '18px', bgcolor: '#FFF8F0', border: '1px solid #fce8ec',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 16px rgba(109,33,79,0.08)' },
            cursor: 'pointer'
          }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
              <Box sx={{ p: 1.2, borderRadius: '12px', bgcolor: 'rgba(244, 201, 93, 0.25)', display: 'flex', height: 'fit-content', border: '1px solid rgba(244,201,93,0.5)' }}>
                <PaymentsIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: '#6D214F' }} />
              </Box>
              <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: { xs: '1.4rem', sm: '1.7rem' }, letterSpacing: '0.5px', m: 0 }}>
                ₹{Number(walletOverview?.topUpBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Typography>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.15rem' }, mb: 0.5 }}>
                Wallet Balance (Credits)
              </Typography>
              <Typography variant="caption" sx={{ color: '#7a5060', display: 'block', lineHeight: 1.4, width: '100%', fontSize: '13px' }}>
                Fund your wallet to unlock packages, deposits, and start growing your returns.
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/user/load-fund');
                  }}
                  sx={{
                    background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                    color: '#FFF8F0',
                    borderRadius: '12px',
                    px: 3,
                    py: 1,
                    fontWeight: 800,
                    fontSize: '0.82rem',
                    textTransform: 'none',
                    boxShadow: '0 4px 14px rgba(109, 33, 79, 0.25)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                      boxShadow: '0 6px 18px rgba(109, 33, 79, 0.35)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Add Credit
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>

      {/* Quick Access Grid */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <Typography variant="h6" sx={{ color: '#6D214F', fontWeight: 900, mb: 2.5, textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '1rem' }}>
          Quick Services
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
                bgcolor: '#ffffff',
                color: item.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(109,33,79,0.06)',
                border: '1.5px solid #f0d0d8',
                '&:hover': { bgcolor: '#FFF8F0', borderColor: '#E5989B', boxShadow: '0 6px 18px rgba(109,33,79,0.12)' },
                transition: 'all 0.2s'
              }}>
                {React.cloneElement(item.icon, { sx: { fontSize: { xs: 26, sm: 30 } } })}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.72rem', sm: '0.8rem' }, textAlign: 'center', color: '#2d0f1e' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Referral Link Card with Plum & Gold Theme */}
      <Box sx={{ mt: 3, mb: 4 }}>
        <Paper elevation={0} sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: '24px',
          background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 60%, #8f2f68 100%)',
          color: '#FFF8F0',
          boxShadow: '0 16px 36px rgba(109, 33, 79, 0.25)',
          border: '1px solid rgba(244, 201, 93, 0.25)',
          width: '100%'
        }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 0.5, color: '#F4C95D', fontSize: { xs: '1.25rem', sm: '1.45rem' } }}>
            Refer & Earn 🎁
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mb: 2.5, opacity: 0.9, lineHeight: 1.4, fontSize: '0.82rem', color: '#FFF8F0' }}>
            Share your exclusive link with friends and earn rewards on every active subscription
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button
              variant="contained"
              startIcon={<ShareIcon />}
              fullWidth
              sx={{
                bgcolor: '#F4C95D',
                color: '#2d0f1e',
                borderRadius: '14px',
                textTransform: 'none',
                fontWeight: 800,
                py: 1.3,
                fontSize: '0.9rem',
                boxShadow: '0 4px 14px rgba(244,201,93,0.35)',
                '&:hover': { bgcolor: '#f8dc8a', transform: 'translateY(-1px)' }
              }}
            >
              Share Now
            </Button>
            <IconButton
              onClick={handleCopyReferralLink}
              sx={{
                bgcolor: '#ffffff',
                color: '#6D214F',
                borderRadius: '14px',
                width: 52,
                height: 52,
                border: '1px solid #f0d0d8',
                '&:hover': { bgcolor: '#FFF8F0' }
              }}
            >
              <ContentCopyIcon />
            </IconButton>
          </Box>
        </Paper>
      </Box>

    </Box>
  );
};

export default UserDashboard;
