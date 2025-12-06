import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import electionRequestsApi from '../../api/electionRequests';
import { ArrowLeft, CheckCircle, XCircle, Clock, Vote, Calendar, Users } from 'lucide-react';
import PageTitle from '../../components/PageTitle';

const ElectionRequests = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending'); // pending, approved, rejected, all

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const params = filter !== 'all' ? { status: filter } : {};
            const res = await electionRequestsApi.getAll(params);
            setRequests(res.data);
        } catch (error) {
            console.error('Failed to fetch election requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        if (!window.confirm('Approve this election request? This will create the election.')) {
            return;
        }

        try {
            const response = await electionRequestsApi.approve(requestId);
            console.log('Approve response:', response);
            alert('✅ Election request approved and election created successfully!');
            fetchRequests();
        } catch (error) {
            console.error('Failed to approve request:', error);
            console.error('Error details:', error.response?.data);

            // Check if it actually succeeded despite the error
            if (error.response?.status === 200 || error.response?.data?.election) {
                alert('✅ Election request approved and election created successfully!');
                fetchRequests();
            } else {
                alert(error.response?.data?.message || error.message || 'Failed to approve request');
            }
        }
    };

    const handleReject = async (requestId) => {
        const reason = prompt('Enter rejection reason:');
        if (!reason) return;

        try {
            await electionRequestsApi.reject(requestId, { reason });
            alert('Election request rejected');
            fetchRequests();
        } catch (error) {
            console.error('Failed to reject request:', error);
            alert(error.response?.data?.message || 'Failed to reject request');
        }
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

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300'
        };
        return badges[status] || badges.pending;
    };

    if (!user || user.role !== 'admin') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-red-600">Access Denied - Admin Only</p>
                    <Link to="/elections" className="text-indigo-600 hover:underline mt-4 inline-block">
                        Back to Elections
                    </Link>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-700 via-slate-700 to-gray-600 py-8">
            <PageTitle title="Election Requests" />
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-8 mb-8 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Link
                                to="/elections"
                                className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
                            >
                                <ArrowLeft size={24} className="text-gray-700" />
                            </Link>
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg">
                                <Vote className="w-10 h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                    Election Requests
                                </h1>
                                <p className="text-gray-600 font-medium mt-1">Review and manage election requests</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="flex gap-3 flex-wrap">
                        {['pending', 'approved', 'rejected', 'all'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-5 py-2.5 rounded-xl font-bold transition-all ${filter === status
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-white text-gray-700 hover:bg-gray-50 shadow-md hover:shadow-lg'
                                    }`}
                            >
                                {status === 'pending' && '⏳ '}
                                {status === 'approved' && '✅ '}
                                {status === 'rejected' && '❌ '}
                                {status === 'all' && '📋 '}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Requests List */}
                {requests.length === 0 ? (
                    <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl p-16 text-center border-2 border-dashed border-gray-300">
                        <div className="p-6 bg-gray-100 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                            <Vote className="w-12 h-12 text-gray-400" />
                        </div>
                        <p className="text-gray-600 text-xl font-semibold mb-2">No requests found</p>
                        <p className="text-gray-500">No election requests with status: {filter}</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {requests.map((request) => (
                            <div
                                key={request._id}
                                className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
                            >
                                {/* Status Bar */}
                                <div className={`h-2 ${request.status === 'pending'
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400'
                                    : request.status === 'approved'
                                        ? 'bg-gradient-to-r from-green-400 to-emerald-400'
                                        : 'bg-gradient-to-r from-red-400 to-pink-400'
                                    }`}
                                />

                                <div className="p-6">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <Vote className={`w-6 h-6 ${request.type === 'society' ? 'text-purple-600' : 'text-orange-600'}`} />
                                                <h3 className="text-2xl font-bold text-gray-900">
                                                    {request.title}
                                                </h3>
                                            </div>
                                            {request.description && (
                                                <p className="text-gray-600 leading-relaxed mb-3">
                                                    {request.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <Users size={16} />
                                                <span>Requested by: <strong>{request.requestedBy?.name}</strong> ({request.requestedBy?.email})</span>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-2 rounded-xl text-sm font-bold border-2 ${getStatusBadge(request.status)}`}>
                                            {request.status === 'pending' && '⏳ '}
                                            {request.status === 'approved' && '✅ '}
                                            {request.status === 'rejected' && '❌ '}
                                            {request.status.toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold mb-1">Type</p>
                                            <p className="font-bold text-gray-900">
                                                {request.type === 'society' ? '🏛️ Society' : '👥 CR Election'}
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold mb-1">Department</p>
                                            <p className="font-bold text-gray-900">📚 {request.department}</p>
                                        </div>
                                        {request.type === 'cr' && (
                                            <div className="bg-gray-50 p-3 rounded-xl">
                                                <p className="text-xs text-gray-500 font-bold mb-1">Batch</p>
                                                <p className="font-bold text-gray-900">🎓 Batch {request.year}</p>
                                            </div>
                                        )}
                                        <div className="bg-gray-50 p-3 rounded-xl">
                                            <p className="text-xs text-gray-500 font-bold mb-1">Requested</p>
                                            <p className="font-bold text-gray-900 text-sm">{formatDate(request.createdAt)}</p>
                                        </div>
                                    </div>

                                    {/* Proposed Dates */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-xl">
                                            <Calendar size={20} className="text-indigo-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 font-bold">Proposed Start</p>
                                                <p className="font-bold text-gray-900">{request.proposedStartDate ? formatDate(request.proposedStartDate) : 'Not set'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl">
                                            <Clock size={20} className="text-red-600" />
                                            <div>
                                                <p className="text-xs text-gray-600 font-bold">Proposed End</p>
                                                <p className="font-bold text-gray-900">{request.proposedEndDate ? formatDate(request.proposedEndDate) : 'Not set'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Positions */}
                                    {request.positions && request.positions.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-sm font-bold text-gray-700 mb-2">Positions:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {request.positions.map((pos, idx) => (
                                                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-800 rounded-lg text-sm font-bold">
                                                        {pos.positionName}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Rejection Reason */}
                                    {request.status === 'rejected' && request.rejectionReason && (
                                        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-4">
                                            <p className="text-sm font-bold text-red-900 mb-1">Rejection Reason:</p>
                                            <p className="text-red-800">{request.rejectionReason}</p>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    {request.status === 'pending' && (
                                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                                            <button
                                                onClick={() => handleApprove(request._id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                            >
                                                <CheckCircle size={20} />
                                                Approve & Create Election
                                            </button>
                                            <button
                                                onClick={() => handleReject(request._id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                            >
                                                <XCircle size={20} />
                                                Reject Request
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionRequests;
