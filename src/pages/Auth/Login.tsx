import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Checkbox, FormControlLabel, Link as MuiLink, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Visibility, VisibilityOff, PersonOutline, LockOutlined, Close as CloseIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { post } from '../../api/Api';

import { LoadingComponent } from '../../App';
import { useLoginMutation } from '../../api/Auth';
import ForgotPasswordForm from "./components/ForgotPasswordForm";
import bmsLogo from "../../assets/bms_logo.png";

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const [isAdminMode, setIsAdminMode] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Guest chat state
  const [openMsgDialog, setOpenMsgDialog] = useState(false);
  const [guestMsgData, setGuestMsgData] = useState({ name: "", phone: "", message: "" });
  const [isSendingMsg, setIsSendingMsg] = useState(false);

  // Load saved credentials on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("rememberedUser");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && typeof parsedUser === 'object' && parsedUser.username && parsedUser.password) {
          setFormData({
            username: parsedUser.username,
            password: parsedUser.password === "dummy-password" ? "" : parsedUser.password,
          });
          if (parsedUser.isAdminMode !== undefined) {
            setIsAdminMode(parsedUser.isAdminMode);
          }
          if (parsedUser.otpValues !== undefined) {
            setOtpValues(parsedUser.otpValues);
          }
          setRememberMe(true);
        } else {
          localStorage.removeItem("rememberedUser");
        }
      } catch (error) {
        localStorage.removeItem("rememberedUser");
        console.error("Failed to parse rememberedUser data:", error);
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    
    const newOtpValues = [...otpValues];
    // Keep only the last typed character in case they type multiple quickly
    newOtpValues[index] = value.slice(-1); 
    setOtpValues(newOtpValues);

    // Auto focus next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 6);
    if (pastedData) {
      const newOtpValues = [...otpValues];
      for (let i = 0; i < pastedData.length; i++) {
        newOtpValues[i] = pastedData[i];
      }
      setOtpValues(newOtpValues);
      const nextFocusIndex = Math.min(pastedData.length, 5);
      inputRefs.current[nextFocusIndex]?.focus();
    }
  };

  const loginMutation = useLoginMutation();
  const { mutate, isPending } = loginMutation;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let finalUsername = formData.username;
    
    if (!isAdminMode) {
      const cardSuffix = otpValues.join('');
      if (cardSuffix.length < 6) {
        toast.error("Please enter the full 6-digit card suffix.");
        return;
      }
      // Use the 6 digits directly as the Member_id
      finalUsername = cardSuffix;
    }

    const payload = { ...formData, username: finalUsername };
    // Users now need to enter a real password too
    // Removed dummy password bypass

    if (rememberMe) {
      localStorage.setItem("rememberedUser", JSON.stringify({ ...payload, isAdminMode, otpValues }));
    } else {
      localStorage.removeItem("rememberedUser");
    }

    mutate(payload);
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSendGuestMessage = async () => {
    if (!guestMsgData.name || !guestMsgData.phone || !guestMsgData.message) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      setIsSendingMsg(true);
      const guestId = `GUEST_${guestMsgData.phone}`;
      const res = await post("/chat/guest/message/send", {
        roomId: `${guestId}_ADMIN_1`,
        guestId: guestId,
        text: `From: ${guestMsgData.name} (${guestMsgData.phone})\n\n${guestMsgData.message}`
      });
      if (res.success) {
        toast.success("Message sent successfully!");
        setOpenMsgDialog(false);
        setGuestMsgData({ name: "", phone: "", message: "" });
      } else {
        toast.error("Failed to send message");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSendingMsg(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#0f172a", // Match welcome page theme
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "-10%",
          left: "-10%",
          width: "250px",
          height: "250px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(50px)",
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: "-5%",
          right: "-5%",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)",
          borderRadius: "50%",
          filter: "blur(60px)",
        }}
      />

      <Container component="main" maxWidth="xs" sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        {/* LOGO OUTSIDE FORM */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: 3 }}>
          <img src={bmsLogo} alt="BMS Logo" style={{ height: "90px", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </Box>

        <Paper
          elevation={24}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            p: { xs: 3, md: 4 },
            borderRadius: "16px",
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
          }}
        >

          {isResetMode ? (
            <ForgotPasswordForm onBackToLogin={() => setIsResetMode(false)} />
          ) : (
            <>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}
          >
            {isAdminMode ? (
              <TextField
                required
                fullWidth
                id="username"
                name="username"
                autoComplete="username"
                autoFocus
                label="Admin Username"
                placeholder="Enter your admin ID"
                value={formData.username}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#ffffff",
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "12px",
                    "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                    "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.25)" },
                    "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "2px" },
                  },
                  "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.6)" },
                  "& .MuiInputLabel-root.Mui-focused": { color: "#3b82f6" },
                  "& .MuiOutlinedInput-input::placeholder": { color: "rgba(255, 255, 255, 0.4)", opacity: 1 }
                }}
              />
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", textAlign: "center", mb: 0.5 }}>
                  Please enter your 6-Digit Login PIN in the boxes below
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'space-between', mb: 1 }}>
                  {"4638292644".split('').map((digit, index) => (
                    <TextField
                      key={`prefix-${index}`}
                      disabled
                      value={digit}
                      variant="outlined"
                      inputProps={{
                        style: { textAlign: 'center', fontSize: '1.1rem', padding: '10px 0', fontWeight: 'bold' }
                      }}
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          color: "#94a3b8",
                          bgcolor: "rgba(255, 255, 255, 0.05)",
                          borderRadius: "8px",
                          "& fieldset": { borderColor: "rgba(255, 255, 255, 0.1)" },
                        },
                        "& .Mui-disabled": {
                          WebkitTextFillColor: "#94a3b8 !important",
                          opacity: 1,
                        }
                      }}
                    />
                  ))}
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'space-between' }}>
                  {otpValues.map((digit, index) => (
                    <TextField
                      key={index}
                      inputRef={(el) => (inputRefs.current[index] = el)}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e as any)}
                      onPaste={handleOtpPaste}
                      variant="outlined"
                      inputProps={{
                        maxLength: 2, // Allow 2 to catch rapid typing and slice it
                        style: { textAlign: 'center', fontSize: '1.25rem', padding: '12px 0', fontWeight: 'bold' }
                      }}
                      sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                          color: "#ffffff",
                          bgcolor: "rgba(255, 255, 255, 0.02)",
                          borderRadius: "12px",
                          "& fieldset": { borderColor: "rgba(255, 255, 255, 0.12)" },
                          "&:hover fieldset": { borderColor: "rgba(255, 255, 255, 0.25)" },
                          "&.Mui-focused fieldset": { borderColor: "#3b82f6", borderWidth: "2px" },
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}

              <TextField
                required
                fullWidth
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                label="Password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: "rgba(255, 255, 255, 0.6)", mr: 0.5 }}
                      >
                        {showPassword ? <VisibilityOff sx={{ color: "rgba(255, 255, 255, 0.6)" }} /> : <Visibility sx={{ color: "rgba(255, 255, 255, 0.6)" }} />}
                      </IconButton>
                    </InputAdornment>
                  )
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    color: "#ffffff",
                    bgcolor: "rgba(255, 255, 255, 0.02)",
                    borderRadius: "12px",
                    "& fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.12)",
                    },
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 255, 255, 0.25)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#3b82f6",
                      borderWidth: "2px"
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "rgba(255, 255, 255, 0.6)",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#3b82f6",
                  },
                  "& .MuiOutlinedInput-input::placeholder": {
                    color: "rgba(255, 255, 255, 0.4)",
                    opacity: 1,
                  }
                }}
              />

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mt: -0.5
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    sx={{
                      color: "rgba(255, 255, 255, 0.3)",
                      "&.Mui-checked": {
                        color: "#3b82f6",
                      },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 500 }}>
                    Remember me
                  </Typography>
                }
              />
              <MuiLink
                component="button"
                type="button"
                onClick={() => setIsResetMode(true)}
                underline="hover"
                sx={{ color: "#3b82f6", fontSize: "0.875rem", fontWeight: 600, "&:hover": { color: "#60a5fa" } }}
              >
                Forgot password?
              </MuiLink>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isPending}
              sx={{
                mt: 1,
                mb: 1,
                background: "#3b82f6",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "1rem",
                padding: "12px",
                borderRadius: "12px",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                transition: "all 0.3s ease",
                "&:hover": {
                  background: "#2563eb",
                  transform: "translateY(-2px)",
                  boxShadow: "0 6px 16px rgba(59, 130, 246, 0.4)",
                },
                "&:disabled": {
                  background: "rgba(255, 255, 255, 0.12)",
                  color: "rgba(255, 255, 255, 0.3)"
                }
              }}
            >
              Sign In
            </Button>

            {/* ADMIN LOGIN TOGGLE */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1, width: '100%' }}>
              <MuiLink
                component="button"
                type="button"
                onClick={() => setIsAdminMode(!isAdminMode)}
                underline="hover"
                sx={{ color: "rgba(255, 255, 255, 0.5)", fontSize: "0.8rem", "&:hover": { color: "#ffffff" } }}
              >
                {isAdminMode ? "Login as Member" : "Login as Administrator"}
              </MuiLink>
            </Box>

            {/* INTEGRATED SECOND CONTAINER: CREATE ACCOUNT & SUPPORT */}
            <Box sx={{ mt: 2, pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.5)", mb: 2 }}>
                Don't have an account?
              </Typography>
              <Button
                component={Link}
                to="/register"
                fullWidth
                variant="outlined"
                sx={{
                  py: 1.5,
                  color: "#3b82f6",
                  borderColor: "rgba(59, 130, 246, 0.5)",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  borderRadius: "12px",
                  textTransform: "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    borderColor: "#3b82f6",
                    background: "rgba(59, 130, 246, 0.05)",
                  }
                }}
              >
                Create New Account
              </Button>

              {/* SUPPORT BUTTONS */}
              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: 3, width: '100%' }}>
                <Button 
                    variant="text" 
                    onClick={() => setOpenMsgDialog(true)}
                    sx={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      textTransform: 'none',
                      fontWeight: 500,
                      padding: 0,
                      minWidth: 'auto',
                      '&:hover': { bgcolor: 'transparent', color: '#3b82f6' }
                    }}
                >
                    💬 Message Us
                </Button>
                <Button 
                    variant="text" 
                    href="mailto:support@bmsfoundations.com"
                    sx={{ 
                      color: 'rgba(255,255,255,0.6)', 
                      textTransform: 'none',
                      fontWeight: 500,
                      padding: 0,
                      minWidth: 'auto',
                      '&:hover': { bgcolor: 'transparent', color: '#3b82f6' }
                    }}
                >
                    ✉️ Mail To Us
                </Button>
              </Box>
            </Box>

            </Box>
            </>
          )}
        </Paper>
      </Container>
      {isPending && <LoadingComponent />}

      {/* GUEST MESSAGE DIALOG */}
      <Dialog open={openMsgDialog} onClose={() => setOpenMsgDialog(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { bgcolor: '#0f172a', color: '#fff', borderRadius: '16px' } }}>
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600} color="#3b82f6">Message Support</Typography>
          <IconButton onClick={() => setOpenMsgDialog(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField 
            label="Your Name" 
            fullWidth 
            variant="outlined" 
            value={guestMsgData.name} 
            onChange={(e) => setGuestMsgData({ ...guestMsgData, name: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" } }}
          />
          <TextField 
            label="Mobile Number" 
            fullWidth 
            variant="outlined" 
            value={guestMsgData.phone} 
            onChange={(e) => setGuestMsgData({ ...guestMsgData, phone: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" } }}
          />
          <TextField 
            label="Message" 
            fullWidth 
            multiline 
            rows={4} 
            variant="outlined" 
            value={guestMsgData.message} 
            onChange={(e) => setGuestMsgData({ ...guestMsgData, message: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" } }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Button onClick={() => setOpenMsgDialog(false)} sx={{ color: 'rgba(255,255,255,0.6)' }}>Cancel</Button>
          <Button 
            onClick={handleSendGuestMessage} 
            variant="contained" 
            disabled={isSendingMsg}
            sx={{ background: "#3b82f6", color: "#ffffff", fontWeight: 600, borderRadius: '8px', '&:hover': { background: '#2563eb' } }}
          >
            {isSendingMsg ? "Sending..." : "Send Message"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Login;
