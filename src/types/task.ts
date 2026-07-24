export interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string | null
  priority?: 'high' | 'medium' | 'low'
  completed: boolean
  createdAt: string
  pending?: boolean
}
