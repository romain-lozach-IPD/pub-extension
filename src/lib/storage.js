// Wrapper pour chrome.storage.local avec Promises
export const get = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key])
    })
  })
}

export const set = (key, value) => {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, () => {
      resolve()
    })
  })
}

export const remove = (key) => {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], () => {
      resolve()
    })
  })
}
