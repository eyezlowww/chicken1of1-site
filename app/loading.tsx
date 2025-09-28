export default function Loading() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        {/* Animated Chicken Logo */}
        <div className="mb-8">
          <div className="w-16 h-16 mx-auto bg-primary-500 rounded-full flex items-center justify-center text-3xl animate-pulse">
            🐔
          </div>
        </div>

        {/* Loading Text */}
        <h2 className="text-xl font-semibold text-white mb-4">
          Loading the Action...
        </h2>

        {/* Loading Spinner */}
        <div className="flex justify-center mb-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>

        {/* Fun Loading Messages */}
        <p className="text-gray-400 text-sm animate-pulse">
          Shuffling the deck... 🃏
        </p>

        {/* Branding */}
        <div className="mt-6">
          <p className="text-xs text-gray-600">
            Bauk Bauk Baby! 🐔
          </p>
        </div>
      </div>
    </div>
  )
}