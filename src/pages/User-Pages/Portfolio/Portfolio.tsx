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
    { label: "Transfer", icon: <SyncAltIcon />, route: "/user/transfer", color: "#0284C7" },
    { label: "Scan & Pay", icon: <QrCode2Icon />, route: "/user/my-qr", color: "#14b8a6" },
    { label: "P2P Transfer", icon: <SendIcon />, route: "/user/p2p-transfer", color: "#ea580c" },
    { label: "Property Listings", icon: <InventoryIcon />, route: "/user/new-subscription", color: "#0284C7" },
    { label: "My Certificates", icon: <ReceiptLongIcon />, route: "/user/my-subscriptions", color: "#f59e0b" },
  ];

  return (
    <Box sx={{
      pb: 6,
      background: 'linear-gradient(180deg, #F8FAFC 0%, #E2E8F0 100%)',
      minHeight: '100vh',
      px: { xs: 2.5, md: 5, lg: 10, xl: 16 },
      pt: { xs: 4, md: 6 },
      maxWidth: '1800px',
      margin: '0 auto'
    }}>
      <Typography variant="h4" sx={{ color: '#0F172A', fontWeight: 900, mb: 4 }}>
        My Portfolio
      </Typography>

      {/* Wallet Cards Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 6 }}>
        {/* Fixed Deposit */}
        <Box onClick={() => navigate('/user/fixed-deposit-wallet')} sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F1F5F9' }, cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(255, 193, 7, 0.1)', display: 'flex', height: 'fit-content' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#FFC107' }} />
            </Box>
            <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(walletOverview?.fixedDepositBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#1E293B', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Fixed Deposit</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '13px' }}>Your money securely saved for long-term growth—simple and always accessible.</Typography>
          </Box>
        </Box>

        {/* Upgrade */}
        <Box onClick={() => navigate('/user/upgrade-wallet')} sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F1F5F9' }, cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(41, 182, 246, 0.1)', display: 'flex', height: 'fit-content' }}>
              <TrendingUpIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#29B6F6' }} />
            </Box>
            <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(walletOverview?.upgradeWalletBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#1E293B', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Property Fund</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '13px' }}>Take your wallet to the next level with more power, flexibility, and rewards.</Typography>
          </Box>
        </Box>

        {/* Earnings */}
        <Box onClick={() => navigate('/user/wallet')} sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F1F5F9' }, cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(2, 132, 199, 0.1)', display: 'flex', height: 'fit-content' }}>
              <AccountBalanceWalletIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#0284C7' }} />
            </Box>
            <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(walletOverview?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#1E293B', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Payouts</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '13px' }}>Watch your funds grow and withdraw them securely anytime.</Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="contained"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/user/wallet?type=withdrawal');
                }}
                sx={{
                  background: 'linear-gradient(45deg, #0284C7 30%, #38BDF8 90%)',
                  color: '#0F172A',
                  borderRadius: '999px',
                  px: 3.5,
                  py: 0.8,
                  fontWeight: 900,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  fontSize: '0.8rem',
                  boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #0369A1 30%, #0284C7 90%)',
                    boxShadow: '0 6px 20px rgba(2, 132, 199, 0.5)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                Payout
              </Button>
            </Box>
          </Box>
        </Box>
        
        {/* Purchase */}
        <Box onClick={() => navigate('/user/purchase-wallet')} sx={{ display: 'flex', flexDirection: 'column', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F1F5F9' }, cursor: 'pointer' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(156, 39, 176, 0.1)', display: 'flex', height: 'fit-content' }}>
              <InventoryIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#9C27B0' }} />
            </Box>
            <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number((walletOverview as any)?.purchaseBalance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
          </Box>
          <Box sx={{ width: '100%' }}>
            <Typography sx={{ color: '#1E293B', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Purchase</Typography>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '13px' }}>Manage your purchases and track your active product investments.</Typography>
          </Box>
        </Box>
      </Box>

      {/* Quick Access Icons */}
      <Box sx={{ mb: 6, width: '100%' }}>
        <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 900, mb: 3, textAlign: 'center', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Quick Access
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: { xs: 2, md: 3 } }}>
          {quickAccessItems.map((item, i) => (
            <Box key={i} onClick={() => navigate(item.route)} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, cursor: 'pointer' }}>
              <Box sx={{ 
                width: { xs: 56, md: 64 }, 
                height: { xs: 56, md: 64 }, 
                borderRadius: '16px', 
                bgcolor: '#F1F5F9', 
                color: item.color,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                boxShadow: '0 6px 15px rgba(0,0,0,0.05)',
                border: '1px solid #E2E8F0',
                transition: '0.2s',
                '&:hover': { transform: 'scale(1.1)', bgcolor: '#F8FAFC' }
              }}>
                {item.icon}
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: { xs: '0.7rem', md: '0.8rem' }, textAlign: 'center', color: '#1E293B' }}>
                {item.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Brokerage Performance */}
      <Box sx={{ mt: 6, mb: 6 }}>
        <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', mb: 3 }}>BROKERAGE PERFORMANCE</Typography>
        <Paper elevation={0} sx={{ p: 4, borderRadius: '28px', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.05)' }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box 
              onClick={() => navigate('/user/team')}
              sx={{ textAlign: 'center', cursor: 'pointer', '&:hover': { opacity: 0.8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <GroupsIcon sx={{ fontSize: 36, color: '#0284C7', mb: 1 }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>My Agents</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', mt: 1 }}>{Math.max(memberDetails?.registration_stats?.total || 0, memberDetails?.total_team || 0)}</Typography>
            </Box>
            <Box 
              onClick={() => navigate('/user/team/direct')}
              sx={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', cursor: 'pointer', '&:hover': { opacity: 0.8 }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <PersonAddAltIcon sx={{ fontSize: 36, color: '#6366f1', mb: 1 }} />
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>Direct Clients</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, color: '#0F172A', mt: 1 }}>{Math.max(memberDetails?.registration_stats?.direct || 0, memberDetails?.direct_referrals?.length || 0)}</Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Earnings Cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Paper elevation={0} sx={{ p: 4, borderRadius: '32px', bgcolor: '#F1F5F9', border: '1px solid #E2E8F0', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', width: '100%' }}>
          <Stack spacing={4}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
              <Box onClick={() => navigate('/user/earnings/referral-bonus')} sx={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F1F5F9' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(245, 158, 11, 0.1)', display: 'flex', height: 'fit-content' }}>
                    <PaymentsIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#f59e0b' }} />
                  </Box>
                  <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(walletOverview?.directBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Typography sx={{ color: '#1E293B', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Referral Commission</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '14px' }}>Turn every referral into a rewarding opportunity with instant bonus earnings.</Typography>
                </Box>
              </Box>

              <Box onClick={() => navigate('/user/earnings/level-benefits')} sx={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F1F5F9' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(2, 132, 199, 0.1)', display: 'flex', height: 'fit-content' }}>
                    <AccountTreeIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#0284C7' }} />
                  </Box>
                  <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(walletOverview?.levelBenefits || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Typography sx={{ color: '#1E293B', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Brokerage Override</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '14px' }}>Every new level brings greater rewards—keep progressing and keep earning</Typography>
                </Box>
              </Box>

              <Box onClick={() => navigate('/user/earnings/single-level-income-history')} sx={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F1F5F9' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.1)', display: 'flex', height: 'fit-content' }}>
                    <TrendingUpIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#ef4444' }} />
                  </Box>
                  <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number((parseFloat(walletOverview?.singleLineIncome) || 0) + (parseFloat(walletOverview?.globalIncome) || 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Typography sx={{ color: '#1E293B', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Direct Commission</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '14px' }}>One growing network, multiple earning opportunities—powered by your single-leg structure.</Typography>
                </Box>
              </Box>

              <Box onClick={() => navigate('/user/transactions?type=Withdrawal')} sx={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', p: { xs: 2, sm: 3 }, borderRadius: '20px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.02)', bgcolor: '#F1F5F9' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
                  <Box sx={{ p: 1.5, borderRadius: '12px', bgcolor: 'rgba(168, 85, 247, 0.1)', display: 'flex', height: 'fit-content' }}>
                    <AttachMoneyIcon sx={{ fontSize: { xs: 24, sm: 32 }, color: '#a855f7' }} />
                  </Box>
                  <Typography sx={{ color: '#0F172A', fontWeight: 900, fontSize: { xs: '1.3rem', sm: '1.6rem' }, letterSpacing: '1px', m: 0 }}>{Number(walletOverview?.totalWithdrawal || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                </Box>
                <Box sx={{ width: '100%' }}>
                  <Typography sx={{ color: '#1E293B', fontWeight: 800, fontSize: { xs: '1rem', sm: '1.2rem' }, textTransform: 'uppercase', mb: 0.5 }}>Total Withdrawal</Typography>
                  <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.3, width: '100%', fontSize: '14px' }}>Your total withdrawals, displayed for quick and easy financial tracking</Typography>
                </Box>
              </Box>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

export default Portfolio;
