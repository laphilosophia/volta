import React from 'react'

interface TestCardProps {
  title?: string
  description?: string
}

export const TestCard: React.FC<TestCardProps> = ({
  title = 'Test Card',
  description = 'This is a test card component.',
}) => {
  return (
    <div className="p-4 bg-white shadow rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  )
}
