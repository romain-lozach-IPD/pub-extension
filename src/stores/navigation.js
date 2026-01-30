import { writable } from 'svelte/store'
import { Home, FileText, Link, Settings } from 'lucide-svelte'

export const currentPage = writable('home')

export const pages = [
  { id: 'home', label: 'Accueil', icon: Home },
  { id: 'xml', label: 'XML', icon: FileText },
  { id: 'links', label: 'Liens', icon: Link },
  { id: 'settings', label: 'Paramètres', icon: Settings }
]
