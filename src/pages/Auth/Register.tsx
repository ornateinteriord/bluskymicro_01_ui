import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  Box, TextField, Button, Typography, InputAdornment, FormControl, FormLabel,
  FormControlLabel, Radio, RadioGroup, Checkbox, FormHelperText, Dialog,
  DialogTitle, DialogContent, DialogActions, Grid, useTheme, useMediaQuery,
  Avatar, MenuItem, IconButton, CircularProgress
} from '@mui/material';
import { Visibility, VisibilityOff, CheckCircle as CheckCircleIcon } from '@mui/icons-material';

import PersonIcon from "@mui/icons-material/Person";
import LockIcon from "@mui/icons-material/Lock";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import WcIcon from "@mui/icons-material/Wc";
import PublicIcon from '@mui/icons-material/Public';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useGetSponserRef, useSignupMutation } from '../../api/Auth';
import { post } from '../../api/Api';
import { LoadingComponent } from '../../App';
import { MuiOtpInput } from 'mui-one-time-password-input';
import { toast } from 'react-toastify';

const COUNTRIES = [
  "United States", "United Kingdom", "Canada", "Australia", "India",
  "Germany", "France", "Japan", "China", "Brazil", "South Africa",
  "Nigeria", "United Arab Emirates", "Singapore", "Malaysia",
  "New Zealand", "Netherlands", "Switzerland", "Sweden", "Spain",
  "Italy", "Mexico", "Argentina", "Colombia", "Chile", "Peru",
  "Philippines", "Indonesia", "Vietnam", "Thailand", "South Korea",
  "Pakistan", "Bangladesh", "Sri Lanka", "Nepal", "Saudi Arabia",
  "Qatar", "Oman", "Kuwait", "Bahrain", "Egypt", "Kenya", "Ghana",
  "Uganda", "Tanzania", "Morocco", "Algeria", "Tunisia", "Turkey",
  "Iran", "Iraq", "Israel", "Jordan", "Lebanon", "Russia", "Ukraine",
  "Poland", "Romania", "Czech Republic", "Hungary", "Greece", "Portugal",
  "Ireland", "Belgium", "Austria", "Denmark", "Finland", "Norway"
].sort();

