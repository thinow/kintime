export default function Loading() {
  return (
    <main className="min-h-screen px-6 py-16">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-8">
          <p className="text-lg font-bold tracking-widest uppercase">Kintime</p>
        </div>
        <div className="animate-pulse space-y-10 mt-10">
          <div>
            <div className="h-3 w-16 bg-stone-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-6 bg-stone-100 rounded" />
              <div className="h-6 bg-stone-100 rounded" />
            </div>
          </div>
          <div>
            <div className="h-3 w-16 bg-stone-200 rounded mb-4" />
            <div className="space-y-3">
              <div className="h-8 bg-stone-100 rounded" />
              <div className="h-8 bg-stone-100 rounded" />
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
