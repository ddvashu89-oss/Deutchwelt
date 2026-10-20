import React, { useRef, useState } from 'react';
import { Download, ExternalLink, Play, AlertCircle, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

export function VideoPlayer({ url, title, poster, autoPlay = false, className = '' }: VideoPlayerProps) {
  const [loadError, setLoadError] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!url) {
    return (
      <div className={`aspect-video w-full rounded-2xl bg-gray-900 flex flex-col items-center justify-center p-6 text-center text-gray-400 ${className}`}>
        <AlertCircle className="w-10 h-10 mb-2 text-gray-500" />
        <p className="text-xs font-semibold">No video source provided for this lecture.</p>
      </div>
    );
  }

  // Detect YouTube
  const youtubeMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  if (youtubeMatch && youtubeMatch[1]) {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${youtubeMatch[1]}?autoplay=${autoPlay ? 1 : 0}&rel=0&modestbranding=1`;
    return (
      <div className={`aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-lg border border-gray-800 ${className}`}>
        <iframe
          src={embedUrl}
          title={title || 'German Video Lecture'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Detect Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)/);
  if (vimeoMatch && vimeoMatch[3]) {
    const embedUrl = `https://player.vimeo.com/video/${vimeoMatch[3]}?autoplay=${autoPlay ? 1 : 0}`;
    return (
      <div className={`aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-lg border border-gray-800 ${className}`}>
        <iframe
          src={embedUrl}
          title={title || 'German Video Lecture'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // If iframe embed link already
  if (url.includes('/embed/') || url.includes('player.')) {
    return (
      <div className={`aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-lg border border-gray-800 ${className}`}>
        <iframe
          src={url}
          title={title || 'German Video Lecture'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Native HTML5 Video for uploaded files (MP4, WebM, MOV, OGG, /uploads/videos/...)
  return (
    <div className={`relative aspect-video w-full rounded-2xl bg-black overflow-hidden shadow-lg border border-gray-800 group ${className}`}>
      {loadError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-gray-900">
          <AlertCircle className="w-10 h-10 text-germanRed mb-2" />
          <p className="text-sm font-bold">Could not load video player</p>
          <p className="text-xs text-gray-400 mt-1 max-w-sm">
            The video file could not be played directly in your browser.
          </p>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setLoadError(false);
                if (videoRef.current) {
                  videoRef.current.load();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 text-xs font-semibold hover:bg-gray-700 text-white"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry
            </button>
            <a
              href={url}
              download
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-germanRed text-xs font-semibold hover:bg-germanRed-600 text-white"
            >
              <Download className="w-3.5 h-3.5" /> Download File
            </a>
          </div>
        </div>
      ) : (
        <video
          ref={videoRef}
          src={url}
          poster={poster}
          controls
          autoPlay={autoPlay}
          playsInline
          onError={() => setLoadError(true)}
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      )}
    </div>
  );
}
