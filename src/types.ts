// Union types
export type TaskStatus = 'todo' | 'in_progress' | 'waiting' | 'done' | 'canceled'
export type TaskPriority = 'low' | 'medium' | 'high'
export type ToastType = 'success' | 'error' | 'info'

// Core interfaces
export interface Environment {
  id: string
  name: string
  url_api: string
  url_front: string
  url_opensapi_doc?: string
  login: string
  password: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface Comment {
  id: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  comments: Comment[]
  createdAt: string
  updatedAt: string
  order: number
}

export interface Link {
  id: string
  name: string
  url: string
  description?: string
  createdAt?: string
  updatedAt?: string
}

export interface Connection {
  id: string
  name: string
  host: string
  username: string
  createdAt?: string
  updatedAt?: string
}

export interface Settings {
  theme: string
  autoSave: boolean
  defaultExportFormat: string
}

export interface ToastItem {
  id: string
  message: string
  type: ToastType
}

export interface DialogState {
  message: string
  onConfirm: () => void
  onCancel: () => void
}

export interface Page {
  id: string
  label: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: new (...args: any[]) => any
}

// Search types
export interface SearchFilters {
  id: string
  abonne_id: string
  hcub_id: string
  avis_id: string
  consultation_id: string
  reference_technique: string
  login: string
}

export interface SearchMeta {
  current_page: number
  last_page: number
  total: number
  from: number
  to: number
}

export interface SearchResult {
  id: string | number
  uuid?: string
  xml_token?: string
  login?: string
  consultation_id?: string | number
  hcub_id?: string
  abonne?: {
    id?: string | number
    login?: string
    hcub_id?: string
  }
  hcub?: {
    id?: string
  }
  consultation?: {
    libelle?: string
  }
  addedAt?: string
  [key: string]: unknown
}

// OpenAPI types
export interface OpenApiSchema {
  type?: string
  format?: string
  example?: unknown
  enum?: unknown[]
  $ref?: string
  properties?: Record<string, OpenApiSchema>
  items?: OpenApiSchema
  required?: string[]
  nullable?: boolean
  minLength?: number
  maxLength?: number
  description?: string
}

export interface OpenApiParameter {
  name: string
  in: string
  required?: boolean
  description?: string
  schema?: OpenApiSchema
}

export interface OpenApiRequestBody {
  required?: boolean
  content?: Record<string, { schema?: OpenApiSchema }>
}

export interface OpenApiResponse {
  description?: string
  content?: Record<string, { schema?: OpenApiSchema }>
}

export interface OpenApiEndpoint {
  id: string
  method: string
  path: string
  summary: string
  description: string
  parameters: OpenApiParameter[]
  requestBody: OpenApiRequestBody | null
  responses: Record<string, OpenApiResponse>
  tags: string[]
  tag: string
  operationId?: string
}

export interface ApiDocGroup {
  name: string
  endpoints: OpenApiEndpoint[]
}

export interface OpenApiSpec {
  openapi?: string
  swagger?: string
  paths?: Record<string, Record<string, unknown>>
  tags?: Array<{ name: string; description?: string }>
  info?: Record<string, unknown>
}
