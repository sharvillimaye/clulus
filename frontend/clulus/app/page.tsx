import WebcamFeed from "./components/WebcamFeed";
import MathQuestion from "./components/MathQuestion";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex h-screen">
        {/* Main Content Area - Math Question */}
        <div className="flex-1 flex items-center justify-center p-8">
          <MathQuestion />
        </div>

        {/* Sidebar - Webcam Feed */}
        <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700">
          <WebcamFeed />
        </div>
      </div>
    </div>
  );
}
