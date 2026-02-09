import { Loader2, Search, Plus } from 'lucide-react'
export default function Loading() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background">
      {/* Sidebar Placeholder */}
      <div className="w-64 bg-[#0a0a0a] border-r border-[#2a2a2a] flex flex-col hidden md:flex animate-pulse">
        <div className="p-6 border-b border-[#2a2a2a]">
          <div className="h-4 bg-[#1a1a1a] rounded w-24"></div>
        </div>
        <div className="flex-1 p-4 space-y-4">
          <div className="h-8 bg-[#1a1a1a] rounded"></div>
          <div className="h-8 bg-[#1a1a1a] rounded w-3/4"></div>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">
        {/* Header Placeholder */}
        <header className="h-16 px-6 border-b border-[#2a2a2a] flex items-center justify-between">
          <div className="h-4 bg-[#1a1a1a] rounded w-32 animate-pulse"></div>
          <div className="w-32 h-9 bg-primary/20 rounded-md animate-pulse"></div>
        </header>

        {/* Main Content Placeholder */}
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div className="h-6 bg-[#1a1a1a] rounded w-24 animate-pulse"></div>
            <div className="w-64 h-9 bg-[#1a1a1a] rounded-lg animate-pulse"></div>
          </div>

          {/* Grid Placeholder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#111111] border border-[#222222] rounded-xl p-4 h-48 animate-pulse">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-[#1a1a1a] rounded-lg"></div>
                  <div className="w-8 h-8 bg-[#1a1a1a] rounded-md"></div>
                </div>
                <div className="h-4 bg-[#1a1a1a] rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-[#1a1a1a] rounded w-1/2"></div>
              </div>
            ))}
          </div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2">
               <Loader2 className="w-8 h-8 animate-spin text-primary" />
               <p className="text-sm text-gray-500 font-medium">Loading your workspace...</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
