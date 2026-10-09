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
                    <PaymentsIcon sx={{ color: '#6D214F', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: '#FFF8F0',
                  "& fieldset": { borderColor: "#f0d0d8", borderWidth: "1.5px" },
                  "&:hover fieldset": { borderColor: "#E5989B" },
                  "&.Mui-focused fieldset": { borderColor: "#6D214F", borderWidth: "2px" },
                },
                "& .MuiInputLabel-root": {
                  color: '#7a5060',
                  fontWeight: 600,
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: '#6D214F',
                },
                "& input": {
                  MozAppearance: "textfield",
                  color: "#2d0f1e",
                  fontWeight: 600,
                },
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  WebkitAppearance: "none",
                  display: "none",
                  margin: 0,
                },
              }}
            />

            {/* Credit Balance displayed below amount text box on left corner */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 0.75, mb: 1, pl: 0.5 }}>
              <Typography variant="caption" sx={{ color: '#7a5060', fontWeight: 600 }}>
                Credit Balance: <span style={{ color: '#6D214F', fontWeight: 800 }}>₹{Number(topUpBalance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
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
                background: !packageAmount ? '#f0d0d8' : 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                color: !packageAmount ? '#a88098' : '#FFF8F0',
                fontWeight: 800,
                fontSize: '0.95rem',
                textTransform: 'none',
                borderRadius: '14px',
                boxShadow: !packageAmount ? 'none' : '0 4px 16px rgba(109,33,79,0.25)',
                '&:hover': {
                  background: !packageAmount ? '#f0d0d8' : 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                  boxShadow: '0 6px 20px rgba(109,33,79,0.35)',
                  transform: 'translateY(-1px)'
                },
                '&:disabled': {
                  backgroundColor: '#f0d0d8',
                  color: '#a88098',
                }
              }}
            >
              {isPending ? <CircularProgress size={22} sx={{ color: '#FFF8F0' }} /> : "Invest Amount"}
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
