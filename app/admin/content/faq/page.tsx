'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, Plus, Edit2, Trash2, ChevronUp, ChevronDown, Save, X, Loader2 } from 'lucide-react'
import { adminFaqApi } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string | null
  sortOrder: number
  isActive: boolean
}

export default function FAQManagement() {
  const { toast } = useToast()
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newFaq, setNewFaq] = useState({
    question: '',
    answer: '',
    category: 'General'
  })
  const [actionLoading, setActionLoading] = useState(false)

  const categories = ['all', 'Job Posting', 'Verification', 'Payments', 'Support', 'Profile', 'General']

  const fetchFaqs = useCallback(async () => {
    try {
      setLoading(true)
      const fetchedFaqs = await adminFaqApi.getAllFaqs()
      setFaqs(fetchedFaqs)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch FAQs',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchFaqs()
  }, [fetchFaqs])

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  }).sort((a, b) => a.sortOrder - b.sortOrder)

  const handleToggleStatus = async (id: string) => {
    try {
      setActionLoading(true)
      await adminFaqApi.toggleFaqStatus(id)
      await fetchFaqs()
      toast({
        title: 'Success',
        description: 'FAQ status updated successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update FAQ status',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) {
      return
    }
    
    try {
      setActionLoading(true)
      await adminFaqApi.deleteFaq(id)
      await fetchFaqs()
      toast({
        title: 'Success',
        description: 'FAQ deleted successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete FAQ',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMoveUp = async (id: string) => {
    try {
      setActionLoading(true)
      await adminFaqApi.reorderFaq(id, 'up')
      await fetchFaqs()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder FAQ',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleMoveDown = async (id: string) => {
    try {
      setActionLoading(true)
      await adminFaqApi.reorderFaq(id, 'down')
      await fetchFaqs()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reorder FAQ',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editingFaq) return

    if (!editingFaq.question.trim() || !editingFaq.answer.trim()) {
      toast({
        title: 'Error',
        description: 'Question and answer are required',
        variant: 'destructive',
      })
      return
    }

    try {
      setActionLoading(true)
      await adminFaqApi.updateFaq(editingFaq.id, {
        question: editingFaq.question,
        answer: editingFaq.answer,
        category: editingFaq.category || 'General',
      })
      await fetchFaqs()
      setEditingFaq(null)
      toast({
        title: 'Success',
        description: 'FAQ updated successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update FAQ',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  const handleAddNew = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast({
        title: 'Error',
        description: 'Question and answer are required',
        variant: 'destructive',
      })
      return
    }

    try {
      setActionLoading(true)
      await adminFaqApi.createFaq({
        question: newFaq.question,
        answer: newFaq.answer,
        category: newFaq.category,
        isActive: true,
      })
      await fetchFaqs()
      setNewFaq({ question: '', answer: '', category: 'General' })
      setIsAddingNew(false)
      toast({
        title: 'Success',
        description: 'FAQ added successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add FAQ',
        variant: 'destructive',
      })
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </div>
    )
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
                  disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save FAQ
                    </>
                  )}
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
                        value={editingFaq.category || 'General'}
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
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2 disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
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
                          {faq.category || 'General'}
                        </span>
                        <span className="text-sm text-gray-500">Order: {faq.sortOrder}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                      <p className="text-gray-600">{faq.answer}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleMoveUp(faq.id)}
                        disabled={actionLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        title="Move up"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveDown(faq.id)}
                        disabled={actionLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
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
                        disabled={actionLoading}
                        className={`px-3 py-1 text-sm rounded disabled:opacity-50 ${
                          faq.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {faq.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        disabled={actionLoading}
                        className="p-2 text-red-600 hover:text-red-700 disabled:opacity-50"
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
