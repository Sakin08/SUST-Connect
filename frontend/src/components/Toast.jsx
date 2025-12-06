import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose, duration = 2000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        warning: 'bg-yellow-500',
        info: 'bg-blue-500'
    };

    return (
        <div className={`${colors[type]} text-white px-4 py-2.5 rounded-lg shadow-lg animate-slide-in-right flex items-center gap-2 max-w-sm`}>
            <span className="text-lg">{icons[type]}</span>
            <span className="flex-1 text-sm">{message}</span>
            <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition ml-2"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>
    );
};

export default Toast;
