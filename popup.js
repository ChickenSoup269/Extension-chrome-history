import { initSettings, updateTexts } from "./settings.js"
import { loadHistory, initHistory } from "./history.js"
import { loadTabs, initTabs } from "./tabs.js"
import { initExport } from "./export.js"
import { debounce, toggleSelect } from "./utils.js"

// Global variables
let currentFilter = "day"
let selectedItems = new Set()
let selectedDate = null
let searchQuery = ""
const maxResults = 100

// Initialize settings and get texts
if (typeof initSettings === "function") {
  initSettings(
    updateTexts,
    (filter, items, date, query, max, texts) => {
      loadHistory(filter, items, date, query, max, texts)
    },
    { currentFilter, selectedItems, selectedDate, searchQuery, maxResults }
  )
    .then((texts) => {
      // Initialize tabs
      initTabs(texts)

      // Initialize history
      initHistory(
        currentFilter,
        selectedItems,
        selectedDate,
        searchQuery,
        maxResults,
        texts
      )

      // Initialize export
      initExport(searchQuery, selectedDate, maxResults, texts)

      // Filter dropdown toggle
      const filterToggle = document.getElementById("filterToggle")
      const filterDropdown = document.getElementById("filterDropdown")
      filterToggle.addEventListener("click", () => {
        filterDropdown.classList.toggle("hidden")
      })

      // Close filter dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (
          !filterToggle.contains(e.target) &&
          !filterDropdown.contains(e.target)
        ) {
          filterDropdown.classList.add("hidden")
        }
      })

      // Export dropdown toggle
      const exportToggle = document.getElementById("exportToggle")
      const exportDropdown = document.getElementById("exportDropdown")
      exportToggle.addEventListener("click", () => {
        exportDropdown.classList.toggle("hidden")
      })

      // Close export dropdown when clicking outside
      document.addEventListener("click", (e) => {
        if (
          !exportToggle.contains(e.target) &&
          !exportDropdown.contains(e.target)
        ) {
          exportDropdown.classList.add("hidden")
        }
      })
    })
    .catch((error) => {
      console.error("Error initializing settings:", error)
      document.getElementById("historyList").innerHTML =
        '<p class="text-red-500">Error loading settings. Please reload the extension.</p>'
    })
} else {
  console.error("initSettings is not a function")
  document.getElementById("historyList").innerHTML =
    '<p class="text-red-500">Error loading settings module. Please check settings.js.</p>'
}

// Open webpage
document.getElementById("openWebpage").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("history-page.html") })
})
