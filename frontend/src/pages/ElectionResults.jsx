import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import electionsApi from '../api/elections';
import { ArrowLeft, Trophy, Users, TrendingUp } from 'lucide-react';
import PageTitle from '../components/PageTitle';

const ElectionResults = () => {
    const { id } = useParams();
    const [election, setElection] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResults();
    }, [id]);

    const fetchResults = async () => {
        try {
            setLoading(true);
            const res = await electionsApi.getResults(id);
            setElection(res.data.election);
            setResults(res.data.results);
        } catch (error) {
            console.error('Failed to fetch results:', error);
            alert(error.response?.data?.message || 'Failed to fetch results');
        } finally {
            setLoading(false);
        }
    };

    const getPercentage = (voteCount, totalVotes) => {
        if (totalVotes === 0) return 0;
        return ((voteCount / totalVotes) * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading results...</p>
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
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-8">
            <PageTitle title={`${election.title} - Results`} />
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Back Button */}
                <Link
                    to={`/elections/${id}`}
                    className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-6 transition-colors"
                >
                    <ArrowLeft size={20} />
                    Back to Election
                </Link>

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-yellow-100 rounded-xl">
                            <Trophy className="w-8 h-8 text-yellow-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-gray-900">{election.title}</h1>
                            <p className="text-gray-600">Election Results</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                        <span className={`px-3 py-1 rounded-full font-semibold ${election.status === 'ended' ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800'
                            }`}>
                            {election.status === 'ended' ? 'Final Results' : 'Live Results'}
                        </span>
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full font-semibold">
                            {election.department}
                        </span>
                        {election.type === 'cr' && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full font-semibold">
                                Batch {election.year}
                            </span>
                        )}
                    </div>
                </div>

                {/* Results by Position */}
                <div className="space-y-6">
                    {results.map((result) => (
                        <div key={result.position._id} className="bg-white rounded-2xl shadow-xl p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900">{result.position.positionName}</h2>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Users size={20} />
                                    <span className="font-semibold">{result.totalVotes} votes</span>
                                </div>
                            </div>

                            {result.candidates.length === 0 ? (
                                <p className="text-gray-600 text-center py-8">No candidates for this position</p>
                            ) : (
                                <div className="space-y-4">
                                    {result.candidates.map((candidateResult, index) => {
                                        const isWinner = index === 0 && result.totalVotes > 0;
                                        const percentage = getPercentage(candidateResult.voteCount, result.totalVotes);

                                        return (
                                            <div
                                                key={candidateResult.candidate._id}
                                                className={`relative p-4 rounded-xl border-2 transition-all ${isWinner
                                                    ? 'border-yellow-400 bg-yellow-50'
                                                    : 'border-gray-200 bg-gray-50'
                                                    }`}
                                            >
                                                {/* Winner Badge */}
                                                {isWinner && (
                                                    <div className="absolute -top-3 -right-3 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                                                        <Trophy size={14} />
                                                        WINNER
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 mb-3">
                                                    {/* Rank */}
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isWinner
                                                        ? 'bg-yellow-400 text-yellow-900'
                                                        : 'bg-gray-200 text-gray-700'
                                                        }`}>
                                                        {index + 1}
                                                    </div>

                                                    {/* Candidate Info */}
                                                    <img
                                                        src={candidateResult.candidate.user.profilePicture || '/default-avatar.png'}
                                                        alt={candidateResult.candidate.user.name}
                                                        className="w-12 h-12 rounded-full object-cover"
                                                    />
                                                    <div className="flex-1">
                                                        <h3 className="font-bold text-lg text-gray-900">
                                                            {candidateResult.candidate.user.name}
                                                        </h3>
                                                        <p className="text-sm text-gray-600">
                                                            {candidateResult.candidate.user.department}
                                                        </p>
                                                    </div>

                                                    {/* Vote Count */}
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-gray-900">
                                                            {candidateResult.voteCount}
                                                        </p>
                                                        <p className="text-sm text-gray-600">votes</p>
                                                    </div>
                                                </div>

                                                {/* Progress Bar */}
                                                <div className="relative">
                                                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${isWinner
                                                                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500'
                                                                : 'bg-gradient-to-r from-indigo-400 to-indigo-500'
                                                                }`}
                                                            style={{ width: `${percentage}%` }}
                                                        />
                                                    </div>
                                                    <div className="flex items-center justify-between mt-1">
                                                        <span className="text-xs text-gray-600">
                                                            {percentage}% of votes
                                                        </span>
                                                        {isWinner && (
                                                            <span className="text-xs font-semibold text-yellow-700 flex items-center gap-1">
                                                                <TrendingUp size={12} />
                                                                Leading
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Summary */}
                <div className="mt-6 bg-white rounded-2xl shadow-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Election Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-indigo-50 rounded-xl">
                            <p className="text-sm text-indigo-600 font-semibold">Total Positions</p>
                            <p className="text-3xl font-bold text-indigo-900">{results.length}</p>
                        </div>
                        <div className="p-4 bg-purple-50 rounded-xl">
                            <p className="text-sm text-purple-600 font-semibold">Total Candidates</p>
                            <p className="text-3xl font-bold text-purple-900">
                                {results.reduce((sum, r) => sum + r.candidates.length, 0)}
                            </p>
                        </div>
                        <div className="p-4 bg-green-50 rounded-xl">
                            <p className="text-sm text-green-600 font-semibold">Total Votes Cast</p>
                            <p className="text-3xl font-bold text-green-900">
                                {results.reduce((sum, r) => sum + r.totalVotes, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ElectionResults;
