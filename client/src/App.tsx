import { useState } from 'react';
import {
  CheckCircle2,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Terminal
} from 'lucide-react';
import { ZyloLogo } from './components/common/ZyloLogo';

export default function App() {
  const [activeTab, setActiveTab] = useState<'overview' | 'packages'>('overview');

  const packages = [
    { name: 'React', version: '^19.3.0', role: 'UI Framework' },
    { name: 'TypeScript', version: '~6.0.2', role: 'Static Typing' },
    { name: 'Vite', version: '^8.3.1', role: 'Build Tool & HMR' },
    { name: 'Tailwind CSS', version: '^4.3.3', role: '@tailwindcss/vite Plugin' },
    { name: 'React Router DOM', version: '^7.18.4', role: 'Declarative Routing' },
    { name: 'Axios', version: '^1.20.0', role: 'HTTP Client' },
    { name: 'Lucide React', version: '^1.49.0', role: 'Icons' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <ZyloLogo variant="full" size="md" badge="STOREFRONT" />
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Tailwind v4 Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Banner Card */}
        <section className="bg-white border border-slate-200 rounded-md p-6 sm:p-8 mb-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100 mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Frontend Foundation Setup
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              React + Vite + Tailwind CSS v4 Template
            </h1>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed">
              Frontend development template configured via <code className="text-xs bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200 font-mono">@tailwindcss/vite</code> plugin. Ready for modular e-commerce development.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="mt-6 flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'overview'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              System Status
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('packages')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${activeTab === 'packages'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              Installed Packages ({packages.length})
            </button>
          </div>

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Terminal className="w-4 h-4 text-indigo-600" />
                  Build Tool
                </div>
                <p className="text-xs text-slate-600 mt-1">Vite with @tailwindcss/vite plugin</p>
                <div className="mt-3 inline-block text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Configured
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  Styling System
                </div>
                <p className="text-xs text-slate-600 mt-1">Tailwind CSS v4 with modern @import syntax</p>
                <div className="mt-3 inline-block text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                  Active (No shadows, rounded-md)
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-md p-4">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  Client Architecture
                </div>
                <p className="text-xs text-slate-600 mt-1">Strict TypeScript, Axios, React Router</p>
                <div className="mt-3 inline-block text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md">
                  Ready for Phase 1
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Packages List */}
          {activeTab === 'packages' && (
            <div className="mt-6 border border-slate-200 rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-2.5 text-left font-semibold">Package Name</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Installed Version</th>
                    <th className="px-4 py-2.5 text-left font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {packages.map((pkg) => (
                    <tr key={pkg.name}>
                      <td className="px-4 py-2 font-medium text-slate-900">{pkg.name}</td>
                      <td className="px-4 py-2 font-mono text-slate-600">{pkg.version}</td>
                      <td className="px-4 py-2 text-slate-600">{pkg.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Status Callout Box */}
        <div className="bg-white border border-slate-200 rounded-md p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <div>
              <p className="text-xs font-bold text-slate-900">Frontend Environment Setup Complete</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready to begin modular development following docs/ and line-items.md
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600">
            <span>Clean Baseline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
          ZYLO Platform • Tailwind CSS v4 Plugin • React 19 • TypeScript
        </div>
      </footer>
    </div>
  );
}
