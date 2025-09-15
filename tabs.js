export function loadTabs(texts) {
  const tabsList = document.getElementById("tabsList")
  tabsList.innerHTML = `<p class="text-center text-lg">${texts.loading}</p>`

  chrome.sessions.getRecentlyClosed({ maxResults: 100 }, (sessions) => {
    if (chrome.runtime.lastError) {
      tabsList.innerHTML = `<p class="text-red-500 text-lg">${texts.errorSync}</p>`
      return
    }

    tabsList.innerHTML = ""
    sessions.forEach((session) => {
      if (session.tab) {
        const tabDiv = document.createElement("div")
        tabDiv.className = "p-3 bg-blue-100 dark:bg-blue-900 rounded-lg mb-3"
        const faviconUrl = `https://www.google.com/s2/favicons?sz=16&domain=${
          new URL(session.tab.url).hostname
        }`
        tabDiv.innerHTML = `
          <div class="flex items-center">
            <img src="${faviconUrl}" class="favicon" alt="favicon">
            <div class="flex-1">
              <h3 class="font-semibold">${
                session.tab.title || "Tab không tên"
              }</h3>
              <a href="${
                session.tab.url
              }" target="_blank" class="text-blue-600 dark:text-blue-400">Mở: ${
          session.tab.url
        }</a>
            </div>
            <button class="ml-3 bg-red-500 text-white px-3 py-1 rounded delete-tab" data-session-id="${
              session.id
            }">Xóa</button>
          </div>
        `
        tabDiv.querySelector(".delete-tab").addEventListener("click", () => {
          chrome.sessions.forgetClosedSession(session.id)
          tabDiv.remove()
        })
        tabsList.appendChild(tabDiv)
      }
    })
  })
}

export function initTabs(texts) {
  const historyTab = document.getElementById("historyTab")
  const tabsTab = document.getElementById("tabsTab")
  const historySection = document.getElementById("historySection")
  const tabsSection = document.getElementById("tabsSection")

  historyTab.addEventListener("click", () => {
    historyTab.classList.add("bg-blue-500", "text-white")
    historyTab.classList.remove("bg-gray-300", "dark:bg-gray-600")
    tabsTab.classList.remove("bg-blue-500", "text-white")
    tabsTab.classList.add("bg-gray-300", "dark:bg-gray-600")
    historySection.classList.remove("hidden")
    tabsSection.classList.add("hidden")
  })

  tabsTab.addEventListener("click", () => {
    tabsTab.classList.add("bg-blue-500", "text-white")
    tabsTab.classList.remove("bg-gray-300", "dark:bg-gray-600")
    historyTab.classList.remove("bg-blue-500", "text-white")
    historyTab.classList.add("bg-gray-300", "dark:bg-gray-600")
    tabsSection.classList.remove("hidden")
    historySection.classList.add("hidden")
    loadTabs(texts)
  })
}
