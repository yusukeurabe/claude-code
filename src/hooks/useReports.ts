import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Report, ReportFormData, ReportFilters } from '../types'

export function useReports(userId: string | undefined) {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = useCallback(async (filters?: Partial<ReportFilters>) => {
    if (!userId) return
    setLoading(true)
    setError(null)

    let query = supabase
      .from('reports')
      .select('*, category:categories(id, name, color)')
      .eq('user_id', userId)
      .order('report_date', { ascending: false })
      .order('created_at', { ascending: false })

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,body.ilike.%${filters.search}%`)
    }
    if (filters?.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters?.date_from) {
      query = query.gte('report_date', filters.date_from)
    }
    if (filters?.date_to) {
      query = query.lte('report_date', filters.date_to)
    }

    const { data, error } = await query
    if (error) {
      setError(error.message)
    } else {
      setReports((data as Report[]) ?? [])
    }
    setLoading(false)
  }, [userId])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  const createReport = async (formData: ReportFormData): Promise<{ error: string | null }> => {
    if (!userId) return { error: 'ログインが必要です' }

    const payload = {
      user_id: userId,
      title: formData.title,
      report_date: formData.report_date,
      body: formData.body,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      category_id: formData.category_id || null,
      tags: formData.tags,
      tomorrow_plan: formData.tomorrow_plan || null,
      impression: formData.impression || null,
    }

    const { error } = await supabase.from('reports').insert(payload)
    if (error) return { error: error.message }
    await fetchReports()
    return { error: null }
  }

  const updateReport = async (id: string, formData: ReportFormData): Promise<{ error: string | null }> => {
    const payload = {
      title: formData.title,
      report_date: formData.report_date,
      body: formData.body,
      start_time: formData.start_time || null,
      end_time: formData.end_time || null,
      category_id: formData.category_id || null,
      tags: formData.tags,
      tomorrow_plan: formData.tomorrow_plan || null,
      impression: formData.impression || null,
    }

    const { error } = await supabase
      .from('reports')
      .update(payload)
      .eq('id', id)
      .eq('user_id', userId)

    if (error) return { error: error.message }
    await fetchReports()
    return { error: null }
  }

  const deleteReport = async (id: string): Promise<{ error: string | null }> => {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', id)
      .eq('user_id', userId)

    if (error) return { error: error.message }
    setReports(prev => prev.filter(r => r.id !== id))
    return { error: null }
  }

  return {
    reports,
    loading,
    error,
    fetchReports,
    createReport,
    updateReport,
    deleteReport,
  }
}
