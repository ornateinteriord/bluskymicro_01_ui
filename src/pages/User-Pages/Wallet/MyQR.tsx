import React, { useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItemButton, Avatar, Divider, Chip, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGetMemberDetails } from '../../../api/Memeber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { toast } from 'react-toastify';
import { get, post } from '../../../api/Api';
import { jwtDecode } from 'jwt-decode';
import TokenService from '../../../api/token/tokenService';

const getCurrentUserId = () => {
  const tId = TokenService.getMemberId();
  if (tId) return tId;
  try {
    const token = TokenService.getToken();
    if (token) {
      const decoded: any = jwtDecode(token);
      return decoded.Member_id || decoded.memberId || decoded.id || '';
    }
  } catch (e) {}
  return '';
};

const MyQR: React.FC = () => {
  const navigate = useNavigate();
  const currentUserId = getCurrentUserId();
  const { data: memberDetails, isLoading } = useGetMemberDetails(currentUserId);

  // Chat Share Modal State
  const [shareOpen, setShareOpen] = useState(false);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [searchMobile, setSearchMobile] = useState('');
  const [searchingMember, setSearchingMember] = useState(false);
  const [foundMember, setFoundMember] = useState<any>(null);
  const [sendingRoomId, setSendingRoomId] = useState<string | null>(null);

  const handleOpenShare = async () => {
    setShareOpen(true);
    setLoadingRooms(true);
    try {
      const res = await get('/chat/rooms');
      if (res.success) {
        setChatRooms(res.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch chat rooms', err);
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleSearchMember = async () => {
    if (!searchMobile.trim()) {
      toast.error('Please enter a mobile number');
      return;
    }
    setSearchingMember(true);
    setFoundMember(null);
    try {
      const res = await get(`/chat/search-member?mobile=${encodeURIComponent(searchMobile.trim())}`);
      if (res.success && res.data) {
        const roomRes = await post('/chat/room', {
          targetMemberId: res.data.Member_id || res.data.memberId || res.data.id,
          targetRole: res.data.role || 'Member'
        });
        if (roomRes.success && roomRes.data) {
          setFoundMember({
            ...res.data,
            chatRoom: roomRes.data
          });
        }
      } else {
        toast.error('No member found with this mobile number');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Member not found');
    } finally {
      setSearchingMember(false);
    }
  };

  const handleSendQRToRoom = async (roomId: string, targetName: string) => {
    const memberId = TokenService.getMemberId() || memberDetails?.Member_id || memberDetails?.member_id || 'UNKNOWN';
    const memberName = memberDetails?.Name || memberDetails?.name || memberDetails?.username || 'Member';
    const qrData = `Ecash-P2P:${memberId}`;
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&margin=10`;

    setSendingRoomId(roomId);
    try {
      const res = await post('/chat/message', {
        roomId,
        content: `Here is my Ecash P2P QR Code for transfers.\nMember: ${memberName}\nID: ${memberId}`,
        attachments: [qrImageUrl]
      });
      if (res.success) {
        toast.success(`QR Code sent directly to ${targetName}!`);
        setShareOpen(false);
      }
    } catch (err) {
      toast.error('Failed to send QR code to chat');
    } finally {
      setSendingRoomId(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', bgcolor: '#FFF8F0' }}>
        <CircularProgress sx={{ color: '#6D214F' }} />
      </Box>
    );
  }

  const memberId = TokenService.getMemberId() || memberDetails?.Member_id || memberDetails?.member_id || 'UNKNOWN';
  const memberName = memberDetails?.Name || memberDetails?.name || memberDetails?.username || 'Member';
  const qrData = `Ecash-P2P:${memberId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData);
    toast.success('QR Code data copied to clipboard!');
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(qrImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Ecash-QR-${memberId}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('QR Code downloaded!');
    } catch (err) {
      toast.error('Failed to download QR code image.');
    }
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: '480px', 
      mx: 'auto', 
      minHeight: '100vh', 
      bgcolor: '#FFF8F0',
      pb: 10 
    }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <IconButton 
          onClick={() => navigate(-1)}
          sx={{ 
            bgcolor: '#ffffff', 
            border: '1.5px solid #f0d0d8',
            color: '#6D214F',
            p: 1,
            '&:hover': { bgcolor: '#fdf2f4' }
          }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 900, color: '#6D214F', letterSpacing: '-0.5px' }}>
            My P2P QR
          </Typography>
          <Typography variant="caption" sx={{ color: '#8c6b7d', fontWeight: 600 }}>
            Receive payments from other members
          </Typography>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: '24px',
          bgcolor: '#ffffff',
          border: '1.5px solid #f0d0d8',
          boxShadow: '0 8px 24px rgba(109, 33, 79, 0.06)',
          textAlign: 'center',
        }}
      >
        <Box sx={{ display: 'inline-flex', p: 1.5, borderRadius: '16px', bgcolor: 'rgba(244, 201, 93, 0.25)', mb: 2 }}>
          <QrCode2Icon sx={{ fontSize: 36, color: '#6D214F' }} />
        </Box>

        <Typography variant="h5" sx={{ color: '#6D214F', fontWeight: 900, mb: 0.5 }}>
          Scan to Pay Me
        </Typography>
        <Typography variant="caption" sx={{ color: '#8c6b7d', mb: 3, display: 'block', maxWidth: '320px', mx: 'auto', lineHeight: 1.4 }}>
          Share your QR code with members to receive instant wallet transfers to your Top Up Wallet.
        </Typography>

        <Box
          sx={{
            p: 2.5,
            bgcolor: '#FFF8F0',
            borderRadius: '20px',
            display: 'inline-block',
            border: '1.5px dashed #E5989B',
            boxShadow: '0 4px 16px rgba(109, 33, 79, 0.06)',
            mb: 3,
          }}
        >
          <img
            src={qrImageUrl}
            alt="My P2P QR Code"
            style={{ width: '200px', height: '200px', display: 'block', borderRadius: '12px' }}
          />
        </Box>

        <Box sx={{ mb: 3, p: 2, borderRadius: '16px', bgcolor: '#FFF8F0', border: '1px solid #f0d0d8' }}>
          <Typography variant="caption" sx={{ color: '#8c6b7d', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 700, display: 'block' }}>
            Account Holder
          </Typography>
          <Typography variant="subtitle1" sx={{ color: '#6D214F', fontWeight: 900 }}>
            {memberName}
          </Typography>
          <Box sx={{ bgcolor: 'rgba(244, 201, 93, 0.3)', px: 1.5, py: 0.3, borderRadius: '8px', display: 'inline-block', mt: 0.5 }}>
            <Typography variant="caption" sx={{ color: '#6D214F', fontWeight: 800 }}>
              ID: {memberId}
            </Typography>
          </Box>
        </Box>

        <Stack spacing={1.5}>
          <Button
            variant="contained"
            fullWidth
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            sx={{
              background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
              color: '#FFF8F0',
              borderRadius: '16px',
              py: 1.4,
              fontWeight: 900,
              textTransform: 'none',
              fontSize: '0.92rem',
              boxShadow: '0 8px 24px rgba(109, 33, 79, 0.25)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.2s'
            }}
          >
            Copy QR Data
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<ChatBubbleOutlineIcon sx={{ color: '#6D214F' }} />}
            onClick={handleOpenShare}
            sx={{
              borderColor: '#f0d0d8',
              color: '#6D214F',
              borderRadius: '16px',
              py: 1.3,
              fontWeight: 800,
              textTransform: 'none',
              fontSize: '0.92rem',
              '&:hover': {
                borderColor: '#6D214F',
                bgcolor: '#fdf2f4',
              },
            }}
          >
            Share to Chat
          </Button>

          <Button
            variant="outlined"
            fullWidth
            startIcon={<DownloadIcon sx={{ color: '#8c6b7d' }} />}
            onClick={handleDownload}
            sx={{
              borderColor: '#f0d0d8',
              color: '#8c6b7d',
              borderRadius: '16px',
              py: 1.3,
              fontWeight: 700,
              textTransform: 'none',
              fontSize: '0.92rem',
              '&:hover': {
                borderColor: '#8c6b7d',
                bgcolor: '#fdf2f4',
              },
            }}
          >
            Download Image
          </Button>
        </Stack>
      </Paper>

      {/* SHARE TO CHAT DIALOG */}
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '24px',
            bgcolor: '#ffffff',
            border: '1.5px solid #f0d0d8',
            color: '#2d0f1e',
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: 2.5, px: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: 1, borderRadius: '12px', bgcolor: 'rgba(109, 33, 79, 0.12)', display: 'flex' }}>
            <ChatBubbleOutlineIcon sx={{ color: '#6D214F', fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#6D214F' }}>
              Share QR to Chat
            </Typography>
            <Typography variant="caption" sx={{ color: '#8c6b7d', display: 'block' }}>
              Send QR code directly to any conversation
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: 2.5, py: 2 }}>
          <Box sx={{ my: 1 }}>
            <Typography variant="caption" sx={{ mb: 0.5, color: '#6D214F', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>
              Search Member by Mobile
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Mobile number..."
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchMember()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#2d0f1e',
                    bgcolor: '#FFF8F0',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#f0d0d8' },
                    '&:hover fieldset': { borderColor: '#E5989B' },
                    '&.Mui-focused fieldset': { borderColor: '#6D214F' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearchMember}
                disabled={searchingMember}
                sx={{
                  background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                  color: '#FFF8F0',
                  fontWeight: 800,
                  borderRadius: '12px',
                  px: 2,
                  '&:hover': { background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)' },
                }}
              >
                {searchingMember ? <CircularProgress size={18} sx={{ color: '#FFF8F0' }} /> : <SearchIcon fontSize="small" />}
              </Button>
            </Box>

            {foundMember && foundMember.chatRoom && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: '14px', bgcolor: '#FFF8F0', border: '1px solid #f0d0d8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                  <Avatar sx={{ bgcolor: '#6D214F', color: '#FFF8F0', fontWeight: 900, width: 36, height: 36 }}>
                    {(foundMember.name || 'U')[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap variant="body2" sx={{ fontWeight: 800, color: '#2d0f1e' }}>
                      {foundMember.name}
                    </Typography>
                    <Typography noWrap variant="caption" sx={{ color: '#8c6b7d' }}>
                      ID: {foundMember.Member_id || foundMember.memberId || 'N/A'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<SendIcon sx={{ fontSize: 16 }} />}
                  disabled={sendingRoomId === foundMember.chatRoom.roomId}
                  onClick={() => handleSendQRToRoom(foundMember.chatRoom.roomId, foundMember.name)}
                  sx={{
                    background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                    color: '#FFF8F0',
                    fontWeight: 800,
                    borderRadius: '10px',
                    px: 1.5,
                    py: 0.5,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    '&:hover': { background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)' },
                  }}
                >
                  {sendingRoomId === foundMember.chatRoom.roomId ? <CircularProgress size={14} sx={{ color: '#FFF8F0' }} /> : 'Send QR'}
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 2, borderColor: '#f0d0d8' }}>
            <Chip label="ACTIVE CONVERSATIONS" sx={{ bgcolor: '#FFF8F0', color: '#8c6b7d', fontWeight: 700, fontSize: '10px' }} />
          </Divider>

          {loadingRooms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress size={24} sx={{ color: '#6D214F' }} />
            </Box>
          ) : chatRooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2, px: 2, bgcolor: '#FFF8F0', borderRadius: '12px' }}>
              <Typography variant="caption" sx={{ color: '#8c6b7d' }}>
                No active chat conversations found.
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: '200px', overflowY: 'auto', p: 0 }}>
              {chatRooms.map((room) => {
                const otherParticipant = room.participantDetails?.find(
                  (p: any) => p.memberId !== currentUserId
                ) || room.participantDetails?.[0];

                const name = otherParticipant?.name || 'Chat Member';

                return (
                  <ListItemButton
                    key={room.roomId}
                    sx={{
                      borderRadius: '12px',
                      mb: 1,
                      bgcolor: '#FFF8F0',
                      border: '1px solid #f0d0d8',
                      '&:hover': { bgcolor: '#fdf2f4' },
                      justifyContent: 'space-between',
                      px: 1.5,
                      py: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                      <Avatar sx={{ bgcolor: '#6D214F', color: '#FFF8F0', fontWeight: 900, width: 34, height: 34, fontSize: '0.85rem' }}>
                        {name[0].toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap variant="body2" sx={{ fontWeight: 800, color: '#2d0f1e', fontSize: '0.85rem' }}>
                          {name}
                        </Typography>
                      </Box>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={sendingRoomId === room.roomId}
                      onClick={() => handleSendQRToRoom(room.roomId, name)}
                      sx={{
                        background: 'linear-gradient(135deg, #6D214F 0%, #8f2f68 100%)',
                        color: '#FFF8F0',
                        fontWeight: 800,
                        borderRadius: '10px',
                        px: 1.5,
                        py: 0.4,
                        fontSize: '0.72rem',
                        textTransform: 'none',
                        '&:hover': { background: 'linear-gradient(135deg, #4e1739 0%, #6D214F 100%)' },
                      }}
                    >
                      {sendingRoomId === room.roomId ? <CircularProgress size={14} sx={{ color: '#FFF8F0' }} /> : 'Send QR'}
                    </Button>
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 2.5, pb: 2 }}>
          <Button onClick={() => setShareOpen(false)} sx={{ color: '#8c6b7d', fontWeight: 700, textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyQR;
