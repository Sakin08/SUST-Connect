import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import DonorCard from '../components/DonorCard';
import RequestCard from '../components/RequestCard';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const BloodDonation = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'donors');
    const [donors, setDonors] = useState([]);
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        bloodGroup: '',
        location: '',
        eligible: false
    });

    useEffect(() => {
        if (activeTab === 'donors') {
            loadDonors();
        } else {
            loadRequests();
        }
    }, [activeTab, filters]);

    const loadDonors = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);
            if (filters.location) params.append('location', filters.location);
            if (filters.eligible) params.append('eligible', 'true');

            const res = await axios.get(`${API_URL}/blood-donation/donors?${params}`);
            setDonors(res.data);
        } catch (err) {
            console.error('Failed to load donors:', err);
        }
        setLoading(false);
    };

    const loadRequests = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.bloodGroup) params.append('bloodGroup', filters.bloodGroup);

            const res = await axios.get(`${API_URL}/blood-donation/requests?${params}`);
            console.log('Blood requests loaded:', res.data);
            console.log('First request commentCount:', res.data[0]?.commentCount);
            setRequests(res.data);
        } catch (err) {
            console.error('Failed to load requests:', err);
        }
        setLoading(false);
    };

    const isEligible = (donor) => {
        if (!donor.nextEligibleDate) return true;
        return new Date(donor.nextEligibleDate) <= new Date();
    };

    const getDaysUntilEligible = (nextDate) => {
        if (!nextDate) return 0;
        const diff = new Date(nextDate) - new Date();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8 sm:py-12">
            <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
                {/* Header */}
                <header className="mb-8 sm:mb-10">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 sm:p-4 bg-gradient-to-br from-red-500 via-rose-600 to-pink-600 rounded-2xl shadow-lg">
                                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent tracking-tight">
                                    Blood Donation
                                </h1>
                                <p className="text-sm sm:text-base text-rose-200 mt-1">Save lives by donating blood</p>
                            </div>
                        </div>

                        {user && (
                            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                                <Link
                                    to="/blood-donation/register"
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Register as Donor</span>
                                </Link>
                                <Link
                                    to="/blood-donation/request"
                                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <span>Request Blood</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* Tabs */}
                <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-2 mb-8 border border-white/20">
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setActiveTab('donors');
                                setSearchParams({ tab: 'donors' });
                            }}
                            className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all ${activeTab === 'donors'
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="hidden sm:inline">Blood Donors</span>
                            <span className="sm:hidden">Donors</span>
                            <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === 'donors' ? 'bg-white/30' : 'bg-gray-200'
                                }`}>
                                {donors.length}
                            </span>
                        </button>
                        <button
                            onClick={() => {
                                setActiveTab('requests');
                                setSearchParams({ tab: 'requests' });
                            }}
                            className={`flex-1 px-6 py-3 font-bold rounded-xl transition-all ${activeTab === 'requests'
                                ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-lg'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <span className="hidden sm:inline">Blood Requests</span>
                            <span className="sm:hidden">Requests</span>
                            <span className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${activeTab === 'requests' ? 'bg-white/30' : 'bg-gray-200'
                                }`}>
                                {requests.length}
                            </span>
                        </button>
                    </div>
                </div>

                {/* Filters - Compact */}
                <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-3 sm:p-4 mb-6 border border-white/20">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Blood Group
                            </label>
                            <select
                                value={filters.bloodGroup}
                                onChange={(e) => setFilters({ ...filters, bloodGroup: e.target.value })}
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">All Groups</option>
                                {bloodGroups.map(group => (
                                    <option key={group} value={group}>{group}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                Location
                            </label>
                            <input
                                type="text"
                                value={filters.location}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                placeholder="Location..."
                                className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                            />
                        </div>
                        {activeTab === 'donors' && (
                            <div className="flex items-end">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filters.eligible}
                                        onChange={(e) => setFilters({ ...filters, eligible: e.target.checked })}
                                        className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                                    />
                                    <span className="text-xs font-medium text-gray-700">
                                        Eligible only
                                    </span>
                                </label>
                            </div>
                        )}
                        <div className="flex items-end">
                            <button
                                onClick={() => setFilters({ bloodGroup: '', location: '', eligible: false })}
                                className="w-full px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20">
                            <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-xl font-bold text-gray-800">Loading...</p>
                        </div>
                    </div>
                ) : activeTab === 'donors' ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {donors.map(donor => (
                            <DonorCard
                                key={donor._id}
                                donor={donor}
                                isEligible={isEligible}
                                daysLeft={getDaysUntilEligible}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                        {requests.map(request => (
                            <RequestCard key={request._id} request={request} onUpdate={loadRequests} />
                        ))}
                    </div>
                )}

                {!loading && ((activeTab === 'donors' && donors.length === 0) || (activeTab === 'requests' && requests.length === 0)) && (
                    <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-16 text-center border border-white/20">
                        <div className="w-24 h-24 bg-gradient-to-br from-red-100 to-pink-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            No {activeTab === 'donors' ? 'donors' : 'requests'} found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {activeTab === 'donors'
                                ? 'Be the first to register as a blood donor!'
                                : 'No active blood requests at the moment.'}
                        </p>
                        {user && (
                            <Link
                                to={activeTab === 'donors' ? '/blood-donation/register' : '/blood-donation/request'}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                {activeTab === 'donors' ? 'Register Now' : 'Create Request'}
                            </Link>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BloodDonation;
