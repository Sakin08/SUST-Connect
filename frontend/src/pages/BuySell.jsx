import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import BuySellCard from '../components/BuySellCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import FilterBar from '../components/FilterBar.jsx';
import api from '../api/buysell.js';

const BuySell = () => {
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ sort: 'newest' });

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allPosts, searchQuery, filters]);

  const loadPosts = async () => {
    try {
      const res = await api.getAll();
      setAllPosts(res.data || []);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load posts:', err);
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    try {
      await api.remove(postId);
      // Remove the deleted post from state
      setAllPosts(prevPosts => prevPosts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Failed to delete post:', err);
      alert(err.response?.data?.message || 'Failed to delete post. Please try again.');
    }
  };

  const applyFilters = () => {
    let result = [...allPosts];

    // Search filter
    if (searchQuery) {
      result = result.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    if (filters.minPrice) {
      result = result.filter(post => post.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(post => post.price <= Number(filters.maxPrice));
    }

    // Location filter
    if (filters.location) {
      result = result.filter(post =>
        post.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Sort
    switch (filters.sort) {
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
    }

    setFilteredPosts(result);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
        <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-bold text-gray-800">Loading marketplace...</p>
          <p className="text-sm text-gray-500 mt-2">Finding great deals for you</p>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 p-4">
      <div className="max-w-md w-full p-8 text-center bg-red-50 border-l-4 border-red-500 rounded-2xl shadow-xl">
        <p className="text-xl font-bold text-red-800">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Section */}
        <header className="mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight">
                  Marketplace
                </h1>
                <p className="text-sm sm:text-base text-emerald-200 mt-1">Find great deals or sell your items</p>
              </div>
            </div>

            <Link
              to="/buysell/create"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Create Post</span>
            </Link>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar
            onSearch={setSearchQuery}
            placeholder="Search for items, locations, or descriptions..."
          />
        </div>

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            filters={filters}
            onFilterChange={setFilters}
            type="buysell"
          />
        </div>

        {/* Results Count */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl shadow-md">
              <span className="text-2xl font-black">{filteredPosts.length}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-gray-800">
                {filteredPosts.length === 1 ? 'Item Found' : 'Items Found'}
              </p>
              {filteredPosts.length !== allPosts.length && (
                <p className="text-sm text-gray-600">
                  Filtered from {allPosts.length} total
                </p>
              )}
            </div>
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-white hover:bg-blue-600 font-bold px-4 py-2 rounded-xl transition-all border-2 border-blue-200 hover:border-blue-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear search
            </button>
          )}
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {filteredPosts.length === 0 ? (
            <div className="col-span-full">
              <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-16 text-center border border-white/20">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No items found</h3>
                <p className="text-gray-600 mb-6">
                  {searchQuery || filters.location || filters.minPrice || filters.maxPrice
                    ? "Try adjusting your search or filters"
                    : "Be the first to post an item!"}
                </p>
                {(searchQuery || filters.location || filters.minPrice || filters.maxPrice) ? (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters({ sort: 'newest' });
                    }}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    Clear all filters
                  </button>
                ) : (
                  <Link
                    to="/buysell/create"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post First Item
                  </Link>
                )}
              </div>
            </div>
          ) : (
            filteredPosts.map(post => (
              <BuySellCard
                key={post._id}
                post={post}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default BuySell;