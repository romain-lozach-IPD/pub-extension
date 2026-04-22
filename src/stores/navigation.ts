import { writable } from 'svelte/store'
import { Home, Link, CheckSquare, Settings, BookOpen, Wrench } from 'lucide-svelte'
import type { Page } from '../types.ts'

export const currentPage = writable<string>('home')
export const editorData = writable<{ xmlToken: string; decodedXml: string }>({ xmlToken: '', decodedXml: '' })

export const pages: Page[] = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'links', label: 'Liens', icon: Link },
  { id: 'tasks', label: 'Tâches', icon: CheckSquare },
  { id: 'apidoc', label: 'API Doc', icon: BookOpen },
  { id: 'settings', label: 'Paramètres', icon: Settings }
]

export function openEditorWithData(xmlToken: string): void {
  let decodedXml = ''
  try {
    decodedXml = atob(xmlToken)
  } catch (e) {
    decodedXml = 'Erreur de décodage: ' + (e as Error).message
  }

  editorData.set({ xmlToken, decodedXml })
  currentPage.set('tools')
}
