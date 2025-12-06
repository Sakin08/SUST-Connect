import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, Clock, CheckCircle } from 'lucide-react';

const PollCard = ({ poll }) => {
    const navigate = useNavigate();

    const getTypeColor = (type) => {
        switch (type) {
            case 'opinion': return 'from-blue-500 to-indigo-600';
            case 'election': return 'from-purple-500 to-pink-600';
            case 'feedback': return 'from-green-500 to-emerald-600';
            case 'survey': return 'from-orange-500 to-amber-600';
            default: return 'from-gray-500 to-gray-600';
        }
    };

    const getStatusBadge = () => {
        if (poll.status === 'ended') {
            return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-lg">Ended</span>;
        }

        const now = new Date();
        const endDate = new Date(poll.endDate);
        const hoursLeft = Math.floor((endDate - now) / (1000 * 60 * 60));

        if (hoursLeft < 24) {
            return <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-lg animate-pulse">Ending Soon</span>;
        }

        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg">Active</span>;
    };

    return (
        <div
            onClick={() => navigate(`/polls/${poll._id}`)}
            className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-lg border border-gray-200 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full max-h-[400px]"
        >
            {/* Header with gradient */}
            <div className={`relative h-24 bg-gradient-to-r ${getTypeColor(poll.type)} p-4 flex items-center justify-between`}>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="relative z-10 flex items-center gap-3">
                    <div className="p-2 bg-white/20 backdrop-blur-md rounded-lg">
                        <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-white/80 uppercase tracking-wider">{poll.type}</p>
                        <p className="text-sm font-semibold text-white">{poll.category}</p>
                    </div>
                </div>
                <div className="relative z-10">
                    {getStatusBadge()}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow overflow-hidden">
                <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-3 group-hover:text-blue-600 transition-colors">
                    {poll.title}
                </h3>

                {poll.description && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {poll.description}
                    </p>
                )}

                {/* Stats */}
                <div className="flex items-center gap-3 mt-auto pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                        <Users size={14} className="text-blue-600" />
                        <span className="text-sm font-bold text-blue-700">{poll.totalVotes}</span>
                        <span className="text-xs text-blue-600">votes</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200">
                        <BarChart3 size={14} className="text-purple-600" />
                        <span className="text-xs font-semibold text-purple-700">{poll.options?.length} options</span>
                    </div>

                    {poll.hasVoted && (
                        <div className="flex items-center gap-1 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200 ml-auto">
                            <CheckCircle size={14} className="text-green-600" />
                            <span className="text-xs font-bold text-green-700">Voted</span>
                        </div>
                    )}
                </div>

                {/* Time remaining */}
                {poll.status === 'active' && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-2">
                        <Clock size={12} />
                        <span>Ends {new Date(poll.endDate).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PollCard;
