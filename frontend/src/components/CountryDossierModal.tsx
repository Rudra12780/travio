import React, { useState } from 'react';
import { CountryDossier } from '../data/countryData';

interface Props {
  country: CountryDossier | null;
  onClose: () => void;
  onPlanTrip: (countryName: string) => void;
}

export const CountryDossierModal: React.FC<Props> = ({ country, onClose, onPlanTrip }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'attractions' | 'seasons' | 'cuisine' | 'budget'>('overview');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!country) return null;

  const currentHero = selectedPhoto || country.heroImage;

  return (
    <div className="landing-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="country-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose} aria-label="Close dossier">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Hero Visual Header */}
        <div className="dossier-hero" style={{ backgroundImage: `url(${currentHero})` }}>
          <div className="dossier-hero-overlay">
            <div className="dossier-hero-top">
              <span className="dossier-continent-badge">{country.continent}</span>
              <div className="dossier-metrics">
                <span className="metric-pill">
                  <span className="star-icon">★</span> {country.rating} ({country.voyagerVotes})
                </span>
                <span className="metric-pill safety-pill">
                  🛡️ {country.safetyScore}% Safety Index
                </span>
              </div>
            </div>

            <div className="dossier-hero-bottom">
              <div className="dossier-title-row">
                <span className="dossier-flag">{country.flag}</span>
                <div>
                  <h2 className="dossier-country-name">{country.name}</h2>
                  <p className="dossier-capital">Capital: <strong>{country.capital}</strong></p>
                </div>
              </div>
              <p className="dossier-tagline">“{country.tagline}”</p>
            </div>
          </div>
        </div>

        {/* Gallery Thumbnails Strip */}
        <div className="dossier-gallery-strip">
          <button 
            type="button"
            className={`gallery-thumb-btn ${currentHero === country.heroImage ? 'active' : ''}`}
            onClick={() => setSelectedPhoto(country.heroImage)}
          >
            <img src={country.heroImage} alt={country.name} />
          </button>
          {country.gallery.map((img, i) => (
            <button
              type="button"
              key={i}
              className={`gallery-thumb-btn ${currentHero === img ? 'active' : ''}`}
              onClick={() => setSelectedPhoto(img)}
            >
              <img src={img} alt={`${country.name} preview ${i + 1}`} />
            </button>
          ))}
        </div>

        {/* Modal Navigation Tabs */}
        <div className="dossier-tabs-nav">
          <button
            type="button"
            className={`dossier-tab ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            🌟 Why It's The Best
          </button>
          <button
            type="button"
            className={`dossier-tab ${activeTab === 'attractions' ? 'active' : ''}`}
            onClick={() => setActiveTab('attractions')}
          >
            🏛️ Top Bucket List ({country.topAttractions.length})
          </button>
          <button
            type="button"
            className={`dossier-tab ${activeTab === 'seasons' ? 'active' : ''}`}
            onClick={() => setActiveTab('seasons')}
          >
            ⛅ Seasons & Weather
          </button>
          <button
            type="button"
            className={`dossier-tab ${activeTab === 'cuisine' ? 'active' : ''}`}
            onClick={() => setActiveTab('cuisine')}
          >
            🍜 Signature Cuisine
          </button>
          <button
            type="button"
            className={`dossier-tab ${activeTab === 'budget' ? 'active' : ''}`}
            onClick={() => setActiveTab('budget')}
          >
            💳 Voyager Budget
          </button>
        </div>

        {/* Modal Tab Content */}
        <div className="dossier-body">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="tab-pane">
              <div className="dossier-why-card">
                <h3>🏆 What Makes {country.name} One of the Absolute Best Countries to Visit</h3>
                <p>{country.whyBest}</p>
              </div>

              {/* Transit & Visa Essential Badges */}
              <div className="dossier-fast-facts-grid">
                <div className="fast-fact-card">
                  <div className="fast-fact-icon">🚄</div>
                  <div className="fast-fact-content">
                    <h4>Transit & Mobility</h4>
                    <p>{country.transitInfo}</p>
                  </div>
                </div>

                <div className="fast-fact-card">
                  <div className="fast-fact-icon">🛂</div>
                  <div className="fast-fact-content">
                    <h4>Visa & Entry Guidelines</h4>
                    <p>{country.visaInfo}</p>
                  </div>
                </div>
              </div>

              {/* Insider Travel Tips */}
              <div className="dossier-tips-section">
                <h4>💡 Insider Voyager Advice</h4>
                <div className="tips-grid">
                  {country.travelTips.map((tip, idx) => (
                    <div key={idx} className="tip-box">
                      <span className="tip-badge">{tip.badge}</span>
                      <h5>{tip.title}</h5>
                      <p>{tip.advice}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATTRACTIONS */}
          {activeTab === 'attractions' && (
            <div className="tab-pane">
              <div className="attractions-grid">
                {country.topAttractions.map((att, idx) => (
                  <div key={idx} className="attraction-card">
                    <div className="attraction-img-wrap">
                      <img src={att.image} alt={att.name} />
                      <span className="attraction-tag">{att.tag}</span>
                    </div>
                    <div className="attraction-info">
                      <span className="attraction-location">📍 {att.location}</span>
                      <h4>{att.name}</h4>
                      <p>{att.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SEASONS */}
          {activeTab === 'seasons' && (
            <div className="tab-pane">
              <div className="season-summary-card">
                <div className="season-summary-header">
                  <span className="season-badge">🌟 Prime Window</span>
                  <h4>{country.bestSeason.title} ({country.bestSeason.months})</h4>
                </div>
                <p>{country.bestSeason.climateSummary}</p>
              </div>

              <h4 className="seasons-subhead">Seasonal Climate Breakdown</h4>
              <div className="seasons-grid">
                {country.bestSeason.seasons.map((s, idx) => (
                  <div key={idx} className="season-item-card">
                    <div className="season-top">
                      <span className="season-name">{s.name}</span>
                      <span className="season-temp">{s.temp}</span>
                    </div>
                    <span className="season-period">{s.period}</span>
                    <p className="season-highlight">{s.highlight}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CUISINE */}
          {activeTab === 'cuisine' && (
            <div className="tab-pane">
              <p className="cuisine-intro">
                Authentic flavors and culinary masterpieces that define {country.name}’s global foodie reputation:
              </p>
              <div className="dishes-grid">
                {country.signatureDishes.map((dish, idx) => (
                  <div key={idx} className="dish-card">
                    <span className="dish-icon">{dish.icon}</span>
                    <div className="dish-content">
                      <h4>{dish.name}</h4>
                      <p>{dish.description}</p>
                      <div className="must-try-row">
                        <strong>Must-try spot:</strong> <span>{dish.mustTrySpot}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: BUDGET */}
          {activeTab === 'budget' && (
            <div className="tab-pane">
              <div className="budget-tiers-row">
                <div className="budget-tier-box backpacker">
                  <span className="tier-tag">🎒 Backpacker</span>
                  <div className="tier-amount">
                    ${country.dailyBudget.backpacker} <small>/ day</small>
                  </div>
                  <p>Hostels, transit passes, street food, and free landmark self-tours.</p>
                </div>

                <div className="budget-tier-box comfort featured">
                  <span className="tier-badge-rec">Most Popular</span>
                  <span className="tier-tag">🏨 Balanced Voyager</span>
                  <div className="tier-amount">
                    ${country.dailyBudget.comfort} <small>/ day</small>
                  </div>
                  <p>Boutique hotels, high-speed rail, sit-down trattorias/izakayas, and guided tours.</p>
                </div>

                <div className="budget-tier-box luxury">
                  <span className="tier-tag">✨ Luxury VIP</span>
                  <div className="tier-amount">
                    ${country.dailyBudget.luxury} <small>/ day</small>
                  </div>
                  <p>5-star heritage resorts, private chauffeur transfers, fine dining & VIP admissions.</p>
                </div>
              </div>

              <div className="budget-notes-box">
                <p><strong>Currency:</strong> {country.dailyBudget.currency} ({country.dailyBudget.currencySymbol})</p>
                <p>{country.dailyBudget.breakdownNote}</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Plan Trip Action */}
        <div className="dossier-footer">
          <div className="dossier-footer-left">
            <span className="footer-rec-text">Ready to experience {country.name}?</span>
            <span className="footer-subtext">Add {country.name} to your Trovio voyager planner with ready-made stops</span>
          </div>
          <div className="dossier-footer-actions">
            <button type="button" className="btn-secondary-modal" onClick={onClose}>
              Keep Browsing
            </button>
            <button 
              type="button" 
              className="btn-primary-plan" 
              onClick={() => onPlanTrip(country.name)}
            >
              <span>Plan Trip to {country.name}</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