const Register = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchParams] = useSearchParams();
  const refCode = searchParams.get("ref") || "";

  const [formData, setFormData] = useState<Record<string, string>>({
    Sponsor_code: "",
    Sponsor_name: "",
    gender: "",
    Name: "",
    email: "",
    password: "",
    confirmPassword: "",
    mobileno: "",
    pincode: "",
    country: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [genderError, setGenderError] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [registrationData, setRegistrationData] = useState<{ memberId: string; email: string; mobile: string }>({
    memberId: '',
    email: '',
    mobile: '',
  });

  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [firebaseToken, setFirebaseToken] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const { data: sponsorData, isLoading, isError, error, refetch } = useGetSponserRef(formData.Sponsor_code);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSendOTP = async () => {
    if (!formData.mobileno || formData.mobileno.length !== 10) {
      toast.error("Please enter a valid 10-digit mobile number first");
      return;
    }

    setIsSendingOTP(true);
    try {
      const res: any = await post("/auth/send-registration-otp", {
        mobileno: formData.mobileno
      });

      if (res.success) {
        setOtp("");
        setOtpDialogOpen(true);
        setResendCooldown(60);
        toast.success(res.message || "OTP sent successfully!");
        if (res.devOtp) {
          toast.info(`Test OTP: ${res.devOtp}`, { autoClose: 12000 });
        }
      } else {
        toast.error(res.message || "Failed to send OTP");
      }
    } catch (error: any) {
      console.error("OTP Send Error", error);
      const msg = error.response?.data?.message || error.message || "Failed to send OTP";
      toast.error(msg);
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      toast.error("Please enter the complete 6-digit OTP");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const res: any = await post("/auth/verify-registration-otp", {
        mobileno: formData.mobileno,
        otp: otp.trim()
      });

      if (res.success) {
        setFirebaseToken(res.token || "");
        setIsMobileVerified(true);
        setOtpDialogOpen(false);
        toast.success("Mobile number verified successfully!");
      } else {
        toast.error(res.message || "Invalid OTP");
      }
    } catch (error: any) {
      console.error("Verification Error", error);
      const msg = error.response?.data?.message || error.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  useEffect(() => {
    if (refCode) setFormData(prev => ({ ...prev, Sponsor_code: refCode }));
  }, [refCode]);

  useEffect(() => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) refetch();
  }, [formData.Sponsor_code, refetch]);

  useEffect(() => {
    if (sponsorData && sponsorData.name) {
      setFormData(prev => ({ ...prev, Sponsor_name: sponsorData.name }));
    } else if (isError) {
      setFormData(prev => ({ ...prev, Sponsor_name: "" }));
    }
  }, [sponsorData, isError]);

  const sponsorError = isError && error instanceof Error ? error.message : "";

  const handleSponsorCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, Sponsor_code: e.target.value, Sponsor_name: "" }));
  };

  const handleSponsorCodeBlur = () => {
    if (formData.Sponsor_code && formData.Sponsor_code.length >= 5) refetch();
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(e.target.checked);
    setErrorMessage("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "mobileno") {
      const cleanValue = value.replace(/\D/g, "").slice(0, 10);
      if (isMobileVerified && cleanValue !== formData.mobileno) {
        setIsMobileVerified(false);
        setFirebaseToken("");
      }
      setFormData(prev => ({ ...prev, [name]: cleanValue }));
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prevData => ({ ...prevData, gender: e.target.value }));
    setGenderError(false);
  };

  const { mutate, isPending } = useSignupMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    if (!formData.gender) return setGenderError(true);
    if (!formData.Sponsor_code || formData.Sponsor_code.length < 5) return setErrorMessage("Valid sponsor code is required");
    if (!formData.Sponsor_name) return setErrorMessage("Please enter a valid sponsor code");
    if (!formData.country) return setErrorMessage("Country is required");
    if (!/^\d{10}$/.test(formData.mobileno)) return setErrorMessage("Please enter a valid 10-digit mobile number");

    if (!isMobileVerified) {
      toast.error("Please verify your mobile number with OTP before registering");
      return setErrorMessage("Please verify your mobile number with OTP before registering");
    }

    if (!formData.password || formData.password.length < 6) {
      return setErrorMessage("Password must be at least 6 characters");
    }
    if (formData.password !== formData.confirmPassword) {
      return setErrorMessage("Passwords do not match");
    }

    try {
      const finalData = {
        ...formData,
        sponsor_id: formData.Sponsor_code,
        Sponsor_code: formData.Sponsor_code,
        Sponsor_name: formData.Sponsor_name,
        spackage: 'Ecash Plan',
        password: formData.password,
        otp: firebaseToken,
      };

      mutate(finalData, {
        onSuccess: (response) => {
          if (response.success) {
            setRegistrationData({
              memberId: response.user.Member_id,
              email: formData.email,
              mobile: formData.mobileno,
            });
            setSuccessDialogOpen(true);
          }
        },
        onError: (error: any) => {
          setErrorMessage(error.response?.data?.message || "Registration failed");
        }
      });
    } catch (error: any) {
      setErrorMessage("Registration failed. Please try again.");
    }
  };

  const handleCloseDialog = () => {
    setSuccessDialogOpen(false);
    navigate("/login");
  };

  const textFieldStyles = {
    "& .MuiOutlinedInput-root": {
      color: "#ffffff",
      bgcolor: "rgba(255, 255, 255, 0.03)",
      borderRadius: "12px",
      transition: "all 0.3s ease",
      "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
      "&:hover fieldset": { borderColor: "rgba(0, 230, 118, 0.5)" },
      "&.Mui-focused fieldset": { borderColor: "#00e676", borderWidth: "2px" },
    },
    "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.6)" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#00e676" },
    "& .MuiOutlinedInput-input::placeholder": { color: "rgba(255, 255, 255, 0.3)", opacity: 1 }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column", bgcolor: "#0f172a", position: 'relative', overflow: 'hidden' }}>
      {/* Background decorations */}
      <Box sx={{ position: 'fixed', top: '-10%', left: '-10%', width: '50vw', height: '50vw', minWidth: '300px', minHeight: '300px', background: 'radial-gradient(circle, rgba(0, 230, 118, 0.08) 0%, rgba(15,23,42,0) 70%)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />
      <Box sx={{ position: 'fixed', bottom: '-10%', right: '-5%', width: '40vw', height: '40vw', minWidth: '250px', minHeight: '250px', background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, rgba(15,23,42,0) 70%)', filter: 'blur(60px)', borderRadius: '50%', zIndex: 0, pointerEvents: 'none' }} />

      {/* Main Content */}
      <Box
        sx={{
          display: 'flex', flex: 1, position: 'relative', zIndex: 1,
          flexDirection: { xs: 'column', lg: 'row' },
          alignItems: 'center', justifyContent: 'center',
          p: { xs: 2, sm: 3, md: 4, lg: 6 },
          gap: { xs: 3, lg: 8 },
        }}
      >
        {/* Left Branding */}
        <Box
          sx={{
            display: 'flex', flexDirection: 'column',
            alignItems: { xs: 'center', lg: 'flex-start' },
            textAlign: { xs: 'center', lg: 'left' },
            maxWidth: { xs: '100%', lg: '420px' }, width: '100%'
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: 950,
              fontSize: { xs: '2.5rem', lg: '3.5rem' },
              letterSpacing: '2px',
              color: '#38bdf8',
              mb: '1.25rem',
              textShadow: '0 4px 20px rgba(56, 189, 248, 0.4)'
            }}
          >
            Ecash
          </Typography>
          <Typography
            variant={isMobile ? "h5" : "h3"}
            sx={{ color: '#00e676', fontWeight: 900, mb: 1.5, textShadow: '0 4px 12px rgba(0,0,0,0.3)', lineHeight: 1.2 }}
          >
            Join the Future
          </Typography>
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
              {[
                { label: 'Secure', icon: <LockIcon /> },
                { label: 'Global', icon: <PublicIcon /> },
                { label: 'Premium', icon: <AutoAwesomeIcon /> }
              ].map((item, i) => (
                <Box key={i} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ bgcolor: 'rgba(0, 230, 118, 0.1)', color: '#00e676', width: 58, height: 58, border: '1px solid rgba(0, 230, 118, 0.2)' }}>
                    {item.icon}
                  </Avatar>
                  <Typography variant="caption" sx={{ color: '#cbd5e1', fontWeight: 600 }}>{item.label}</Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>

        {/* Right Form Card */}
        <Box
          sx={{
            width: '100%', maxWidth: { xs: '100%', sm: '520px', lg: '560px' },
            bgcolor: 'rgba(30, 41, 59, 0.6)',
            backdropFilter: 'blur(20px)',
            borderRadius: { xs: '20px', sm: '24px' },
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            p: { xs: 2.5, sm: 4 },
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{ color: "#ffffff", fontWeight: 800, mb: 0.5, textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '1.25rem', sm: '1.5rem' } }}
          >
            Create Account
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: "#94a3b8", mb: 3, textAlign: { xs: 'center', sm: 'left' }, fontSize: { xs: '0.82rem', sm: '0.875rem' } }}
          >
            Fill in your details below to get started.
          </Typography>

          {errorMessage && (
            <Box sx={{ p: 1.5, mb: 2.5, borderRadius: '12px', bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <Typography color="error" variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.85rem' }}>
                <span>⚠️</span> {errorMessage}
              </Typography>
            </Box>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
            <Grid container spacing={{ xs: 2, sm: 2.5 }}>

              {/* Sponsor Code */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="Sponsor_code" placeholder="Sponsor Code"
                  value={formData.Sponsor_code} onChange={handleSponsorCodeChange} onBlur={handleSponsorCodeBlur}
                  error={(formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5) || (formData.Sponsor_code.length >= 5 && !!sponsorError)}
                  helperText={
                    (formData.Sponsor_code.length > 0 && formData.Sponsor_code.length < 5)
                      ? "Minimum 5 chars."
                      : formData.Sponsor_code.length >= 5 && sponsorError ? sponsorError : ""
                  }
                  InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment> }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Sponsor Name */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="Sponsor_name" placeholder="Sponsor Name"
                  value={formData.Sponsor_name} disabled
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment> }}
                  sx={{
                    ...textFieldStyles,
                    "& .MuiOutlinedInput-root.Mui-disabled": { bgcolor: "rgba(255,255,255,0.02)" },
                    "& .MuiOutlinedInput-input.Mui-disabled": { WebkitTextFillColor: "rgba(255, 255, 255, 0.5)" }
                  }}
                />
              </Grid>

              {/* Full Name */}
              <Grid item xs={12}>
                <TextField
                  required fullWidth name="Name" placeholder="Full Name"
                  value={formData.Name} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment> }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Email & Mobile */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="email" placeholder="Email Address" type="email"
                  value={formData.email} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment> }}
                  sx={textFieldStyles}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="mobileno" placeholder="Mobile Number (10 digits)" type="tel"
                  value={formData.mobileno} onChange={handleChange}
                  disabled={isMobileVerified}
                  inputProps={{ maxLength: 10, inputMode: "numeric" }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon sx={{ color: isMobileVerified ? "#00e676" : (formData.mobileno.length === 10 ? "#38bdf8" : "rgba(255,255,255,0.4)") }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        {isMobileVerified ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, bgcolor: 'rgba(0, 230, 118, 0.15)', px: 1, py: 0.4, borderRadius: '8px', border: '1px solid rgba(0, 230, 118, 0.3)' }}>
                            <CheckCircleIcon sx={{ color: '#00e676', fontSize: 16 }} />
                            <Typography sx={{ color: '#00e676', fontSize: '0.72rem', fontWeight: 700 }}>Verified</Typography>
                            <Button
                              size="small"
                              onClick={() => { setIsMobileVerified(false); setFirebaseToken(""); }}
                              sx={{ minWidth: 'auto', p: 0, ml: 0.5, color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', textTransform: 'none', '&:hover': { color: '#ef4444' } }}
                            >
                              Edit
                            </Button>
                          </Box>
                        ) : (
                          <Button
                            size="small"
                            variant="contained"
                            disabled={formData.mobileno.length !== 10 || isSendingOTP}
                            onClick={handleSendOTP}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 700,
                              fontSize: '0.72rem',
                              py: 0.4,
                              px: 1.2,
                              borderRadius: '8px',
                              bgcolor: formData.mobileno.length === 10 ? '#0284C7' : 'rgba(255,255,255,0.08)',
                              color: '#ffffff',
                              boxShadow: 'none',
                              '&:hover': { bgcolor: '#0369A1' },
                              '&:disabled': { color: 'rgba(255,255,255,0.3)', bgcolor: 'rgba(255,255,255,0.04)' }
                            }}
                          >
                            {isSendingOTP ? <CircularProgress size={14} sx={{ color: '#fff' }} /> : "Verify OTP"}
                          </Button>
                        )}
                      </InputAdornment>
                    )
                  }}
                  helperText={
                    !isMobileVerified && formData.mobileno.length === 10
                      ? "Click 'Verify OTP' to verify your number"
                      : ""
                  }
                  FormHelperTextProps={{
                    sx: { color: '#38bdf8', fontSize: '0.72rem', mt: 0.5 }
                  }}
                  sx={{
                    ...textFieldStyles,
                    "& .MuiOutlinedInput-root": {
                      ...textFieldStyles["& .MuiOutlinedInput-root"],
                      borderColor: isMobileVerified ? "#00e676 !important" : undefined
                    }
                  }}
                />
              </Grid>

              {/* Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="password" placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password} onChange={handleChange}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Confirm Password */}
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="confirmPassword" placeholder="Confirm Password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword} onChange={handleChange}
                  error={!!(formData.confirmPassword && formData.password !== formData.confirmPassword)}
                  helperText={formData.confirmPassword && formData.password !== formData.confirmPassword ? "Passwords do not match" : ""}
                  InputProps={{
                    startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment>,
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                          {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Country & Pincode */}
              <Grid item xs={12} sm={6}>
                <TextField
                  select required fullWidth name="country"
                  value={formData.country} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><PublicIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment> }}
                  SelectProps={{
                    displayEmpty: true,
                    renderValue: (value: any) => {
                      if (!value) return <span style={{ color: "rgba(255, 255, 255, 0.3)" }}>Country</span>;
                      return value;
                    }
                  }}
                  sx={{ ...textFieldStyles, "& .MuiSelect-icon": { color: "rgba(255, 255, 255, 0.6)" } }}
                >
                  <MenuItem disabled value=""><em>Country</em></MenuItem>
                  {COUNTRIES.map(country => (
                    <MenuItem key={country} value={country}>{country}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required fullWidth name="pincode" placeholder="Pincode"
                  value={formData.pincode} onChange={handleChange}
                  InputProps={{ startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: "rgba(255,255,255,0.4)" }} /></InputAdornment> }}
                  sx={textFieldStyles}
                />
              </Grid>

              {/* Gender */}
              <Grid item xs={12} sx={{ mt: 0.5 }}>
                <FormControl error={!!genderError}>
                  <FormLabel sx={{ color: "rgba(255,255,255,0.7)", display: 'flex', alignItems: 'center', mb: 1, fontSize: '0.9rem' }}>
                    <WcIcon sx={{ mr: 1, color: "rgba(255,255,255,0.4)", fontSize: '1.2rem' }} /> Gender
                  </FormLabel>
                  <RadioGroup row name="gender" value={formData.gender} onChange={handleRadioChange}>
                    <FormControlLabel value="Male" control={<Radio size="small" sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#00e676" } }} />} label={<span style={{ color: "rgba(255,255,255,0.8)", fontSize: '0.9rem' }}>Male</span>} />
                    <FormControlLabel value="Female" control={<Radio size="small" sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#00e676" } }} />} label={<span style={{ color: "rgba(255,255,255,0.8)", fontSize: '0.9rem' }}>Female</span>} />
                  </RadioGroup>
                  {genderError && <FormHelperText sx={{ color: "#ef4444", mx: 0 }}>Please select a gender</FormHelperText>}
                </FormControl>
              </Grid>

              {/* Terms */}
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={isChecked} onChange={handleCheckboxChange} size="small" sx={{ color: "rgba(255,255,255,0.3)", "&.Mui-checked": { color: "#00e676" } }} />}
                  label={
                    <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.7)", fontSize: { xs: '0.8rem', sm: '0.85rem' } }}>
                      I accept the Terms and Conditions
                    </Typography>
                  }
                />
              </Grid>

              {/* Submit */}
              <Grid item xs={12} sx={{ mt: 1 }}>
                <Button
                  type="submit" fullWidth variant="contained" disabled={!isChecked || isPending}
                  sx={{
                    py: 1.7,
                    bgcolor: "#00e676",
                    color: "#0f172a",
                    fontWeight: 800,
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    borderRadius: "12px",
                    textTransform: "none",
                    boxShadow: "0 8px 24px rgba(0, 230, 118, 0.2)",
                    transition: "all 0.3s ease",
                    "&:hover": { bgcolor: "#00c853", transform: "translateY(-2px)", boxShadow: "0 12px 28px rgba(0, 230, 118, 0.3)" },
                    "&:disabled": { bgcolor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.3)" }
                  }}
                >
                  {isPending ? "Creating Account..." : "Create Account"}
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Typography variant="body2" sx={{ textAlign: "center", mt: 3, color: "#94a3b8", fontSize: { xs: '0.82rem', sm: '0.875rem' } }}>
            Already registered?{" "}
            <Link to="/login" style={{ color: "#00e676", textDecoration: "none", fontWeight: 700 }}>
              Sign In
            </Link>
          </Typography>
        </Box>
      </Box>

      {/* Success Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            border: '1px solid rgba(0, 230, 118, 0.2)',
            borderRadius: '24px',
            p: { xs: 1, sm: 2 },
            boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
            mx: { xs: 2, sm: 'auto' },
          }
        }}
      >
        <DialogTitle sx={{ color: '#00e676', textAlign: 'center', fontWeight: 800, fontSize: { xs: '1.2rem', sm: '1.5rem' } }}>
          🎉 Registration Successful!
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center' }}>
          <Typography variant="body1" sx={{ color: '#f8fafc', mb: 3, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
            Welcome aboard! Here are your account details:
          </Typography>
          <Box
            sx={{
              bgcolor: 'rgba(15,23,42,0.6)',
              p: { xs: 2, sm: 3 },
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.06)',
              display: 'inline-block',
              textAlign: 'left',
              minWidth: { xs: '100%', sm: 260 },
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            <Typography variant="body2" sx={{ color: '#fff', mb: 1.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              <strong style={{ color: '#00e676', display: 'inline-block', minWidth: '110px' }}>Member ID:</strong>
              {registrationData.memberId}
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', mb: 1.5, fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              <strong style={{ color: '#00e676', display: 'inline-block', minWidth: '110px' }}>Mobile:</strong>
              {registrationData.mobile}
            </Typography>
            <Typography variant="body2" sx={{ color: '#fff', fontSize: { xs: '0.85rem', sm: '1rem' } }}>
              <strong style={{ color: '#00e676', display: 'inline-block', minWidth: '110px' }}>Email:</strong>
              {registrationData.email}
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ mt: 3, color: '#94a3b8', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
            Use your <strong style={{ color: '#00e676' }}>mobile number</strong> and the <strong style={{ color: '#00e676' }}>password</strong> you just created to log in.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button
            onClick={handleCloseDialog}
            sx={{
              bgcolor: '#00e676',
              color: '#0f172a',
              fontWeight: 700,
              px: { xs: 4, sm: 6 },
              py: 1.5,
              borderRadius: '12px',
              textTransform: 'none',
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': { bgcolor: '#00c853', transform: 'translateY(-2px)' },
              transition: 'all 0.2s'
            }}
          >
            Go to Login
          </Button>
        </DialogActions>
      </Dialog>

      {/* Invisible reCAPTCHA container for Phone Auth */}
      <div id="register-recaptcha-container"></div>

      {/* OTP Verification Dialog */}
      <Dialog
        open={otpDialogOpen}
        onClose={() => setOtpDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#1e293b',
            color: '#fff',
            borderRadius: '20px',
            p: { xs: 2, sm: 2.5 },
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.7)',
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 1, fontWeight: 800, fontSize: { xs: '1.15rem', sm: '1.25rem' } }}>
          Verify Mobile Number
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5, pt: 1 }}>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem' }}>
            Enter the 6-digit verification code sent to <strong style={{ color: '#38bdf8' }}>+91 {formData.mobileno}</strong>
          </Typography>

          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <MuiOtpInput
              value={otp}
              onChange={setOtp}
              length={6}
              autoFocus
              TextFieldsProps={{
                sx: {
                  '& .MuiOutlinedInput-root': {
                    color: '#ffffff',
                    bgcolor: 'rgba(255,255,255,0.06)',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
                    '&:hover fieldset': { borderColor: '#38bdf8' },
                    '&.Mui-focused fieldset': { borderColor: '#00e676', borderWidth: '2px' }
                  },
                  '& .MuiOutlinedInput-input': {
                    textAlign: 'center',
                    fontSize: { xs: '1.1rem', sm: '1.3rem' },
                    fontWeight: 700,
                    p: { xs: 1, sm: 1.5 }
                  }
                }
              }}
            />
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', px: 1 }}>
            <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              Didn't receive code?
            </Typography>
            <Button
              size="small"
              onClick={handleSendOTP}
              disabled={resendCooldown > 0 || isSendingOTP}
              sx={{
                color: resendCooldown > 0 ? 'rgba(255,255,255,0.4)' : '#38bdf8',
                fontWeight: 700,
                textTransform: 'none',
                fontSize: '0.8rem'
              }}
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
            </Button>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 2, pb: 1, gap: 1 }}>
          <Button
            onClick={() => setOtpDialogOpen(false)}
            sx={{ color: 'rgba(255,255,255,0.6)', textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            disabled={otp.length !== 6 || isVerifyingOTP}
            onClick={handleVerifyOTP}
            sx={{
              bgcolor: '#00e676',
              color: '#0f172a',
              fontWeight: 800,
              borderRadius: '12px',
              py: 1.2,
              textTransform: 'none',
              '&:hover': { bgcolor: '#00c853' },
              '&:disabled': { bgcolor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.3)' }
            }}
          >
            {isVerifyingOTP ? <CircularProgress size={20} sx={{ color: '#0f172a' }} /> : "Verify Code"}
          </Button>
        </DialogActions>
      </Dialog>

      {(isLoading || isPending) && <LoadingComponent />}
    </Box>
  );
};

export default Register;
