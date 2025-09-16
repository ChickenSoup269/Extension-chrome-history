import { debounce, toggleSelect } from "./utils.js"

export function loadHistory(
  currentFilter,
  selectedItems,
  selectedDate,
  searchQuery,
  maxResults = 100,
  texts
) {
  const historyList = document.getElementById("historyList")
  historyList.innerHTML = `<p class="text-center">${texts.loading}</p>`
  console.log("Loading history with query:", {
    currentFilter,
    searchQuery,
    selectedDate,
    maxResults,
  })

  const query = {
    text: searchQuery,
    maxResults,
    startTime: selectedDate ? new Date(selectedDate).setHours(0, 0, 0, 0) : 0,
    endTime: selectedDate
      ? new Date(selectedDate).setHours(23, 59, 59, 999)
      : undefined,
  }

  chrome.history.search(query, (results) => {
    console.log("History results:", results)
    if (chrome.runtime.lastError) {
      console.error("History search error:", chrome.runtime.lastError)
      historyList.innerHTML = `<p class="text-red-500">${texts.errorSync}</p>`
      return
    }

    if (results.length === 0) {
      historyList.innerHTML = `<p class="text-center">${texts.noSelection}</p>`
      return
    }

    let grouped = {}
    if (currentFilter === "day") {
      const groupByDay = {}
      results.forEach((item) => {
        const date = new Date(item.lastVisitTime)
        const dayStr = date.toLocaleDateString(
          texts.lang === "vi" ? "vi-VN" : "en-US",
          {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          }
        )
        if (!groupByDay[dayStr]) groupByDay[dayStr] = []
        groupByDay[dayStr].push(item)
      })
      grouped = groupByDay
    } else if (currentFilter === "hour") {
      const groupByHour = {}
      results.forEach((item) => {
        const date = new Date(item.lastVisitTime)
        const hour = `${date.getHours().toString().padStart(2, "0")}:00–${(
          date.getHours() + 1
        )
          .toString()
          .padStart(2, "0")}:00`
        if (!groupByHour[hour]) groupByHour[hour] = []
        groupByHour[hour].push(item)
      })
      grouped = groupByHour
    } else {
      const groupBySite = {}
      results.forEach((item) => {
        const site = new URL(item.url).hostname
        if (!groupBySite[site]) groupBySite[site] = []
        groupBySite[site].push(item)
      })
      grouped = groupBySite
    }

    historyList.innerHTML = ""
    Object.keys(grouped)
      .sort()
      .forEach((group) => {
        const groupDiv = document.createElement("div")
        groupDiv.className = "p-2 bg-gray-200 dark:bg-gray-700 rounded mb-2"
        groupDiv.innerHTML = `<h3 class="font-semibold">${group} (${grouped[group].length} mục)</h3>`

        grouped[group].forEach((item) => {
          const itemDiv = document.createElement("div")
          itemDiv.className = "history-item flex items-center cursor-pointer"
          const faviconUrl = `https://www.google.com/s2/favicons?sz=16&domain=${
            new URL(item.url).hostname
          }`
          itemDiv.innerHTML = `
          <input type="checkbox" class="item-checkbox" data-url="${item.url}">
          <img src="${faviconUrl}" class="favicon" alt="favicon">
          <a href="${item.url}" target="_blank" class="flex-1 truncate mr-2">${
            item.title || item.url
          }</a>
          <small class="text-gray-500">${new Date(
            item.lastVisitTime
          ).toLocaleString(texts.lang === "vi" ? "vi-VN" : "en-US")}</small>
        `
          itemDiv.addEventListener("click", (e) => {
            if (e.target.type !== "checkbox") {
              toggleSelect(
                item.url,
                e.target.closest(".history-item"),
                null,
                selectedItems
              )
            }
          })
          groupDiv.appendChild(itemDiv)
        })
        historyList.appendChild(groupDiv)
      })

    document.querySelectorAll(".item-checkbox").forEach((cb) => {
      cb.addEventListener("change", (e) =>
        toggleSelect(
          e.target.dataset.url,
          e.target.closest(".history-item"),
          null,
          selectedItems
        )
      )
    })
    console.log("History rendered:", Object.keys(grouped).length, "groups")
  })
}

