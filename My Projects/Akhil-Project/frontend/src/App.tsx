import React from 'react'

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600">NestureAI</h1>
          <nav>
            <ul className="flex space-x-4 text-sm font-medium text-secondary-500">
              <li><a href="#" className="hover:text-primary-500">Atlas Profile</a></li>
              <li><a href="#" className="hover:text-primary-500">LetterQuest</a></li>
              <li><a href="#" className="hover:text-primary-500">Dashboard</a></li>
            </ul>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow px-5 py-6 sm:px-6 text-center">
          <h2 className="text-3xl font-extrabold text-secondary-900 mb-4">
            Welcome to NestureAI
          </h2>
          <p className="text-lg text-secondary-500 max-w-2xl mx-auto">
            A secure, supportive educational platform empowering learners and their families.
          </p>
          <div className="mt-8 flex justify-center space-x-4">
            <button className="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-500 transition-colors shadow-sm">
              Explore Atlas
            </button>
            <button className="bg-secondary-100 text-secondary-900 px-6 py-3 rounded-md font-medium hover:bg-secondary-200 transition-colors">
              Start LetterQuest
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
