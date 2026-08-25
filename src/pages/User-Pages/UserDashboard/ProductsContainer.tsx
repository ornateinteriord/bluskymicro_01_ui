import React, { useState, useContext } from "react";
import { Box, Typography, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import UserContext from "../../../context/user/userContext";
import { useGetWalletOverview } from '../../../api/Memeber';
import { useBuyPackageDirectlyMutation } from '../../../api/Packages';
import { toast } from 'react-toastify';
import { useGetMemberAddOns } from '../../../api/Packages';

import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const PACKAGES = [
  { id: 1, amount: 10000, title: "Secure Growth Plan", yield: "5%", days: "210 Day", tag: "Members Only", color: "#059669", description: "Begin your journey with the Secure Growth Plan and unlock new growth opportunities", features: ["1 Property Listing", "Standard Response Rate", "120 Days Ad Validity"] },
  { id: 2, amount: 25000, title: "Smart Saver Plan", yield: "5%", days: "210 Day", tag: "Members Only", color: "#EA580C", description: "The Smart Saver Plan helps you explore enhanced features and expand your trading potential", features: ["Up to 2x Response Rate", "160 Days Ad Validity", "50 Buyer Notifications", "Verified Property Tag"] },
  { id: 3, amount: 50000, title: "Wealth Builder Plan", yield: "5%", days: "210 Day", tag: "Members Only", color: "#4B5563", description: "Explore the Wealth Builder Plan designed for advanced financial management and growth opportunities", features: ["Up to 5x Response Rate", "180 Days Ad Validity", "100 Buyer Notifications", "250 Email Promotions"] },
  { id: 4, amount: 100000, title: "Future Secure Deposit", yield: "5%", days: "210 Day", tag: "Members Only", color: "#0284C7", description: "Take your forex journey further with the Future Secure Deposit", features: ["Up to 7x Response Rate", "250 Days Ad Validity", "100 Buyer Notifications", "1500 Email Promotions"] },
  { id: 5, amount: 200000, title: "Prosper Plus Plan", yield: "5%", days: "210 Day", tag: "Members Only", color: "#7C3AED", description: "A premium package built to support smarter trading decisions and long-term growth", features: ["Up to 10x Response Rate", "300 Days Ad Validity", "150 Buyer Notifications", "2000 Email Promotions"] },
  { id: 6, amount: 500000, title: "Golden Growth Investment Plan", yield: "5%", days: "210 Day", tag: "Members Only", color: "#B45309", description: "Experience a higher level of financial flexibility with the Golden Growth Investment Plan", features: ["Premium Response Rate", "365 Days Ad Validity", "Unlimited Notifications", "Dedicated Support"] }
];

const ProductsContainer: React.FC = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { data: walletOverview } = useGetWalletOverview(user?.Member_id || '');
  const { mutate: buyPackage, isPending } = useBuyPackageDirectlyMutation();

  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [confirmPkg, setConfirmPkg] = useState<any>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [purchasedPkg, setPurchasedPkg] = useState<any>(null);
  const { data: memberAddons } = useGetMemberAddOns(user?.Member_id || '');
  const topUpBalance = walletOverview?.topUpBalance || 0;

  const hasAnyPackagePurchased = React.useMemo(() => {
    if (walletOverview?.primaryPackage) return true;
    if (user?.package_value) return true;
    if (memberAddons && memberAddons.length > 0) return true;
    return false;
  }, [walletOverview, user, memberAddons]);

  const isPurchased = (pkgAmount: number) => {
    // Check primary package
    if (walletOverview?.primaryPackage === pkgAmount) return true;
    if (user?.package_value === pkgAmount) return true;
    
    // Check addon packages
    if (memberAddons && memberAddons.length > 0) {
      if (memberAddons.some((addon: any) => addon.amount === pkgAmount)) return true;
    }
    
    return false;
  };

  const handleBuyClick = (pkg: any) => {
    const amountToBuy = pkg.amount;
    if (topUpBalance < amountToBuy) {
      toast.error(`Insufficient Top Up Balance! You need ${amountToBuy} but have ${topUpBalance}`);
      return;
    }
    setConfirmPkg({ ...pkg, amount: amountToBuy });
  };

  const handleCardClick = (pkgAmount: number) => {
    if (isPurchased(pkgAmount)) {
      navigate(`/user/earnings/package-detail?package=${pkgAmount}`);
    }
  };

  const executeBuy = () => {
    if (!confirmPkg || !user?.Member_id) return;

    setBuyingId(confirmPkg.id);
    buyPackage(
      { member_id: user.Member_id, requested_amount: confirmPkg.amount },
      {
        onSettled: () => {
          setBuyingId(null);
          setConfirmPkg(null);
        },
        onSuccess: () => {
          setPurchasedPkg(confirmPkg);
          setSuccessDialogOpen(true);
        }
      }
    );
  };

  return (
    <Box sx={{ mt: 4, width: '100%' }}>


      {/* Packages Container */}
      <Box 
        sx={{ 
          display: 'flex',
          flexWrap: 'nowrap',
          overflowX: 'auto',
          gap: 3,
          pb: 2,
          px: 1,
          '&::-webkit-scrollbar': { height: '8px' },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#E2E8F0', borderRadius: '4px' },
          justifyContent: 'flex-start'
        }}
      >
        {PACKAGES.map((pkg) => (
          <Card 
            key={pkg.id}
            onClick={() => handleCardClick(pkg.amount)}
            sx={{ 
              minWidth: { xs: '260px', sm: '290px' },
              maxWidth: { xs: '260px', sm: '290px' },
              flexShrink: 0,
              bgcolor: '#FFFFFF', 
              border: '1px solid #E2E8F0', 
              borderRadius: '16px', 
              color: '#0F172A',
              boxShadow: 'none',
              cursor: isPurchased(pkg.amount) ? 'pointer' : 'default',
              transition: 'transform 0.3s ease',
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
              }
            }}
          >
            <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, position: 'relative', zIndex: 1 }}>
              <Typography variant="h5" fontWeight={900} sx={{ fontSize: '1.2rem', color: pkg.color, mb: 1, lineHeight: 1.2, minHeight: '48px', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* 
                <Box sx={{
                  width: 38,
                  height: 38,
                  backgroundColor: pkg.color,
                  WebkitMaskImage: `url(${USDTLogo})`,
                  WebkitMaskSize: 'contain',
                  WebkitMaskRepeat: 'no-repeat',
                  WebkitMaskPosition: 'center',
                  maskImage: `url(${USDTLogo})`,
                  maskSize: 'contain',
                  maskRepeat: 'no-repeat',
                  maskPosition: 'center'
                }} />
                */}
                {pkg.title}
              </Typography>
              
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.75rem', mb: 2, minHeight: '32px', lineHeight: 1.3, position: 'relative', zIndex: 2 }}>
                {pkg.description}
              </Typography>

              <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', gap: 0.8, minHeight: '90px' }}>
                {pkg.features?.map((feature, idx) => (
                  <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                    <CheckCircleOutlineIcon sx={{ fontSize: '1rem', color: pkg.color, mt: '2px' }} />
                    <Typography variant="caption" sx={{ color: '#334155', fontWeight: 600, fontSize: '0.75rem' }}>
                      {feature}
                    </Typography>
                  </Box>
                ))}
              </Box>
              
              <Typography variant="h5" fontWeight={800} sx={{ color: pkg.color, mb: 1, height: '36px', display: 'flex', alignItems: 'center' }}>
                {Number(pkg.amount).toFixed(2)}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                <Box sx={{ display: 'flex', gap: 2.5 }}>
                  {!isPurchased(pkg.amount) ? (
                    <Box>
                      {/* <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.1, mb: 0 }}>{pkg.yield.replace('%', '')}</Typography>
                      <Typography variant="caption" sx={{ color: '#475569', fontWeight: 500, fontSize: '0.65rem', display: 'block' }}>Year Plan</Typography> */}
                    </Box>
                  ) : (
                    <Box>
                      {/* Single Leg Income has been removed as per request */}
                    </Box>
                  )}
                </Box>
                
                {isPurchased(pkg.amount) ? (
                  <Chip 
                    label="Active" 
                    sx={{ 
                      bgcolor: 'rgba(59, 130, 246, 0.2)', 
                      color: '#0284C7',
                      fontWeight: 800,
                      borderRadius: '24px',
                      width: '80px',
                      height: '36px',
                      fontSize: '0.875rem',
                      flexShrink: 0,
                    }} 
                  />
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => handleBuyClick(pkg)}
                    disabled={isPending || hasAnyPackagePurchased}
                    sx={{
                      bgcolor: pkg.color,
                      color: '#000000',
                      fontWeight: 800,
                      textTransform: 'none',
                      borderRadius: '24px',
                      width: '80px',
                      height: '36px',
                      boxShadow: 'none',
                      flexShrink: 0,
                      '&:hover': {
                        bgcolor: pkg.color,
                        filter: 'brightness(0.9)',
                        boxShadow: 'none'
                      },
                      '&:disabled': {
                        bgcolor: 'rgba(2, 132, 199, 0.3)',
                        color: '#475569'
                      }
                    }}
                  >
                    {isPending && buyingId === pkg.id ? <CircularProgress size={16} color="inherit" /> : "Post"}
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Confirmation Dialog */}
      <Dialog 
        open={!!confirmPkg} 
        onClose={() => !isPending && setConfirmPkg(null)}
        PaperProps={{
          sx: {
            bgcolor: '#FFFFFF',
            color: '#0F172A',
            borderRadius: '16px',
            border: '1px solid #E2E8F0'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Confirm Investment</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#475569' }}>
            Are you sure you want to invest in <strong>{confirmPkg?.title}</strong> for <strong>{Number(confirmPkg?.amount).toFixed(2)}</strong>?
          </DialogContentText>
          {confirmPkg?.description && (
            <Typography variant="body2" sx={{ color: '#475569', mt: 2, fontStyle: 'italic' }}>
              "{confirmPkg.description}"
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setConfirmPkg(null)} 
            disabled={isPending}
            sx={{ color: '#475569' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={executeBuy} 
            variant="contained" 
            disabled={isPending}
            sx={{
              bgcolor: '#0284C7',
              color: '#000',
              fontWeight: 700,
              '&:hover': { bgcolor: '#0369A1' },
              '&:disabled': { bgcolor: 'rgba(2, 132, 199, 0.3)' }
            }}
          >
            {isPending ? <CircularProgress size={24} color="inherit" /> : "Yes, Invest Now"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#F1F5F9',
            color: '#0F172A',
            borderRadius: '24px',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 4, color: '#10b981', fontWeight: 800, fontSize: '1.5rem' }}>
          Purchase Successful!
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: '#475569' }}>
            You have successfully subscribed to the package.
          </Typography>
          <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'flex-start' }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>Package Name</Typography>
              <Typography variant="h6" sx={{ color: '#0284C7', fontWeight: 700, textAlign: 'right' }}>{purchasedPkg?.title}</Typography>
            </Box>
            {purchasedPkg?.description && (
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <Typography variant="body2" sx={{ color: '#475569', fontStyle: 'italic', textAlign: 'right', maxWidth: '80%' }}>
                  "{purchasedPkg.description}"
                </Typography>
              </Box>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>Amount Paid</Typography>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>{Number(purchasedPkg?.amount).toFixed(2)}</Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 4, pt: 2, justifyContent: 'center' }}>
          <Button
            onClick={() => setSuccessDialogOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
              color: '#0F172A',
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '1.1rem',
              '&:hover': {
                background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              }
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductsContainer;
