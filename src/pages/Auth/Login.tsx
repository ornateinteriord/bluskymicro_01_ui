import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, Checkbox, FormControlLabel, Link as MuiLink, InputAdornment, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Visibility, VisibilityOff, PersonOutline, LockOutlined, PhoneAndroid, Close as CloseIcon } from '@mui/icons-material';
import { toast } from 'react-toastify';
import { post } from '../../api/Api';

import { LoadingComponent } from '../../App';
import { useLoginMutation } from '../../api/Auth';
import ForgotPasswordForm from "./components/ForgotPasswordForm";

const textFieldSx = {
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
  "& .MuiOutlinedInput-input::placeholder": { color: "rgba(255, 255, 255, 0.4)", opacity: 1 },
};

const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);

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
    // For mobile number field (user mode): strip non-digit chars and cap at 10
    if (name === "username" && !isAdminMode) {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, username: digitsOnly }));
      return;
    }
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const loginMutation = useLoginMutation();
  const { mutate, isPending } = loginMutation;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isAdminMode) {
      // Validate mobile number: digits only, 10 digits
      const mobile = formData.username.trim();
      if (!/^\d{10}$/.test(mobile)) {
        toast.error("Please enter a valid 10-digit mobile number.");
        return;
      }
    }

    const payload = { ...formData, username: formData.username.trim() };

    if (rememberMe) {
      localStorage.setItem("rememberedUser", JSON.stringify({ ...payload, isAdminMode }));
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
        background: "#0f172a",
        position: "relative",
        overflow: "hidden",
        px: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Decorative blobs */}
      <Box sx={{ position: "absolute", top: "-10%", left: "-10%", width: { xs: "200px", sm: "250px" }, height: { xs: "200px", sm: "250px" }, background: "radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(50px)" }} />
      <Box sx={{ position: "absolute", bottom: "-5%", right: "-5%", width: { xs: "250px", sm: "400px" }, height: { xs: "250px", sm: "400px" }, background: "radial-gradient(circle, rgba(59, 130, 246, 0.08) 0%, transparent 70%)", borderRadius: "50%", filter: "blur(60px)" }} />

      <Container
        component="main"
        maxWidth="xs"
        sx={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}
      >
        {/* Brand Text */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', mb: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 950,
              fontSize: { xs: '2.2rem', sm: '2.8rem' },
              letterSpacing: '2px',
              color: '#38bdf8',
              textShadow: '0 4px 16px rgba(56, 189, 248, 0.4)'
            }}
          >
            Ecash
          </Typography>
        </Box>

        <Paper
          elevation={24}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            p: { xs: 2.5, sm: 4 },
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.02)",
            backdropFilter: "blur(12px)",
            boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
            border: "1px solid rgba(255, 255, 255, 0.07)",
          }}
        >
          {isResetMode ? (
            <ForgotPasswordForm onBackToLogin={() => setIsResetMode(false)} />
          ) : (
            <>
              {/* Header */}
              <Typography
                variant="h5"
                sx={{ color: "#fff", fontWeight: 800, mb: 0.5, textAlign: "center", fontSize: { xs: "1.3rem", sm: "1.5rem" } }}
              >
                Welcome Back
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "rgba(255,255,255,0.5)", mb: 3, textAlign: "center", fontSize: { xs: "0.82rem", sm: "0.875rem" } }}
              >
                {isAdminMode ? "Sign in to your admin account" : "Sign in with your mobile number & password"}
              </Typography>

              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%", display: "flex", flexDirection: "column", gap: { xs: 2, sm: 2.5 } }}
              >
                {/* Mobile Number or Admin Username */}
                <TextField
                  required
                  fullWidth
                  id="username"
                  name="username"
                  autoComplete={isAdminMode ? "username" : "tel"}
                  autoFocus
                  label={isAdminMode ? "Admin Username" : "Mobile Number"}
                  placeholder={isAdminMode ? "Enter your admin ID" : "10-digit mobile number"}
                  value={formData.username}
                  onChange={handleChange}
                  variant="outlined"
                  type="text"
                  inputMode={isAdminMode ? undefined : "numeric"}
                  inputProps={isAdminMode ? {} : { maxLength: 10, inputMode: "numeric" }}
                  error={!isAdminMode && formData.username.length > 0 && formData.username.length < 10}
                  helperText={
                    !isAdminMode && formData.username.length === 10
                      ? "✓ Valid mobile number"
                      : ""
                  }
                  FormHelperTextProps={{
                    sx: {
                      color: "#00e676",
                      fontSize: "0.76rem",
                      ml: 0.5,
                    }
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        {isAdminMode
                          ? <PersonOutline sx={{ color: "rgba(255, 255, 255, 0.5)" }} />
                          : <PhoneAndroid sx={{ color: formData.username.length === 10 ? "#00e676" : "rgba(255, 255, 255, 0.5)" }} />
                        }
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    ...textFieldSx,
                    ...(!isAdminMode && formData.username.length === 10 ? {
                      "& .MuiOutlinedInput-root": {
                        ...textFieldSx["& .MuiOutlinedInput-root"],
                        "& fieldset": { borderColor: "rgba(0, 230, 118, 0.5)" },
                        "&.Mui-focused fieldset": { borderColor: "#00e676", borderWidth: "2px" },
                      }
                    } : {})
                  }}
                />

                {/* Password */}
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
                  sx={textFieldSx}
                />

                {/* Remember Me & Forgot Password */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: -0.5, flexWrap: "wrap", gap: 1 }}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        size="small"
                        sx={{ color: "rgba(255, 255, 255, 0.3)", "&.Mui-checked": { color: "#3b82f6" } }}
                      />
                    }
                    label={
                      <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.7)", fontWeight: 500, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}>
                        Remember me
                      </Typography>
                    }
                  />
                  <MuiLink
                    component="button"
                    type="button"
                    onClick={() => setIsResetMode(true)}
                    underline="hover"
                    sx={{ color: "#3b82f6", fontSize: { xs: "0.8rem", sm: "0.875rem" }, fontWeight: 600, "&:hover": { color: "#60a5fa" } }}
                  >
                    Forgot password?
                  </MuiLink>
                </Box>

                {/* Sign In Button */}
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={isPending}
                  sx={{
                    mt: 0.5,
                    mb: 0.5,
                    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    fontSize: { xs: "0.95rem", sm: "1rem" },
                    padding: "13px",
                    borderRadius: "12px",
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(59, 130, 246, 0.35)",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                      transform: "translateY(-2px)",
                      boxShadow: "0 6px 20px rgba(59, 130, 246, 0.45)",
                    },
                    "&:disabled": { background: "rgba(255, 255, 255, 0.10)", color: "rgba(255, 255, 255, 0.3)" }
                  }}
                >
                  {isPending ? "Signing In..." : "Sign In"}
                </Button>

                {/* Admin Toggle */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.5, width: '100%' }}>
                  <MuiLink
                    component="button"
                    type="button"
                    onClick={() => {
                      setIsAdminMode(!isAdminMode);
                      setFormData({ username: "", password: "" });
                    }}
                    underline="hover"
                    sx={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.78rem", "&:hover": { color: "#ffffff" } }}
                  >
                    {isAdminMode ? "← Login as Member" : "Login as Administrator"}
                  </MuiLink>
                </Box>

                {/* Divider & Register */}
                <Box sx={{ mt: 1.5, pt: 2.5, borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', gap: 2 }}>
                  <Typography variant="body2" sx={{ color: "rgba(255, 255, 255, 0.45)", fontSize: { xs: "0.82rem", sm: "0.875rem" } }}>
                    Don't have an account?
                  </Typography>
                  <Button
                    component={Link}
                    to="/register"
                    fullWidth
                    variant="outlined"
                    sx={{
                      py: 1.4,
                      color: "#3b82f6",
                      borderColor: "rgba(59, 130, 246, 0.4)",
                      fontWeight: 600,
                      fontSize: { xs: "0.9rem", sm: "0.95rem" },
                      borderRadius: "12px",
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      "&:hover": { borderColor: "#3b82f6", background: "rgba(59, 130, 246, 0.06)" }
                    }}
                  >
                    Create New Account
                  </Button>

                  {/* Support Buttons */}
                  <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', gap: { xs: 2, sm: 3 }, width: '100%', flexWrap: 'wrap' }}>
                    <Button
                      variant="text"
                      onClick={() => setOpenMsgDialog(true)}
                      sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontWeight: 500, padding: 0, minWidth: 'auto', fontSize: { xs: "0.8rem", sm: "0.85rem" }, '&:hover': { bgcolor: 'transparent', color: '#3b82f6' } }}
                    >
                      💬 Message Us
                    </Button>
                    <Button
                      variant="text"
                      href="mailto:support@ecash.com"
                      sx={{ color: 'rgba(255,255,255,0.5)', textTransform: 'none', fontWeight: 500, padding: 0, minWidth: 'auto', fontSize: { xs: "0.8rem", sm: "0.85rem" }, '&:hover': { bgcolor: 'transparent', color: '#3b82f6' } }}
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

      {/* Guest Message Dialog */}
      <Dialog
        open={openMsgDialog}
        onClose={() => setOpenMsgDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { bgcolor: '#0f172a', color: '#fff', borderRadius: '16px', mx: { xs: 2, sm: 'auto' } } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" fontWeight={600} color="#3b82f6">Message Support</Typography>
          <IconButton onClick={() => setOpenMsgDialog(false)} sx={{ color: 'rgba(255,255,255,0.5)' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3, display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField
            label="Your Name" fullWidth variant="outlined"
            value={guestMsgData.name}
            onChange={(e) => setGuestMsgData({ ...guestMsgData, name: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" } }}
          />
          <TextField
            label="Mobile Number" fullWidth variant="outlined"
            value={guestMsgData.phone}
            onChange={(e) => setGuestMsgData({ ...guestMsgData, phone: e.target.value })}
            sx={{ "& .MuiOutlinedInput-root": { color: "#fff", "& fieldset": { borderColor: "rgba(255,255,255,0.2)" } }, "& .MuiInputLabel-root": { color: "rgba(255,255,255,0.6)" } }}
          />
          <TextField
            label="Message" fullWidth multiline rows={4} variant="outlined"
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
