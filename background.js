// Service Worker - Background Script

// Initialisation lors de l'installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('Side Panel Extension installée')
  
  // Initialisation des données par défaut
  chrome.storage.local.get(['links', 'settings'], (result) => {
    if (!result.links) {
      chrome.storage.local.set({ links: [] })
    }
    if (!result.settings) {
      chrome.storage.local.set({ 
        settings: { 
          theme: 'light',
          autoSave: true 
        } 
      })
    }
  })
})

// Toggle le side panel au clic sur l'icône
chrome.action.onClicked.addListener(async (tab) => {
  // Récupère le panel actif pour cet onglet
  try {
    // Ouvre le side panel pour l'onglet actif
    await chrome.sidePanel.open({ tabId: tab.id })
    console.log('Side panel toggled for tab:', tab.id)
  } catch (error) {
    console.error('Error toggling side panel:', error)
  }
})

// Prêt pour futures communications
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Gestion des messages à implémenter plus tard
  console.log('Message reçu:', request)
  sendResponse({ success: true })
})
