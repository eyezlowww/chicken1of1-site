import Image from 'next/image'

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center relative overflow-hidden">
      {/* Subtle blood-red glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] bg-blood-700/10 rounded-full blur-[100px]" />

      <div className="text-center relative z-10">
        {/* Animated Chicken Fighter */}
        <div className="mb-8">
          <div className="w-24 h-24 mx-auto flex items-center justify-center animate-pulse">
            <Image
              src="/chicken-fighter-404.png"
              alt="Loading..."
              width={96}
              height={96}
              className="object-contain drop-shadow-[0_0_15px_rgba(185,28,28,0.3)]"
            />
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="font-heading text-xl font-semibold text-white mb-4 uppercase tracking-wide">
          Loading the Action...
        </h2>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blood-600"></div>
        </div>

        {/* Fun Loading Message */}
        <p className="text-cage-400 text-sm animate-pulse">
          Shuffling the deck...
        </p>

        {/* Branding */}
        <div className="mt-6">
          <p className="text-xs text-cage-600">
            Bauk Bauk Baby!
          </p>
        </div>
      </div>
    </div>
  )
}
