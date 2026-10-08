import React, { useContext } from 'react';
import moment from 'moment';
import { Box, Card, CardContent, Typography, Grid, CircularProgress, Divider, Chip, LinearProgress, Button, IconButton } from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DownloadIcon from '@mui/icons-material/Download';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../../context/user/userContext';
import { useGetMemberAddOns } from '../../../api/Packages';
import { useGetWalletOverview } from '../../../api/Memeber';
import { openBondCertificate } from '../../../utils/BondCertificateGenerator';

const MySubscriptions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const { data: addOns = [], isLoading: addOnsLoading } = useGetMemberAddOns(user?.Member_id || '');
  const { data: walletOverview } = useGetWalletOverview(user?.Member_id || '');

  if (!user) {
    return (
      <Box sx={{ bgcolor: '#FFF8F0', minHeight: '100vh', display: 'flex', justifyContent: 'center', pt: 10 }}>
        <CircularProgress sx={{ color: '#6D214F' }} />
      </Box>
    );
  }

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
            My Subscriptions
          </Typography>
          <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 600 }}>
            Active packages, deposits & certificates
          </Typography>
        </Box>
      </Box>

      {addOnsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress sx={{ color: '#6D214F' }} />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {(() => {
            const primaryInAddOns = addOns.find((a: any) => a.package_id?.startsWith('PKG-P-'));
            let finalAddOns = [...addOns];
            if (primaryInAddOns) {
              finalAddOns = addOns.map((a: any) => a);
            }

            const baseAmount = user.package_value || 0;

            const primaryPkg = {
              request_id: 'PRIMARY',
              isPrimary: true,
              requested_amount: baseAmount,
              roi_status: user.roi_status || 'Active',
              roi_payout_target: user.roi_payout_target || ((user.package_value || 0) * 3),
              roi_payout_count: user.roi_payout_count || 0,
              roi_start_date: user.roi_start_date || user.Date_of_joining,
            };

            const allPackages = primaryInAddOns ? [...finalAddOns] : [primaryPkg, ...addOns];

            return allPackages.map((pkg: any, index: number) => {
              const pkgAmount = pkg.amount || pkg.requested_amount || 0;
              const pkgId = pkg.package_id || pkg.request_id || 'N/A';
              const totalDays = pkg.isFD 
                ? (moment(pkg.date_of_maturity).diff(moment(pkg.roi_start_date), 'days') || 1)
                : 120;
              const pkgProgress = pkg.roi_payout_count ? Math.min((pkg.roi_payout_count / totalDays) * 100, 100) : 0;

              // Calculate Single Leg Income buyers (Max 100)
              const sliAmount = walletOverview?.singleLevelIncomeByPackage?.[pkgAmount] || 0;
              const perBuyerIncome = pkgAmount * 0.015;
              const buyersCount = perBuyerIncome > 0 ? Math.round(sliAmount / perBuyerIncome) : 0;
              const sliProgress = Math.min((buyersCount / 100) * 100, 100);

              return (
                <Grid item xs={12} key={pkgId}>
                  <Card sx={{
                    boxShadow: '0 4px 16px rgba(109,33,79,0.06)',
                    borderRadius: '24px',
                    border: '1.5px solid #f0d0d8',
                    backgroundColor: '#ffffff',
                    color: '#2d0f1e',
                    transition: 'all 0.2s',
                    '&:hover': { transform: 'translateY(-2px)', borderColor: '#E5989B' }
                  }}>
                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                            {pkg.isFD ? <AccountBalanceIcon sx={{ fontSize: 16, color: '#6D214F' }} /> : <PaymentsIcon sx={{ fontSize: 16, color: '#6D214F' }} />}
                            <Typography variant="caption" sx={{ fontSize: '0.72rem', fontWeight: 800, color: '#8c6b7d', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                              {pkg.isFD ? 'Fixed Deposit' : `Subscription #${index + 1}`}
                            </Typography>
                          </Box>
                          <Typography variant="h5" sx={{ fontWeight: 900, color: '#6D214F', lineHeight: 1.2 }}>
                            ₹{pkgAmount.toLocaleString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={pkg.roi_status}
                          size="small"
                          sx={{ 
                            height: 24, 
                            fontSize: '0.72rem', 
                            fontWeight: 800, 
                            borderRadius: '8px',
                            backgroundColor: pkg.roi_status === 'Active' ? 'rgba(244, 201, 93, 0.3)' : '#fdf2f4',
                            color: '#6D214F',
                            border: '1px solid rgba(244, 201, 93, 0.6)'
                          }}
                        />
                      </Box>

                      <Divider sx={{ my: 1.5, borderColor: '#f0d0d8' }} />
                      <Box sx={{ mb: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="caption" sx={{ fontSize: '0.75rem', color: '#8c6b7d', fontWeight: 700 }}>
                          {pkg.isFD ? 'Interest Rate' : 'Single Leg Income'}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#6D214F' }}>
                          {pkg.isFD ? `${pkg.interest_rate || 0}% p.a.` : `₹${sliAmount.toFixed(2)}`}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                        <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#8c6b7d', fontWeight: 700 }}>
                          {pkg.isFD ? 'Maturity Progress' : `${buyersCount} of 100 Buyers`}
                        </Typography>
                        <Typography variant="caption" sx={{ fontSize: '0.72rem', color: '#6D214F', fontWeight: 800 }}>
                          {pkg.isFD ? `${pkgProgress.toFixed(0)}%` : `${sliProgress.toFixed(0)}%`}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={pkg.isFD ? pkgProgress : sliProgress}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: '#FFF8F0',
                          border: '1px solid #f0d0d8',
                          '& .MuiLinearProgress-bar': {
                            background: 'linear-gradient(90deg, #E5989B, #6D214F)',
                            borderRadius: 4
                          }
                        }}
                      />

                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => openBondCertificate({
                          memberNumber: user.Member_id || user.member_id || '',
                          memberName: user.Name || user.name || '',
                          dob: user.dob || '',
                          fatherName: user.Father_name || user.father_name || '',
                          address: user.address || '',
                          accountNo: user.account_number || pkg.package_id || `FD${pkgId.toString().slice(-5)}`,
                          commencementDate: pkg.roi_start_date || user.Date_of_joining || new Date().toISOString(),
                          planTerm: 'FD / 3 Years',
                          planAmount: pkgAmount,
                          interestRate: pkg.interest_rate || 9.0,
                          maturityDate: moment(pkg.roi_start_date || user.Date_of_joining || new Date().toISOString()).add(3, 'years').toISOString(),
                          aadhaarNo: user.aadharcard_no || '',
                          panNo: user.Pan_no || user.pan_no || '',
                          nomineeName: user.Nominee_name || user.nominee || '',
                          nomineeRelation: user.Nominee_Relation || user.relation || '',
                          branchCode: user.branch_id || '004',
                          branch: 'UDUPI',
                          profilePhotoUrl: user.profile_image || user.member_image,
                        })}
                        sx={{
                          mt: 2,
                          width: '100%',
                          borderColor: '#f0d0d8',
                          color: '#6D214F',
                          fontWeight: 800,
                          textTransform: 'none',
                          fontSize: '0.82rem',
                          py: 0.8,
                          borderRadius: '12px',
                          bgcolor: '#FFF8F0',
                          '&:hover': { bgcolor: '#fdf2f4', borderColor: '#6D214F' }
                        }}
                      >
                        Download Bond Certificate
                      </Button>

                      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CalendarTodayIcon sx={{ color: '#8c6b7d', fontSize: 13 }} />
                          <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#8c6b7d', fontWeight: 600 }}>
                            {new Date(pkg.roi_start_date || pkg.createdAt || Date.now()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: '#8c6b7d', fontFamily: 'monospace', fontWeight: 600 }}>
                          #{pkgId.toString().slice(-8)}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            });
          })()}
        </Grid>
      )}
    </Box>
  );
};

export default MySubscriptions;
