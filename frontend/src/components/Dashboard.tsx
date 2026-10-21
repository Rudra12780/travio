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
import { AdminDashboard } from './AdminDashboard';
import { CreateTripModal } from './CreateTripModal';
import { SharedTripModal } from './SharedTripModal';
import { SavedPlaces } from './SavedPlaces';

interface Props {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onSignOut: () => void;
  initialTab?: ActiveTab;
}

export const Dashboard: React.FC<Props> = ({
  user,
  onUpdateUser,
  onSignOut,
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab || 'dashboard');
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [sharedTrip, setSharedTrip] = useState<Trip | null>(null);

  const handleNavigate = (tab: ActiveTab, tripId?: number) => {
    // Security restriction: Regular travelers cannot access admin portal! Zero hint!
    if (tab === 'admin' && user.role !== 'Admin') {
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

        {activeTab === 'saved-places' && (
          <SavedPlaces
            userId={user.id || 1}
            onNavigate={handleNavigate}
            onPlanTripClick={() => setShowCreateModal(true)}
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

        {activeTab === 'admin' && user.role === 'Admin' && (
          <AdminDashboard
            adminUser={user}
            onAdminSignOut={onSignOut}
            onUpdateAdminUser={onUpdateUser}
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