export function initHistory(
  currentFilter,
  selectedItems,
  selectedDate,
  searchQuery,
  maxResults = 100,
  texts
) {
  // Set datePicker max to today
  const today = new Date().toISOString().split("T")[0]
  document.getElementById("datePicker").setAttribute("max", today)

  // Filter events
  document.getElementById("filterDay").addEventListener("click", () => {
    currentFilter = "day"
    document.getElementById("filterToggle").textContent = texts.groupByDay
    document.getElementById("filterDropdown").classList.add("hidden")
    loadHistory(
      currentFilter,
      selectedItems,
      selectedDate,
      searchQuery,
      maxResults,
      texts
    )
  })
  document.getElementById("filterHour").addEventListener("click", () => {
    currentFilter = "hour"
    document.getElementById("filterToggle").textContent = texts.groupByHour
    document.getElementById("filterDropdown").classList.add("hidden")
    loadHistory(
      currentFilter,
      selectedItems,
      selectedDate,
      searchQuery,
      maxResults,
      texts
    )
  })
  document.getElementById("filterSite").addEventListener("click", () => {
    currentFilter = "site"
    document.getElementById("filterToggle").textContent = texts.groupBySite
    document.getElementById("filterDropdown").classList.add("hidden")
    loadHistory(
      currentFilter,
      selectedItems,
      selectedDate,
      searchQuery,
      maxResults,
      texts
    )
  })

  // Date picker
  document.getElementById("datePicker").addEventListener("change", (e) => {
    selectedDate = e.target.value
    loadHistory(
      currentFilter,
      selectedItems,
      selectedDate,
      searchQuery,
      maxResults,
      texts
    )
  })
  document.getElementById("clearDate").addEventListener("click", () => {
    document.getElementById("datePicker").value = ""
    selectedDate = null
    loadHistory(
      currentFilter,
      selectedItems,
      selectedDate,
      searchQuery,
      maxResults,
      texts
    )
  })

  // Search
  document.getElementById("searchInput").addEventListener(
    "input",
    debounce((e) => {
      searchQuery = e.target.value
      loadHistory(
        currentFilter,
        selectedItems,
        selectedDate,
        searchQuery,
        maxResults,
        texts
      )
    }, 1000)
  )

  // Select all
  document.getElementById("selectAll").addEventListener("click", () => {
    document.querySelectorAll(".item-checkbox").forEach((cb) => {
      cb.checked = true
      toggleSelect(
        cb.dataset.url,
        cb.closest(".history-item"),
        true,
        selectedItems
      )
    })
  })

  // Delete selected
  document.getElementById("deleteSelected").addEventListener("click", () => {
    if (selectedItems.size === 0) return alert(texts.noSelection)
    selectedItems.forEach((url) => chrome.history.deleteUrl({ url }))
    const count = selectedItems.size
    selectedItems.clear()
    loadHistory(
      currentFilter,
      selectedItems,
      selectedDate,
      searchQuery,
      maxResults,
      texts
    )
    alert(`${count} ${texts.deletedItems}`)
  })

  // Delete day
  document.getElementById("deleteDay").addEventListener("click", () => {
    if (!selectedDate) return alert(texts.noSelection)
    const startTime = new Date(selectedDate).setHours(0, 0, 0, 0)
    const endTime = new Date(selectedDate).setHours(23, 59, 59, 999)
    const dateStr = new Date(selectedDate).toLocaleDateString(
      texts.lang === "vi" ? "vi-VN" : "en-US",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    )
    const count = document.querySelector("#historyList h3")
      ? parseInt(
          document
            .querySelector("#historyList h3")
            .textContent.match(/\((\d+) mục\)/)?.[1] || 0
        )
      : 0
    if (
      confirm(
        texts.confirmDeleteDay
          .replace("{date}", dateStr)
          .replace("{count}", count)
      )
    ) {
      chrome.history.deleteRange({ startTime, endTime })
      loadHistory(
        currentFilter,
        selectedItems,
        selectedDate,
        searchQuery,
        maxResults,
        texts
      )
      alert(`Đã xóa ${count} ${texts.deletedItems} ${dateStr}`)
    }
  })

  // Set initial filter button text
  document.getElementById("filterToggle").textContent = texts.groupByDay

  // Initial load
  loadHistory(
    currentFilter,
    selectedItems,
    selectedDate,
    searchQuery,
    maxResults,
    texts
  )
}
