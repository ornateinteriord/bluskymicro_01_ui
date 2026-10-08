import React, { useState, useContext } from "react";
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  TextField, 
  InputAdornment, 
  CircularProgress, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions 
} from '@mui/material';
import PaymentsIcon from '@mui/icons-material/Payments';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import UserContext from "../../../context/user/userContext";
import { useGetWalletOverview } from '../../../api/Memeber';
import { useBuyPackageDirectlyMutation } from '../../../api/Packages';
import { toast } from 'react-toastify';

const ProductsContainer: React.FC = () => {
  const { user } = useContext(UserContext);
  const { data: walletOverview } = useGetWalletOverview(user?.Member_id || '');
  const { mutate: buyPackage, isPending } = useBuyPackageDirectlyMutation();

  const [packageAmount, setPackageAmount] = useState<string>('');
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [purchasedAmount, setPurchasedAmount] = useState<number | null>(null);

  const topUpBalance = walletOverview?.topUpBalance || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!packageAmount || isNaN(Number(packageAmount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    const amountNum = Number(packageAmount);

    if (amountNum < 100) {
      toast.error("Minimum package amount is ₹100");
      return;
    }

    if (amountNum > topUpBalance) {
      toast.error(`Insufficient Balance! You need ₹${amountNum.toLocaleString()} but have ₹${topUpBalance.toLocaleString()}`);
      return;
    }

    if (!user?.Member_id) {
      toast.error("User information not found");
      return;
    }

    buyPackage(
      { member_id: user.Member_id, requested_amount: amountNum },
      {
        onSuccess: () => {
          setPurchasedAmount(amountNum);
          setSuccessDialogOpen(true);
          setPackageAmount('');
        }
      }
    );
  };

  return (
    <Box sx={{ mt: 3, mb: 4, width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Card
        sx={{
          maxWidth: 540,
          width: '100%',
          boxShadow: '0 8px 32px rgba(10,37,88,0.06)',
          borderRadius: '16px',
          border: '1px dashed #90a4d4',
          backgroundColor: '#fdfdff',
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <AccountBalanceWalletIcon sx={{ fontSize: 28, color: '#ed6c02' }} />
              <Typography variant="body2" sx={{ color: '#0a2558', fontWeight: 700, fontSize: '0.9rem' }}>
                Package Deposit (Min ₹100)
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
              inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
              value={packageAmount}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || /^\d+$/.test(val)) {
                  setPackageAmount(val);
                }
              }}
              placeholder="Min 100"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaymentsIcon sx={{ color: '#0a2558', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: '#ffffff',
                },
                "& .MuiInputLabel-root": {
                  color: '#475569',
                  fontWeight: 600,
                },
                "& input": {
                  MozAppearance: "textfield",
                },
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  display: "none",
                  margin: 0,
                },
              }}
            />

            {/* Balance displayed below amount text box on left corner */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0.75, mb: 1, pl: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 600 }}>
                Balance: <span style={{ color: '#059669', fontWeight: 700 }}>₹{Number(topUpBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </Typography>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={!packageAmount || isPending}
              sx={{
                mt: 2.5,
                py: 1.5,
                backgroundColor: !packageAmount ? '#e2e8f0' : '#0a2558',
                color: !packageAmount ? '#94a3b8' : '#ffffff',
                fontWeight: 700,
                fontSize: '1rem',
                textTransform: 'none',
                borderRadius: '12px',
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: !packageAmount ? '#e2e8f0' : '#153b93',
                  boxShadow: 'none',
                },
                '&:disabled': {
                  backgroundColor: '#e2e8f0',
                  color: '#94a3b8',
                }
              }}
            >
              {isPending ? <CircularProgress size={22} sx={{ color: '#ffffff' }} /> : "Submit Deposit Request"}
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
            bgcolor: '#FFFFFF',
            borderRadius: '20px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
          }
        }}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3.5, color: '#10b981', fontWeight: 800 }}>
          Deposit Successful!
        </DialogTitle>
        <DialogContent sx={{ pb: 1, textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: '#64748B', mb: 2 }}>
            Your deposit request has been processed successfully.
          </Typography>
          <Box sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: '12px', border: '1px solid #E2E8F0' }}>
            <Typography variant="caption" sx={{ color: '#64748B', display: 'block' }}>
              Amount Processed
            </Typography>
            <Typography variant="h5" sx={{ color: '#0F172A', fontWeight: 800, mt: 0.5 }}>
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
              borderRadius: '10px',
              bgcolor: '#0284C7',
              color: '#FFFFFF',
              fontWeight: 700,
              textTransform: 'none',
              '&:hover': { bgcolor: '#0369A1' }
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
