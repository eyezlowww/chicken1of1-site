'use client'

export default function TestErrorPage() {
  const throwError = () => {
    throw new Error('This is a test error to demo the error page!')
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-white mb-6">
          Error Page Testing
        </h1>
        <p className="text-gray-400 mb-8">
          Click the button below to trigger an error and see the error page:
        </p>
        <button
          onClick={throwError}
          className="btn-primary"
        >
          Trigger Test Error
        </button>
        <p className="text-sm text-gray-500 mt-4">
          This will show you the error.tsx page in action
        </p>
      </div>
    </div>
  )
}