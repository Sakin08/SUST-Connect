import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import electionsApi from '../api/elections';
import { ArrowLeft, Vote, Calendar, Clock, Users, CheckCircle, XCircle, Trophy, Trash2 } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const ElectionDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [election, setElection] = useState(null);
    const [positions, setPositions] = useState([]);
    const [candidates, setCandidates] = useState([]);
    const [hasVoted, setHasVoted] = useState(false);
    const [isEligible, setIsEligible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedVotes, setSelectedVotes] = useState({});
    const [voting, setVoting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        fetchElectionDetails();
    }, [id]);

    const fetchElectionDetails = async () => {
        try {
            setLoading(true);
            const res = await electionsApi.getById(id);
            setElection(res.data.election);
            setPositions(res.data.positions);
            setCandidates(res.data.candidates);
            setHasVoted(res.data.hasVoted);
            setIsEligible(res.data.isEligible);

            // Debug logging
            console.log('Election Details:', {
                status: res.data.election.status,
                isEligible: res.data.isEligible,
                hasVoted: res.data.hasVoted,
                positionsCount: res.data.positions.length,
                candidatesCount: res.data.candidates.length,
                canVote: res.data.election.status === 'ongoing' && res.data.isEligible && !res.data.hasVoted,
                requestedBy: res.data.election.requestedBy,
                createdBy: res.data.election.createdBy,
                fullElection: res.data.election
            });
            console.log('Has requestedBy?', !!res.data.election.requestedBy);
            console.log('Has createdBy?', !!res.data.election.createdBy);
        } catch (error) {
            console.error('Failed to fetch election details:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVoteSelection = (positionId, candidateId) => {
        setSelectedVotes(prev => ({
            ...prev,
            [positionId]: candidateId
        }));
    };

    const handleSubmitVote = async () => {
        try {
            setVoting(true);
            const votes = Object.entries(selectedVotes).map(([positionId, candidateId]) => ({
                positionId,
                candidateId
            }));

            await electionsApi.castVote({
                electionId: id,
                votes
            });

            alert('Vote cast successfully!');
            setShowConfirmModal(false);
            fetchElectionDetails();
        } catch (error) {
            console.error('Failed to cast vote:', error);
            alert(error.response?.data?.message || 'Failed to cast vote');
        } finally {
            setVoting(false);
        }
    };

    const handleDeleteElection = async () => {
        if (!window.confirm('Are you sure you want to delete this election? This action cannot be undone and will delete all votes, candidates, and positions.')) {
            return;
        }

        try {
            await electionsApi.delete(id);
            alert('Election deleted successfully!');
            navigate('/elections');
        } catch (error) {
            console.error('Failed to delete election:', error);
            alert(error.response?.data?.message || 'Failed to delete election');
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeRemaining = () => {
        if (!election) return '';
        const now = new Date();
        const end = new Date(election.endTime);
        const diff = end - now;

        if (diff <= 0) return 'Ended';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) return `${days}d ${hours}h remaining`;
        if (hours > 0) return `${hours}h ${minutes}m remaining`;
        return `${minutes}m remaining`;
    };

    const getCandidatesForPosition = (positionId) => {
        return candidates.filter(c => c.position._id === positionId);
    };

    const canVote = election?.status === 'ongoing' && isEligible && !hasVoted;
    const allPositionsSelected = positions.every(pos => selectedVotes[pos._id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading election...</p>
                </div>
            </div>
        );
    }

    if (!election) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-xl text-gray-600">Election not found</p>
                    <Link to="/elections" className="text-indigo-600 hover:underline mt-4 inline-block">
                        Back to Elections
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 py-8">
            <PageTitle title={election.title} />
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button and Admin Controls */}
                <div className="flex items-center justify-between mb-6">
                    <Link
                        to="/elections"
                        className="inline-flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Elections
                    </Link>

                    {/* Admin Controls */}
                    {user?.role === 'admin' && (
                        <div className="flex gap-2">
                            <button
                                onClick={handleDeleteElection}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg"
                            >
                                <Trash2 size={18} />
                                Delete Election
                            </button>
                        </div>
                    )}
                </div>

                {/* Election Header */}
                <div className="bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900 rounded-3xl shadow-2xl p-8 mb-6 border-2 border-gray-700">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`p-3 rounded-2xl ${election.type === 'society'
                                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                    : 'bg-gradient-to-br from-orange-500 to-red-500'}`}>
                                    <Vote className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-4xl font-black bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                    {election.title}
                                </h1>
                            </div>
                            {election.description && (
                                <p className="text-gray-300 text-lg leading-relaxed">{election.description}</p>
                            )}
                        </div>
                        <div className="flex flex-col gap-3 ml-6">
                            <span className={`px-5 py-2.5 rounded-xl text-sm font-bold text-center shadow-lg ${election.status === 'ongoing' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white animate-pulse' :
                                election.status === 'upcoming' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                                    'bg-gradient-to-r from-gray-400 to-gray-500 text-white'
                                }`}>
                                {election.status === 'ongoing' && '🔴 '}
                                {election.status === 'upcoming' && '🔵 '}
                                {election.status === 'ended' && '⚫ '}
                                {election.status.toUpperCase()}
                            </span>
                            {election.status === 'ongoing' && (
                                <span className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-bold text-center shadow-lg">
                                    ⏰ {getTimeRemaining()}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <div className="flex items-center gap-4 p-5 bg-slate-700/50 rounded-2xl shadow-md border-2 border-indigo-500/30 hover:border-indigo-400 transition-all backdrop-blur-sm">
                            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Starts</p>
                                <p className="font-bold text-white text-lg">{formatDate(election.startTime).split(',')[0]}</p>
                                <p className="text-xs text-gray-400">{formatDate(election.startTime).split(',')[1]}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-slate-700/50 rounded-2xl shadow-md border-2 border-red-500/30 hover:border-red-400 transition-all backdrop-blur-sm">
                            <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Ends</p>
                                <p className="font-bold text-white text-lg">{formatDate(election.endTime).split(',')[0]}</p>
                                <p className="text-xs text-gray-400">{formatDate(election.endTime).split(',')[1]}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-5 bg-slate-700/50 rounded-2xl shadow-md border-2 border-purple-500/30 hover:border-purple-400 transition-all backdrop-blur-sm">
                            <div className={`p-3 rounded-xl shadow-lg ${election.type === 'society'
                                ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                                : 'bg-gradient-to-br from-orange-500 to-yellow-500'}`}>
                                <Users className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide">Type</p>
                                <p className="font-bold text-white text-lg">
                                    {election.type === 'society' ? '🏛️ Society' : '👥 CR Election'}
                                </p>
                                <p className="text-xs text-gray-400">📚 {election.department}</p>
                            </div>
                        </div>
                    </div>

                    {/* Election Organizer Information */}
                    {election.requestedBy && (
                        <div className="mt-6">
                            <div className="p-5 bg-slate-700/50 rounded-2xl shadow-md border-2 border-blue-500/30 backdrop-blur-sm">
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-wide mb-3">👤 Election Organizer</p>
                                <div className="flex items-center gap-4">
                                    <img
                                        src={election.requestedBy.profilePicture || '/default-avatar.png'}
                                        alt={election.requestedBy.name}
                                        className="w-14 h-14 rounded-full object-cover border-2 border-blue-500"
                                    />
                                    <div>
                                        <p className="font-bold text-white text-lg">{election.requestedBy.name}</p>
                                        <p className="text-sm text-gray-400">
                                            📚 {election.requestedBy.department}
                                            {election.requestedBy.batch && ` • Batch ${election.requestedBy.batch}`}
                                        </p>
                                        {election.requestedBy.registrationNumber && (
                                            <p className="text-xs text-gray-500">🆔 {election.requestedBy.registrationNumber}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Eligibility Status */}
                    {user && (
                        <div className={`mt-6 p-5 rounded-2xl flex items-center gap-4 shadow-lg border-2 ${isEligible
                            ? 'bg-gradient-to-r from-green-900/30 to-emerald-900/30 border-green-500/50 backdrop-blur-sm'
                            : 'bg-gradient-to-r from-red-900/30 to-pink-900/30 border-red-500/50 backdrop-blur-sm'
                            }`}>
                            {isEligible ? (
                                <>
                                    <div className="p-3 bg-green-500 rounded-xl shadow-lg">
                                        <CheckCircle className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-300 text-lg">✅ You are eligible to vote</p>
                                        {hasVoted && (
                                            <p className="text-sm text-green-400 font-medium mt-1">🎉 You have already cast your vote</p>
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="p-3 bg-red-500 rounded-xl shadow-lg">
                                        <XCircle className="w-7 h-7 text-white" />
                                    </div>
                                    <p className="font-bold text-red-300 text-lg">❌ You are not eligible to vote in this election</p>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* View Results Button */}
                {(election.status === 'ended' || election.showLiveResults) && (
                    <div className="mb-6">
                        <Link
                            to={`/elections/${id}/results`}
                            className="block w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-center hover:shadow-xl transition-all"
                        >
                            <Trophy className="inline-block w-5 h-5 mr-2" />
                            View Results
                        </Link>
                    </div>
                )}

                {/* Positions and Candidates */}
                <div className="space-y-6">
                    {positions.map((position) => {
                        const positionCandidates = getCandidatesForPosition(position._id);
                        return (
                            <div key={position._id} className="bg-gradient-to-br from-slate-800 to-gray-900 rounded-3xl shadow-2xl p-8 border-2 border-gray-700 hover:border-indigo-500 transition-all">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                                        <Trophy className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-white">{position.positionName}</h2>
                                        {position.description && (
                                            <p className="text-gray-400 mt-1">{position.description}</p>
                                        )}
                                    </div>
                                    <span className="ml-auto px-4 py-2 bg-indigo-500/30 text-indigo-300 rounded-full text-sm font-bold border border-indigo-500/50">
                                        {positionCandidates.length} Candidate{positionCandidates.length !== 1 ? 's' : ''}
                                    </span>
                                </div>

                                {positionCandidates.length === 0 ? (
                                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-2xl p-8 text-center">
                                        <div className="p-4 bg-yellow-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                                            <Users className="w-8 h-8 text-yellow-700" />
                                        </div>
                                        <p className="text-yellow-900 font-bold text-lg">No candidates added yet</p>
                                        <p className="text-yellow-700 text-sm mt-2">Admin needs to add candidates for this position</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {positionCandidates.map((candidate) => (
                                            <div
                                                key={candidate._id}
                                                onClick={() => canVote && handleVoteSelection(position._id, candidate._id)}
                                                className={`group p-5 rounded-2xl border-3 transition-all ${selectedVotes[position._id] === candidate._id
                                                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 shadow-xl scale-105 backdrop-blur-sm'
                                                    : 'border-gray-600 bg-slate-700/50 hover:border-indigo-400 hover:shadow-lg backdrop-blur-sm'
                                                    } ${canVote ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="relative">
                                                        <img
                                                            src={candidate.user.profilePicture || '/default-avatar.png'}
                                                            alt={candidate.user.name}
                                                            className="w-20 h-20 rounded-2xl object-cover border-3 border-gray-600 shadow-lg"
                                                        />
                                                        {selectedVotes[position._id] === candidate._id && (
                                                            <div className="absolute -top-2 -right-2 p-1.5 bg-indigo-600 rounded-full shadow-lg">
                                                                <CheckCircle className="w-5 h-5 text-white" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-black text-xl text-white mb-1">{candidate.user.name}</h3>
                                                        <p className="text-sm text-gray-300 font-medium mb-1">
                                                            📚 {candidate.user.department}
                                                        </p>
                                                        <p className="text-xs text-gray-400 font-medium mb-2">
                                                            🆔 {candidate.user.registrationNumber || 'N/A'}  • 📅 Batch {candidate.user.batch || 'N/A'}
                                                        </p>
                                                        {candidate.manifesto && (
                                                            <div className="mt-3 p-3 bg-slate-800/70 rounded-xl border border-gray-600">
                                                                <p className="text-sm text-gray-300 leading-relaxed line-clamp-3">
                                                                    {candidate.manifesto}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Vote Button */}
                {canVote && (
                    <div className="mt-8 sticky bottom-4">
                        <button
                            onClick={() => setShowConfirmModal(true)}
                            disabled={!allPositionsSelected}
                            className="group w-full bg-gradient-to-r from-green-600 via-emerald-600 to-green-600 text-white py-5 rounded-2xl font-black text-xl shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 disabled:hover:scale-100 bg-size-200 bg-pos-0 hover:bg-pos-100"
                        >
                            <Vote className="inline-block w-6 h-6 mr-3 group-hover:rotate-12 transition-transform" />
                            {allPositionsSelected ? '✅ Cast Your Vote' : '⚠️ Select All Positions'}
                        </button>
                    </div>
                )}

                {/* Show why you can't vote */}
                {!canVote && user && (
                    <div className="mt-6 bg-slate-800/50 border-2 border-gray-600 rounded-xl p-4 text-center backdrop-blur-sm">
                        <p className="font-bold text-gray-300 mb-2">Cannot Vote</p>
                        {election.status !== 'ongoing' && (
                            <p className="text-gray-400">• Election is not currently ongoing (Status: {election.status})</p>
                        )}
                        {!isEligible && (
                            <p className="text-gray-400">• You are not eligible for this election</p>
                        )}
                        {hasVoted && (
                            <p className="text-gray-400">• You have already voted</p>
                        )}
                    </div>
                )}

                {/* Confirmation Modal */}
                {showConfirmModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-6 max-w-md w-full">
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Your Vote</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to cast your vote? This action cannot be undone.
                            </p>
                            <div className="space-y-2 mb-6">
                                {positions.map(pos => {
                                    const selectedCandidate = candidates.find(c => c._id === selectedVotes[pos._id]);
                                    return (
                                        <div key={pos._id} className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-semibold text-gray-700">{pos.positionName}</p>
                                            <p className="text-gray-900">{selectedCandidate?.user.name}</p>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmitVote}
                                    disabled={voting}
                                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    {voting ? 'Submitting...' : 'Confirm Vote'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ElectionDetails;
