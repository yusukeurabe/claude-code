export interface Profile {
  id: string
  user_id: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  color: string
  created_at: string
}

export interface Report {
  id: string
  user_id: string
  title: string
  report_date: string
  body: string
  start_time: string | null
  end_time: string | null
  category_id: string | null
  tags: string[]
  tomorrow_plan: string | null
  impression: string | null
  created_at: string
  updated_at: string
  // joined
  category?: Category | null
  profile?: Profile | null
}

export interface ReportFormData {
  title: string
  report_date: string
  body: string
  start_time: string
  end_time: string
  category_id: string
  tags: string[]
  tomorrow_plan: string
  impression: string
}

export interface ReportFilters {
  search: string
  category_id: string
  date_from: string
  date_to: string
}
