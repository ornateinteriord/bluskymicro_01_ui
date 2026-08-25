import React, { useState, useContext, useEffect } from "react";
import { Card, CardContent, CardHeader, TextField, FormControl, Button, Box, Typography, Select, MenuItem, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import UserContext from "../../../context/user/userContext";
import { useGetWalletOverview } from '../../../api/Memeber';
import { useBuyPackageDirectlyMutation } from '../../../api/Packages';
import { toast } from 'react-toastify';
import { get } from '../../../api/Api';

const NewSubscription: React.FC = () => {
  const { user } = useContext(UserContext);
  const { data: walletOverview } = useGetWalletOverview(user?.Member_id || '');
  const { mutate: buyPackage, isPending: isSubmitting } = useBuyPackageDirectlyMutation();

  const [formData, setFormData] = useState({
    targetMemberId: "",
    package: "",
  });

  const [targetName, setTargetName] = useState(user?.Name || "");
  const [isSearching, setIsSearching] = useState(false);
  const [isTargetActive, setIsTargetActive] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [purchasedPkgDetails, setPurchasedPkgDetails] = useState<any>(null);

  // Removed auto-fill of targetMemberId to allow entering anyone's user ID

  useEffect(() => {
    if (!formData.targetMemberId) {
      setTargetName("");
      setIsTargetActive(false);
      return;
    }
    
    if (formData.targetMemberId === user?.Member_id) {
      setTargetName(user?.Name || "");
      setIsTargetActive(false);
      return;
    }

    const fetchName = async () => {
      setIsSearching(true);
      try {
        const res = await get(`/auth/get-sponsor/${formData.targetMemberId}`);
        if (res && res.success) {
          setTargetName(res.name || "Name not available");
          if (res.status === 'active' || res.status === 'Active') {
            setIsTargetActive(true);
            toast.error("Already active");
          } else {
            setIsTargetActive(false);
          }
        } else {
          setTargetName("Member Not Found");
          setIsTargetActive(false);
        }
      } catch (e) {
        setTargetName("Member Not Found");
        setIsTargetActive(false);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(fetchName, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.targetMemberId, user?.Member_id, user?.Name]);

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      package: e.target.value,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.Member_id || !formData.package) {
      toast.error("Please select a package");
      return;
    }

    if (targetName === "Member Not Found" || isTargetActive || isSearching) {
      toast.error("Please provide a valid pending Target Member ID");
      return;
    }
    
    buyPackage({
      member_id: user.Member_id,
      target_member_id: formData.targetMemberId || user.Member_id,
      requested_amount: Number(formData.package),
    }, {
      onSuccess: () => {
        let packageName = "";
        switch(formData.package) {
          case "10000": packageName = "Secure Growth Plan"; break;
          case "25000": packageName = "Smart Saver Plan"; break;
          case "50000": packageName = "Wealth Builder Plan"; break;
          case "100000": packageName = "Future Secure Deposit"; break;
          case "200000": packageName = "Prosper Plus Plan"; break;
          case "500000": packageName = "Golden Growth Investment Plan"; break;
          default: packageName = `${formData.package} Package`;
        }
        
        setPurchasedPkgDetails({
          targetMemberId: formData.targetMemberId || user.Member_id,
          targetName: targetName,
          amount: formData.package,
          packageName: packageName
        });
        setSuccessDialogOpen(true);
        setFormData(prev => ({ ...prev, package: "", targetMemberId: "" }));
        setTargetName("");
      }
    });
  };

  const inputStyles = {
    bgcolor: '#F8FAFC',
    borderRadius: '8px',
    color: '#0F172A',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: '#E2E8F0',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      bordercolor: '#0284C7',
    },
    '& .MuiInputBase-input': {
      color: '#0F172A',
      WebkitTextFillcolor: '#0F172A',
    },
    '& .MuiInputBase-input.Mui-disabled': {
      color: '#0F172A',
      WebkitTextFillcolor: '#0F172A',
      opacity: 0.8,
    },
    '& .MuiSelect-icon': {
      color: '#475569',
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 4 }, display: 'flex', justifyContent: 'center', bgcolor: '#F8FAFC', minHeight: '100vh' }}>
      <Card sx={{ maxWidth: 600, width: '100%', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', boxShadow: "0 15px 35px rgba(0,0,0,0.2)", borderRadius: '28px', color: '#0F172A', alignSelf: 'flex-start' }}>
        <CardHeader 
          title="NEW SUBSCRIPTION" 
          sx={{ bgcolor: '#F8FAFC', color: '#0F172A', py: 2.5, textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)' }}
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 900, letterSpacing: '1px' }}
        />
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Target Member ID <span style={{color: '#ef4444'}}>*</span></Typography>
              <TextField
                name="targetMemberId"
                value={formData.targetMemberId}
                onChange={handleInputChange}
                fullWidth
                size="small"
                placeholder="Enter member ID"
                sx={inputStyles}
                required
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Target Name</Typography>
              <TextField
                value={targetName}
                fullWidth
                size="small"
                disabled
                InputProps={{
                  endAdornment: isSearching ? <CircularProgress size={20} color="inherit" sx={{color: '#475569'}} /> : null
                }}
                sx={{ 
                  ...inputStyles, 
                  bgcolor: targetName === 'Member Not Found' ? 'rgba(239, 68, 68, 0.1)' : '#F8FAFC',
                  '& .MuiInputBase-input.Mui-disabled': {
                    color: targetName === 'Member Not Found' ? '#ef4444' : '#121010ff',
                    WebkitTextFillColor: targetName === 'Member Not Found' ? '#ef4444' : '#0f0e0eff',
                  }
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Your Purchase Balance</Typography>
              <TextField
                value={`${Number(walletOverview?.topUpBalance || 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })}`}
                fullWidth
                size="small"
                disabled
                sx={{ ...inputStyles, opacity: 0.8 }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Package <span style={{color: '#ef4444'}}>*</span></Typography>
              <FormControl fullWidth size="small">
                <Select
                  name="package"
                  value={formData.package}
                  onChange={handleSelectChange}
                  sx={inputStyles}
                  displayEmpty
                  MenuProps={{
                    PaperProps: {
                      sx: {
                        bgcolor: '#F1F5F9',
                        color: '#0F172A',
                        border: '1px solid #E2E8F0'
                      }
                    }
                  }}
                >
                  <MenuItem value="" disabled>Select Package</MenuItem>
                  <MenuItem value="10000">10,000 Secure Growth Plan</MenuItem>
                  <MenuItem value="25000">25,000 Smart Saver Plan</MenuItem>
                  <MenuItem value="50000">50,000 Wealth Builder Plan</MenuItem>
                  <MenuItem value="100000">1,00,000 Future Secure Deposit</MenuItem>
                  <MenuItem value="200000">2,00,000 Prosper Plus Plan</MenuItem>
                  <MenuItem value="500000">5,00,000 Golden Growth Investment Plan</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { xs: 'flex-start', sm: 'center' }, gap: 1 }}>
              <Typography sx={{ width: '150px', color: '#475569', fontSize: '0.9rem', fontWeight: 600 }}>Topup Date</Typography>
              <TextField
                value={new Date().toLocaleDateString('en-GB')}
                fullWidth
                size="small"
                disabled
                sx={{ ...inputStyles, opacity: 0.8 }}
              />
            </Box>

            <Box sx={{ display: 'flex', justifySelf: 'center', mt: 3, pt: 3, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSubmitting || targetName === "Member Not Found" || isTargetActive || targetName === "" || isSearching}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  px: 5,
                  py: 1.2,
                  fontWeight: 800,
                  textTransform: 'none',
                  borderRadius: '999px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  width: { xs: '100%', sm: 'auto' },
                  "&:hover": { 
                    bgcolor: '#0369A1',
                    boxShadow: '0 6px 20px rgba(2, 132, 199, 0.6)'
                  },
                  "&:disabled": {
                    bgcolor: 'rgba(2, 132, 199, 0.3)',
                    color: '#475569'
                  }
                }}
              >
                {isSubmitting ? "Processing..." : "Buy Package"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

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
          Subscription Successful!
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <Typography variant="body1" sx={{ textAlign: 'center', mb: 4, color: '#475569' }}>
            Package has been successfully activated for the target member.
          </Typography>
          <Box sx={{ bgcolor: 'rgba(0,0,0,0.2)', p: 3, borderRadius: '16px', border: '1px solid #E2E8F0' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>Target Member ID</Typography>
              <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 700 }}>{purchasedPkgDetails?.targetMemberId}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>Target Name</Typography>
              <Typography variant="h6" sx={{ color: '#0000', fontWeight: 700 }}>{purchasedPkgDetails?.targetName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>Package</Typography>
              <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 700 }}>{purchasedPkgDetails?.packageName}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>Amount Paid</Typography>
              <Typography variant="h6" sx={{ color: '#10b981', fontWeight: 700 }}>{Number(purchasedPkgDetails?.amount).toFixed(2)}</Typography>
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

export default NewSubscription;
