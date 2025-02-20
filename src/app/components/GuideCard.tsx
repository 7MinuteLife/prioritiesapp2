'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Download, 
  Printer, 
  ChevronDown, 
  ChevronUp,
  Copy
} from 'lucide-react'
import { generatePDF } from '@/lib/utils/pdfGenerator'

interface GuideCardProps {
  title: string
  description: string
  icon?: string
  content: React.ReactNode
}

export default function GuideCard({ 
  title, 
  description, 
  icon, 
  content,
}: GuideCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (contentRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${title}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #111; }
                p { color: #444; }
              </style>
            </head>
            <body>
              <h1>${title}</h1>
              <p>${description}</p>
              ${contentRef.current.innerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const handleDownload = async () => {
    if (contentRef.current) {
      await generatePDF(title, contentRef.current)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${description}`)
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (error) {
      console.error('Failed to copy text:', error)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-6">
        {/* Header with actions */}
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            {icon && <span className="text-2xl">{icon}</span>}
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
              <p className="mt-1 text-gray-600">{description}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isExpanded && (
              <>
                <button 
                  onClick={handlePrint}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="Print guide"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleDownload}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title="Download PDF"
                >
                  <Download className="w-5 h-5" />
                </button>
                <button 
                  onClick={handleCopy}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                  title={copySuccess ? "Copied!" : "Copy guide"}
                >
                  <Copy className="w-5 h-5" />
                </button>
              </>
            )}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              ref={contentRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-6 overflow-hidden"
            >
              {content}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
} 