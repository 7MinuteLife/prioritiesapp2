'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, ChevronDown } from 'lucide-react'

interface GuideSection {
  title: string
  content: string | string[] | { title: string; items: string[] }[]
  type: 'text' | 'bullets' | 'steps' | 'numbered'
}

interface GuideProps {
  title: string
  description: string
  sections: GuideSection[]
}

export default function Guide({ title, description, sections }: GuideProps) {
  const [expandedSection, setExpandedSection] = useState<number | null>(null)

  const handleDownload = () => {
    // TODO: Implement PDF download functionality
    console.log('Downloading guide...')
  }

  const renderContent = (content: GuideSection['content'], type: GuideSection['type']) => {
    if (typeof content === 'string') {
      return <p className="text-gray-600">{content}</p>
    }

    if (Array.isArray(content)) {
      if (type === 'bullets') {
        return (
          <ul className="list-disc list-inside space-y-2">
            {content.map((item, index) => (
              <li key={index} className="text-gray-600">{item}</li>
            ))}
          </ul>
        )
      }

      if (type === 'numbered') {
        return (
          <ol className="list-decimal list-inside space-y-2">
            {content.map((item, index) => (
              <li key={index} className="text-gray-600">{item}</li>
            ))}
          </ol>
        )
      }

      if (type === 'steps') {
        return (
          <div className="space-y-4">
            {content.map((step: any, index) => (
              <div key={index} className="space-y-2">
                <h4 className="font-semibold text-gray-900">{step.title}</h4>
                <ul className="list-disc list-inside pl-4 space-y-1">
                  {step.items.map((item: string, itemIndex: number) => (
                    <li key={itemIndex} className="text-gray-600">{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      }
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <div className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
            <p className="mt-2 text-gray-600">{description}</p>
          </div>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>

        <div className="space-y-4 mt-6">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              className="border border-gray-200 rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setExpandedSection(expandedSection === index ? null : index)}
                className="w-full px-6 py-4 flex justify-between items-center bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    expandedSection === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === index && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-6 py-4"
                >
                  {renderContent(section.content, section.type)}
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
} 