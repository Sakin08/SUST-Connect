import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import electionsApi from '../api/elections';
import electionRequestsApi from '../api/electionRequests';
import { Vote, Calendar, Users, Trophy, Clock, Trash2, CheckCircle, Plus } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const Elections = () => {
    const { user } = useAuth();
    const [elections, setElections] = useState([]);
    const [myElections, setMyElections] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, ongoing, upcoming, ended

    useEffect(() => {
        fetchElections();
        if (user && user.role !== 'admin') {
            fetchMyRequests();
        }
    }, [filter, user]);

    const fetchElections = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const [allRes, myRes] = await Promise.all([
                electionsApi.getAll(params),
                user ? electionsApi.getMyElections() : Promise.resolve({ data: [] })
            ]);
            setElections(allRes.data);
            setMyElections(myRes.data);
        } catch (error) {
            console.error('Failed to fetch elections:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyRequests = async () => {
        try {
            const res = await electionRequestsApi.getMyRequests();
            setMyRequests(res.data.filter(r => r.status === 'pending'));
        } catch (error) {
            console.error('Failed to fetch my requests:', error);
        }
    };

    // Helper function to check if user is eligible for an election
    const isUserEligible = (election) => {
        if (!user) return false;

        if (election.type === 'society') {
            return user.department === election.department;
        } else if (election.type === 'cr' && user.batch && user.batch !== 'N/A') {
            const userBatchStr = user.batch.toString().trim();
            let userBatchNumber;
            if (userBatchStr.length === 4) {
                userBatchNumber = parseInt(userBatchStr.substring(2, 4));
            } else if (userBatchStr.length === 2) {
                userBatchNumber = parseInt(userBatchStr);
            } else {
                return false;
            }
            return user.department === election.department && userBatchNumber === election.year;
        }
        return false;
    };

    // Sort elections: user's department first, then others
    const getSortedElections = () => {
        if (!user) return elections;

        const userDept = user.department;
        const myDeptElections = elections.filter(e => e.department === userDept);
        const otherElections = elections.filter(e => e.department !== userDept);

        return [...myDeptElections, ...otherElections];
    };

    const sortedElections = getSortedElections();

    const handleDeleteElection = async (electionId, electionTitle, e) => {
        e.preventDefault(); // Prevent navigation to election details

        if (!window.confirm(`Are you sure you want to delete "${electionTitle}"? This will delete all votes, candidates, and positions.`)) {
            return;
        }

        try {
            await electionsApi.delete(electionId);
            alert('Election deleted successfully!');
            fetchElections(); // Refresh the list
        } catch (error) {
            console.error('Failed to delete election:', error);
            alert(error.response?.data?.message || 'Failed to delete election');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            upcoming: 'bg-blue-100 text-blue-800',
            ongoing: 'bg-green-100 text-green-800',
            ended: 'bg-gray-100 text-gray-800'
        };
        return badges[status] || badges.ended;
    };

    const getTypeBadge = (type) => {
        return type === 'society'
            ? 'bg-purple-100 text-purple-800'
            : 'bg-orange-100 text-orange-800';
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const ElectionCard = ({ election, isEligible = false }) => {
        // Check if user would be eligible based on department/batch (for ended elections)
        let wouldBeEligible = false;
        if (user) {
            if (election.type === 'society') {
                wouldBeEligible = user.department === election.department;
            } else if (election.type === 'cr' && user.batch && user.batch !== 'N/A') {
                const userBatchStr = user.batch.toString().trim();
                let userBatchNumber;
                if (userBatchStr.length === 4) {
                    // "2019" -> 19
                    userBatchNumber = parseInt(userBatchStr.substring(2, 4));
                } else if (userBatchStr.length === 2) {
                    // "19" -> 19
                    userBatchNumber = parseInt(userBatchStr);
                } else {
                    userBatchNumber = 0;
                }
                wouldBeEligible = user.department === election.department && userBatchNumber === election.year;
            }
        }

        const canAccess = !user || isEligible || wouldBeEligible || user.role === 'admin';

        const cardContent = (
            <>
                {/* Gradient Top Bar */}
                <div className={`h-2 ${election.type === 'society'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500'
                    : 'bg-gradient-to-r from-orange-500 to-red-500'}`}
                />

                {/* Admin Delete Button */}
                {user?.role === 'admin' && (
                    <button
                        onClick={(e) => handleDeleteElection(election._id, election.title, e)}
                        className="absolute top-4 right-4 z-10 p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-all shadow-md hover:shadow-lg"
                        title="Delete Election"
                    >
                        <Trash2 size={18} />
                    </button>
                )}

                {/* Not Eligible Overlay */}
                {!canAccess && (
                    <div className="absolute top-4 right-4 z-10 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-xs font-bold border border-red-300">
                        🔒 Not Eligible
                    </div>
                )}

                <div className="block p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 pr-12">
                            <div className="flex items-center gap-2 mb-2">
                                <Vote className={`w-5 h-5 ${election.type === 'society' ? 'text-purple-600' : 'text-orange-600'}`} />
                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                                    {election.title}
                                </h3>
                            </div>
                            {election.description && (
                                <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                    {election.description}
                                </p>
                            )}
                        </div>
                        {isEligible && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full shadow-md">
                                <CheckCircle size={14} />
                                Eligible
                            </span>
                        )}
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getStatusBadge(election.status)}`}>
                            {election.status === 'ongoing' && '🔴 '}
                            {election.status === 'upcoming' && '🔵 '}
                            {election.status === 'ended' && '⚫ '}
                            {election.status.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm ${getTypeBadge(election.type)}`}>
                            {election.type === 'society' ? '🏛️ Society' : '👥 CR Election'}
                        </span>
                        <span className="px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-lg text-xs font-bold shadow-sm">
                            📚 {election.department}
                        </span>
                        {election.type === 'cr' && (
                            <span className="px-3 py-1.5 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 rounded-lg text-xs font-bold shadow-sm">
                                🎓 Batch {election.year}
                            </span>
                        )}
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="p-2 bg-indigo-50 rounded-lg">
                                <Calendar size={16} className="text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Starts</p>
                                <p className="text-gray-900 font-semibold">{formatDate(election.startTime).split(',')[0]}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <Clock size={16} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 font-medium">Ends</p>
                                <p className="text-gray-900 font-semibold">{formatDate(election.endTime).split(',')[0]}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );

        return (
            <div className={`group relative bg-white/95 backdrop-blur-md rounded-2xl shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 ${canAccess
                ? 'hover:shadow-2xl hover:border-indigo-400 hover:-translate-y-1 cursor-pointer'
                : 'opacity-60 cursor-not-allowed'
                }`}>
                {canAccess ? (
                    <Link to={`/elections/${election._id}`}>
                        {cardContent}
                    </Link>
                ) : (
                    <div onClick={(e) => {
                        e.preventDefault();
                        alert('You are not eligible to view this election. Only eligible voters can access election details.');
                    }}>
                        {cardContent}
                    </div>
                )}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading elections...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8">
            <PageTitle title="Elections" />
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                <Vote className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Elections
                                </h1>
                                <p className="text-gray-600 font-medium mt-1">Vote for your representatives</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            {user && user.role !== 'admin' && (
                                <Link
                                    to="/elections/request"
                                    className="group px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                                >
                                    <Vote className="w-5 h-5" />
                                    Request Election
                                </Link>
                            )}
                            {user?.role === 'admin' && (
                                <>
                                    <Link
                                        to="/admin/elections/requests"
                                        className="group px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        <Clock className="w-5 h-5" />
                                        Pending Requests
                                    </Link>
                                    <Link
                                        to="/admin/elections/create"
                                        className="group px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
                                    >
                                        <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                                        Create Election
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 flex-wrap">
                        {['all', 'ongoing', 'upcoming', 'ended'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-5 py-2.5 rounded-xl font-bold transition-all ${filter === status
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {status === 'all' && '📋 '}
                                {status === 'ongoing' && '🔴 '}
                                {status === 'upcoming' && '🔵 '}
                                {status === 'ended' && '⚫ '}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Request Election Info Card */}
                {user && user.role !== 'admin' && elections.length === 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 mb-8">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-green-500 rounded-xl">
                                <Vote className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-green-900 mb-2">
                                    Need an Election for Your Department or Batch?
                                </h3>
                                <p className="text-green-800 mb-4">
                                    You can request a CR election or Society election by clicking the "Request Election" button above.
                                    Provide the details, and admins will review and create it for you.
                                </p>
                                <Link
                                    to="/elections/request"
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition-colors"
                                >
                                    <Plus size={18} />
                                    Request Election Now
                                </Link>
                            </div>
                        </div>
                    </div>
                )}

                {/* My Pending Requests */}
                {user && user.role !== 'admin' && myRequests.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white">
                                Your Pending Requests
                            </h2>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                                {myRequests.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border-2 border-yellow-300 overflow-hidden hover:shadow-xl transition-all"
                                >
                                    <div className="h-2 bg-gradient-to-r from-yellow-400 to-orange-400" />
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Vote className={`w-5 h-5 ${request.type === 'society' ? 'text-purple-600' : 'text-orange-600'}`} />
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {request.title}
                                            </h3>
                                        </div>
                                        {request.description && (
                                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                {request.description}
                                            </p>
                                        )}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex flex-wrap items-center gap-2 text-sm">
                                                <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-lg font-bold text-xs">
                                                    {request.type === 'society' ? '🏛️ Society' : '👥 CR'}
                                                </span>
                                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-lg font-bold text-xs">
                                                    📚 {request.department}
                                                </span>
                                                {request.type === 'cr' && (
                                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-lg font-bold text-xs">
                                                        🎓 Batch {request.year}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-center">
                                            <p className="text-sm font-bold text-yellow-800">
                                                ⏳ Waiting for Admin Approval
                                            </p>
                                            <p className="text-xs text-yellow-700 mt-1">
                                                Requested on {new Date(request.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* My Eligible Elections */}
                {myElections.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-3 mb-5">
                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900">
                                Elections You Can Vote In
                            </h2>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-bold">
                                {myElections.length}
                            </span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {myElections.map((election) => (
                                <ElectionCard key={election._id} election={election} isEligible={true} />
                            ))}
                        </div>
                    </div>
                )}

                {/* All Elections - Organized by Status */}
                <div>
                    <div className="flex items-center gap-3 mb-5">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                            <Trophy className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-2xl font-black text-gray-900">
                            All Elections
                        </h2>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-bold">
                            {elections.length}
                        </span>
                    </div>
                    {elections.length === 0 ? (
                        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300">
                            <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                                <Vote className="w-12 h-12 text-gray-400" />
                            </div>
                            <p className="text-gray-600 text-xl font-semibold mb-2">No elections found</p>
                            <p className="text-gray-500">Check back later for upcoming elections</p>
                        </div>
                    ) : (
                        <div className="space-y-10">
                            {/* Ongoing Elections */}
                            {sortedElections.filter(e => e.status === 'ongoing').length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-1 w-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            🔴 Ongoing Elections
                                        </h3>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                                            {sortedElections.filter(e => e.status === 'ongoing').length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sortedElections
                                            .filter(e => e.status === 'ongoing')
                                            .map((election) => (
                                                <ElectionCard
                                                    key={election._id}
                                                    election={election}
                                                    isEligible={isUserEligible(election)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Elections */}
                            {sortedElections.filter(e => e.status === 'upcoming').length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-1 w-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            🔵 Upcoming Elections
                                        </h3>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold">
                                            {sortedElections.filter(e => e.status === 'upcoming').length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sortedElections
                                            .filter(e => e.status === 'upcoming')
                                            .map((election) => (
                                                <ElectionCard
                                                    key={election._id}
                                                    election={election}
                                                    isEligible={isUserEligible(election)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}

                            {/* Ended Elections */}
                            {sortedElections.filter(e => e.status === 'ended').length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="h-1 w-12 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full"></div>
                                        <h3 className="text-xl font-bold text-gray-800">
                                            ⚫ Ended Elections
                                        </h3>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-bold">
                                            {sortedElections.filter(e => e.status === 'ended').length}
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {sortedElections
                                            .filter(e => e.status === 'ended')
                                            .map((election) => (
                                                <ElectionCard
                                                    key={election._id}
                                                    election={election}
                                                    isEligible={isUserEligible(election)}
                                                />
                                            ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Elections;
