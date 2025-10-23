"use client";

export default function Header() {
  return (
    <header className="bg-slate-900 text-white h-14 flex items-center justify-between px-6 shadow-2xl border-b border-slate-700 flex-shrink-0">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-slate-900">GR</div>
        <div>
          <h1 className="text-lg font-bold tracking-tight">Grassland Resilience Navigator</h1>
          <div className="text-xs text-slate-400 font-medium">Agricultural Risk Assessment Platform</div>
        </div>
      </div>
      <nav className="flex items-center space-x-1">
        <button className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">Documentation</button>
        <button className="text-slate-300 hover:text-white hover:bg-slate-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors">API</button>
        <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors">Dashboard</button>
      </nav>
    </header>
  );
}