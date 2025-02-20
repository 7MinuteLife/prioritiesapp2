'use client'

import { useState } from 'react'
import GuideCard from '@/app/components/GuideCard'
import { valuesGuide } from './data/values-guide'
import { routinesGuide } from './data/routines-guide'
import { relationshipsGuide } from './data/relationships-guide'
import { purposeGuide } from './data/purpose-guide'
import { timeGuide } from './data/time-guide'
import { decisionsGuide } from './data/decisions-guide'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'

function Navigation() {
  const { user, loading, signOut } = useAuth()

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="text-gray-900 hover:text-gray-600">
              <span className="text-xl font-semibold">7minute.ai</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link 
              href="/guides" 
              className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
            >
              Guides
            </Link>
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link 
                      href="/values" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Create Values
                    </Link>
                    <Link 
                      href="/my-lists" 
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      My Lists
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-gray-600 hover:text-gray-900 px-4 py-2 rounded-md text-sm font-medium border border-gray-200 hover:border-gray-300"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm"
                    >
                      Get Started Free
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

interface GuideSection {
  title: string;
  content?: string[];
  subsections?: {
    title: string;
    items: string[];
  }[];
}

interface Guide {
  id?: string;
  title: string;
  description: string;
  sections?: GuideSection[];
  content?: React.ReactNode;
}

const guides: Guide[] = [
  {
    ...valuesGuide,
    sections: valuesGuide.sections.map(section => ({
      title: section.title,
      content: section.content,
      subsections: section.subsections
    })),
    content: (
      <div className="space-y-6">
        {valuesGuide.sections.map((section, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {section.title}
            </h3>
            
            {section.content && Array.isArray(section.content) && (
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {section.content.map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="select-none text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {section.subsections && (
              <div className="space-y-4 pl-4">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {subsection.title}
                    </h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-2">
                          <span className="select-none text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  },
  {
    ...routinesGuide,
    sections: routinesGuide.sections.map(section => ({
      title: section.title,
      content: section.content,
      subsections: section.subsections
    })),
    content: (
      <div className="space-y-6">
        {routinesGuide.sections.map((section, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {section.title}
            </h3>
            
            {section.content && Array.isArray(section.content) && (
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {section.content.map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="select-none text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {section.subsections && (
              <div className="space-y-4 pl-4">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {subsection.title}
                    </h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-2">
                          <span className="select-none text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  },
  {
    ...relationshipsGuide,
    sections: relationshipsGuide.sections.map(section => ({
      title: section.title,
      content: section.content,
      subsections: section.subsections
    })),
    content: (
      <div className="space-y-6">
        {relationshipsGuide.sections.map((section, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {section.title}
            </h3>
            
            {section.content && Array.isArray(section.content) && (
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {section.content.map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="select-none text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {section.subsections && (
              <div className="space-y-4 pl-4">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {subsection.title}
                    </h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-2">
                          <span className="select-none text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  },
  {
    ...purposeGuide,
    sections: purposeGuide.sections.map(section => ({
      title: section.title,
      content: section.content,
      subsections: section.subsections
    })),
    content: (
      <div className="space-y-6">
        {purposeGuide.sections.map((section, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {section.title}
            </h3>
            
            {section.content && Array.isArray(section.content) && (
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {section.content.map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="select-none text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {section.subsections && (
              <div className="space-y-4 pl-4">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {subsection.title}
                    </h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-2">
                          <span className="select-none text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  },
  {
    ...timeGuide,
    sections: timeGuide.sections.map(section => ({
      title: section.title,
      content: section.content,
      subsections: section.subsections
    })),
    content: (
      <div className="space-y-6">
        {timeGuide.sections.map((section, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {section.title}
            </h3>
            
            {section.content && Array.isArray(section.content) && (
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {section.content.map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="select-none text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {section.subsections && (
              <div className="space-y-4 pl-4">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {subsection.title}
                    </h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-2">
                          <span className="select-none text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  },
  {
    ...decisionsGuide,
    sections: decisionsGuide.sections.map(section => ({
      title: section.title,
      content: section.content,
      subsections: section.subsections
    })),
    content: (
      <div className="space-y-6">
        {decisionsGuide.sections.map((section, index) => (
          <div key={index} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {section.title}
            </h3>
            
            {section.content && Array.isArray(section.content) && (
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                {section.content.map((item: string, itemIndex: number) => (
                  <li key={itemIndex} className="flex gap-2">
                    <span className="select-none text-gray-400">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {section.subsections && (
              <div className="space-y-4 pl-4">
                {section.subsections.map((subsection, subIndex) => (
                  <div key={subIndex} className="space-y-2">
                    <h4 className="font-medium text-gray-800 dark:text-gray-200">
                      {subsection.title}
                    </h4>
                    <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                      {subsection.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex gap-2">
                          <span className="select-none text-gray-400">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }
]

export default function GuidesPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F3]">
      <Navigation />
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Guides & Resources
            </h1>
            <p className="text-gray-600">
              Explore our collection of guides to help you live more intentionally.
            </p>
          </div>

          <div className="space-y-6">
            {guides.map((guide, index) => (
              <GuideCard
                key={index}
                title={guide.title}
                description={guide.description}
                icon={guide.icon}
                content={guide.content}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 