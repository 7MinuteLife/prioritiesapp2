export default function GuidesLoading() {
  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
        <div className="mt-2 h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-gray-200 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
} 