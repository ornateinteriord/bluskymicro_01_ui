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
  const maxWithdrawal = totalPackages * 0.25;

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
      const tdsAmount = withdrawalAmount * 0.05; // 5% TDS
      const calculatedNetAmount = withdrawalAmount - tdsAmount;

      setTds(tdsAmount);
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
      toast.error(`You need ${requiredReferrals} direct referrals to withdraw at your current package level.`);
      return;
    }

    const withdrawalAmount = parseFloat(amount);
    const currentBalance = optimisticBalance !== null ? optimisticBalance : parseFloat(walletData?.balance || 0);

    if (withdrawalAmount > currentBalance) {
      return;
    }

    if (withdrawalAmount < 500) {
      toast.error('Minimum withdrawal amount is 500');
      return;
    }

    if (withdrawalAmount > maxWithdrawal) {
      toast.error(`Maximum withdrawal limit is ${maxWithdrawal.toFixed(2)} (25% of your total package amount)`);
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
        margin: isMobile ? "0.5rem" : "1rem",
        backgroundcolor: '#0F172A',
        mt: 1, // Further reduced top margin
      }}
    >
      <CardContent sx={{ padding: isMobile ? "12px" : "24px" }}>
        {/* Withdrawal Section */}
        {isWithdrawalView && (
        <div>
          <Box sx={{ marginBottom: "1rem", backgroundColor: "#0a2558", color: '#ffff', padding: "12px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "1.1rem", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "8px" }}>
            <IconButton 
              onClick={() => {
                if (step === 2) setStep(1);
                else setSearchParams({});
              }} 
              size="small" 
              sx={{ color: 'white' }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>
            Withdrawal Request {!isWithdrawalAllowed && "(Temporarily Disabled)"}
          </Box>
          <div style={{ padding: "0 1rem 1rem 1rem" }}>
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
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
                }}
              />

              <TextField
                label="Withdrawal Amount"
                type="text"
                value={amount}
                onChange={handleAmountChange}
                fullWidth
                size="medium"
                placeholder="Enter amount (Min 500)"
                disabled={withdrawMutation.isPending || !isWithdrawalAllowed || isWeekend}
                error={parseFloat(amount) > displayBalance || (Boolean(amount) && parseFloat(amount) < 500)}
                helperText={parseFloat(amount) > displayBalance ? "Insufficient Balance" : (amount && parseFloat(amount) < 500) ? "Minimum withdrawal amount is ₹500" : ""}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "&:hover fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                    "&.Mui-focused fieldset": { borderColor: isWithdrawalAllowed ? "#0a2558" : "#ff9800" },
                  },
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
                label="Admin (5%)"
                value={`${tds.toFixed(2)}`}
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
                  Minimum withdrawal amount is ₹500. Requests are processed within 2-3 business days.
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
                      <Typography variant="body2">• 5% Admin applied</Typography>
                      <Typography variant="body2">  Minimum withdrawal: 500</Typography>
                      <Typography variant="body2">• Maximum withdrawal: 25% of total package ({maxWithdrawal.toFixed(2)})</Typography>
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
                      • Withdrawal locked: Your package level requires {requiredReferrals} direct referrals, but you currently have {currentDirects}.
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
                    !isWithdrawalAllowed ||
                    !isReferralConditionMet ||
                    isWeekend || 
                    parseFloat(amount) < 500
                  }
                  onClick={handleSendOTP}
                  sx={{
                    backgroundColor: isWithdrawalAllowed && isReferralConditionMet ? "#0a2558" : "#ff9800",
                    color: "white",
                    "&:hover": {
                      backgroundColor: isWithdrawalAllowed && isReferralConditionMet ? "#581c87" : "#f57c00"
                    },
                    height: "48px",
                    fontSize: "1rem",
                    fontWeight: "bold"
                  }}
                >
                  {isSendingOTP ? <CircularProgress size={24} sx={{ color: 'white' }} /> :
                  (!isWithdrawalAllowed || !isReferralConditionMet) ? "Disabled" : "Proceed to Withdraw"}
                </Button>
              </Box>
            </form>
              </Fade>
            ) : (
              <Fade in={step === 2}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
                  <Box textAlign="center">
                    <Typography variant="h6" sx={{ color: '#0a2558', mb: 1, fontWeight: 'bold' }}>Security Verification</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
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
                            borderRadius: '8px',
                            fontSize: '1.2rem',
                            fontWeight: 'bold',
                            '&.Mui-focused fieldset': {
                              borderColor: '#0a2558',
                              borderWidth: '2px'
                            },
                          },
                          '& .MuiOutlinedInput-input': {
                            textAlign: 'center',
                            px: 0,
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
                        backgroundColor: "#0a2558",
                        minWidth: "150px",
                        py: 1.2,
                        "&:hover": {
                          backgroundColor: "#581c87"
                        },
                        "&:disabled": { backgroundColor: "#cccccc" },
                      }}
                    >
                      {withdrawMutation.isPending ? <CircularProgress size={24} sx={{ color: '#0F172A' }} /> : 'Confirm Withdrawal'}
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
        <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Transaction History</span>
          <Button 
            variant="contained" 
            onClick={() => setSearchParams({ type: 'withdrawal' })}
            sx={{
              backgroundColor: "#0a2558",
              color: "white",
              "&:hover": { backgroundColor: "#581c87" },
              borderRadius: "8px",
              fontWeight: "bold",
              textTransform: "none"
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
