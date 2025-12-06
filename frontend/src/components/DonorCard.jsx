import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from './UserAvatar';
import { CheckCircle, MapPin, Phone, UserCheck, Clock, HeartHandshake, Calendar, BarChart3, ChevronRight } from 'lucide-react'; // Suggested icons

const DonorCard = ({ donor, isEligible, daysLeft }) => {
    const { user } = useAuth();

    // Safety check - if donor or donor.user is null, don't render
    if (!donor || !donor.user) {
        return null;
    }

    const eligible = isEligible(donor);
    const daysUntilEligible = daysLeft(donor.nextEligibleDate);
    const isOwnProfile = user && donor.user && user._id === donor.user._id;

    // Dynamic classes based on eligibility status
    const primaryColor = eligible ? 'green' : 'yellow';
    const primaryClass = eligible ? 'border-green-500' : 'border-yellow-500';
    const accentClass = eligible ? 'text-green-600' : 'text-yellow-600';
    const bgAccentClass = eligible ? 'bg-green-50' : 'bg-yellow-50';

    return (
        <div className={`
            bg-white/90 backdrop-blur-lg rounded-xl shadow-lg 
            hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]
            overflow-hidden border ${primaryClass} flex flex-col
        `}>
            {/* 1. TOP HEADER & BLOOD GROUP */}
            <div className="p-4 pb-3">
                <div className="flex items-start gap-3">
                    {/* User Info (Left) */}
                    <div className="flex-1 min-w-0 flex gap-2 items-center">
                        <Link to={`/profile/${donor.user._id}`} className="flex-shrink-0">
                            <UserAvatar user={donor.user} size="md" />
                        </Link>
                        <div className="flex-1 min-w-0">
                            <Link
                                to={`/profile/${donor.user._id}`}
                                className="font-bold text-base text-gray-900 hover:text-red-600 transition block truncate"
                            >
                                {donor.user.name}
                            </Link>
                            <p className="text-sm text-gray-600 truncate">{donor.user.department}</p>
                            {/* Verification Badge */}
                            {donor.user.isStudentVerified && (
                                <span className="inline-flex items-center gap-1 text-blue-600 text-xs font-semibold py-0.5 px-2 rounded-full bg-blue-50 border border-blue-200 mt-1">
                                    <UserCheck size={12} />
                                    <span>Verified</span>
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Blood Group (Right - Accentuated) */}
                    <div className="flex flex-col items-center bg-gradient-to-br from-red-50 to-rose-100 px-3 py-2 rounded-xl border-2 border-red-200 shadow-lg flex-shrink-0">
                        <div className="text-3xl font-extrabold bg-gradient-to-br from-red-600 to-rose-700 bg-clip-text text-transparent leading-none">
                            {donor.bloodGroup}
                        </div>
                        <div className="text-xs font-black text-red-500 mt-1">BLOOD</div>
                    </div>
                </div>
            </div>

            {/* 2. ELIGIBILITY STATUS (MAIN CALLOUT) */}
            <div className={`p-3 mx-3 rounded-xl shadow-lg border-2 ${primaryClass} ${bgAccentClass} mb-3`}>
                {eligible ? (
                    <div className="flex items-center justify-center gap-2">
                        <CheckCircle size={20} className="text-green-600 flex-shrink-0" />
                        <p className="text-base font-bold text-green-700 text-center">
                            Available to Donate Now!
                        </p>
                    </div>
                ) : (
                    <div className="text-center">
                        <p className="text-base font-bold text-yellow-700 leading-snug flex items-center justify-center gap-2">
                            <Clock size={18} className="text-yellow-600" />
                            <span className="flex items-center gap-1">
                                Eligible in <span className="text-lg">{daysUntilEligible}</span> days
                            </span>
                        </p>
                        {donor.nextEligibleDate && (
                            <p className="text-sm text-gray-600 mt-1">
                                Next: {new Date(donor.nextEligibleDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric'
                                })}
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* 3. INFO GRID (Consolidated) */}
            <div className="p-4 pt-0 flex flex-col flex-grow space-y-2">

                {/* Location */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-lg shadow-sm border border-gray-200">
                    <MapPin size={16} className="text-red-500 flex-shrink-0" />
                    <span className="text-sm font-medium text-gray-700 truncate">{donor.location}</span>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-3 py-2 rounded-lg shadow-sm border border-green-200">
                    <Phone size={16} className="text-green-600 flex-shrink-0" />
                    <a href={`tel:${donor.phone}`} className="text-sm font-medium text-gray-700 hover:text-green-600 transition truncate">
                        {donor.phone}
                    </a>
                </div>

                {/* Total Donations */}
                <div className="flex items-center justify-between bg-gradient-to-r from-red-50 to-rose-100 px-3 py-2 rounded-lg shadow-md border-2 border-red-200">
                    <div className="flex items-center gap-2">
                        <BarChart3 size={16} className="text-red-600" />
                        <span className="text-sm font-semibold text-gray-700">Total Donations</span>
                    </div>
                    <span className="text-lg font-extrabold text-red-700">{donor.totalDonations}</span>
                </div>

                {/* Last Donation Date */}
                {donor.lastDonationDate && (
                    <div className="flex items-center gap-2 px-3 py-1.5 border-t border-gray-200">
                        <Calendar size={14} className="text-gray-500 flex-shrink-0" />
                        <span className="text-xs text-gray-600">
                            Last donated: {new Date(donor.lastDonationDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                            })}
                        </span>
                    </div>
                )}
            </div>

            {/* 4. Footer Actions */}
            <div className="p-3 pt-0">
                {isOwnProfile ? (
                    <Link
                        to="/blood-donation/edit"
                        className="block w-full text-center py-2.5 rounded-xl font-bold text-sm transition bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        Edit Profile
                    </Link>
                ) : (
                    <div className="flex gap-2">
                        <Link
                            to={`/chat/${donor.user._id}`}
                            className="flex-1 text-center py-2.5 rounded-xl font-bold text-sm transition bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl hover:scale-105"
                        >
                            Contact
                        </Link>
                        <Link
                            to={`/profile/${donor.user._id}`}
                            className="flex-1 text-center py-2.5 rounded-xl font-bold text-sm transition bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 shadow-md hover:shadow-lg"
                        >
                            Profile
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DonorCard;