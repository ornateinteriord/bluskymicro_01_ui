import { useState, useEffect } from 'react';
import { Card, CardContent, TextField, Typography, Box, Button, CircularProgress, Fade, IconButton, Alert } from '@mui/material';
import DataTable from "react-data-table-component";
import { useMediaQuery } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getWalletColumns,  } from '../../../utils/DataTableColumnsProvider';
import TokenService from "../../../api/token/tokenService";
import { useGetWalletOverview, useWalletWithdraw, useGetMemberDetails, useSendWithdrawalOTP } from '../../../api/Memeber';
import { toast } from 'react-toastify';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { MuiOtpInput } from 'mui-one-time-password-input';

import { useSearchParams } from 'react-router-dom';

const Wallet = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const isWithdrawalView = searchParams.get('type') === 'withdrawal';
  const isMobile = useMediaQuery("(max-width:600px)");
  const [amount, setAmount] = useState("");
  const [tds, setTds] = useState(0); const [netAmount, setNetAmount] = useState(0);
  const [optimisticBalance, setOptimisticBalance] = useState<number | null>(null);
  const [isWithdrawalAllowed, setIsWithdrawalAllowed] = useState<boolean>(true);
  // const [ setLoanStatusMessage] = useState<string>("");

  const memberId = TokenService.getMemberId() || '';

  const {
    data: walletData,
    isLoading,
    refetch,
  } = useGetWalletOverview(memberId);

  const { data: memberDetails } = useGetMemberDetails(memberId);

  const { mutate: sendOTP, isPending: isSendingOTP } = useSendWithdrawalOTP(memberId);
  const withdrawMutation = useWalletWithdraw(memberId);

  const [step, setStep] = useState<1 | 2>(1);
  const [otp, setOtp] = useState("");

  // --- Referral requirement logic ---
  const currentDirects = memberDetails?.data?.registration_stats?.direct || 0;
  const totalPackages = parseFloat(walletData?.data?.totalPackages || 0);
  const maxWithdrawal = totalPackages * 2;

  const currentDay = new Date().getDay();
  const isWeekend = currentDay === 0 || currentDay === 6;

  let requiredReferrals = 0;
  if (totalPackages >= 1000) requiredReferrals = 10;
  else if (totalPackages >= 500) requiredReferrals = 8;
  else if (totalPackages >= 250) requiredReferrals = 6;
  else if (totalPackages >= 120) requiredReferrals = 4;
  else if (totalPackages >= 60) requiredReferrals = 2;
  else requiredReferrals = 0; // <= 30

  const isReferralConditionMet = currentDirects >= requiredReferrals;

  useEffect(() => {
    if (walletData?.data?.balance) {
      const balance = parseFloat(walletData.data.balance);
      setOptimisticBalance(balance);
    }

    // Check withdrawal allowance from API response
    if (walletData?.loanStatus) {
      setIsWithdrawalAllowed(walletData.loanStatus.isWithdrawalAllowed);
      // setLoanStatusMessage(walletData.loanStatus.message || "");
    }
  }, [walletData?.data?.balance, walletData?.loanStatus]);

  const handleAmountChange = (e: any) => {
    const value = e.target.value;
    // Allow only numeric input
    if (value !== "" && !/^\d*/.test(value)) return;

    setAmount(value);

    if (value && value !== "0") {
      const withdrawalAmount = parseFloat(value);
      const deductionAmount = withdrawalAmount * 0.10; // 10% deduction
      const calculatedNetAmount = withdrawalAmount - deductionAmount;

      setTds(deductionAmount);
      setNetAmount(calculatedNetAmount);
    } else {
      setTds(0);
      setNetAmount(0);
    }
  };

  const handleSendOTP = () => {
    if (!amount || amount === "0") {
      return;
    }

    if (!memberId) {
      return;
    }

    if (isWeekend) {
      toast.error('Withdrawals are only allowed from Monday to Friday');
      return;
    }

    if (!isReferralConditionMet) {
      toast.error(`You need ${requiredReferrals} direct referrals to withdraw at your current investment level.`);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const currentBalance = optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0);

    if (withdrawalAmount > currentBalance) {
      return;
    }

    if (withdrawalAmount > maxWithdrawal) {
      toast.error(`Maximum withdrawal limit is ₹${maxWithdrawal.toFixed(2)} (2x of your total invest amount)`);
      return;
    }

    sendOTP(
      { memberId: memberId, amount: amount },
      {
        onSuccess: () => {
          setStep(2);
        }
      }
    );
  };

  const handleWithdraw = () => {
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const currentBalance = optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0);
    const newBalance = currentBalance - withdrawalAmount;
    setOptimisticBalance(newBalance);

    withdrawMutation.mutate(
      { memberId: memberId, amount: amount, otp: otp },
      {
        onSuccess: () => {
          setAmount("");
          setTds(0);
          setNetAmount(0);
          setOtp("");
          setStep(1);
          refetch();
        },
        onError: () => {
          // Revert optimistic update on error
          setOptimisticBalance(parseFloat(walletData?.balance || 0));
        }
      }
    );
  };

  const displayBalance = Math.max(0, optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0));

  if (isLoading) {
    return (
      <Card
        sx={{
          margin: isMobile ? "1rem" : "2rem",
          mt: 1, // Further reduced top margin
          textAlign: "center",
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
        }}
      >
        <CircularProgress sx={{ color: "#0a2558" }} />
      </Card>
    );
  }

  return (
    <Card
      sx={{
        margin: isMobile ? "0.5rem" : "1.5rem",
        bgcolor: '#ffffff',
        borderRadius: "24px",
        border: "1px solid #f0d0d8",
        boxShadow: "0 8px 30px rgba(109,33,79,0.06)",
        mt: 1,
      }}
    >
      <CardContent sx={{ padding: isMobile ? "14px" : "28px" }}>
        {/* Withdrawal Section */}
        {isWithdrawalView && (
        <div>
          <Box sx={{
            marginBottom: "1.5rem",
            background: "linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)",
            color: '#FFF8F0',
            padding: "14px 18px",
            borderRadius: "16px",
            fontWeight: "bold",
            fontSize: "1.1rem",
            boxShadow: "0 4px 14px rgba(109,33,79,0.25)",
            display: "flex",
            alignItems: "center",
            gap: "10px"
          }}>
            <IconButton 
              onClick={() => {
                if (step === 2) setStep(1);
                else setSearchParams({});
              }} 
              size="small" 
              sx={{ color: '#FFF8F0' }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            Withdrawal Request {!isWithdrawalAllowed && "(Temporarily Disabled)"}
          </Box>
          <div style={{ padding: "0 0.5rem 1rem 0.5rem" }}>
            {step === 1 ? (
              <Fade in={step === 1}>
            <form
              style={{
                marginTop: 2,
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <TextField
                label="Available Balance"
                value={`${displayBalance.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: "#FFF8F0",
                    "& fieldset": { borderColor: "#f0d0d8", borderWidth: "1.5px" },
                    "&:hover fieldset": { borderColor: "#E5989B" },
                    "&.Mui-focused fieldset": { borderColor: "#6D214F", borderWidth: "2px" },
                  },
                  "& .MuiInputLabel-root": { color: "#7a5060", fontWeight: 600 },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#6D214F" },
                }}
              />

              <TextField
                label="Withdrawal Amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                size="medium"
                placeholder="Enter amount"
                disabled={withdrawMutation.isPending || !isWithdrawalAllowed || isWeekend}
                error={parseFloat(amount) > displayBalance || (Boolean(amount) && parseFloat(amount) > maxWithdrawal)}
                helperText={
                  parseFloat(amount) > displayBalance 
                    ? "Insufficient Balance" 
                    : (Boolean(amount) && parseFloat(amount) > maxWithdrawal) 
                      ? `Maximum withdrawal limit is ₹${maxWithdrawal.toFixed(2)} (2x of invest amount)` 
                      : ""
                }
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: "#FFF8F0",
                    "& fieldset": { borderColor: "#f0d0d8", borderWidth: "1.5px" },
                    "&:hover fieldset": { borderColor: "#E5989B" },
                    "&.Mui-focused fieldset": { borderColor: "#6D214F", borderWidth: "2px" },
                  },
                  "& .MuiInputLabel-root": { color: "#7a5060", fontWeight: 600 },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#6D214F" },
                }}
              />

              {/* 
              <TextField
                label="Admin Charges (15%)"
                value={`${adminCharges.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />
              */}

              <TextField
                label="Deduction (10%)"
                value={`${tds.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "14px",
                    bgcolor: "#FFF8F0",
                    "& fieldset": { borderColor: "#f0d0d8", borderWidth: "1.5px" },
                    "&:hover fieldset": { borderColor: "#E5989B" },
                    "&.Mui-focused fieldset": { borderColor: "#6D214F", borderWidth: "2px" },
                  },
                  "& .MuiInputLabel-root": { color: "#7a5060", fontWeight: 600 },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#6D214F" },
                }}
              />

              <TextField
                label="Net Amount Received"
                value={`${netAmount.toFixed(2)}`}
                fullWidth
                size="medium"
                InputProps={{ readOnly: true }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              {isWeekend ? (
                <Alert severity="error" sx={{ mb: 1, borderRadius: '8px' }}>
                  Withdrawals are only allowed from Monday to Friday.
                </Alert>
              ) : (
                <Alert severity="info" sx={{ mb: 1, borderRadius: '8px' }}>
                  Requests are processed within 2-3 business days.
                </Alert>
              )}

              <Box
                sx={{
                  display: "flex",
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between",
                  alignItems: isMobile ? "stretch" : "center",
                  gap: 2,
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Terms & Conditions:</strong>
                  </Typography>
                  <Box sx={{ display: "flex", gap: 4, flexDirection: isMobile ? "column" : "row" }}>
                    <Box>
                      <Typography variant="body2">• 10% Deduction applied</Typography>
                      <Typography variant="body2">• Maximum withdrawal: 2x of total invest amount ({maxWithdrawal.toFixed(2)})</Typography>
                      <Typography variant="body2">• One withdrawal per day allowed</Typography>
                    </Box>
                  </Box>
                  {!isWithdrawalAllowed && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#ff9800",
                        fontWeight: "bold",
                        mt: 1
                      }}
                    >
                      • Withdrawal disabled due to unpaid loan from last Saturday
                    </Typography>
                  )}
                  {!isReferralConditionMet && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: "#f44336",
                        fontWeight: "bold",
                        mt: 1
                      }}
                    >
                      • Withdrawal locked: Your investment level requires {requiredReferrals} direct referrals, but you currently have {currentDirects}.
                    </Typography>
                  )}
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={
                    isSendingOTP ||
                    withdrawMutation.isPending ||
                    !amount ||
                    parseFloat(amount) <= 0 ||
                    parseFloat(amount) > maxWithdrawal ||
                    !isWithdrawalAllowed ||
                    !isReferralConditionMet ||
                    isWeekend
                  }
                  onClick={handleSendOTP}
                  sx={{
                    background: isWithdrawalAllowed && isReferralConditionMet ? "linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)" : "#F4C95D",
                    color: isWithdrawalAllowed && isReferralConditionMet ? "#FFF8F0" : "#2d0f1e",
                    "&:hover": {
                      background: isWithdrawalAllowed && isReferralConditionMet ? "linear-gradient(135deg, #4e1739 0%, #6D214F 100%)" : "#e6be4e"
                    },
                    borderRadius: "14px",
                    height: "50px",
                    fontSize: "1rem",
                    fontWeight: 800,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(109,33,79,0.25)"
                  }}
                >
                  {isSendingOTP ? <CircularProgress size={24} sx={{ color: '#FFF8F0' }} /> :
                  (!isWithdrawalAllowed || !isReferralConditionMet) ? "Disabled" : "Proceed to Withdraw"}
                </Button>
              </Box>
            </form>
              </Fade>
            ) : (
              <Fade in={step === 2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#6D214F', mb: 1, fontWeight: 800 }}>Security Verification</Typography>
                    <Typography variant="body2" sx={{ color: '#7a5060' }}>
                      Enter the 6-digit OTP sent to your registered email address.
                    </Typography>
                  </Box>

                  <Box sx={{ my: 2, display: 'flex', justifyContent: 'center' }}>
                    <MuiOtpInput
                      length={6}
                      value={otp}
                      onChange={(newValue) => setOtp(newValue)}
                      TextFieldsProps={{
                        size: 'medium',
                        placeholder: '-',
                        sx: {
                          maxWidth: '45px',
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: '#FFF8F0',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            '& fieldset': { borderColor: '#f0d0d8' },
                            '&:hover fieldset': { borderColor: '#E5989B' },
                            '&.Mui-focused fieldset': {
                              borderColor: '#6D214F',
                              borderWidth: '2px'
                            },
                          },
                          '& .MuiOutlinedInput-input': {
                            textAlign: 'center',
                            px: 0,
                            color: '#2d0f1e'
                          }
                        }
                      }}
                    />
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                      variant="contained"
                      onClick={handleWithdraw}
                      disabled={withdrawMutation.isPending || otp.length !== 6}
                      sx={{
                        background: "linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)",
                        color: "#FFF8F0",
                        fontWeight: 800,
                        borderRadius: "12px",
                        minWidth: "160px",
                        py: 1.3,
                        textTransform: "none",
                        "&:hover": {
                          background: "linear-gradient(135deg, #4e1739 0%, #6D214F 100%)"
                        },
                        "&:disabled": { backgroundColor: "#f0d0d8", color: "#a88098" },
                      }}
                    >
                      {withdrawMutation.isPending ? <CircularProgress size={24} sx={{ color: '#FFF8F0' }} /> : 'Confirm Withdrawal'}
                    </Button>
                  </Box>
                </Box>
              </Fade>
            )}
          </div>
        </div>
        )}

        {/* Transaction History */}
        {!isWithdrawalView && (
        <>
        <div style={{ marginBottom: "1.2rem", color: "#2d0f1e", fontWeight: 800, fontSize: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Transaction History</span>
          <Button 
            variant="contained" 
            onClick={() => setSearchParams({ type: 'withdrawal' })}
            sx={{
              background: "linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)",
              color: "#FFF8F0",
              "&:hover": { background: "linear-gradient(135deg, #4e1739 0%, #6D214F 100%)" },
              borderRadius: "12px",
              fontWeight: 800,
              textTransform: "none",
              px: 3,
              boxShadow: "0 4px 12px rgba(109,33,79,0.2)"
            }}
          >
            Withdraw
          </Button>
        </div>
          {walletData?.transactions && walletData.transactions.length > 0 ? (
              <DataTable
                columns={getWalletColumns()}
                data={walletData.transactions}
                pagination
                customStyles={DASHBOARD_CUTSOM_STYLE}
                paginationPerPage={isMobile ? 10 : 25}
                paginationRowsPerPageOptions={
                  isMobile ? [10, 20, 50] : [25, 50, 100]
                }
                highlightOnHover
                responsive
              />
            ) : (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No transactions found
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ mt: 1 }}
                >
                  Your transaction history will appear here
                </Typography>
              </Box>
            )}
        </>
        )}
      </CardContent>
    </Card>
  );
};

export default Wallet;
