const texts = {
  vi: {
    lang: "vi",
    title: "History Manager Pro",
    historyTab: "Lịch sử",
    tabsTab: "Tabs Thiết bị Khác",
    searchPlaceholder: "Tìm kiếm lịch sử...",
    all: "Tất cả",
    groupByDay: "Nhóm theo Ngày",
    groupByHour: "Nhóm theo Giờ",
    groupBySite: "Nhóm theo Trang Web",
    selectAll: "Chọn Tất Cả",
    deleteSelected: "Xóa Đã Chọn",
    deleteDay: "Xóa Ngày Này",
    exportCSV: "CSV",
    exportJSON: "JSON",
    exportHTML: "HTML",
    settings: "Cài Đặt",
    openFullPage: "Mở Trang Đầy Đủ",
    loading: "Đang tải...",
    errorSync: "Lỗi: Bật Chrome Sync để xem tabs từ thiết bị khác.",
    noSelection: "Không có lịch sử nào!",
    deletedItems: "mục đã xóa!",
    confirmDeleteDay: "Xác nhận xóa tất cả lịch sử ngày {date}? ({count} mục)",
    langLabel: "Ngôn ngữ / Language",
    themeLabel: "Chuyển sáng/tối",
  },
  en: {
    lang: "en",
    title: "History Manager Pro",
    historyTab: "History",
    tabsTab: "Tabs Other Devices",
    searchPlaceholder: "Search history...",
    all: "All",
    groupByDay: "Group by Day",
    groupByHour: "Group by Hour",
    groupBySite: "Group by Site",
    selectAll: "Select All",
    deleteSelected: "Delete Selected",
    deleteDay: "Delete This Day",
    exportCSV: "CSV",
    exportJSON: "JSON",
    exportHTML: "HTML",
    settings: "Settings",
    openFullPage: "Open Full Page",
    loading: "Loading...",
    errorSync: "Error: Enable Chrome Sync to view tabs from other devices.",
    noSelection: "No history found!",
    deletedItems: "items deleted!",
    confirmDeleteDay: "Confirm delete all history for {date}? ({count} items)",
    langLabel: "Language",
    themeLabel: "Toggle Light/Dark",
  },
}

export function updateTexts(currentLang = "vi") {
  const currentTexts = texts[currentLang]
  document.getElementById("title").textContent = currentTexts.title
  document.getElementById("historyTab").textContent = currentTexts.historyTab
  document.getElementById("tabsTab").textContent = currentTexts.tabsTab
  document.getElementById("searchInput").placeholder =
    currentTexts.searchPlaceholder
  document.getElementById("clearDate").textContent = currentTexts.all
  document.getElementById("filterDay").textContent = currentTexts.groupByDay
  document.getElementById("filterHour").textContent = currentTexts.groupByHour
  document.getElementById("filterSite").textContent = currentTexts.groupBySite
  document.getElementById("selectAll").textContent = currentTexts.selectAll
  document.getElementById("deleteSelected").textContent =
    currentTexts.deleteSelected
  document.getElementById("deleteDay").textContent = currentTexts.deleteDay
  document.getElementById(
    "exportCSVSelected"
  ).textContent = `${currentTexts.exportCSV} (Ngày đã chọn)`
  document.getElementById(
    "exportCSVAll"
  ).textContent = `${currentTexts.exportCSV} (Tất cả)`
  document.getElementById(
    "exportJSONSelected"
  ).textContent = `${currentTexts.exportJSON} (Ngày đã chọn)`
  document.getElementById(
    "exportJSONAll"
  ).textContent = `${currentTexts.exportJSON} (Tất cả)`
  document.getElementById(
    "exportHTMLSelected"
  ).textContent = `${currentTexts.exportHTML} (Ngày đã chọn)`
  document.getElementById(
    "exportHTMLAll"
  ).textContent = `${currentTexts.exportHTML} (Tất cả)`
  document.getElementById("settingsToggle").textContent = currentTexts.settings
  document.getElementById("langLabel").textContent = currentTexts.langLabel
  document.getElementById("themeToggle").textContent = currentTexts.themeLabel
  return currentTexts
}

export function initSettings(
  updateTextsCallback,
  reloadCallback,
  { currentFilter, selectedItems, selectedDate, searchQuery, maxResults }
) {
  return new Promise((resolve) => {
    let currentLang = "vi"
    chrome.storage.sync.get(["lang", "darkMode"], (result) => {
      if (result.lang) currentLang = result.lang
      const currentTexts = updateTextsCallback(currentLang)
      if (result.darkMode) {
        document.body.classList.add("dark")
        document.getElementById("themeToggle").textContent =
          currentTexts.themeLabel
      }

      // Settings dropdown toggle
      const settingsToggle = document.getElementById("settingsToggle")
      const settingsDropdown = document.getElementById("settingsDropdown")
      settingsToggle.addEventListener("click", () => {
        settingsDropdown.classList.toggle("hidden")
      })

      // Close dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (
          !settingsToggle.contains(e.target) &&
          !settingsDropdown.contains(e.target)
        ) {
          settingsDropdown.classList.add("hidden")
        }
      })

      // Theme toggle
      const themeToggle = document.getElementById("themeToggle")
      themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark")
        themeToggle.textContent = document.body.classList.contains("dark")
          ? currentTexts.themeLabel
          : currentTexts.themeLabel
        chrome.storage.sync.set({
          darkMode: document.body.classList.contains("dark"),
        })
      })

      // Language change
      document.getElementById("langSelect").addEventListener("change", (e) => {
        currentLang = e.target.value
        chrome.storage.sync.set({ lang: currentLang }, () => {
          const updatedTexts = updateTextsCallback(currentLang)
          reloadCallback(
            currentFilter,
            selectedItems,
            selectedDate,
            searchQuery,
            maxResults,
            updatedTexts
          )
        })
      })

      resolve(currentTexts)
    })
  })
}
