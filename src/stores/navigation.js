import { writable } from 'svelte/store'
import { Home, FileText, Link, Settings } from 'lucide-svelte'

export const currentPage = writable('home')
export const editorData = writable({ xmlToken: '', decodedXml: '' })

export const pages = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'xml', label: 'XML', icon: FileText },
  { id: 'links', label: 'Liens', icon: Link },
  { id: 'settings', label: 'Paramètres', icon: Settings }
]

export function openEditorWithData(xmlToken) {
  let decodedXml = ''
  try {
    // Decode base64 only - no XML transformation
    decodedXml = atob(xmlToken)
  } catch (e) {
    decodedXml = 'Erreur de décodage: ' + e.message
  }
  
  editorData.set({ xmlToken, decodedXml })
  currentPage.set('xml')
}
