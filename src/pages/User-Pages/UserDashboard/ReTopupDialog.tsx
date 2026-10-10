import React, { useState, useContext } from 'react';
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import BoltIcon from '@mui/icons-material/Bolt';
import { useNavigate } from 'react-router-dom';
import UserContext from '../../../context/user/userContext';
import { useGetWalletOverview, useGetMemberDetails } from '../../../api/Memeber';
import { useGetMemberAddOns, useBuyPackageDirectlyMutation } from '../../../api/Packages';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';

interface ReTopupDialogProps {
  open: boolean;
  onClose: () => void;
}

export const ReTopupDialog: React.FC<ReTopupDialogProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(UserContext);
  const memberId = user?.Member_id || '';

  const { data: walletOverview } = useGetWalletOverview(memberId);
  const { data: memberDetails } = useGetMemberDetails(memberId);
  const { data: addOns = [] } = useGetMemberAddOns(memberId);
  const { mutate: buyPackage, isPending } = useBuyPackageDirectlyMutation();

  const [investAmount, setInvestAmount] = useState<string>('');
  const [successDialogOpen, setSuccessDialogOpen] = useState<boolean>(false);
  const [confirmedAmount, setConfirmedAmount] = useState<number | null>(null);

  const creditBalance = Number(walletOverview?.balance ?? walletOverview?.availableForWithdrawal ?? 0);

  // Compute highest previous investment
  const primaryVal = Number(memberDetails?.package_value || user?.package_value || 0);
  const addonVals = (addOns || []).map((a: any) => Number(a.amount || a.requested_amount || 0)).filter((v: number) => v > 0);
  const allInvestments = primaryVal > 0 ? [primaryVal, ...addonVals] : [...addonVals];
  const lastInvestedAmount = allInvestments.length > 0 ? Math.max(...allInvestments) : 0;
  const minAllowed = lastInvestedAmount > 0 ? lastInvestedAmount + 100 : 100;

  // Validation rules: multiples of 100, more than earlier amount, and balance check
  const amountNum = Number(investAmount);
  const isEntered = investAmount.trim() !== '' && !isNaN(amountNum);
  const isMultipleOf100 = isEntered && amountNum % 100 === 0;
  const isHigherThanLast = isEntered && amountNum >= minAllowed;
  const isBalanceSufficient = isEntered && amountNum <= creditBalance;
  const isValid = isEntered && isMultipleOf100 && isHigherThanLast && isBalanceSufficient;

  // Validation error string
  let validationError: string | null = null;
  if (isEntered) {
    if (amountNum % 100 !== 0) {
      validationError = 'Amount must be in multiples of ₹100 only.';
    } else if (amountNum < minAllowed) {
      validationError = lastInvestedAmount > 0
        ? `Amount must be greater than previous investment of ₹${lastInvestedAmount.toLocaleString()}.`
        : 'Minimum invest amount is ₹100.';
    } else if (amountNum > creditBalance) {
      validationError = `Insufficient Credit Balance! You have ₹${creditBalance.toLocaleString()} but need ₹${amountNum.toLocaleString()}.`;
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!investAmount || isNaN(amountNum)) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (amountNum % 100 !== 0) {
      toast.error('Invest amount must be in multiples of ₹100 only');
      return;
    }

    if (amountNum < minAllowed) {
      toast.error(`Amount must be higher than previous investment of ₹${lastInvestedAmount.toLocaleString()}`);
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
          setConfirmedAmount(amountNum);
          setSuccessDialogOpen(true);
          setInvestAmount('');
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

  const handleCloseAll = () => {
    setSuccessDialogOpen(false);
    onClose();
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: 'transparent',
            boxShadow: 'none',
            m: { xs: 1.5, sm: 2 }
          }
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: 540,
            mx: 'auto',
            boxShadow: '0 12px 36px rgba(109, 33, 79, 0.16)',
            borderRadius: '24px',
            border: '1.5px dashed #E5989B',
            backgroundColor: '#ffffff',
            p: { xs: 2.5, sm: 3.5 },
            position: 'relative'
          }}
        >
          {/* Top Bar: Icon + Title + Close Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 26, color: '#6D214F' }} />
              <Typography variant="body2" sx={{ color: '#2d0f1e', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
                Invest
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: '#8c6b7d',
                bgcolor: '#FFF8F0',
                border: '1px solid #f0d0d8',
                '&:hover': { bgcolor: '#ffeef0' }
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          {/* Earlier Investment Info if any */}
          {lastInvestedAmount > 0 && (
            <Box
              sx={{
                mb: 2,
                p: 1.2,
                px: 1.5,
                borderRadius: '12px',
                bgcolor: '#FFF8F0',
                border: '1px solid #f0d0d8',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography sx={{ fontSize: '0.78rem', color: '#7a5060', fontWeight: 700 }}>
                Earlier Investment:
              </Typography>
              <Typography sx={{ fontSize: '0.88rem', color: '#6D214F', fontWeight: 900 }}>
                ₹{lastInvestedAmount.toLocaleString()}
              </Typography>
            </Box>
          )}

          {/* Form */}
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              required
              fullWidth
              label="Amount (₹) *"
              variant="outlined"
              size="medium"
              type="text"
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              value={investAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '' || /^\d+$/.test(val)) {
                  setInvestAmount(val);
                }
              }}
              placeholder={`Min ${minAllowed}`}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentsIcon sx={{ color: '#6D214F', fontSize: 20 }} />
                  </InputAdornment>
                )
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '14px',
                  bgcolor: '#FFF8F0',
                  '& fieldset': { borderColor: validationError ? '#ef4444' : '#f0d0d8', borderWidth: '1.5px' },
                  '&:hover fieldset': { borderColor: validationError ? '#dc2626' : '#E5989B' },
                  '&.Mui-focused fieldset': { borderColor: validationError ? '#dc2626' : '#6D214F', borderWidth: '2px' }
                },
                '& .MuiInputLabel-root': {
                  color: validationError ? '#ef4444' : '#7a5060',
                  fontWeight: 600
                },
                '& .MuiInputLabel-root.Mui-focused': {
                  color: validationError ? '#dc2626' : '#6D214F'
                },
                '& input': {
                  MozAppearance: 'textfield',
                  color: '#2d0f1e',
                  fontWeight: 700,
                  fontSize: '1.05rem'
                },
                '& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button': {
                  WebkitAppearance: 'none',
                  display: 'none',
                  margin: 0
                }
              }}
            />

            {/* Live Error Warning */}
            {validationError && (
              <Alert
                severity="error"
                sx={{
                  mt: 1.5,
                  borderRadius: '12px',
                  py: 0.3,
                  px: 1.5,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  bgcolor: '#fee2e2',
                  color: '#991b1b',
                  '& .MuiAlert-icon': { fontSize: '18px', color: '#dc2626' }
                }}
              >
                {validationError}
              </Alert>
            )}

            {/* Credit Balance Display */}
            <Box sx={{ mt: 1.8, mb: 2 }}>
              <Typography sx={{ color: '#7a5060', fontSize: '0.82rem', fontWeight: 600 }}>
                Credit Balance: <span style={{ color: '#2d0f1e', fontWeight: 800 }}>₹{creditBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </Typography>
            </Box>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={isPending || !isValid}
              sx={{
                py: 1.3,
                borderRadius: '14px',
                fontWeight: 800,
                fontSize: '0.98rem',
                textTransform: 'none',
                background: isValid
                  ? 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)'
                  : '#f0d0d8',
                color: isValid ? '#FFF8F0' : '#8c6b7d',
                boxShadow: isValid ? '0 4px 14px rgba(109, 33, 79, 0.24)' : 'none',
                '&:hover': {
                  background: isValid ? 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)' : '#f0d0d8',
                  boxShadow: isValid ? '0 8px 20px rgba(109, 33, 79, 0.35)' : 'none',
                  transform: isValid ? 'translateY(-1px)' : 'none'
                },
                transition: 'all 0.2s ease'
              }}
            >
              {isPending ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={20} sx={{ color: '#FFF8F0' }} />
                  <span>Processing...</span>
                </Box>
              ) : (
                'Invest Amount'
              )}
            </Button>
          </Box>

          {/* Credits Container with Action Buttons */}
          <Box
            sx={{
              mt: 2.5,
              bgcolor: '#FFF8F0',
              border: '1.5px solid #f0d0d8',
              borderRadius: '20px',
              p: { xs: 2, sm: 2.5 },
              boxShadow: '0 4px 16px rgba(109, 33, 79, 0.04)'
            }}
          >
            {/* Icon + Title */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{
                p: 0.8,
                borderRadius: '12px',
                bgcolor: 'rgba(244, 201, 93, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgba(244, 201, 93, 0.6)',
                flexShrink: 0
              }}>
                <PaymentsIcon sx={{ fontSize: 22, color: '#6D214F' }} />
              </Box>
              <Typography sx={{
                color: '#6D214F',
                fontWeight: 900,
                fontSize: '1.1rem',
                letterSpacing: '0.5px'
              }}>
                Credits
              </Typography>
            </Box>

            {/* Big Rupee Balance (same like first) */}
            <Box sx={{ my: 1 }}>
              <Typography sx={{
                color: '#6D214F',
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '2.5rem' },
                lineHeight: 1,
                letterSpacing: '-0.8px'
              }}>
                ₹{Number(creditBalance).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </Typography>
            </Box>

            {/* Action Buttons: First row 2 buttons, 3rd button below that */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, width: '100%', mt: 0.5 }}>
              {/* Row 1: + Add and Withdraw */}
              <Box sx={{ display: 'flex', gap: 1.2, width: '100%' }}>
                {/* 1. + Add */}
                <Button
                  variant="contained"
                  onClick={() => { onClose(); navigate('/user/load-fund'); }}
                  startIcon={<AddIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                  sx={{
                    flex: 1,
                    py: 1.1,
                    background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                    color: '#FFF8F0',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textTransform: 'none',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(109, 33, 79, 0.24)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  + Add
                </Button>

                {/* 2. Withdraw */}
                <Button
                  variant="contained"
                  onClick={() => { onClose(); navigate('/user/wallet?type=withdrawal'); }}
                  startIcon={<PaymentsIcon sx={{ fontSize: 18 }} />}
                  fullWidth
                  sx={{
                    flex: 1,
                    py: 1.1,
                    background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                    color: '#FFF8F0',
                    borderRadius: '12px',
                    fontWeight: 800,
                    fontSize: '0.88rem',
                    textTransform: 'none',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(109, 33, 79, 0.24)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                      transform: 'translateY(-1px)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  Withdraw
                </Button>
              </Box>

              {/* Row 2: 3rd button (Activation) below */}
              <Button
                variant="contained"
                onClick={() => { onClose(); navigate('/user/new-subscription'); }}
                startIcon={<BoltIcon sx={{ fontSize: 18 }} />}
                fullWidth
                sx={{
                  py: 1.1,
                  background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                  color: '#FFF8F0',
                  borderRadius: '12px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                  textTransform: 'none',
                  justifyContent: 'center',
                  boxShadow: '0 3px 10px rgba(109, 33, 79, 0.24)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                    transform: 'translateY(-1px)'
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                Activation
              </Button>
            </Box>
          </Box>
        </Box>
      </Dialog>

      {/* Success Confirmation Modal */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseAll}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            p: 3,
            textAlign: 'center',
            bgcolor: '#ffffff',
            boxShadow: '0 12px 36px rgba(109, 33, 79, 0.2)'
          }
        }}
      >
        <DialogContent sx={{ p: 1 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(5, 150, 105, 0.12)',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2
            }}
          >
            <CheckCircleOutlineIcon sx={{ fontSize: 38 }} />
          </Box>
          <Typography variant="h6" sx={{ color: '#2d0f1e', fontWeight: 900, mb: 1 }}>
            Investment Successful!
          </Typography>
          <Typography variant="body2" sx={{ color: '#7a5060', mb: 2.5, lineHeight: 1.6 }}>
            You have successfully invested{' '}
            <strong style={{ color: '#6D214F' }}>₹{confirmedAmount?.toLocaleString()}</strong> from your Credits Wallet. Daily Incentive will be credited daily.
          </Typography>
          <Button
            variant="contained"
            fullWidth
            onClick={handleCloseAll}
            sx={{
              py: 1.2,
              borderRadius: '12px',
              fontWeight: 800,
              background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
              color: '#FFF8F0',
              textTransform: 'none'
            }}
          >
            Done
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReTopupDialog;
