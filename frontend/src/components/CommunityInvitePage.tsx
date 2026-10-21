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
        <div style={{ position: 'relative', marginBottom: '20px', width: '56px', height: '56px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', border: '4px solid #E8E6E0', borderTopColor: '#101010', animation: 'spin 1s linear infinite' }} />
          <Compass className="w-6 h-6" style={{ position: 'absolute', inset: 0, margin: 'auto', color: '#101010' }} />
        </div>
        <h2 style={{ fontSize: '20px', fontWeight: 900, color: '#101010', margin: 0 }}>Validating Expedition Pass...</h2>
        <p style={{ fontSize: '13.5px', color: '#555555', marginTop: '6px' }}>Checking traveler credentials & cohort availability</p>
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
            borderRadius: '16px',
            border: '2px solid #101010',
            padding: '36px 28px',
            textAlign: 'center',
            boxShadow: '4px 4px 0px #101010'
          }}
        >
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#F4AFC1',
              border: '2px solid #101010',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              color: '#101010'
            }}
          >
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 900, color: '#101010', marginBottom: '8px' }}>
            Expedition Pass Unavailable
          </h2>
          <p style={{ fontSize: '13.5px', color: '#555555', lineHeight: 1.6, marginBottom: '24px' }}>
            {error || 'This invite link is invalid, full, or has been revoked by the expedition leader.'}
          </p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchDetails}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                background: '#FFFFFF',
                border: '2px solid #101010',
                color: '#101010',
                fontSize: '13px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px #101010'
              }}
            >
              <RefreshCw className="w-4 h-4" /> Try Again
            </button>
            <button
              onClick={onNavigateHome}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '8px',
                background: '#FFD84D',
                color: '#101010',
                fontSize: '13px',
                fontWeight: 900,
                border: '2px solid #101010',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px #101010',
                textTransform: 'uppercase'
              }}
            >
              Explore Destinations <ArrowRight className="w-4 h-4" />
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
      {/* Main Invite Card */}
      <div
        style={{
          width: '100%',
          background: '#FFFFFF',
          borderRadius: '16px',
          border: '2px solid #101010',
          overflow: 'hidden',
          boxShadow: '6px 6px 0px #101010',
          position: 'relative'
        }}
      >
        {/* Cover Image Banner */}
        <div style={{ position: 'relative', height: '240px', width: '100%', overflow: 'hidden', borderBottom: '2px solid #101010' }}>
          <img
            src={community.cover_image || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80'}
            alt={community.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />

          {/* Top floating badge */}
          <div style={{ position: 'absolute', top: '16px', left: '16px', right: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                background: '#101010',
                color: '#FFFFFF',
                fontSize: '11px',
                fontWeight: 900,
                padding: '5px 12px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              <Sparkles className="w-3.5 h-3.5" /> Official Expedition Pass
            </span>
            <button
              onClick={handleCopyLink}
              style={{
                background: '#FFFFFF',
                border: '2px solid #101010',
                color: '#101010',
                borderRadius: '8px',
                padding: '6px 14px',
                fontSize: '11.5px',
                fontWeight: 900,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '2px 2px 0px #101010',
                textTransform: 'uppercase'
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? 'Link Copied' : 'Share Pass'}</span>
            </button>
          </div>

          {/* Location & Title overlay */}
          <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', background: 'rgba(16, 16, 16, 0.8)', padding: '10px 14px', borderRadius: '8px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                color: '#FFD84D',
                fontSize: '11.5px',
                fontWeight: 900,
                marginBottom: '4px',
                textTransform: 'uppercase'
              }}
            >
              <MapPin className="w-3.5 h-3.5" />
              {community.destination}
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF', margin: 0 }}>
              {community.name}
            </h1>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {/* Host & Date Bar */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '14px',
              padding: '16px',
              borderRadius: '12px',
              background: '#F7F6F2',
              border: '1.5px solid #101010'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#FFD84D',
                  border: '1.5px solid #101010',
                  color: '#101010',
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
                <p style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555555', fontWeight: 900, margin: '0 0 2px' }}>
                  Leader
                </p>
                <p style={{ fontSize: '13px', color: '#101010', fontWeight: 900, margin: 0, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {community.creator?.name || community.creator_name || 'Expedition Host'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: '#429FE8',
                  border: '1.5px solid #101010',
                  color: '#101010',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555555', fontWeight: 900, margin: '0 0 2px' }}>
                  Schedule
                </p>
                <p style={{ fontSize: '12.5px', color: '#101010', fontWeight: 800, margin: 0 }}>
                  {community.start_date || 'Flexible'} {community.end_date ? `→ ${community.end_date}` : ''}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: isFull ? '#F4AFC1' : '#36B7B3',
                  border: '1.5px solid #101010',
                  color: '#101010',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#555555', fontWeight: 900, margin: '0 0 2px' }}>
                  Available
                </p>
                <p style={{ fontSize: '12.5px', color: '#101010', fontWeight: 900, margin: 0 }}>
                  {availableSlots} / {community.max_members} spots left
                </p>
              </div>
            </div>
          </div>

          {/* Description */}
          {community.description && (
            <div>
              <h3 style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#101010', fontWeight: 900, margin: '0 0 8px' }}>
                Expedition Vision & Field Details
              </h3>
              <p
                style={{
                  fontSize: '13.5px',
                  color: '#333333',
                  lineHeight: 1.6,
                  background: '#F7F6F2',
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1.5px solid #101010',
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
              borderRadius: '10px',
              background: '#FFFFFF',
              border: '1.5px solid #101010',
              color: '#101010',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>Authenticated travel collective. Your credentials & journey telemetry are secured under GlobalTrotter protocol.</span>
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
                    borderRadius: '10px',
                    background: '#36B7B3',
                    border: '2px solid #101010',
                    color: '#101010',
                    fontWeight: 900,
                    fontSize: '14px'
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  You are officially part of this community expedition!
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={onNavigateCommunity}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 900,
                      justifyContent: 'center',
                      borderRadius: '8px',
                      background: '#FFD84D',
                      color: '#101010',
                      border: '2px solid #101010',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '2px 2px 0px #101010',
                      textTransform: 'uppercase'
                    }}
                  >
                    Open Community Hub <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNavigateHome}
                    style={{
                      padding: '12px 20px',
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '2px solid #101010',
                      color: '#101010',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      boxShadow: '2px 2px 0px #101010'
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
                    borderRadius: '10px',
                    background: '#F4AFC1',
                    border: '2px solid #101010',
                    color: '#101010',
                    fontWeight: 900,
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
                    borderRadius: '8px',
                    background: '#FFFFFF',
                    border: '2px solid #101010',
                    color: '#101010',
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: '2px 2px 0px #101010'
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
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '14px',
                    fontWeight: 900,
                    justifyContent: 'center',
                    borderRadius: '10px',
                    background: '#FFD84D',
                    color: '#101010',
                    border: '2px solid #101010',
                    boxShadow: '3px 3px 0px #101010',
                    opacity: joining ? 0.7 : 1,
                    cursor: joining ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
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
                <p style={{ textAlign: 'center', fontSize: '12px', color: '#555555', margin: 0, fontWeight: 600 }}>
                  Joining as <strong style={{ color: '#101010' }}>{currentUser.name}</strong> ({currentUser.email})
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: '10px',
                    background: '#F7F6F2',
                    border: '1.5px solid #101010',
                    textAlign: 'center'
                  }}
                >
                  <p style={{ fontSize: '13.5px', fontWeight: 900, color: '#101010', margin: '0 0 4px' }}>
                    Account Required to Join
                  </p>
                  <p style={{ fontSize: '12px', color: '#555555', margin: 0 }}>
                    To maintain travel safety and group coordination, please sign in or create your GlobalTrotter account.
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => {
                      localStorage.setItem('trovio_pending_invite', token);
                      onOpenSignIn();
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      fontSize: '13px',
                      fontWeight: 900,
                      justifyContent: 'center',
                      borderRadius: '8px',
                      background: '#FFD84D',
                      color: '#101010',
                      border: '2px solid #101010',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '2px 2px 0px #101010',
                      textTransform: 'uppercase'
                    }}
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
                      borderRadius: '8px',
                      background: '#FFFFFF',
                      border: '2px solid #101010',
                      color: '#101010',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: '2px 2px 0px #101010'
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
