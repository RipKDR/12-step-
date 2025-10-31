import React from 'react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            12-Step Recovery Companion
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            A privacy-first recovery tool for NA/AA programs
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-semibold text-blue-900 mb-2">
              🎭 Demo Mode
            </h2>
            <p className="text-blue-800">
              This is a preview of the mobile app. The full experience is designed for mobile devices.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Mobile Preview */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📱 Mobile App Preview
            </h3>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">Home Screen</h4>
                <p className="text-sm text-gray-600">
                  Personalized dashboard with sobriety streak, quick actions, and recent activity
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">Daily Entry</h4>
                <p className="text-sm text-gray-600">
                  Track cravings, feelings, triggers, and coping actions with intuitive forms
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-4">
                <h4 className="font-medium text-gray-900">Step Work</h4>
                <p className="text-sm text-gray-600">
                  Work through 12-step programs with guided prompts and progress tracking
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              ✨ Key Features
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Privacy-first design with user-controlled data sharing</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Copyright-safe 12-step prompts (no NA/AA literature)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Secure sponsor connections with selective sharing</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Action plans and routines with push notifications</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Geofenced trigger locations with automatic actions</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Meeting finder with BMLT/AA integration</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span className="text-gray-700">Full data export and delete capabilities</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Architecture */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🏗️ Technical Architecture
          </h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">📱</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Mobile App</h4>
              <p className="text-sm text-gray-600">
                Expo React Native with TypeScript, offline-first SQLite cache, and secure storage
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🌐</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Web Portal</h4>
              <p className="text-sm text-gray-600">
                Next.js 14 with tRPC for sponsors and administrators
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🗄️</span>
              </div>
              <h4 className="font-medium text-gray-900 mb-2">Backend</h4>
              <p className="text-sm text-gray-600">
                Supabase with Postgres, Row Level Security, and real-time subscriptions
              </p>
            </div>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🔒 Privacy & Security
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Data Protection</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Row Level Security on all database tables</li>
                <li>• User-controlled sharing with sponsors</li>
                <li>• No service role keys on client</li>
                <li>• Optional client-side encryption</li>
                <li>• Full data export and delete rights</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Accessibility</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• WCAG 2.2 AA compliant</li>
                <li>• Large touch targets (44x44 dp minimum)</li>
                <li>• Screen reader support</li>
                <li>• High contrast mode</li>
                <li>• Reduced motion support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold text-gray-900 mb-4">
            🚀 Try the Mobile Demo
          </h3>
          <p className="text-gray-600 mb-6">
            To see the full mobile experience, run the demo locally:
          </p>
          <div className="bg-gray-900 rounded-lg p-4 text-left max-w-2xl mx-auto">
            <code className="text-green-400 text-sm">
              <div>cd apps/mobile</div>
              <div>npx expo start --web</div>
            </code>
          </div>
          <p className="text-sm text-gray-500 mt-4">
            Or scan the QR code with Expo Go on your phone for the native experience
          </p>
        </div>
      </div>
    </div>
  );
}
