import { initSettings, updateTexts } from "./settings.js"
import { initHistory } from "./history.js"
import { initTabs } from "./tabs.js"
import { initExport } from "./export.js"
import { debounce, toggleSelect } from "./utils.js"

// Global variables
let currentFilter = "day"
let selectedItems = new Set()
let selectedDate = null
let searchQuery = ""

// Initialize everything
async function initializeApp() {
  // Define reload callback for settings changes
  const reloadCallback = (filter, items, date, query, maxResults, texts) => {
    initHistory(filter, items, date, query, maxResults, texts)
    initTabs(texts)
    initExport(query, date, 500, texts)
  }

  // Initialize settings
  const currentLang = await initSettings(updateTexts, reloadCallback)

  // Get texts for initial load
  const texts = updateTexts(currentLang)

  // Initialize tabs
  initTabs(texts)

  // Initialize history
  initHistory(
    currentFilter,
    selectedItems,
    selectedDate,
    searchQuery,
    500,
    texts
  )

  // Initialize export
  initExport(searchQuery, selectedDate, 500, texts)
}

// Run initialization
initializeApp()
