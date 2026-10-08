import { Typography, Box, Paper, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddAltIcon from '@mui/icons-material/PersonAddAlt';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import SyncAltIcon from '@mui/icons-material/SyncAlt';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import SendIcon from '@mui/icons-material/Send';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';

import TokenService from '../../../api/token/tokenService';
import { useGetWalletOverview, useGetMemberDetails } from '../../../api/Memeber';

const Portfolio = () => {
  const navigate = useNavigate();
  const memberId = TokenService.getMemberId();
  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails } = useGetMemberDetails(memberId);

  const quickAccessItems = [
    { label: "Transfer", icon: <SyncAltIcon />, route: "/user/transfer", color: "#6D214F" },
    { label: "Scan & Pay", icon: <QrCode2Icon />, route: "/user/my-qr", color: "#6D214F" },
    { label: "P2P Transfer", icon: <SendIcon />, route: "/user/p2p-transfer", color: "#6D214F" },
    { label: "Property Listings", icon: <InventoryIcon />, route: "/user/new-subscription", color: "#6D214F" },
    { label: "My Certificates", icon: <ReceiptLongIcon />, route: "/user/my-subscriptions", color: "#6D214F" },
  ];

  return (
    <Box sx={{
      pb: 10,
      background: '#FFF8F0',
      minHeight: '100vh',
      px: { xs: 2, sm: 3 },
      pt: { xs: 3, sm: 4 },
      maxWidth: '480px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ color: '#6D214F', fontWeight: 900, letterSpacing: '-0.5px' }}>
          My Portfolio
        </Typography>
        <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 600 }}>
          Manage your assets, funds & brokerage earnings
        </Typography>
      </Box>

      {/* Wallet Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr', gap: 2, mb: 4 }}>
        {/* Fixed Deposit */}
        <Box 
          onClick={() => navigate('/user/fixed-deposit-wallet')} 
          sx={{ 
            display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '20px', 
            bgcolor: '#ffffff', border: '1.5px solid #f0d0d8', boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B', boxShadow: '0 8px 24px rgba(109,33,79,0.12)' }, 
            cursor: 'pointer' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(244, 201, 93, 0.2)', display: 'flex', height: 'fit-content' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 26, color: '#6D214F' }} />
            </Box>
            <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', m: 0 }}>
              ₹{Number(walletOverview?.fixedDepositBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '1.05rem', mb: 0.3 }}>Fixed Deposit</Typography>
            <Typography variant="caption" sx={{ color: '#8c6b7d', display: 'block', lineHeight: 1.3, fontSize: '12px' }}>
              Your money securely saved for long-term growth—simple and always accessible.
            </Typography>
          </Box>
        </Box>

        {/* Upgrade / Property Fund */}
        <Box 
          onClick={() => navigate('/user/upgrade-wallet')} 
          sx={{ 
            display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '20px', 
            bgcolor: '#ffffff', border: '1.5px solid #f0d0d8', boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B', boxShadow: '0 8px 24px rgba(109,33,79,0.12)' }, 
            cursor: 'pointer' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(229, 152, 155, 0.25)', display: 'flex', height: 'fit-content' }}>
              <TrendingUpIcon sx={{ fontSize: 26, color: '#6D214F' }} />
            </Box>
            <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', m: 0 }}>
              ₹{Number(walletOverview?.upgradeWalletBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '1.05rem', mb: 0.3 }}>Property Fund</Typography>
            <Typography variant="caption" sx={{ color: '#8c6b7d', display: 'block', lineHeight: 1.3, fontSize: '12px' }}>
              Take your wallet to the next level with more power, flexibility, and rewards.
            </Typography>
          </Box>
        </Box>

        {/* Earnings / Payouts */}
        <Box 
          onClick={() => navigate('/user/wallet')} 
          sx={{ 
            display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '20px', 
            bgcolor: '#ffffff', border: '1.5px solid #f0d0d8', boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B', boxShadow: '0 8px 24px rgba(109,33,79,0.12)' }, 
            cursor: 'pointer' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(109, 33, 79, 0.12)', display: 'flex', height: 'fit-content' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 26, color: '#6D214F' }} />
            </Box>
            <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', m: 0 }}>
              ₹{Number(walletOverview?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '1.05rem', mb: 0.3 }}>Payouts</Typography>
            <Typography variant="caption" sx={{ color: '#8c6b7d', display: 'block', lineHeight: 1.3, fontSize: '12px' }}>
              Watch your funds grow and withdraw them securely anytime.
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/user/wallet?type=withdrawal');
                }}
                sx={{
                  background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                  color: '#FFF8F0',
                  borderRadius: '12px',
                  px: 3,
                  py: 0.7,
                  fontWeight: 800,
                  textTransform: 'none',
                  fontSize: '0.85rem',
                  boxShadow: '0 4px 12px rgba(109, 33, 79, 0.25)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s'
                }}
              >
                Withdraw Now
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Purchase */}
        <Box 
          onClick={() => navigate('/user/purchase-wallet')} 
          sx={{ 
            display: 'flex', flexDirection: 'column', p: 2.5, borderRadius: '20px', 
            bgcolor: '#ffffff', border: '1.5px solid #f0d0d8', boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
            transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B', boxShadow: '0 8px 24px rgba(109,33,79,0.12)' }, 
            cursor: 'pointer' 
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1.5 }}>
            <Box sx={{ p: 1.2, borderRadius: '14px', bgcolor: 'rgba(244, 201, 93, 0.25)', display: 'flex', height: 'fit-content' }}>
              <InventoryIcon sx={{ fontSize: 26, color: '#6D214F' }} />
            </Box>
            <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: '1.4rem', letterSpacing: '0.5px', m: 0 }}>
              ₹{Number((walletOverview as any)?.purchaseBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '1.05rem', mb: 0.3 }}>Purchase Wallet</Typography>
            <Typography variant="caption" sx={{ color: '#8c6b7d', display: 'block', lineHeight: 1.3, fontSize: '12px' }}>
              Manage your purchases and track your active product investments.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Access Icons */}
      <Box sx={{ mb: 4, width: '100%' }}>
        <Typography variant="h6" sx={{ color: '#6D214F', fontWeight: 900, mb: 2.5, textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '1rem' }}>
          Quick Services
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1.5 }}>
          {quickAccessItems.map((item, i) => (
            <Box key={i} onClick={() => navigate(item.route)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
              <Box sx={{ 
                width: 56, 
                height: 56, 
                borderRadius: '18px', 
                bgcolor: '#ffffff', 
                color: '#6D214F',
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(109,33,79,0.06)',
                border: '1.5px solid #f0d0d8',
                transition: '0.2s',
                '&:hover': { bgcolor: '#FFF8F0', borderColor: '#E5989B', boxShadow: '0 6px 18px rgba(109,33,79,0.12)' }
              }}>
                {item.icon}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.72rem', textAlign: 'center', color: '#2d0f1e' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Brokerage Performance */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ color: '#6D214F', fontWeight: 900, mb: 2, fontSize: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Brokerage Performance
        </Typography>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '22px', bgcolor: '#ffffff', border: '1.5px solid #f0d0d8', boxShadow: '0 4px 16px rgba(109,33,79,0.06)' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box 
              onClick={() => navigate('/user/team')}
              sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <GroupsIcon sx={{ fontSize: 32, color: '#6D214F', mb: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>My Agents</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#6D214F', mt: 0.5 }}>{Math.max(memberDetails?.registration_stats?.total || 0, memberDetails?.total_team || 0)}</Typography>
            </Box>
            <Box 
              onClick={() => navigate('/user/team/direct')}
              sx={{ textAlign: 'center', borderLeft: '1.5px solid #f0d0d8', cursor: 'pointer', '&:hover': { opacity: 0.8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <PersonAddAltIcon sx={{ fontSize: 32, color: '#E5989B', mb: 0.5 }} />
              <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '11px' }}>Direct Clients</Typography>
              <Typography variant="h4" sx={{ fontWeight: 900, color: '#6D214F', mt: 0.5 }}>{Math.max(memberDetails?.registration_stats?.direct || 0, memberDetails?.direct_referrals?.length || 0)}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Earnings Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="h6" sx={{ color: '#6D214F', fontWeight: 900, mb: 0.5, fontSize: '1rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Earnings Summary
        </Typography>
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: '22px', bgcolor: '#ffffff', border: '1.5px solid #f0d0d8', boxShadow: '0 4px 16px rgba(109,33,79,0.06)', width: '100%' }}>
          <Stack spacing={2}>
            <Box onClick={() => navigate('/user/earnings/referral-bonus')} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: '16px', bgcolor: '#FFF8F0', border: '1px solid #f0d0d8', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#fdf2f4' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(109, 33, 79, 0.12)', display: 'flex' }}>
                  <PaymentsIcon sx={{ fontSize: 24, color: '#6D214F' }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '0.92rem' }}>Referral Commission</Typography>
                  <Typography variant="caption" sx={{ color: '#8c6b7d', fontSize: '11px' }}>Instant bonus earnings</Typography>
                </Box>
              </Box>
              <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: '1.1rem' }}>
                ₹{Number(walletOverview?.directBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box onClick={() => navigate('/user/earnings/level-benefits')} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: '16px', bgcolor: '#FFF8F0', border: '1px solid #f0d0d8', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#fdf2f4' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(229, 152, 155, 0.25)', display: 'flex' }}>
                  <AccountTreeIcon sx={{ fontSize: 24, color: '#6D214F' }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '0.92rem' }}>Brokerage Override</Typography>
                  <Typography variant="caption" sx={{ color: '#8c6b7d', fontSize: '11px' }}>Level based progression</Typography>
                </Box>
              </Box>
              <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: '1.1rem' }}>
                ₹{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box onClick={() => navigate('/user/earnings/single-level-income-history')} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: '16px', bgcolor: '#FFF8F0', border: '1px solid #f0d0d8', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#fdf2f4' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(244, 201, 93, 0.25)', display: 'flex' }}>
                  <TrendingUpIcon sx={{ fontSize: 24, color: '#6D214F' }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '0.92rem' }}>Direct Commission</Typography>
                  <Typography variant="caption" sx={{ color: '#8c6b7d', fontSize: '11px' }}>Single-leg structure</Typography>
                </Box>
              </Box>
              <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: '1.1rem' }}>
                ₹{Number((parseFloat(walletOverview?.singleLineIncome) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>

            <Box onClick={() => navigate('/user/transactions?type=Withdrawal')} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 1.5, borderRadius: '16px', bgcolor: '#FFF8F0', border: '1px solid #f0d0d8', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: '#fdf2f4' } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(109, 33, 79, 0.12)', display: 'flex' }}>
                  <AttachMoneyIcon sx={{ fontSize: 24, color: '#6D214F' }} />
                </Box>
                <Box>
                  <Typography sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '0.92rem' }}>Total Withdrawal</Typography>
                  <Typography variant="caption" sx={{ color: '#8c6b7d', fontSize: '11px' }}>Processed payouts</Typography>
                </Box>
              </Box>
              <Typography sx={{ color: '#6D214F', fontWeight: 900, fontSize: '1.1rem' }}>
                ₹{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Portfolio;
