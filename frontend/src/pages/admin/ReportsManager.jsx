import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { getAllReports, updateReportStatus } from '../../api/reports';
import { useToast } from '../../hooks/useToast';
import { Flag, Eye, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import PageTitle from '../../components/PageTitle';
import UserAvatar from '../../components/UserAvatar';

const ReportsManager = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedReport, setSelectedReport] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        loadReports();
    }, [user, navigate]);

    const loadReports = async () => {
        try {
            const data = await getAllReports();
            setReports(data);
        } catch (error) {
            showToast('Failed to load reports', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (reportId, status) => {
        try {
            await updateReportStatus(reportId, { status, adminNotes });
            showToast('Report status updated', 'success');
            setSelectedReport(null);
            setAdminNotes('');
            loadReports();
        } catch (error) {
            showToast('Failed to update report', 'error');
        }
    };

    const filteredReports = reports.filter(report => {
        const matchesFilter = filter === 'all' || report.status === filter;
        const matchesSearch = !searchTerm ||
            report.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reporter?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reportedUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.reason?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusBadge = (status) => {
        const badges = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <AlertTriangle size={14} /> },
            reviewed: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Eye size={14} /> },
            resolved: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={14} /> },
            dismissed: { bg: 'bg-gray-100', text: 'text-gray-800', icon: <XCircle size={14} /> }
        };
        const badge = badges[status] || badges.pending;
        return (
            <span className={`${badge.bg} ${badge.text} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1`}>
                {badge.icon}
                {status.toUpperCase()}
            </span>
        );
    };

    const getReasonLabel = (reason) => {
        const labels = {
            spam: 'Spam',
            inappropriate: 'Inappropriate Content',
            scam: 'Scam/Fraud',
            harassment: 'Harassment',
            fake: 'Fake Information',
            other: 'Other'
        };
        return labels[reason] || reason;
    };

    const getItemLink = (itemType, itemId) => {
        const links = {
            buysell: `/buysell/${itemId}`,
            housing: `/housing/${itemId}`,
            event: `/events/${itemId}`,
            job: `/jobs/${itemId}`,
            lostfound: `/lost-found/${itemId}`,
            studygroup: `/study-groups/${itemId}`,
            post: `/posts/${itemId}`,
            comment: null, // Comments don't have direct links
            user: `/profile/${itemId}`,
        };
        return links[itemType] || null;
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading reports...</div>
            </div>
        );
    }

    const stats = {
        total: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        reviewed: reports.filter(r => r.status === 'reviewed').length,
        resolved: reports.filter(r => r.status === 'resolved').length,
        dismissed: reports.filter(r => r.status === 'dismissed').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <PageTitle title="Reports Manager" />
            <div className="max-w-7xl mx-auto px-4">
                <div className="bg-white rounded-2xl shadow-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <Flag className="text-red-600" size={32} />
                            <h1 className="text-3xl font-bold text-gray-900">Reports Manager</h1>
                        </div>
                    </div>

                    {/* Statistics Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                            <p className="text-sm text-gray-600 mb-1">Total Reports</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
                            <p className="text-sm text-yellow-700 mb-1">Pending</p>
                            <p className="text-3xl font-bold text-yellow-800">{stats.pending}</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                            <p className="text-sm text-blue-700 mb-1">Reviewed</p>
                            <p className="text-3xl font-bold text-blue-800">{stats.reviewed}</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                            <p className="text-sm text-green-700 mb-1">Resolved</p>
                            <p className="text-3xl font-bold text-green-800">{stats.resolved}</p>
                        </div>
                        <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-300">
                            <p className="text-sm text-gray-600 mb-1">Dismissed</p>
                            <p className="text-3xl font-bold text-gray-700">{stats.dismissed}</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search reports by description, user, or reason..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchTerm && (
                                <button
                                    onClick={() => setSearchTerm('')}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle size={20} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 mb-6 flex-wrap">
                        {['all', 'pending', 'reviewed', 'resolved', 'dismissed'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                {status !== 'all' && ` (${reports.filter(r => r.status === status).length})`}
                            </button>
                        ))}
                    </div>

                    {/* Results Count */}
                    {searchTerm && (
                        <div className="mb-4 text-sm text-gray-600">
                            Found {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
                            {searchTerm && ` matching "${searchTerm}"`}
                        </div>
                    )}

                    {/* Reports List */}
                    <div className="space-y-4">
                        {filteredReports.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                                    <Flag className="w-12 h-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    {searchTerm ? 'No matching reports' : 'No reports found'}
                                </h3>
                                <p className="text-gray-500">
                                    {searchTerm ? 'Try adjusting your search terms' : 'All reports will appear here'}
                                </p>
                            </div>
                        ) : (
                            filteredReports.map(report => (
                                <div
                                    key={report._id}
                                    className="border border-gray-200 rounded-xl p-5 hover:shadow-lg transition bg-white"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                {getStatusBadge(report.status)}
                                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold">
                                                    {report.itemType.toUpperCase()}
                                                </span>
                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                                                    {getReasonLabel(report.reason)}
                                                </span>
                                                {getItemLink(report.itemType, report.reportedItem) && (
                                                    <Link
                                                        to={getItemLink(report.itemType, report.reportedItem)}
                                                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold hover:bg-blue-200 transition flex items-center gap-1"
                                                    >
                                                        View Content
                                                    </Link>
                                                )}
                                            </div>

                                            <p className="text-gray-700 mb-4 p-3 bg-gray-50 rounded-lg border-l-4 border-red-400">
                                                <span className="font-semibold text-gray-900">Report Description:</span><br />
                                                {report.description}
                                            </p>

                                            {/* Reporter Info */}
                                            <div className="flex items-center gap-3 mb-3 p-3 bg-blue-50 rounded-lg">
                                                <UserAvatar user={report.reporter} size="md" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-gray-700">Reported by:</p>
                                                    <Link
                                                        to={`/profile/${report.reporter?._id}`}
                                                        className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                                    >
                                                        {report.reporter?.name}
                                                    </Link>
                                                    <p className="text-xs text-gray-600">{report.reporter?.email}</p>
                                                    {report.reporter?.department && (
                                                        <p className="text-xs text-gray-500">
                                                            {report.reporter.department} • Batch {report.reporter.batch}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Reported User Info */}
                                            {report.reportedUser && (
                                                <div className="flex items-center gap-3 mb-3 p-3 bg-red-50 rounded-lg">
                                                    <UserAvatar user={report.reportedUser} size="md" />
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-700">Reported user:</p>
                                                        <Link
                                                            to={`/profile/${report.reportedUser?._id}`}
                                                            className="font-bold text-red-600 hover:text-red-800 flex items-center gap-1"
                                                        >
                                                            {report.reportedUser?.name}
                                                        </Link>
                                                        <p className="text-xs text-gray-600">{report.reportedUser?.email}</p>
                                                        {report.reportedUser?.department && (
                                                            <p className="text-xs text-gray-500">
                                                                {report.reportedUser.department} • Batch {report.reportedUser.batch}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-xs text-gray-500 flex items-center gap-4">
                                                <span>📅 {new Date(report.createdAt).toLocaleString()}</span>
                                                {report.resolvedBy && (
                                                    <span>✅ Resolved by: {report.resolvedBy.name}</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="ml-4 flex flex-col gap-2">
                                            {report.status === 'pending' && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleUpdateStatus(report._id, 'resolved')}
                                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition flex items-center gap-1"
                                                        title="Quick Resolve"
                                                    >
                                                        <CheckCircle size={14} />
                                                        Resolve
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(report._id, 'dismissed')}
                                                        className="px-3 py-1.5 bg-gray-600 text-white rounded-lg text-xs font-semibold hover:bg-gray-700 transition flex items-center gap-1"
                                                        title="Quick Dismiss"
                                                    >
                                                        <XCircle size={14} />
                                                        Dismiss
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => {
                                                    setSelectedReport(report);
                                                    setAdminNotes(report.adminNotes || '');
                                                }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                                            >
                                                <Eye size={16} />
                                                Details
                                            </button>
                                        </div>
                                    </div>

                                    {report.adminNotes && (
                                        <div className="mt-3 p-3 bg-green-50 rounded-lg border-l-4 border-green-600">
                                            <p className="text-sm font-semibold text-green-900 mb-1">📝 Admin Notes:</p>
                                            <p className="text-sm text-green-800">{report.adminNotes}</p>
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Manage Report Modal */}
            {selectedReport && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={() => setSelectedReport(null)}
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <Flag className="text-red-600" />
                                Manage Report
                            </h3>
                            {getItemLink(selectedReport.itemType, selectedReport.reportedItem) && (
                                <Link
                                    to={getItemLink(selectedReport.itemType, selectedReport.reportedItem)}
                                    className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm font-bold hover:bg-blue-200 transition flex items-center gap-2"
                                >
                                    View Content
                                </Link>
                            )}
                        </div>

                        <div className="space-y-4 mb-6">
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-bold">
                                    {selectedReport.itemType.toUpperCase()}
                                </span>
                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-bold">
                                    {getReasonLabel(selectedReport.reason)}
                                </span>
                                {getStatusBadge(selectedReport.status)}
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-red-400">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Report Description:</p>
                                <p className="text-gray-900">{selectedReport.description}</p>
                            </div>

                            {/* Reporter Info */}
                            <div className="p-4 bg-blue-50 rounded-lg">
                                <p className="text-sm font-semibold text-gray-700 mb-3">Reported by:</p>
                                <div className="flex items-center gap-3">
                                    <UserAvatar user={selectedReport.reporter} size="lg" />
                                    <div className="flex-1">
                                        <Link
                                            to={`/profile/${selectedReport.reporter?._id}`}
                                            className="font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 text-lg"
                                        >
                                            {selectedReport.reporter?.name}
                                        </Link>
                                        <p className="text-sm text-gray-600">{selectedReport.reporter?.email}</p>
                                        {selectedReport.reporter?.department && (
                                            <p className="text-sm text-gray-500">
                                                {selectedReport.reporter.department} • Batch {selectedReport.reporter.batch}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Reported User Info */}
                            {selectedReport.reportedUser && (
                                <div className="p-4 bg-red-50 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Reported user:</p>
                                    <div className="flex items-center gap-3">
                                        <UserAvatar user={selectedReport.reportedUser} size="lg" />
                                        <div className="flex-1">
                                            <Link
                                                to={`/profile/${selectedReport.reportedUser?._id}`}
                                                className="font-bold text-red-600 hover:text-red-800 flex items-center gap-1 text-lg"
                                            >
                                                {selectedReport.reportedUser?.name}
                                            </Link>
                                            <p className="text-sm text-gray-600">{selectedReport.reportedUser?.email}</p>
                                            {selectedReport.reportedUser?.department && (
                                                <p className="text-sm text-gray-500">
                                                    {selectedReport.reportedUser.department} • Batch {selectedReport.reportedUser.batch}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="text-sm text-gray-500 space-y-1">
                                <p>📅 Submitted: {new Date(selectedReport.createdAt).toLocaleString()}</p>
                                {selectedReport.resolvedBy && (
                                    <p>✅ Resolved by: {selectedReport.resolvedBy.name} on {new Date(selectedReport.resolvedAt).toLocaleString()}</p>
                                )}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Admin Notes
                            </label>
                            <textarea
                                value={adminNotes}
                                onChange={(e) => setAdminNotes(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                rows="4"
                                placeholder="Add notes about your decision..."
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => handleUpdateStatus(selectedReport._id, 'reviewed')}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Mark Reviewed
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedReport._id, 'resolved')}
                                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                            >
                                Resolve
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(selectedReport._id, 'dismissed')}
                                className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
                            >
                                Dismiss
                            </button>
                            <button
                                onClick={() => setSelectedReport(null)}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportsManager;
