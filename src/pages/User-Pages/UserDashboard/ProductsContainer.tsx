import React, { useState, useContext } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import UserContext from '../../../context/user/userContext';
import { useGetWalletOverview } from '../../../api/Memeber';
import { useBuyPackageDirectlyMutation } from '../../../api/Packages';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

const ProductsContainer: React.FC = () => {
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  const memberId = user?.Member_id || '';

  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { mutate: buyPackage, isPending } = useBuyPackageDirectlyMutation();

  const [packageAmount, setPackageAmount] = useState<string>('');
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [purchasedAmount, setPurchasedAmount] = useState<number | null>(null);

  // Single wallet: credits balance
  const creditBalance = Number(walletOverview?.balance ?? walletOverview?.availableForWithdrawal ?? 0);

  const amountNum = Number(packageAmount);
  const isEntered = packageAmount.trim() !== '' && !isNaN(amountNum);
  const isMultipleOf100 = isEntered && amountNum >= 100 && amountNum % 100 === 0;
  const isBalanceSufficient = isEntered && amountNum <= creditBalance;
  const isValid = isEntered && isMultipleOf100 && isBalanceSufficient;

  let validationError: string | null = null;
  if (isEntered) {
    if (amountNum < 100) {
      validationError = 'Minimum invest amount is ₹100.';
    } else if (amountNum % 100 !== 0) {
      validationError = 'Amount must be in multiples of ₹100 only.';
    } else if (amountNum > creditBalance) {
      validationError = `Insufficient Credit Balance! You have ₹${creditBalance.toLocaleString()} but need ₹${amountNum.toLocaleString()}.`;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!packageAmount || isNaN(amountNum)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum < 100) {
      toast.error('Minimum invest amount is ₹100');
      return;
    }

    if (amountNum % 100 !== 0) {
      toast.error('Invest amount must be in multiples of ₹100 only');
      return;
    }

    if (amountNum > creditBalance) {
      toast.error(`Insufficient Credit Balance! You have ₹${creditBalance.toLocaleString()} but need ₹${amountNum.toLocaleString()}`);
      return;
    }

    if (!memberId) {
      toast.error('User information not found');
      return;
    }

    buyPackage(
      { member_id: memberId, requested_amount: amountNum },
      {
        onSuccess: () => {
          setPurchasedAmount(amountNum);
          setSuccessDialogOpen(true);
          setPackageAmount('');
          queryClient.invalidateQueries({ queryKey: ['walletOverview'] });
          queryClient.invalidateQueries({ queryKey: ['memberDetails'] });
          queryClient.invalidateQueries({ queryKey: ['addOns'] });
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.message || err?.message || 'Investment failed');
        }
      }
    );
  };

  return (
    <Box sx={{ mb: 3.5, width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card
        sx={{
          maxWidth: 540,
          width: '100%',
          boxShadow: '0 8px 24px rgba(109,33,79,0.06)',
          borderRadius: '24px',
          border: '1.5px dashed #E5989B',
          backgroundColor: '#ffffff',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 26, color: '#6D214F' }} />
              <Typography variant="body2" sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '0.95rem' }}>
                Invest
              </Typography>
            </Box>
          </Box>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              label="Amount (₹) *"
              variant="outlined"
              size="medium"
              type="text"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={packageAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setPackageAmount(val);
                }
              }}
              placeholder="Min 100"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentsIcon sx={{ color: '#6D214F', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: '#FFF8F0',
                  '& fieldset': { borderColor: validationError ? '#ef4444' : '#f0d0d8', borderWidth: '1.5px' },
                  '&:hover fieldset': { borderColor: validationError ? '#dc2626' : '#E5989B' },
                  '&.Mui-focused fieldset': { borderColor: validationError ? '#dc2626' : '#6D214F', borderWidth: '2px' },
                },
                '& .MuiInputLabel-root': {
                  color: validationError ? '#ef4444' : '#7a5060',
                  fontWeight: 600,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: validationError ? '#dc2626' : '#6D214F',
                },
                '& input': {
                  MozAppearance: 'textfield',
                  color: '#2d0f1e',
                  fontWeight: 600,
                },
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  display: 'none',
                  margin: 0,
                },
              }}
            />

            {/* Validation Error */}
            {validationError && (
              <Alert
                severity="error"
                sx={{
                  mt: 1.2,
                  borderRadius: '12px',
                  py: 0.2,
                  px: 1.2,
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  bgcolor: '#fee2e2',
                  color: '#991b1b',
                  '& .MuiAlert-icon': { fontSize: '18px', color: '#dc2626' }
                }}
              >
                {validationError}
              </Alert>
            )}

            {/* Credit Balance displayed below amount text box on left corner */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0.75, mb: 1, pl: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#7a5060', fontWeight: 600 }}>
                Credit Balance: <span style={{ color: '#6D214F', fontWeight: 800 }}>₹{Number(creditBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!isValid || isPending}
              sx={{
                mt: 2,
                py: 1.4,
                background: !isValid ? '#f0d0d8' : 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: !isValid ? '#a88098' : '#FFF8F0',
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                borderRadius: '14px',
                boxShadow: !isValid ? 'none' : '0 4px 16px rgba(109,33,79,0.25)',
                '&:hover': {
                  background: !isValid ? '#f0d0d8' : 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  boxShadow: '0 6px 20px rgba(109,33,79,0.35)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  backgroundColor: '#f0d0d8',
                  color: '#a88098',
                }
              }}
            >
              {isPending ? <CircularProgress size={22} sx={{ color: '#FFF8F0' }} /> : 'Invest Amount'}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        PaperProps={{
          sx: {
            bgcolor: '#FFF8F0',
            borderRadius: '24px',
            border: '1px solid #fce8ec',
            boxShadow: '0 20px 48px rgba(109,33,79,0.15)',
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3.5, color: '#6D214F', fontWeight: 800 }}>
          Investment Successful! 🎉
        </DialogTitle>
        <DialogContent sx={{ pb: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#7a5060', mb: 2 }}>
            Your investment request has been processed successfully.
          </Typography>
          <Box sx={{ bgcolor: '#ffffff', p: 2, borderRadius: '16px', border: '1px solid #f0d0d8' }}>
            <Typography variant="caption" sx={{ color: '#7a5060', display: 'block' }}>
              Amount Invested
            </Typography>
            <Typography variant="h5" sx={{ color: '#6D214F', fontWeight: 900, mt: 0.5 }}>
              ₹{Number(purchasedAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'center' }}>
          <Button
            onClick={() => setSuccessDialogOpen(false)}
            variant="contained"
            fullWidth
            sx={{
              py: 1.2,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
              color: '#FFF8F0',
              fontWeight: 800,
              textTransform: 'none',
              boxShadow: '0 4px 12px rgba(109,33,79,0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)'
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
