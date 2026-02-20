import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Category } from '../types'

export function useCategories(userId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('name')
      .then(({ data }) => {
        setCategories((data as Category[]) ?? [])
        setLoading(false)
      })
  }, [userId])

  const createCategory = async (name: string, color: string) => {
    if (!userId) return
    const { data, error } = await supabase
      .from('categories')
      .insert({ user_id: userId, name, color })
      .select()
      .single()
    if (!error && data) {
      setCategories(prev => [...prev, data as Category])
    }
    return { error }
  }

  const deleteCategory = async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)
    if (!error) {
      setCategories(prev => prev.filter(c => c.id !== id))
    }
    return { error }
  }

  return { categories, loading, createCategory, deleteCategory }
}
