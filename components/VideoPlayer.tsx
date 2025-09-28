import Image from 'next/image'

interface VideoPlayerProps {
  src: string
  poster: string
  alt: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  loop?: boolean
  controls?: boolean
}

export default function VideoPlayer({
  src,
  poster,
  alt,
  className = '',
  autoPlay = true,
  muted = true,
  loop = true,
  controls = false,
}: VideoPlayerProps) {
  return (
    <video
      autoPlay={autoPlay}
      muted={muted}
      loop={loop}
      playsInline
      controls={controls}
      className={`w-full h-full object-cover ${className}`}
      poster={poster}
      preload="metadata"
    >
      <source src={src} type="video/mp4" />
      {/* Fallback for browsers that don't support video */}
      <Image
        src={poster}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 100vw, 50vw"
      />
    </video>
  )
}