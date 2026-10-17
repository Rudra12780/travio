import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Community } from '../types';
import { api } from '../api';

interface Props {
  community: Community;
  isOpen: boolean;
  userId?: number;
  onClose: () => void;
  onCommunityUpdated?: (updated: Community) => void;
}

export const CommunityQRModal: React.FC<Props> = ({
  community,
  isOpen,
  userId,
  onClose,
  onCommunityUpdated
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [currentCommunity, setCurrentCommunity] = useState<Community>(community);

  useEffect(() => {
    setCurrentCommunity(community);
  }, [community]);

  const inviteUrl = `${window.location.origin}/community/join/${currentCommunity.invite_token}`;

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    // Generate high-resolution, branded QR code
    QRCode.toCanvas(
      canvasRef.current,
      inviteUrl,
      {
        width: 260,
        margin: 2,
        color: {
          dark: '#0F172A', // Deep slate for crisp scan contrast
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      },
      (error) => {
        if (error) console.error('QR code generation error:', error);
      }
    );
  }, [isOpen, inviteUrl, currentCommunity.invite_token]);

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      showNotification('📋 Invitation link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      showNotification('Link: ' + inviteUrl);
    }
  };

  const handleDownloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `${currentCommunity.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-qr-invite.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showNotification('📥 QR Code image downloaded!');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join our expedition: ${currentCommunity.name}`,
          text: `Scan the QR code or click to join our travel community to ${currentCommunity.destination}!`,
          url: inviteUrl
        });
      } catch (err) {
        // Ignored if cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleRegenerate = async () => {
    if (!userId) return;
    const confirmRevoke = window.confirm(
      'Are you sure you want to regenerate this QR code?\n\nThis will immediately revoke the existing QR code and invitation link. Anyone who scans the old QR code will no longer be able to join.'
    );
    if (!confirmRevoke) return;

    setIsRegenerating(true);
    try {
      const res = await api.regenerateCommunityInvite(currentCommunity.id, userId);
      const updated: Community = {
        ...currentCommunity,
        invite_token: res.invite_token,
        is_invite_active: 1
      };
      setCurrentCommunity(updated);
      if (onCommunityUpdated) onCommunityUpdated(updated);
      showNotification('✨ New unique QR code generated! Previous QR code is revoked.');
    } catch (err: any) {
      alert(err.message || 'Failed to regenerate invite token');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleActive = async () => {
    if (!userId) return;
    const newActiveState = !currentCommunity.is_invite_active;
    setIsToggling(true);
    try {
      const res = await api.toggleCommunityInvite(currentCommunity.id, userId, newActiveState);
      const updated: Community = {
        ...currentCommunity,
        is_invite_active: res.is_invite_active
      };
      setCurrentCommunity(updated);
      if (onCommunityUpdated) onCommunityUpdated(updated);
      showNotification(res.message);
    } catch (err: any) {
      alert(err.message || 'Failed to update invitation status');
    } finally {
      setIsToggling(false);
    }
  };

  const isCreator = userId ? currentCommunity.creator_id === userId : false;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(10px)',
        padding: '20px'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          border: '1.5px solid #E8E2F0',
          borderRadius: '28px',
          width: '100%',
          maxWidth: '480px',
          padding: '32px 24px',
          boxShadow: '0 25px 60px -15px rgba(32, 63, 112, 0.25)',
          color: '#292833',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: '#FAF9FC',
            border: '1px solid #E8E2F0',
            color: '#777584',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s'
          }}
        >
          ✕
        </button>

        {/* Header Tag */}
        <span
          style={{
            background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.25) 100%)',
            border: '1px solid #E8E2F0',
            color: '#203F70',
            fontSize: '11px',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            padding: '4px 14px',
            borderRadius: '9999px',
            marginBottom: '10px'
          }}
        >
          📱 Community QR Invitation Pass
        </span>

        <h3 style={{ fontSize: '20px', fontWeight: 900, margin: '0 0 4px', color: '#292833' }}>
          {currentCommunity.name}
        </h3>
        <p style={{ fontSize: '13px', color: '#777584', margin: '0 0 18px' }}>
          📍 {currentCommunity.destination} • {currentCommunity.current_members}/{currentCommunity.max_members} members
        </p>

        {/* QR Code Card Frame */}
        <div
          style={{
            background: '#FAF9FC',
            borderRadius: '20px',
            padding: '16px',
            boxShadow: '0 8px 24px rgba(32, 63, 112, 0.06)',
            border: '2px solid #E8E2F0',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '16px',
            position: 'relative'
          }}
        >
          <canvas ref={canvasRef} style={{ width: '220px', height: '220px', display: 'block' }} />

          {!currentCommunity.is_invite_active && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(25, 43, 77, 0.88)',
                borderRadius: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                color: '#EF4444'
              }}
            >
              <span style={{ fontSize: '28px', marginBottom: '6px' }}>⏸️</span>
              <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>Invitations Paused</strong>
              <p style={{ fontSize: '11px', color: '#FAF9FC', margin: '4px 0 0' }}>
                New visitors cannot join until the organizer resumes invitations.
              </p>
            </div>
          )}

          <div
            style={{
              marginTop: '6px',
              fontSize: '11px',
              fontWeight: 800,
              color: '#8178E8',
              letterSpacing: '0.04em'
            }}
          >
            SCAN TO JOIN ON GLOBETROTTER
          </div>
        </div>

        {/* Shareable URL Box */}
        <div
          style={{
            width: '100%',
            background: '#FAF9FC',
            border: '1px solid #E8E2F0',
            borderRadius: '14px',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          <span
            style={{
              fontSize: '12px',
              color: '#292833',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              textAlign: 'left'
            }}
          >
            {inviteUrl}
          </span>
          <button
            type="button"
            onClick={handleCopyLink}
            style={{
              background: copied ? '#8178E8' : 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '6px 14px',
              fontSize: '11.5px',
              fontWeight: 800,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease'
            }}
          >
            {copied ? '✓ Copied!' : 'Copy'}
          </button>
        </div>

        {/* Action Buttons Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%', marginBottom: '14px' }}>
          <button
            type="button"
            onClick={handleDownloadQR}
            style={{
              background: 'linear-gradient(135deg, #8178E8 0%, #A678BD 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '11px 16px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 4px 14px rgba(129, 120, 232, 0.25)'
            }}
          >
            <span>📥 Download</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            style={{
              background: 'linear-gradient(135deg, rgba(247, 191, 213, 0.25) 0%, rgba(195, 154, 217, 0.25) 100%)',
              color: '#203F70',
              border: '1.5px solid #E8E2F0',
              borderRadius: '9999px',
              padding: '11px 16px',
              fontSize: '13px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <span>🔗 Share Link</span>
          </button>
        </div>

        {/* Creator Management Controls */}
        {isCreator && (
          <div
            style={{
              width: '100%',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              paddingTop: '14px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <button
              type="button"
              onClick={handleToggleActive}
              disabled={isToggling}
              style={{
                background: currentCommunity.is_invite_active ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: currentCommunity.is_invite_active ? '#FBBF24' : '#34D399',
                border: currentCommunity.is_invite_active ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(16, 185, 129, 0.35)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {currentCommunity.is_invite_active ? '⏸️ Pause Invites' : '▶️ Resume Invites'}
            </button>

            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              title="Revokes previous QR and issues a fresh one"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#F87171',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {isRegenerating ? 'Generating...' : '🔄 Revoke & New QR'}
            </button>
          </div>
        )}

        {/* Toast popup */}
        {toastMsg && (
          <div
            style={{
              position: 'absolute',
              bottom: '-45px',
              background: '#0F172A',
              border: '1px solid #2DD4BF',
              color: '#FFFFFF',
              fontSize: '12px',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: '9999px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              whiteSpace: 'nowrap',
              animation: 'fadeIn 0.2s ease'
            }}
          >
            {toastMsg}
          </div>
        )}
      </div>
    </div>
  );
};
