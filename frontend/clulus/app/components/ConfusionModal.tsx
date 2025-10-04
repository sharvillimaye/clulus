"use client";

interface ConfusionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConfusionModal({
  isOpen,
  onClose,
}: ConfusionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
            <span className="text-2xl">🤔</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Confusion Detected
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We noticed you might be confused
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="mb-6">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Our AI detected signs of confusion in your facial expression. Would
            you like some help or clarification?
          </p>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
              💡 Suggestions:
            </h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Take a break and review the material</li>
              <li>• Ask questions if something is unclear</li>
              <li>• Try a different approach to the problem</li>
              <li>• Seek help from an instructor or peer</li>
            </ul>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 font-medium"
          >
            I'm Fine, Continue
          </button>
          <button
            onClick={() => {
              // Mock action - in real app this would trigger help features
              console.log("Help requested");
              onClose();
            }}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            Get Help
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
