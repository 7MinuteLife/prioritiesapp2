'use client'

interface PrioritiesThumbnailProps {
  values: { content: string }[]
}

export default function PrioritiesThumbnail({ values }: PrioritiesThumbnailProps) {
  return (
    <div className="w-full h-full p-4">
      <div className="h-full flex flex-col justify-end space-y-1.5">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className={`h-4 rounded ${values[i] ? 'bg-white' : 'bg-white/20'}`}
            style={{
              width: `${100 - (i * 6)}%`
            }}
          />
        ))}
      </div>
    </div>
  )
} 