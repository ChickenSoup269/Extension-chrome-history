chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openHistoryManager",
    title: "Mở History Manager Pro",
    contexts: ["all"],
  })
})

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openHistoryManager") {
    chrome.tabs.create({ url: chrome.runtime.getURL("history-page.html") })
  }
})
