import React, { useState } from 'react';
import { UserProfile, ActiveTab } from '../types';
import { GlobalSearchBar } from './GlobalSearchBar';

interface Props {
  user: UserProfile;
  onNavigate: (tab: ActiveTab, tripId?: number) => void;
}

interface CommunityPost {
  id: number;
  author: string;
  authorAvatar: string;
  location: string;
  title: string;
  content: string;
  image?: string;
  likes: number;
  commentsCount: number;
  timeAgo: string;
  category: string;
}

const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 1,
    author: 'Aarav Sharma',
    authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
    location: 'Udaipur, Rajasthan',
    title: 'Magical Sunset at Lake Pichola and Jag Mandir',
    content: 'Took the royal sunset ferry right at 5:00 PM. The golden hour reflections bouncing off the marble facade of City Palace are something you have to witness in person! Make sure to book the top deck seats.',
    image: 'https://images.unsplash.com/photo-1598971861713-54ad16a7e72e?auto=format&fit=crop&w=1000&q=80',
    likes: 48,
    commentsCount: 12,
    timeAgo: '2 hours ago',
    category: 'Heritage Cruise'
  },
  {
    id: 2,
    author: 'Priya Patel',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    location: 'Jodhpur, Blue City',
    title: 'Flying Fox Zip-Line Across Mehrangarh Fort Ramparts',
    content: '6 consecutive zip lines across the battlements and lakes! The aerial views looking down onto the sea of blue houses are breathtaking. Pro tip: do the morning slot to avoid afternoon heat.',
    image: 'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1000&q=80',
    likes: 62,
    commentsCount: 9,
    timeAgo: '5 hours ago',
    category: 'Adventure'
  },
  {
    id: 3,
    author: 'Vikram Singh',
    authorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
    location: 'Thar Desert, Jaisalmer',
    title: 'Stargazing Camp in Sam Sand Dunes',
    content: 'Nothing beats sleeping under the open desert sky. The campfire Kalbelia folk performance was electric. The local Rajasthani dal baati churma made over wood coals was the highlight.',
    image: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1000&q=80',
    likes: 85,
    commentsCount: 19,
    timeAgo: '1 day ago',
    category: 'Wilderness Camping'
  }
];

export const CommunityTab: React.FC<Props> = ({ user }) => {
  const [posts, setPosts] = useState<CommunityPost[]>(INITIAL_POSTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('Default');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedSort, setSelectedSort] = useState('Newest');

  // New post state
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState('Expedition');

  const handleLike = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const post: CommunityPost = {
      id: Date.now(),
      author: user.name || 'panther',
      authorAvatar: user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
      location: newLocation || 'Rajasthan Trail',
      title: newTitle.trim(),
      content: newContent.trim(),
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1000&q=80',
      likes: 1,
      commentsCount: 0,
      timeAgo: 'Just now',
      category: newCategory
    };

    setPosts([post, ...posts]);
    setShowCreatePost(false);
    setNewTitle('');
    setNewLocation('');
    setNewContent('');
  };

  const filteredPosts = posts.filter(p => {
    const term = searchTerm.toLowerCase();
    const matchSearch = !term || p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term) || p.location.toLowerCase().includes(term);
    const matchFilter = selectedFilter === 'All' || p.category.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchSearch && matchFilter;
  });

  return (
    <div style={{ marginTop: '20px', maxWidth: '880px', margin: '20px auto 40px' }}>
      {/* Title & Screen Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px', margin: '0 0 6px 0' }}>
            Community tab Screen (Screen 10)
          </h2>
          <p style={{ fontSize: '13.5px', color: '#64748B', margin: 0 }}>
            Community section where all users can share their experience about a certain trip or activity
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreatePost(!showCreatePost)}
          className="btn-plan-budget"
          style={{ padding: '10px 20px', fontSize: '13.5px' }}
        >
          <span>{showCreatePost ? '✕ Cancel Post' : '+ Share Your Experience'}</span>
        </button>
      </div>

      {/* Global Search Bar (Screen 10 Wireframe) */}
      <GlobalSearchBar
        placeholder="Search bar ....."
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        groupByOptions={['Default', 'By Location', 'By Activity Category']}
        filterOptions={['All', 'Heritage Cruise', 'Adventure', 'Wilderness Camping']}
        sortByOptions={['Newest', 'Most Liked', 'Most Comments']}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        selectedFilter={selectedFilter}
        onFilterChange={setSelectedFilter}
        selectedSort={selectedSort}
        onSortChange={setSelectedSort}
      />

      {/* Create New Community Post Box */}
      {showCreatePost && (
        <form
          onSubmit={handleCreatePost}
          style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            border: '1.5px solid #2DD4BF',
            padding: '24px',
            marginBottom: '24px',
            boxShadow: '0 6px 20px rgba(13, 148, 136, 0.1)'
          }}
        >
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '14px' }}>
            Share your Voyage Story with the GlobalTrotter Community
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Title of your experience..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <input
              type="text"
              className="form-input"
              placeholder="Location (e.g. Udaipur, Jodhpur)..."
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
              required
            />
          </div>

          <textarea
            className="form-input"
            rows={3}
            placeholder="Share details, tips, recommended activities, best time to visit..."
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            required
            style={{ marginBottom: '14px' }}
          />

          <button
            type="submit"
            className="btn-plan-budget"
            style={{ padding: '10px 22px' }}
          >
            Post Story to Community
          </button>
        </form>
      )}

      {/* Community Feed Posts (Screen 10 Wireframe) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredPosts.map(post => (
          <div
            key={post.id}
            style={{
              background: '#FFFFFF',
              borderRadius: '20px',
              border: '1px solid #E2E8F0',
              overflow: 'hidden',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)'
            }}
          >
            {/* Post Header: Avatar, Author, Location, Time */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '18px 20px 12px' }}>
              <img
                src={post.authorAvatar}
                alt={post.author}
                style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 800, fontSize: '15px', color: '#0F172A' }}>{post.author}</span>
                  <span style={{
                    background: '#F0FDFA',
                    color: '#0D9488',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    {post.category}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748B' }}>
                  📍 {post.location} • {post.timeAgo}
                </div>
              </div>
            </div>

            {/* Post Content */}
            <div style={{ padding: '0 20px 14px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginBottom: '8px' }}>
                {post.title}
              </h3>
              <p style={{ fontSize: '13.5px', color: '#334155', lineHeight: '1.5', margin: 0 }}>
                {post.content}
              </p>
            </div>

            {/* Optional Image */}
            {post.image && (
              <div style={{ height: '240px', overflow: 'hidden' }}>
                <img src={post.image} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}

            {/* Post Footer: Likes, Comments */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 20px',
              borderTop: '1px solid #F1F5F9',
              background: '#F8FAFC'
            }}>
              <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => handleLike(post.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#E11D48'
                  }}
                >
                  <span>❤️</span>
                  <span>{post.likes} Likes</span>
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#64748B', fontWeight: 600 }}>
                  <span>💬</span>
                  <span>{post.commentsCount} Comments</span>
                </div>
              </div>

              <span style={{ fontSize: '12px', color: '#94A3B8' }}>Verified Voyager Story</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
