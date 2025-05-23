'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2, Trash2, ChevronUp, ChevronDown, Save, X } from 'lucide-react'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  isActive: boolean
}

export default function FAQManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'How do I post a job on TrustBuild?',
      answer: 'To post a job, simply click "Post a Job" from your dashboard, fill in the job details, and submit for review.',
      category: 'Job Posting',
      order: 1,
      isActive: true
    },
    {
      id: '2',
      question: 'How are contractors verified?',
      answer: 'All contractors go through a thorough verification process including background checks, license verification, and insurance validation.',
      category: 'Verification',
      order: 2,
      isActive: true
    },
    {
      id: '3',
      question: 'What payment methods are accepted?',
      answer: 'We accept all major credit cards, bank transfers, and digital wallet payments for secure transactions.',
      category: 'Payments',
      order: 3,
      isActive: true
    },
    {
      id: '4',
      question: 'How do I dispute a transaction?',
      answer: 'Contact our support team through the help center or use the dispute resolution system in your dashboard.',
      category: 'Support',
      order: 4,
      isActive: true
    },
    {
      id: '5',
      question: 'Can I edit my contractor profile?',
      answer: 'Yes, you can update your profile, portfolio, and services anytime from your contractor dashboard.',
      category: 'Profile',
      order: 5,
      isActive: false
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: 'General'
  })

  const categories = ['all', 'Job Posting', 'Verification', 'Payments', 'Support', 'Profile', 'General']

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => a.order - b.order)

  const handleToggleStatus = (id: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, isActive: !faq.isActive } : faq
    ))
  }

  const handleDelete = (id: string) => {
    setFaqs(faqs.filter(faq => faq.id !== id))
  }

  const handleMoveUp = (id: string) => {
    const index = faqs.findIndex(faq => faq.id === id)
    if (index > 0) {
      const newFaqs = [...faqs]
      const temp = newFaqs[index].order
      newFaqs[index].order = newFaqs[index - 1].order
      newFaqs[index - 1].order = temp
      setFaqs(newFaqs)
    }
  }

  const handleMoveDown = (id: string) => {
    const index = faqs.findIndex(faq => faq.id === id)
    if (index < faqs.length - 1) {
      const newFaqs = [...faqs]
      const temp = newFaqs[index].order
      newFaqs[index].order = newFaqs[index + 1].order
      newFaqs[index + 1].order = temp
      setFaqs(newFaqs)
    }
  }

  const handleSaveEdit = () => {
    if (editingFaq) {
      setFaqs(faqs.map(faq => 
        faq.id === editingFaq.id ? editingFaq : faq
      ))
      setEditingFaq(null)
    }
  }

  const handleAddNew = () => {
    if (newFaq.question && newFaq.answer) {
      const id = (faqs.length + 1).toString()
      const order = Math.max(...faqs.map(f => f.order)) + 1
      setFaqs([...faqs, {
        id,
        ...newFaq,
        order,
        isActive: true
      }])
      setNewFaq({ question: '', answer: '', category: 'General' })
      setIsAddingNew(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/admin" 
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Panel
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">FAQ Management</h1>
          <p className="text-gray-600 mt-2">Manage frequently asked questions and help content</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Total FAQs</h3>
            <p className="text-2xl font-bold text-gray-900">{faqs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Active FAQs</h3>
            <p className="text-2xl font-bold text-green-600">{faqs.filter(f => f.isActive).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Inactive FAQs</h3>
            <p className="text-2xl font-bold text-red-600">{faqs.filter(f => !f.isActive).length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-sm font-medium text-gray-500">Categories</h3>
            <p className="text-2xl font-bold text-blue-600">{categories.length - 1}</p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setIsAddingNew(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add New FAQ
            </button>
          </div>
        </div>

        {/* Add New FAQ Form */}
        {isAddingNew && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">Add New FAQ</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newFaq.category}
                  onChange={(e) => setNewFaq({ ...newFaq, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {categories.slice(1).map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                <input
                  type="text"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the question..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                <textarea
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter the answer..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAddNew}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save FAQ
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false)
                    setNewFaq({ question: '', answer: '', category: 'General' })
                  }}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FAQ List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-lg shadow-sm border">
              {editingFaq?.id === faq.id ? (
                // Edit Mode
                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select
                        value={editingFaq.category}
                        onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {categories.slice(1).map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Question</label>
                      <input
                        type="text"
                        value={editingFaq.question}
                        onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Answer</label>
                      <textarea
                        value={editingFaq.answer}
                        onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={handleSaveEdit}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button
                        onClick={() => setEditingFaq(null)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          faq.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {faq.category}
                        </span>
                        <span className="text-sm text-gray-500">Order: {faq.order}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleMoveUp(faq.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(faq.id)}
                        className="p-2 text-gray-400 hover:text-gray-600"
                        title="Move down"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingFaq(faq)}
                        className="p-2 text-blue-600 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(faq.id)}
                        className={`px-3 py-1 text-sm rounded ${
                          faq.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {faq.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFaqs.length === 0 && (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">No FAQs found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
} 