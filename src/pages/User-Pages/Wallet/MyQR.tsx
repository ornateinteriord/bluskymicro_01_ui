import React, { useState } from 'react';
import { Box, Typography, Button, Paper, CircularProgress, Stack, Dialog, DialogTitle, DialogContent, DialogActions, TextField, List, ListItemButton, Avatar, Divider, Chip } from '@mui/material';
import { useGetMemberDetails } from '../../../api/Memeber';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
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
    try {
      setSearchingMember(true);
      setFoundMember(null);
      const res = await get(`/chat/search?mobileNumber=${searchMobile.trim()}`);
      if (res.success && res.data) {
        setFoundMember(res.data);
        toast.success('Member found in chat directory!');
      } else {
        toast.error(res.message || 'Member not found');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'No active member found with this mobile number');
    } finally {
      setSearchingMember(false);
    }
  };

  const handleSendQRToRoom = async (roomId: string, recipientName: string) => {
    if (!roomId) return;
    try {
      setSendingRoomId(roomId);
      const mId = TokenService.getMemberId() || memberDetails?.Member_id || memberDetails?.member_id || '';
      const mName = memberDetails?.Name || memberDetails?.name || memberDetails?.username || 'Member';
      const qrData = `Ecash-P2P:${mId}`;
      const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&margin=10`;
      const messageText = `P2P Transfer QR Code\nName: ${mName}\nMember ID: ${mId}\n\nEcash-P2P:${mId}`;
      const res = await post('/chat/message/send', {
        roomId,
        text: messageText,
        imageUrl: qrImageUrl,
        messageType: 'image',
      });
      if (res.success) {
        toast.success(`P2P QR Code shared to ${recipientName || 'Chat'} successfully!`);
        setShareOpen(false);
        setSearchMobile('');
        setFoundMember(null);
      } else {
        toast.error(res.message || 'Failed to share QR code');
      }
    } catch (err) {
      toast.error('Failed to send QR code to chat');
    } finally {
      setSendingRoomId(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress sx={{ color: '#0284C7' }} />
      </Box>
    );
  }

  const memberId = TokenService.getMemberId() || memberDetails?.Member_id || memberDetails?.member_id || 'UNKNOWN';
  const memberName = memberDetails?.Name || memberDetails?.name || memberDetails?.username || 'Member';
  const qrData = `Ecash-P2P:${memberId}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrData)}&margin=10`;

  const handleCopy = () => {
    navigator.clipboard.writeText(qrData);
    toast.success('QR Code Data copied to clipboard!');
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
    <Box sx={{ p: { xs: 2, sm: 4 }, maxWidth: '600px', mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: '28px',
          bgcolor: '#F8FAFC',
          border: '1px solid #E2E8F0',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)',
        }}
      >
        <Box sx={{ display: 'inline-flex', p: 2, borderRadius: '20px', bgcolor: 'rgba(255, 215, 0, 0.1)', mb: 2 }}>
          <QrCode2Icon sx={{ fontSize: 40, color: '#0284C7' }} />
        </Box>

        <Typography variant="h4" sx={{ color: '#0F172A', fontWeight: 900, mb: 0.5, letterSpacing: '0.5px',fontSize:{xs:20,sm:25} }}>
          MY P2P QR CODE
        </Typography>
        <Typography variant="body2" sx={{ color: '#475569', mb: 4, maxWidth: '400px', mx: 'auto',fontSize:{xs:12,sm:14} }}>
          Share this QR code with other Ecash members to receive instant member-to-member transfers directly to your Top Up Wallet.
        </Typography>

        <Box
          sx={{
            p: 3,
            bgcolor: '#F1F5F9',
            borderRadius: '24px',
            display: 'inline-block',
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            mb: 4,
          }}
        >
          <img
            src={qrImageUrl}
            alt="My P2P QR Code"
            style={{ width: '220px', height: '220px', display: 'block' }}
          />
        </Box>

        <Box sx={{ mb: 4, p: 2, borderRadius: '16px', bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Typography variant="caption" sx={{ color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', display: 'block', mb: 0.5,fontSize:{xs:12,sm:14} }}>
            Member Name & ID
          </Typography>
          <Typography variant="h6" sx={{ color: '#0F172A', fontWeight: 800,fontSize:{xs:12,sm:14} }}>
            {memberName} ({memberId})
          </Typography>
        </Box>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopy}
            sx={{
              background: 'linear-gradient(45deg, #0EA5E9 30%, #0284C7 90%)',
              color: '#FFFFFF',
              borderRadius: '999px',
              px: 3.5,
              py: 1.5,
              fontWeight: 900,
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 15px rgba(255, 215, 0, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #0284C7 30%, #0369A1 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(255, 215, 0, 0.5)',
              },
            }}
          >
            Copy QR Data
          </Button>

          <Button
            variant="contained"
            startIcon={<ChatBubbleOutlineIcon />}
            onClick={handleOpenShare}
            sx={{
              background: 'linear-gradient(45deg, #0EA5E9 30%, #0284C7 90%)',
              color: '#FFFFFF',
              borderRadius: '999px',
              px: 3.5,
              py: 1.5,
              fontWeight: 900,
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              letterSpacing: '0.5px',
              boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #0284C7 30%, #0369A1 90%)',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(2, 132, 199, 0.5)',
              },
            }}
          >
            Share to Chat
          </Button>

          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
            sx={{
              borderColor: '#E2E8F0',
              color: '#0F172A',
              borderRadius: '999px',
              px: 3.5,
              py: 1.5,
              fontWeight: 800,
              textTransform: 'uppercase',
              fontSize: '0.8rem',
              letterSpacing: '0.5px',
              '&:hover': {
                bordercolor: '#0F172A',
                bgcolor: '#F8FAFC',
                transform: 'translateY(-2px)',
              },
            }}
          >
            Download QR
          </Button>
        </Stack>
      </Paper>

      {/* SHARE TO CHAT DIALOG */}
      <Dialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: { xs: '20px', sm: '24px' },
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            color: '#0F172A',
            m: { xs: 1.5, sm: 4 },
            width: { xs: 'calc(100% - 24px)', sm: '100%' },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, pt: { xs: 2.5, sm: 3 }, px: { xs: 2, sm: 3 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ p: { xs: 0.8, sm: 1 }, borderRadius: '12px', bgcolor: 'rgba(2, 132, 199, 0.1)', display: 'flex', flexShrink: 0 }}>
            <ChatBubbleOutlineIcon sx={{ color: '#00E676', fontSize: { xs: 22, sm: 24 } }} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 900, color: '#0F172A', lineHeight: 1.2, fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
              Share P2P QR to Chat
            </Typography>
            <Typography variant="caption" sx={{ color: '#475569', fontSize: { xs: '0.7rem', sm: '0.75rem' }, display: 'block', lineHeight: 1.3, mt: 0.2 }}>
              Send your QR code directly to any member in your chat conversations
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
          <Box sx={{ p: { xs: 1.5, sm: 2 }, mb: 3, borderRadius: '16px', bgcolor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.3)', display: 'flex', alignItems: 'center', gap: { xs: 1.5, sm: 2 } }}>
            <img src={qrImageUrl} alt="QR Preview" style={{ width: 50, height: 50, borderRadius: '8px', background: '#fff', padding: '4px', flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#00E676', fontSize: { xs: 13, sm: 14 }, wordBreak: 'break-word' }}>
                Sharing QR of: {memberName} ({memberId})
              </Typography>
              <Typography variant="caption" sx={{ color: '#475569', display: 'block', fontSize: { xs: 11, sm: 12 }, lineHeight: 1.3, mt: 0.2 }}>
                Recipient will receive your QR image, Member ID & Name
              </Typography>
            </Box>
          </Box>

          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 700 }}>
              Search Member by Mobile Number
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Enter registered mobile number..."
                value={searchMobile}
                onChange={(e) => setSearchMobile(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchMember()}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    color: '#0F172A',
                    bgcolor: '#F8FAFC',
                    borderRadius: '12px',
                    '& fieldset': { borderColor: '#E2E8F0' },
                    '&:hover fieldset': { borderColor: '#00E676' },
                    '&.Mui-focused fieldset': { borderColor: '#00E676' },
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSearchMember}
                disabled={searchingMember}
                sx={{
                  bgcolor: '#0284C7',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  borderRadius: '12px',
                  px: 2.5,
                  flexShrink: 0,
                  '&:hover': { bgcolor: '#0369A1' },
                }}
              >
                {searchingMember ? <CircularProgress size={20} sx={{ color: '#FFFFFF' }} /> : <SearchIcon />}
              </Button>
            </Box>

            {foundMember && foundMember.chatRoom && (
              <Box sx={{ mt: 2, p: { xs: 1.5, sm: 2 }, borderRadius: '16px', bgcolor: 'rgba(2, 132, 199, 0.08)', border: '1px solid rgba(2, 132, 199, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2, minWidth: 0, flex: 1 }}>
                  <Avatar sx={{ bgcolor: '#00E676', color: '#FFFFFF', fontWeight: 900, width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, flexShrink: 0 }}>
                    {(foundMember.name || 'U')[0].toUpperCase()}
                  </Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography noWrap variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: 13, sm: 14 } }}>
                      {foundMember.name} {foundMember.Member_id || foundMember.memberId || foundMember.member_id ? `(${foundMember.Member_id || foundMember.memberId || foundMember.member_id})` : ''}
                    </Typography>
                    <Typography noWrap variant="caption" sx={{ color: '#475569', display: 'block', fontSize: { xs: 11, sm: 12 } }}>
                      Role: {foundMember.role || 'Member'}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  endIcon={<SendIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                  disabled={sendingRoomId === foundMember.chatRoom.roomId}
                  onClick={() => handleSendQRToRoom(foundMember.chatRoom.roomId, foundMember.name)}
                  sx={{
                    background: 'linear-gradient(45deg, #0EA5E9 30%, #0284C7 90%)',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    borderRadius: '999px',
                    px: { xs: 1.5, sm: 2 },
                    py: { xs: 0.5, sm: 0.8 },
                    fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                    flexShrink: 0,
                    textTransform: 'none',
                    boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                    '&:hover': { background: 'linear-gradient(45deg, #0284C7 30%, #0369A1 90%)' },
                  }}
                >
                  {sendingRoomId === foundMember.chatRoom.roomId ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : 'Send QR'}
                </Button>
              </Box>
            )}
          </Box>

          <Divider sx={{ my: 3, borderColor: '#E2E8F0' }}>
            <Chip label="OR RECENT CHATS" sx={{ bgcolor: '#F8FAFC', color: '#475569', fontWeight: 700, fontSize: '11px' }} />
          </Divider>

          <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569', fontWeight: 700 }}>
            Select Active Conversation
          </Typography>

          {loadingRooms ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#00E676' }} />
            </Box>
          ) : chatRooms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3, px: 2, bgcolor: '#F8FAFC', borderRadius: '16px' }}>
              <Typography variant="body2" sx={{ color: '#475569' }}>
                No active chat conversations found. Search a member above to start!
              </Typography>
            </Box>
          ) : (
            <List sx={{ maxHeight: '240px', overflowY: 'auto', pr: 0.5 }}>
              {chatRooms.map((room) => {
                const otherParticipant = room.participantDetails?.find(
                  (p: any) => p.memberId !== currentUserId
                ) || room.participantDetails?.[0];

                const name = otherParticipant?.name || 'Chat Member';
                const role = otherParticipant?.role || 'Member';

                return (
                  <ListItemButton
                    key={room.roomId}
                    sx={{
                      borderRadius: '16px',
                      mb: 1,
                      bgcolor: '#F8FAFC',
                      border: '1px solid #E2E8F0',
                      '&:hover': { bgcolor: '#F8FAFC' },
                      justifyContent: 'space-between',
                      px: { xs: 1.5, sm: 2 },
                      py: 1.5,
                      gap: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 }, minWidth: 0, flex: 1 }}>
                      <Avatar src={otherParticipant?.profileImage} sx={{ bgcolor: '#0284C7', color: '#FFFFFF', fontWeight: 900, width: { xs: 36, sm: 40 }, height: { xs: 36, sm: 40 }, flexShrink: 0 }}>
                        {name[0].toUpperCase()}
                      </Avatar>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography noWrap variant="body2" sx={{ fontWeight: 800, color: '#0F172A', fontSize: { xs: 13, sm: 14 } }}>
                          {name} {otherParticipant?.memberId || otherParticipant?.Member_id ? `(${otherParticipant?.memberId || otherParticipant?.Member_id})` : ''}
                        </Typography>
                        <Typography noWrap variant="caption" sx={{ color: '#475569', display: 'block', fontSize: { xs: 11, sm: 12 } }}>
                          {role} • {room.lastMessage ? (room.lastMessage.length > 25 ? room.lastMessage.substring(0, 25) + '...' : room.lastMessage) : 'No messages yet'}
                        </Typography>
                      </Box>
                    </Box>

                    <Button
                      variant="contained"
                      size="small"
                      endIcon={<SendIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />}
                      disabled={sendingRoomId === room.roomId}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendQRToRoom(room.roomId, name);
                      }}
                      sx={{
                        background: 'linear-gradient(45deg, #0EA5E9 30%, #0284C7 90%)',
                        color: '#FFFFFF',
                        fontWeight: 900,
                        borderRadius: '999px',
                        px: { xs: 1.5, sm: 2 },
                        py: { xs: 0.5, sm: 0.6 },
                        fontSize: { xs: '0.75rem', sm: '0.8125rem' },
                        flexShrink: 0,
                        textTransform: 'none',
                        boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)',
                        '&:hover': { background: 'linear-gradient(45deg, #0284C7 30%, #0369A1 90%)' },
                      }}
                    >
                      {sendingRoomId === room.roomId ? <CircularProgress size={16} sx={{ color: '#FFFFFF' }} /> : 'Send'}
                    </Button>
                  </ListItemButton>
                );
              })}
            </List>
          )}
        </DialogContent>

        <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: { xs: 2, sm: 3 }, justifyContent: 'center' }}>
          <Button
            onClick={() => setShareOpen(false)}
            sx={{
              color: '#475569',
              fontWeight: 800,
              px: 4,
              py: 0.8,
              borderRadius: '999px',
              border: '1px solid #E2E8F0',
              '&:hover': { color: '#0F172A', bgcolor: '#F8FAFC', borderColor: '#E2E8F0' },
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyQR;
