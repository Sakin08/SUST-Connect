import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HousingCard from '../components/HousingCard.jsx';
import api from '../api/axios.js';
import { useAuth } from '../context/AuthContext.jsx';
import { PlusCircle, Search, Frown, Filter, X } from 'lucide-react';

const Housing = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [postTypeFilter, setPostTypeFilter] = useState('all');
  const [housingTypeFilter, setHousingTypeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [maxRent, setMaxRent] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const res = await api.get('/housing');
      setPosts(res.data || []);
      setError(null);
    } catch (err) {
      console.error('Failed to load housing posts:', err);
      setError('Failed to load listings. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to permanently delete this listing?')) {
      try {
        await api.delete(`/housing/${id}`);
        setPosts(posts.filter(p => p._id !== id));
      } catch (err) {
        console.error('Failed to delete listing:', err);
        alert('Failed to delete listing. Please try again.');
      }
    }
  };

  // Apply filters
  const displayPosts = posts
    .filter(post => post.user)
    .filter(post => {
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        return (
          post.title?.toLowerCase().includes(s) ||
          post.location?.toLowerCase().includes(s) ||
          post.address?.toLowerCase().includes(s) ||
          post.description?.toLowerCase().includes(s)
        );
      }
      return true;
    })
    .filter(post => (postTypeFilter !== 'all' ? post.postType === postTypeFilter : true))
    .filter(post => (housingTypeFilter !== 'all' ? post.housingType === housingTypeFilter : true))
    .filter(post => (genderFilter !== 'all' ? post.genderPreference === genderFilter : true))
    .filter(post => (maxRent ? (post.rent || 0) <= Number(maxRent) : true));

  // --- Loading State ---
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 animate-fadeIn">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-bold text-gray-800">Loading housing listings...</p>
          <p className="text-sm text-gray-500 mt-2">Finding the perfect place for you</p>
        </div>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
        <div className="max-w-md w-full p-8 text-center bg-red-50 border-l-4 border-red-500 rounded-2xl shadow-xl animate-fadeIn">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xl font-bold text-red-700 mb-2">Oops! Something went wrong</p>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  // --- Main UI ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12 animate-fadeIn">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

        {/* Header */}
        <header className="mb-8 sm:mb-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                  Housing & Roommates
                </h1>
                <p className="text-sm sm:text-base text-cyan-200 mt-1">Find your perfect place or roommate</p>
              </div>
            </div>

            {user ? (
              <Link
                to="/housing/create"
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                <PlusCircle className="w-5 h-5" />
                <span>Post Listing</span>
              </Link>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 text-blue-600 bg-blue-50 border-2 border-blue-200 px-6 py-3 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all font-semibold"
              >
                Log in to post
              </Link>
            )}
          </div>
        </header>

        {/* Search + Filter */}
        <div className="bg-white rounded-xl shadow-lg p-3 sm:p-4 mb-4">

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>

            {/* Toggle Filters Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold transition text-sm ${showFilters
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-5 border-t border-gray-200 animate-slideDown">

              {/* Post Type */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="text-blue-600">📋</span> Post Type
                </label>
                <select
                  value={postTypeFilter}
                  onChange={(e) => setPostTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="available">🟢 Available</option>
                  <option value="wanted">🔍 Wanted</option>
                </select>
              </div>

              {/* Housing Type */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="text-purple-600">🏠</span> Housing Type
                </label>
                <select
                  value={housingTypeFilter}
                  onChange={(e) => setHousingTypeFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                >
                  <option value="all">All Types</option>
                  <option value="flat">🏢 Flat</option>
                  <option value="sublet">🔑 Sublet</option>
                  <option value="hostel">🏨 Hostel</option>
                  <option value="mess">🍽️ Mess</option>
                </select>
              </div>

              {/* Gender Preference */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="text-pink-600">👥</span> Gender
                </label>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                >
                  <option value="all">All</option>
                  <option value="male">👨 Male</option>
                  <option value="female">👩 Female</option>
                  <option value="any">🤝 Any</option>
                </select>
              </div>

              {/* Max Rent */}
              <div>
                <label className="text-sm font-bold text-gray-700 mb-2 block flex items-center gap-2">
                  <span className="text-green-600">💰</span> Max Rent
                </label>
                <input
                  type="number"
                  value={maxRent}
                  placeholder="e.g., 5000"
                  onChange={(e) => setMaxRent(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white font-medium"
                />
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(searchTerm || postTypeFilter !== 'all' || housingTypeFilter !== 'all' || genderFilter !== 'all' || maxRent) && (
            <div className="flex flex-wrap items-center gap-2 mt-5 pt-5 border-t border-gray-200">
              <span className="text-sm font-bold text-gray-700 mr-1">Active:</span>

              {searchTerm && (
                <FilterBadge label={`🔍 ${searchTerm}`} onClear={() => setSearchTerm('')} />
              )}
              {postTypeFilter !== 'all' && (
                <FilterBadge label={`📋 ${postTypeFilter}`} onClear={() => setPostTypeFilter('all')} />
              )}
              {housingTypeFilter !== 'all' && (
                <FilterBadge label={`🏠 ${housingTypeFilter}`} onClear={() => setHousingTypeFilter('all')} />
              )}
              {genderFilter !== 'all' && (
                <FilterBadge label={`👥 ${genderFilter}`} onClear={() => setGenderFilter('all')} />
              )}
              {maxRent && (
                <FilterBadge label={`💰 ৳${maxRent}`} onClear={() => setMaxRent('')} />
              )}

              <button
                onClick={() => {
                  setSearchTerm('');
                  setPostTypeFilter('all');
                  setHousingTypeFilter('all');
                  setGenderFilter('all');
                  setMaxRent('');
                }}
                className="text-sm text-red-600 hover:text-white hover:bg-red-600 font-bold px-3 py-1.5 rounded-lg transition-all ml-2"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mb-6 flex items-center gap-3">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
            <span className="text-2xl font-black">{displayPosts.length}</span>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-800">
              {displayPosts.length === 1 ? 'Listing Found' : 'Listings Found'}
            </p>
            <p className="text-sm text-gray-600">Browse available options</p>
          </div>
        </div>

        {/* Posts */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {displayPosts.length === 0 ? (
            <EmptyState />
          ) : (
            displayPosts.map(post => (
              <HousingCard key={post._id} post={post} onDelete={handleDelete} />
            ))
          )}
        </div>

      </div>
    </div>
  );
};

/* ------------ Reusable Components ------------ */

const FilterBadge = ({ label, onClear }) => (
  <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 hover:from-blue-200 hover:to-indigo-200 transition-all">
    {label}
    <X className="w-4 h-4 cursor-pointer hover:text-red-600 transition-colors" onClick={onClear} />
  </span>
);

const EmptyState = () => (
  <div className="col-span-full text-center py-20 bg-white/80 backdrop-blur-lg rounded-2xl border-2 border-dashed border-gray-300 shadow-xl animate-fadeIn">
    <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
      <Frown className="w-10 h-10 text-gray-400" />
    </div>
    <p className="text-2xl font-bold text-gray-800 mb-2">No listings found</p>
    <p className="text-gray-600 mb-6">Try adjusting your filters or be the first to post!</p>
    <Link
      to="/housing/create"
      className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
    >
      <PlusCircle className="w-5 h-5" />
      Post First Listing
    </Link>
  </div>
);

export default Housing;
