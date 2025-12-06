import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookRequests } from '../api/bookRequests';
import { BookOpen, Plus, Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, MessageCircle } from 'lucide-react';
import PageTitle from '../components/PageTitle';
import SaveButton from '../components/SaveButton';
import ReportButton from '../components/ReportButton';

const Books = () => {
    const { user } = useAuth();
    const [bookRequests, setBookRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        requestType: '',
        search: ''
    });

    useEffect(() => {
        loadBookRequests();
    }, [filters]);

    const loadBookRequests = async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status) params.status = filters.status;
            if (filters.requestType) params.requestType = filters.requestType;
            if (filters.search) params.search = filters.search;

            const data = await getBookRequests(params);
            setBookRequests(data.bookRequests);
        } catch (error) {
            console.error('Failed to load book requests:', error);
        }
        setLoading(false);
    };

    const getStatusBadge = (status) => {
        const badges = {
            open: { icon: Clock, color: 'bg-blue-100 text-blue-700', label: 'Open' },
            fulfilled: { icon: CheckCircle, color: 'bg-green-100 text-green-700', label: 'Fulfilled' },
            closed: { icon: XCircle, color: 'bg-gray-100 text-gray-700', label: 'Closed' }
        };
        const badge = badges[status] || badges.open;
        const Icon = badge.icon;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                <Icon className="w-3 h-3" />
                {badge.label}
            </span>
        );
    };

    const getUrgencyBadge = (urgency) => {
        if (urgency === 'urgent') {
            return (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                    <AlertCircle className="w-3 h-3" />
                    Urgent
                </span>
            );
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 pb-20 md:pb-8">
            <PageTitle title="Books" />
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-lg">
                                <BookOpen className="w-6 h-6 text-white" />
                            </div>
                            Book Requests
                        </h1>
                        <Link
                            to="/books/create"
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all hover:scale-105"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Request Book</span>
                            <span className="sm:hidden">Request</span>
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {/* Search */}
                            <div className="md:col-span-2 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by title, author, or course..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                value={filters.status}
                                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Status</option>
                                <option value="open">Open</option>
                                <option value="fulfilled">Fulfilled</option>
                                <option value="closed">Closed</option>
                            </select>

                            {/* Request Type Filter */}
                            <select
                                value={filters.requestType}
                                onChange={(e) => setFilters({ ...filters, requestType: e.target.value })}
                                className="px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">All Types</option>
                                <option value="borrow">Borrow</option>
                                <option value="need-to-buy">Need to Buy</option>
                                <option value="looking-for">Looking For</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Book Requests List */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : bookRequests.length === 0 ? (
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-16 text-center">
                        <BookOpen className="w-24 h-24 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No book requests found</h3>
                        <p className="text-gray-600 mb-6">Be the first to request a book!</p>
                        <Link
                            to="/books/create"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Request Book
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {bookRequests.map((request) => (
                            <Link
                                key={request._id}
                                to={`/books/${request._id}`}
                                className="group bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
                            >
                                {/* Image Section */}
                                <div className="relative h-56 bg-gradient-to-br from-indigo-50 via-purple-50 to-blue-100 overflow-hidden">
                                    {request.images && request.images.length > 0 ? (
                                        <>
                                            <img
                                                src={request.images[0]}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                alt={request.bookTitle}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </>
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center">
                                            <BookOpen className="w-24 h-24 text-indigo-300" strokeWidth={1.5} />
                                        </div>
                                    )}

                                    {/* Status Badge */}
                                    <div className="absolute top-3 left-3">
                                        {getStatusBadge(request.status)}
                                    </div>

                                    {/* Top Right - Urgent Badge and Action Buttons */}
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        {request.urgency === 'urgent' && getUrgencyBadge(request.urgency)}
                                        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                                            <SaveButton postId={request._id} postType="bookrequest" />
                                            <ReportButton itemType="bookrequest" itemId={request._id} reportedUserId={request.requester?._id} />
                                        </div>
                                    </div>

                                    {/* Multiple images badge */}
                                    {request.images && request.images.length > 1 && (
                                        <div className="absolute bottom-3 right-3 bg-black/80 backdrop-blur-md text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg">
                                            <BookOpen size={16} strokeWidth={2} />
                                            <span>{request.images.length} photos</span>
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-5 sm:p-6 flex flex-col flex-grow">
                                    {/* Title */}
                                    <h3 className="text-lg sm:text-xl font-black text-gray-900 line-clamp-2 mb-2 leading-tight">
                                        {request.bookTitle}
                                    </h3>

                                    {/* Author */}
                                    {request.author && (
                                        <p className="text-sm font-semibold text-gray-600 mb-3">by {request.author}</p>
                                    )}

                                    {/* Course Badge */}
                                    {request.course && (
                                        <div className="mb-3">
                                            <div className="inline-flex items-baseline gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-md">
                                                <p className="text-sm font-black text-white">
                                                    {request.course}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Description */}
                                    {request.description && (
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed font-medium">
                                            {request.description}
                                        </p>
                                    )}

                                    {/* Requester Info */}
                                    {request.requester && (
                                        <div className="border-t-2 border-gray-100 pt-3 mt-auto">
                                            <div className="flex items-center gap-2">
                                                {request.requester.profilePicture ? (
                                                    <img
                                                        src={request.requester.profilePicture}
                                                        alt={request.requester.name}
                                                        className="w-8 h-8 rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                        {request.requester.name?.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-gray-900 truncate">{request.requester.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{request.requester.department}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-between text-xs mt-3 pt-3 border-t-2 border-gray-100">
                                        <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl px-3 py-2 border border-blue-200">
                                            <MessageCircle size={16} className="text-blue-600" strokeWidth={2} />
                                            <span className="font-black text-blue-700">{(request.responses?.length || 0) + (request.commentCount || 0)}</span>
                                            <span className="font-semibold text-blue-600">
                                                {((request.responses?.length || 0) + (request.commentCount || 0)) === 1 ? 'response' : 'responses'}
                                            </span>
                                        </div>
                                        <span className="text-gray-500 font-semibold">
                                            {new Date(request.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Books;
