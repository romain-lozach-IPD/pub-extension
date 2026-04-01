// Service Worker - Background Script

chrome.runtime.onInstalled.addListener(() => {
  console.log('Side Panel Extension installée')

  chrome.storage.local.get(['links', 'settings'], (result) => {
    if (!result['links']) {
      chrome.storage.local.set({ links: [] })
    }
    if (!result['settings']) {
      chrome.storage.local.set({
        settings: {
          theme: 'light',
          autoSave: true
        }
      })
    }
  })
})

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id as number })
    console.log('Side panel toggled for tab:', tab.id)
  } catch (error) {
    console.error('Error toggling side panel:', error)
  }
})

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('Message reçu:', request)
  sendResponse({ success: true })
})
