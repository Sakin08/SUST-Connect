import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Flag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createReport } from '../api/reports';
import { useToast } from '../hooks/useToast';

const ReportButton = ({ itemId, itemType, reportedUserId, className = '', isOpen, onClose }) => {
    const [showModal, setShowModal] = useState(isOpen || false);

    // Sync with external control
    useEffect(() => {
        if (isOpen !== undefined) {
            setShowModal(isOpen);
        }
    }, [isOpen]);
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const { showToast } = useToast();

    const reasons = [
        { value: 'spam', label: 'Spam' },
        { value: 'inappropriate', label: 'Inappropriate Content' },
        { value: 'scam', label: 'Scam or Fraud' },
        { value: 'harassment', label: 'Harassment' },
        { value: 'fake', label: 'Fake Information' },
        { value: 'other', label: 'Other' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!reason || !description.trim()) {
            showToast('Please select a reason and provide details', 'error');
            return;
        }

        setLoading(true);
        try {
            await createReport({
                reportedItem: itemId,
                itemType,
                reportedUser: reportedUserId,
                reason,
                description
            });

            showToast('Report submitted successfully. Our team will review it.', 'success');
            setShowModal(false);
            if (onClose) onClose();
            setReason('');
            setDescription('');
        } catch (error) {
            showToast(error.response?.data?.message || 'Failed to submit report', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // Don't show report button if user is reporting their own content
    if (reportedUserId && user._id === reportedUserId) {
        return null;
    }

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowModal(true);
                }}
                type="button"
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all whitespace-nowrap ${className}`}
                title="Report"
            >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Report</span>
            </button>

            {showModal && createPortal(
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    style={{ zIndex: 99999 }}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (e.target === e.currentTarget) {
                            setShowModal(false);
                            if (onClose) onClose();
                        }
                    }}
                >
                    <div
                        className="bg-white rounded-xl shadow-2xl max-w-md w-full p-5 max-h-[90vh] overflow-y-auto"
                        style={{ position: 'relative' }}
                        onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                        }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-red-100 rounded-lg">
                                    <Flag className="w-4 h-4 text-red-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Report Content</h3>
                            </div>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    if (onClose) onClose();
                                }}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg p-1.5 transition-colors text-xl leading-none"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4" onClick={(e) => e.stopPropagation()}>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Reason for reporting
                                </label>
                                <select
                                    value={reason}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setReason(e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
                                    required
                                >
                                    <option value="">Select a reason</option>
                                    {reasons.map(r => (
                                        <option key={r.value} value={r.value}>{r.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Additional details
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => {
                                        e.stopPropagation();
                                        setDescription(e.target.value);
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    placeholder="Please provide more information..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none text-sm"
                                    rows="4"
                                    maxLength="1000"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {description.length}/1000 characters
                                </p>
                            </div>

                            <div className="flex gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowModal(false);
                                        if (onClose) onClose();
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    {loading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default ReportButton;
