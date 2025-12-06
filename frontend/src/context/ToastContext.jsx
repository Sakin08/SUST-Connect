import { createContext, useContext, useState } from 'react';
import Toast from '../components/Toast';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = (message, type = 'success', options = {}) => {
        // Skip minor success messages unless forced
        const minorMessages = [
            'saved', 'liked', 'unliked', 'bookmarked', 'unbookmarked',
            'copied', 'updated', 'removed'
        ];

        const isMinor = type === 'success' &&
            minorMessages.some(word => message.toLowerCase().includes(word));

        if (isMinor && !options.force) {
            return; // Skip showing toast
        }

        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-20 right-6 z-50 space-y-2">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
