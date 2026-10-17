import React, { useState, useEffect } from 'react';
import { 
  MapPin, Calendar, Users, CheckCircle2, AlertCircle, ArrowRight, 
  ShieldCheck, Sparkles, Compass, Share2, LogIn, UserPlus, RefreshCw, Check
} from 'lucide-react';
import { api } from '../api';
import { CommunityInviteDetails, UserProfile } from '../types';

interface CommunityInvitePageProps {
  token: string;
  currentUser: UserProfile | null;
  onOpenSignIn: () => void;
  onOpenSignUp: () => void;
  onNavigateHome: () => void;
  onNavigateCommunity: () => void;
}

export const CommunityInvitePage: React.FC<CommunityInvitePageProps> = ({
  token,
  currentUser,
  onOpenSignIn,
  onOpenSignUp,
  onNavigateHome,
  onNavigateCommunity
}) => {
  const [inviteData, setInviteData] = useState<CommunityInviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [hasJoined, setHasJoined] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCommunityInvite(token, currentUser?.id);
      setInviteData(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load community details. Link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchDetails();
  }, [token, currentUser?.id]);

  const handleJoin = async () => {
    if (!currentUser || !currentUser.id) {
      localStorage.setItem('trovio_pending_invite', token);
      onOpenSignIn();
      return;
    }

    try {
      setJoining(true);
      await api.joinCommunity(token, currentUser.id);
      setHasJoined(true);
      await fetchDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to join community.');
    } finally {
      setJoining(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (loading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center' }}>
        <div style={{ position: 'relative', marginBottom: '24px', width: '64px', height: '64px' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', border: '4px solid rgba(129, 120, 232, 0.2)', borderTopColor: '#8178E8', animation: 'spin 1s linear infinite' }} />
          <Compass className="w-7 h-7 text-indigo-500" style={{ position: 'absolute', inset: 0, margin: 'auto', animation: 'pulse 1.5s infinite' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: 0 }}>Validating Travel Pass...</h2>
        <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '6px' }}>Checking expedition credentials & cohort availability</p>
      </div>
    );
  }

  if (error || !inviteData || !inviteData.community) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div
          style={{
            maxWidth: '460px',
            width: '100%',
            background: '#FFFFFF',
            borderRadius: '24px',
            border: '1.5px solid #FECACA',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '0 20px 50px rgba(15, 23, 42, 0.1)'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#EF4444'
            }}
          >
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#0F172A', marginBottom: '8px' }}>
            Expedition Pass Unavailable
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, marginBottom: '24px' }}>
            {error || 'This QR invite link is invalid, full, or has been revoked by the expedition leader.'}
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchDetails}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: '#F1F5F9',
                border: '1px solid #CBD5E1',
                color: '#334155',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={onNavigateHome}
              className="btn-plan-budget"
              style={{ flex: 1, padding: '12px', fontSize: '13.5px', justifyContent: 'center' }}
            >
              Explore Trovio <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { community, status } = inviteData;
  const isFull = status?.isFull || community.current_members >= community.max_members;
  const isAlreadyMember = status?.isMember || hasJoined;
  const availableSlots = Math.max(0, community.max_members - community.current_members);

  return (
    <div style={{ minHeight: '90vh', padding: '40px 16px', maxWidth: '820px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      {/* Main Glassmorphic Invite Card */}
      <div
        style={{
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '26px',
          border: '1.5px solid #E2E8F0',
          overflow: 'hidden',
          boxShadow: '0 25px 60px -10px rgba(15, 23, 42, 0.15)',
          position: 'relative'
        }}
      >
        {/* Cover Image Banner */}
        <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden' }}>
          <img
            src={community.cover_image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'}
            alt={community.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.3) 55%, transparent 100%)'
            }}
          />

          {/* Top floating badge */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(45, 212, 191, 0.35)',
                color: '#2DD4BF',
                fontSize: '11px',
                fontWeight: 800,
                padding: '5px 12px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-400 animate-pulse" /> Official QR Invitation Pass
            </span>
            <button
              onClick={handleCopyLink}
              style={{
                background: 'rgba(15, 23, 42, 0.8)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                color: '#FFFFFF',
                borderRadius: '9999px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share'}</span>
            </button>
          </div>

          {/* Location & Title overlay */}
          <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#2DD4BF',
                fontSize: '12px',
                fontWeight: 800,
                marginBottom: '6px'
              }}
            >
              <MapPin className="w-3.5 h-3.5" />
              {community.destination}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: 0, textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
              {community.name}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Host & Date Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '12px',
              padding: '16px',
              borderRadius: '16px',
              background: '#F8FAFC',
              border: '1px solid #E2E8F0'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#F6EEFA',
                  border: '1px solid #E8E2F0',
                  color: '#8178E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '14px'
                }}
              >
                {(community.creator?.name || community.creator_name || 'E').charAt(0).toUpperCase()}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <p style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', fontWeight: 800, margin: '0 0 2px' }}>
                  Leader
                </p>
                <p style={{ fontSize: '13px', color: '#0F172A', fontWeight: 800, margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {community.creator?.name || community.creator_name || 'Expedition Host'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: '#EEF2FF',
                  border: '1px solid #C7D2FE',
                  color: '#4F46E5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', fontWeight: 800, margin: '0 0 2px' }}>
                  Dates
                </p>
                <p style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 700, margin: 0 }}>
                  {community.start_date || 'Flexible'} {community.end_date ? `→ ${community.end_date}` : ''}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderLeft: '1px solid #E2E8F0', paddingLeft: '12px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  background: isFull ? '#FEF2F2' : '#F0FDF4',
                  border: isFull ? '1px solid #FECACA' : '1px solid #BBF7D0',
                  color: isFull ? '#EF4444' : '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.04em', color: '#64748B', fontWeight: 800, margin: '0 0 2px' }}>
                  Available
                </p>
                <p style={{ fontSize: '12.5px', color: isFull ? '#EF4444' : '#16A34A', fontWeight: 800, margin: 0 }}>
                  {availableSlots} / {community.max_members} spots left
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <div>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748B', fontWeight: 800, margin: '0 0 8px' }}>
                Expedition Vision & Details
              </h3>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#334155',
                  lineHeight: 1.6,
                  background: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '14px',
                  border: '1px solid #E2E8F0',
                  margin: 0
                }}
              >
                {community.description}
              </p>
            </div>
          )}

          {/* Trust Banner */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '12px 16px',
              borderRadius: '12px',
              background: '#F0FDFA',
              border: '1px solid #99F6E4',
              color: '#0F766E',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <ShieldCheck className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>Authenticated travel collective. Your credentials & journey details are protected under Trovio traveler protocol.</span>
          </div>

          {/* CTA Actions */}
          <div>
            {isAlreadyMember ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#F0FDF4',
                    border: '1px solid #86EFAC',
                    color: '#16A34A',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  You are officially part of this community expedition!
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={onNavigateCommunity}
                    className="btn-plan-budget"
                    style={{ flex: 1, padding: '12px', fontSize: '13.5px', justifyContent: 'center' }}
                  >
                    Open Community Hub <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNavigateHome}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '9999px',
                      background: '#F1F5F9',
                      border: '1px solid #CBD5E1',
                      color: '#475569',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      cursor: 'pointer'
                    }}
                  >
                    Return Home
                  </button>
                </div>
              </div>
            ) : isFull ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '14px',
                    borderRadius: '14px',
                    background: '#FEF2F2',
                    border: '1px solid #FECACA',
                    color: '#EF4444',
                    fontWeight: 700,
                    fontSize: '14px'
                  }}
                >
                  <AlertCircle className="w-5 h-5" />
                  This expedition has reached maximum member capacity ({community.max_members} travelers).
                </div>
                <button
                  onClick={onNavigateHome}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '9999px',
                    background: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#334155',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer'
                  }}
                >
                  Explore Other Expeditions
                </button>
              </div>
            ) : currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button
                  onClick={handleJoin}
                  disabled={joining}
                  className="btn-plan-budget"
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 800,
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px -4px rgba(244, 63, 94, 0.45)',
                    opacity: joining ? 0.7 : 1,
                    cursor: joining ? 'not-allowed' : 'pointer'
                  }}
                >
                  {joining ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      Securing Your Slot...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Join Community Expedition
                    </>
                  )}
                </button>
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#64748B', margin: 0 }}>
                  Joining as <strong style={{ color: '#0F172A' }}>{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    background: '#F0FDFA',
                    border: '1px solid #99F6E4',
                    textAlign: 'center'
                  }}
                >
                  <p style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F766E', margin: '0 0 4px' }}>
                    Account Required to Join
                  </p>
                  <p style={{ fontSize: '12px', color: '#64748B', margin: 0 }}>
                    To maintain travel safety and group coordination, please sign in or create your GlobeTrotter account.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      localStorage.setItem('trovio_pending_invite', token);
                      onOpenSignIn();
                    }}
                    className="btn-plan-budget"
                    style={{ flex: 1, padding: '12px', fontSize: '13.5px', justifyContent: 'center' }}
                  >
                    <LogIn className="w-4 h-4" /> Sign In & Join
                  </button>
                  <button
                    onClick={() => {
                      localStorage.setItem('trovio_pending_invite', token);
                      onOpenSignUp();
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: '9999px',
                      background: '#F1F5F9',
                      border: '1.5px solid #CBD5E1',
                      color: '#0F172A',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <UserPlus className="w-4 h-4" /> Create Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
