// Service Worker - Background Script
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

// Prêt pour futures communications
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Gestion des messages à implémenter plus tard
  console.log('Message reçu:', request)
  sendResponse({ success: true })
})
