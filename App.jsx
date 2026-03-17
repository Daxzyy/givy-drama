import React, { useState, useEffect } from 'react'

const API_BASE = 'https://anabot.my.id/api/search/drama'
const API_KEY = 'freeApikey'

function Header({ searchQuery, setSearchQuery, activeTab, setActiveTab }) {
  return (
    <header className="navbar">
      <a href="#" className="nav-brand">
        <span className="brand-g">D</span><span>rama</span>
      </a>
      <div className="nav-tabs">
        <button 
          className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          Trending
        </button>
        <button 
          className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`}
          onClick={() => setActiveTab('search')}
        >
          Popular
        </button>
      </div>
      <div className="nav-right">
        <div className="search-wrap">
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
    </header>
  )
}

function HeroSection({ drama }) {
  if (!drama) return null

  const title = drama.title || drama.bookName
  const episodes = drama.episodes || drama.chapterCount
  const cover = drama.cover || drama.coverWap
  const rating = drama.rating || drama.hotCode || 'N/A'

  return (
    <div className="hero">
      <div 
        className="hero-bg"
        style={{ backgroundImage: `url(${cover})` }}
      />
      <div className="hero-content">
        <div className="hero-badge">
          <span>★</span>
          <span>Featured</span>
        </div>
        <h1 className="hero-title">{title}</h1>
        <p className="hero-desc">
          {drama.introduction || `Explore this amazing drama series with ${episodes} episodes`}
        </p>
        <div className="hero-meta">
          <span>{episodes} Episodes</span>
          <span>{rating}</span>
        </div>
        <div className="hero-actions">
          <button className="btn-play">
            ▶ Play
          </button>
          <button className="btn-info">
            ⓘ Info
          </button>
        </div>
      </div>
    </div>
  )
}

function DramaCard({ drama, onClick }) {
  return (
    <div className="card" onClick={onClick}>
      <img 
        src={drama.cover || drama.coverWap} 
        alt={drama.title || drama.bookName}
        className="card-img"
        onError={(e) => {
          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="180" height="240"%3E%3Crect fill="%231c1c22" width="180" height="240"/%3E%3Ctext x="50%25" y="50%25" font-size="14" fill="%239a9490" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E'
        }}
      />
      <div className="card-content">
        <div className="card-title">{drama.title || drama.bookName}</div>
        <div className="card-meta">{drama.episodes || drama.chapterCount} episodes</div>
      </div>
    </div>
  )
}

function GridSection({ title, dramas, onCardClick, loading }) {
  return (
    <>
      <h2 className="section-title">{title}</h2>
      <div className="cards-grid">
        {loading && (
          <div className="spinner-wrap">
            <div className="spinner"></div>
          </div>
        )}
        {!loading && dramas && dramas.length > 0 ? (
          dramas.map((drama) => (
            <DramaCard 
              key={drama.id || drama.bookId} 
              drama={drama}
              onClick={() => onCardClick && onCardClick(drama)}
            />
          ))
        ) : !loading && (
          <div className="empty-state">
            <p>No dramas found</p>
          </div>
        )}
      </div>
    </>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingDramas, setTrendingDramas] = useState([])
  const [searchDramas, setSearchDramas] = useState([])
  const [selectedDrama, setSelectedDrama] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch trending/rank data
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `${API_BASE}/dramabox/rank?apikey=${API_KEY}`
        )
        const data = await res.json()
        if (data.success && data.data.result.rankList) {
          setTrendingDramas(data.data.result.rankList)
          setSelectedDrama(data.data.result.rankList[0])
        }
      } catch (error) {
        console.error('Error fetching trending:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchTrending()
  }, [])

  // Search dramas
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchDramas([])
      return
    }

    const fetchSearch = async () => {
      try {
        setLoading(true)
        const res = await fetch(
          `${API_BASE}/dramabox/search?keyword=${encodeURIComponent(searchQuery)}&apikey=${API_KEY}`
        )
        const data = await res.json()
        if (data.success && data.data.result) {
          setSearchDramas(data.data.result)
        }
      } catch (error) {
        console.error('Error searching:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchSearch, 500)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const displayDramas = searchQuery.trim() ? searchDramas : trendingDramas
  const currentTab = searchQuery.trim() ? 'search' : 'home'

  return (
    <>
      <Header 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        activeTab={currentTab}
        setActiveTab={setActiveTab}
      />
      
      <main id="root">
        {currentTab === 'home' && (
          <>
            {selectedDrama && <HeroSection drama={selectedDrama} />}
            <GridSection 
              title="Trending Now"
              dramas={trendingDramas}
              onCardClick={setSelectedDrama}
              loading={loading}
            />
          </>
        )}

        {currentTab === 'search' && (
          <GridSection 
            title={`Search: ${searchQuery}`}
            dramas={searchDramas}
            onCardClick={setSelectedDrama}
            loading={loading}
          />
        )}
      </main>
    </>
  )
}
