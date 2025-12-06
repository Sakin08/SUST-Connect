import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGalleryViewer = ({ images, currentIndex, onClose, onNavigate }) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowLeft') onNavigate('prev');
            if (e.key === 'ArrowRight') onNavigate('next');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, onNavigate]);

    return (
        <div className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center animate-fadeIn">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-gray-300 p-3 bg-black/50 hover:bg-black/70 rounded-full transition-all z-10 backdrop-blur-sm"
                title="Close (Esc)"
            >
                <X className="w-6 h-6" />
            </button>

            {/* Navigation Buttons */}
            {images.length > 1 && (
                <>
                    <button
                        onClick={() => onNavigate('prev')}
                        className="absolute left-4 text-white hover:text-gray-300 p-4 bg-black/50 hover:bg-black/70 rounded-full transition-all backdrop-blur-sm"
                        title="Previous (←)"
                    >
                        <ChevronLeft className="w-8 h-8" />
                    </button>
                    <button
                        onClick={() => onNavigate('next')}
                        className="absolute right-4 text-white hover:text-gray-300 p-4 bg-black/50 hover:bg-black/70 rounded-full transition-all backdrop-blur-sm"
                        title="Next (→)"
                    >
                        <ChevronRight className="w-8 h-8" />
                    </button>
                </>
            )}

            {/* Image Container */}
            <div className="w-screen h-screen flex items-center justify-center p-4">
                <img
                    src={images[currentIndex]}
                    alt={`Image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain transition-all duration-300"
                />
            </div>

            {/* Image Counter & Thumbnails */}
            {images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-md px-6 py-3 rounded-full">
                    <div className="flex items-center gap-4">
                        <span className="text-white font-semibold text-lg">
                            {currentIndex + 1} / {images.length}
                        </span>
                        {images.length <= 10 && (
                            <div className="flex gap-2">
                                {images.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => onNavigate(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex
                                            ? 'bg-white w-8'
                                            : 'bg-white/50 hover:bg-white/75'
                                            }`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageGalleryViewer;
