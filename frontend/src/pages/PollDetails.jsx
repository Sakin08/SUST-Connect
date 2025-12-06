import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import pollsApi from '../api/polls';
import { BarChart3, Users, Clock, CheckCircle, ArrowLeft, Edit, Trash2 } from 'lucide-react';

const PollDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [poll, setPoll] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [textResponse, setTextResponse] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadPoll();
    }, [id]);

    const loadPoll = async () => {
        try {
            const res = await pollsApi.getById(id);
            setPoll(res.data);

            // Pre-select user's previous vote if exists
            if (res.data.userVote) {
                setSelectedOptions(res.data.userVote.selectedOptions);
                setTextResponse(res.data.userVote.textResponse || '');
            }
        } catch (error) {
            console.error('Failed to load poll:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOptionToggle = (optionId) => {
        if (poll.pollType === 'single') {
            setSelectedOptions([optionId]);
        } else {
            setSelectedOptions(prev =>
                prev.includes(optionId)
                    ? prev.filter(id => id !== optionId)
                    : [...prev, optionId]
            );
        }
    };

    const handleSubmitVote = async () => {
        if (selectedOptions.length === 0) {
            alert('Please select at least one option');
            return;
        }

        try {
            setSubmitting(true);
            await pollsApi.vote(id, { selectedOptions, textResponse });
            alert('Vote submitted successfully!');
            loadPoll(); // Reload to show updated results
        } catch (error) {
            console.error('Failed to submit vote:', error);
            alert(error.response?.data?.message || 'Failed to submit vote');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this poll permanently?')) return;

        try {
            await pollsApi.remove(id);
            alert('Poll deleted successfully');
            navigate('/polls');
        } catch (error) {
            alert('Failed to delete poll');
        }
    };

    const canEdit = user && poll && (
        poll.createdBy._id === user._id ||
        user.role === 'admin' ||
        user.role === 'super_admin'
    );

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                    <p className="text-xl font-bold text-gray-800">Loading poll...</p>
                </div>
            </div>
        );
    }

    if (!poll) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
                <div className="text-center p-12 bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl">
                    <p className="text-xl font-bold text-gray-800">Poll not found</p>
                </div>
            </div>
        );
    }

    const isActive = poll.status === 'active' && new Date(poll.endDate) > new Date();
    const showResults = poll.hasVoted || !isActive || poll.showLiveResults;

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Back Button */}
                <Link
                    to="/polls"
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Polls
                </Link>

                {/* Poll Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-500 via-indigo-600 to-blue-600 p-6 text-white">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-wider opacity-90">{poll.type}</p>
                                    <p className="text-xs opacity-75">{poll.category}</p>
                                </div>
                            </div>
                            <span className={`px-4 py-2 rounded-lg text-sm font-bold ${isActive ? 'bg-green-500' : 'bg-gray-500'
                                }`}>
                                {isActive ? 'Active' : 'Ended'}
                            </span>
                        </div>
                        <h1 className="text-3xl font-black mb-2">{poll.title}</h1>
                        {poll.description && (
                            <p className="text-white/90 text-lg">{poll.description}</p>
                        )}
                    </div>

                    {/* Stats Bar */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center gap-6 flex-wrap">
                            <div className="flex items-center gap-2">
                                <Users className="w-5 h-5 text-indigo-600" />
                                <span className="font-bold text-gray-900">{poll.totalVotes}</span>
                                <span className="text-sm text-gray-600">votes</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="text-sm text-gray-600">
                                    {isActive ? `Ends ${new Date(poll.endDate).toLocaleDateString()}` : 'Ended'}
                                </span>
                            </div>
                            {poll.hasVoted && (
                                <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-lg">
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-bold text-green-700">You voted</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    <div className="p-6">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                            {poll.pollType === 'single' ? 'Choose one option:' : 'Choose one or more options:'}
                        </h2>

                        <div className="space-y-3">
                            {poll.options.map((option) => {
                                const percentage = poll.totalVotes > 0
                                    ? ((option.voteCount / poll.totalVotes) * 100).toFixed(1)
                                    : 0;
                                const isSelected = selectedOptions.includes(option._id);

                                return (
                                    <div key={option._id} className="relative">
                                        <button
                                            onClick={() => isActive && !poll.hasVoted && handleOptionToggle(option._id)}
                                            disabled={!isActive || poll.hasVoted}
                                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${isSelected
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 bg-white hover:border-indigo-300'
                                                } ${!isActive || poll.hasVoted ? 'cursor-default' : 'cursor-pointer'}`}
                                        >
                                            {/* Progress bar (if showing results) */}
                                            {showResults && (
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-xl transition-all duration-500"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            )}

                                            <div className="relative z-10 flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-gray-400'
                                                        }`}>
                                                        {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <span className="font-semibold text-gray-900">{option.text}</span>
                                                </div>
                                                {showResults && (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-bold text-gray-600">{option.voteCount} votes</span>
                                                        <span className="text-lg font-black text-indigo-600">{percentage}%</span>
                                                    </div>
                                                )}
                                            </div>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Text Response (for feedback/surveys) */}
                        {(poll.type === 'feedback' || poll.type === 'survey') && isActive && !poll.hasVoted && (
                            <div className="mt-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                    Additional Comments (Optional)
                                </label>
                                <textarea
                                    value={textResponse}
                                    onChange={(e) => setTextResponse(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Share your thoughts..."
                                />
                            </div>
                        )}

                        {/* Submit Button */}
                        {isActive && !poll.hasVoted && (
                            <button
                                onClick={handleSubmitVote}
                                disabled={submitting || selectedOptions.length === 0}
                                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? 'Submitting...' : 'Submit Vote'}
                            </button>
                        )}

                        {/* Edit/Delete Buttons */}
                        {canEdit && (
                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 transition-colors"
                                >
                                    <Trash2 size={18} />
                                    Delete Poll
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Creator Info */}
                    <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
                        <div className="flex items-center gap-3">
                            {poll.createdBy.profilePicture ? (
                                <img
                                    src={poll.createdBy.profilePicture}
                                    alt={poll.createdBy.name}
                                    className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-200"
                                />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg ring-2 ring-gray-200">
                                    {poll.createdBy.name.charAt(0)}
                                </div>
                            )}
                            <div>
                                <p className="font-bold text-gray-900">{poll.createdBy.name}</p>
                                <p className="text-sm text-gray-600">
                                    {poll.createdBy.department} • Created {new Date(poll.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PollDetails;
