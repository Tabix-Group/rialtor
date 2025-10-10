'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Tag, Eye, EyeOff } from 'lucide-react'
import { authenticatedFetch } from '@/utils/api'

interface Category {
    id: string
    name: string
    description: string
    slug: string
    color: string
    icon: string
    isActive: boolean
    articleCount: number
    createdAt: string
    updatedAt: string
    parentId: string | null
    parent?: Category
    children?: Category[]
}

interface CategoryResponse {
    categories: Category[]
}

export default function CategoryManagement() {
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingCategory, setEditingCategory] = useState<Category | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        icon: '',
        parentId: ''
    })

    useEffect(() => {
        fetchCategories()
    }, [])

    const fetchCategories = async () => {
        try {
            setLoading(true)
            const response = await authenticatedFetch('/api/categories')
            const data: CategoryResponse = await response.json()
            setCategories(data.categories)
        } catch (error) {
            console.error('Error fetching categories:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingCategory ? `/api/categories/${editingCategory.id}` : '/api/categories'
            const method = editingCategory ? 'PUT' : 'POST'

            const response = await authenticatedFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    parentId: formData.parentId || null
                })
            })

            if (response.ok) {
                await fetchCategories()
                setShowForm(false)
                setEditingCategory(null)
                resetForm()
                alert(editingCategory ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente')
            } else {
                const error = await response.json()
                alert(error.error || 'Error al guardar la categoría')
            }
        } catch (error) {
            console.error('Error saving category:', error)
            alert('Error al guardar la categoría')
        }
    }

    const handleEdit = (category: Category) => {
        setEditingCategory(category)
        setFormData({
            name: category.name,
            description: category.description || '',
            color: category.color,
            icon: category.icon || '',
            parentId: category.parentId || ''
        })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer.')) return

        try {
            const response = await authenticatedFetch(`/api/categories/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchCategories()
                alert('Categoría eliminada exitosamente')
            } else {
                const error = await response.json()
                alert(error.error || 'Error al eliminar la categoría')
            }
        } catch (error) {
            console.error('Error deleting category:', error)
            alert('Error al eliminar la categoría')
        }
    }

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await authenticatedFetch(`/api/categories/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            })

            if (response.ok) {
                await fetchCategories()
            } else {
                alert('Error al cambiar el estado de la categoría')
            }
        } catch (error) {
            console.error('Error toggling category status:', error)
            alert('Error al cambiar el estado de la categoría')
        }
    }

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            color: '#3B82F6',
            icon: '',
            parentId: ''
        })
    }

    const getParentCategories = () => {
        return categories.filter(cat => cat.id !== editingCategory?.id)
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando categorías...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Button */}
            <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold text-gray-900">Categorías ({categories.length})</h4>
                <button
                    onClick={() => {
                        setEditingCategory(null)
                        resetForm()
                        setShowForm(true)
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Agregar Categoría
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingCategory ? 'Editar Categoría' : 'Agregar Nueva Categoría'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Nombre de la categoría"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Descripción
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Descripción opcional de la categoría"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Color
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="#3B82F6"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Icono (opcional)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.icon}
                                        onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: newspaper, trending-up"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Categoría Padre (opcional)
                                </label>
                                <select
                                    value={formData.parentId}
                                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Sin categoría padre</option>
                                    {getParentCategories().map((category) => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingCategory(null)
                                        resetForm()
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingCategory ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Categories List */}
            {categories.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No hay categorías. Crea la primera categoría.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {categories.map((category) => (
                        <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{ backgroundColor: category.color }}
                                        ></div>
                                        <h4 className="font-semibold text-gray-900">{category.name}</h4>
                                        {category.isActive ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                Activa
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                Inactiva
                                            </span>
                                        )}
                                        {category.parent && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                                Subcategoría de {category.parent.name}
                                            </span>
                                        )}
                                    </div>

                                    {category.description && (
                                        <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                                    )}

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Tag className="w-4 h-4" />
                                            <span>{category.articleCount} artículos</span>
                                        </div>
                                        <span>Slug: {category.slug}</span>
                                        {category.icon && <span>Icono: {category.icon}</span>}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => toggleActive(category.id, category.isActive)}
                                        className={`p-2 ${category.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                                        title={category.isActive ? 'Desactivar' : 'Activar'}
                                    >
                                        {category.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>

                                    <button
                                        onClick={() => handleEdit(category)}
                                        className="p-2 text-blue-600 hover:text-blue-800"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2 text-gray-600 hover:text-gray-800"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}