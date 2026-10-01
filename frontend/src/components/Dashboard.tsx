import React, { useState } from 'react';
import { UserProfile, ActiveTab, Trip } from '../types';
import { Navbar } from './Navbar';
import { DashboardHome } from './DashboardHome';
import { MyTrips } from './MyTrips';
import { ItineraryBuilder } from './ItineraryBuilder';
import { ItineraryView } from './ItineraryView';
import { CitySearch } from './CitySearch';
import { ActivitySearch } from './ActivitySearch';
import { TripBudget } from './TripBudget';
import { TripCalendar } from './TripCalendar';
import { UserProfileSettings } from './UserProfileSettings';
import { CommunityTab } from './CommunityTab';
import { AdminDashboard } from './AdminDashboard';
import { CreateTripModal } from './CreateTripModal';
import { SharedTripModal } from './SharedTripModal';

interface Props {
  user: UserProfile;
  adminOrigin?: boolean;
  onReturnToAdmin?: () => void;
  onRedirectToUser?: (targetUser: UserProfile) => void;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
}

export const Dashboard: React.FC<Props> = ({
  user,
  adminOrigin = false,
  onReturnToAdmin,
  onRedirectToUser,
  onUpdateUser,
  onSignOut
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(null);

  const handleNavigate = (tab: ActiveTab, tripId?: number) => {
    // Security restriction: Regular travelers cannot access admin portal! Zero hint!
    if (tab === 'admin' && user.role !== 'Admin' && !adminOrigin) {
      return;
    }

    if (tripId) setSelectedTripId(tripId);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTripCreated = (newTrip: Trip) => {
    setSelectedTripId(newTrip.id);
    setActiveTab('itinerary-builder');
  };

  return (
    <div className="dash-wrapper">
      {/* Admin Impersonation Top Dispatch Bar (Only visible if redirected by Admin) */}
      {adminOrigin && onReturnToAdmin && (
        <div style={{
          background: 'linear-gradient(90deg, #0F172A 0%, #1E293B 100%)',
          borderBottom: '2px solid #0D9488',
          color: '#FFFFFF',
          padding: '10px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: '0 4px 14px rgba(0,0,0,0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              background: '#0D9488',
              color: '#FFFFFF',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 8px',
              borderRadius: '6px',
              letterSpacing: '0.06em'
            }}>
              👑 ADMIN DISPATCH ACTIVE
            </span>
            <span style={{ fontSize: '13.5px', color: '#E2E8F0', fontWeight: 500 }}>
              Inspecting session for traveler: <strong style={{ color: '#2DD4BF' }}>{user.name}</strong> ({user.email})
            </span>
          </div>

          <button
            type="button"
            onClick={onReturnToAdmin}
            style={{
              background: 'linear-gradient(135deg, #0D9488 0%, #0F766E 100%)',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '9999px',
              padding: '7px 18px',
              fontSize: '12.5px',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(13, 148, 136, 0.4)'
            }}
          >
            <span>← Return to Mission Control</span>
          </button>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => handleNavigate(tab)}
        onSignOut={onSignOut}
      />

      {/* Main Content Area */}
      <main className="dash-container">
        {activeTab === 'dashboard' && (
          <DashboardHome
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'my-trips' && (
          <MyTrips
            userId={user.id || 1}
            onNavigate={handleNavigate}
            onPlanTripClick={() => setShowCreateModal(true)}
            onShareClick={(trip) => setSharedTrip(trip)}
          />
        )}

        {activeTab === 'itinerary-builder' && (
          <ItineraryBuilder
            selectedTripId={selectedTripId}
            userId={user.id || 1}
            onNavigate={handleNavigate}
          />
        )}

        {(activeTab === 'itinerary-view' || activeTab === 'live-trip') && (
          <ItineraryView
            tripId={selectedTripId}
            userId={user.id || 1}
            onNavigate={handleNavigate}
            onShareClick={(trip) => setSharedTrip(trip)}
          />
        )}

        {activeTab === 'cities' && (
          <CitySearch
            userId={user.id || 1}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitySearch
            userId={user.id || 1}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'expenses' && (
          <TripBudget
            tripId={selectedTripId}
            userId={user.id || 1}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'calendar' && (
          <TripCalendar
            tripId={selectedTripId}
            userId={user.id || 1}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'settings' && (
          <UserProfileSettings
            user={user}
            onUpdateUser={onUpdateUser}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'community' && (
          <CommunityTab
            user={user}
            onNavigate={handleNavigate}
          />
        )}

        {activeTab === 'admin' && (user.role === 'Admin' || adminOrigin) && (
          <AdminDashboard
            onRedirectToUser={(targetUser) => {
              if (onRedirectToUser) onRedirectToUser(targetUser);
            }}
            onAdminSignOut={onSignOut}
          />
        )}
      </main>

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={showCreateModal}
        userId={user.id || 1}
        onClose={() => setShowCreateModal(false)}
        onTripCreated={handleTripCreated}
      />

      {/* Shared Trip Modal */}
      <SharedTripModal
        trip={sharedTrip}
        userId={user.id || 1}
        onClose={() => setSharedTrip(null)}
        onTripCopied={(copiedTrip) => {
          setSelectedTripId(copiedTrip.id);
          setActiveTab('itinerary-builder');
        }}
      />
    </div>
  );
};
