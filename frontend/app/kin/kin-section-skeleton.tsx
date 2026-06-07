export function KinSectionSkeleton() {
  return (
    <div className="mt-10 animate-pulse">
      <div className="h-3 w-16 bg-stone-200 rounded mb-4" />
      <ul className="space-y-2 mb-4">
        <li className="h-10 bg-stone-100 rounded-xl" />
        <li className="h-10 bg-stone-100 rounded-xl" />
      </ul>
      <div className="flex gap-2">
        <div className="flex-1 h-12 bg-stone-100 rounded-xl" />
        <div className="w-14 h-12 bg-stone-200 rounded-xl" />
      </div>
    </div>
  )
}
