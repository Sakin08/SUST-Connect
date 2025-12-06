import { useState } from 'react';
import ImageGalleryViewer from './ImageGalleryViewer';
import { Maximize2 } from 'lucide-react';

const ImageGallery = ({ images }) => {
    const [selectedImage, setSelectedImage] = useState(0);
    const [showViewer, setShowViewer] = useState(false);

    if (!images || images.length === 0) return null;

    const handleNavigate = (direction) => {
        if (direction === 'prev') {
            setSelectedImage((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        } else if (direction === 'next') {
            setSelectedImage((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        } else if (typeof direction === 'number') {
            setSelectedImage(direction);
        }
    };

    return (
        <>
            <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-video bg-gray-100 rounded-xl overflow-hidden group">
                    <img
                        src={images[selectedImage]}
                        alt={`Image ${selectedImage + 1}`}
                        className="w-full h-full object-cover cursor-pointer"
                        onClick={() => setShowViewer(true)}
                    />

                    {/* Expand Icon */}
                    <button
                        onClick={() => setShowViewer(true)}
                        className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition opacity-0 group-hover:opacity-100"
                        title="View fullscreen"
                    >
                        <Maximize2 className="w-5 h-5" />
                    </button>

                    {images.length > 1 && (
                        <>
                            <button
                                onClick={() => handleNavigate('prev')}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <button
                                onClick={() => handleNavigate('next')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </>
                    )}
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {selectedImage + 1} / {images.length}
                    </div>
                </div>
            </div>

            {/* Fullscreen Viewer */}
            {showViewer && (
                <ImageGalleryViewer
                    images={images}
                    currentIndex={selectedImage}
                    onClose={() => setShowViewer(false)}
                    onNavigate={handleNavigate}
                />
            )}
        </>
    );
};

export default ImageGallery;
