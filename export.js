export function initExport(searchQuery, selectedDate, maxResults, texts) {
  async function exportData(format, allHistory = false) {
    const query = {
      text: searchQuery,
      maxResults: allHistory ? 10000 : maxResults, // Larger limit for all history
      startTime: allHistory
        ? 0
        : selectedDate
        ? new Date(selectedDate).setHours(0, 0, 0, 0)
        : 0,
      endTime: allHistory
        ? undefined
        : selectedDate
        ? new Date(selectedDate).setHours(23, 59, 59, 999)
        : undefined,
    }
    console.log("Exporting history with query:", query)
    chrome.history.search(query, (results) => {
      if (chrome.runtime.lastError) {
        console.error("History search error:", chrome.runtime.lastError)
        alert(texts.errorSync)
        return
      }
      console.log("Export history results:", results.length, "items")
      let content, mimeType
      const filename = `history_${
        allHistory ? "all" : new Date().toISOString().split("T")[0]
      }.${format}`
      if (format === "csv") {
        const csv =
          "URL,Title,Visit Time\n" +
          results
            .map(
              (r) =>
                `"${r.url.replace(/"/g, '""')}","${(r.title || "").replace(
                  /"/g,
                  '""'
                )}","${new Date(r.lastVisitTime).toISOString()}"`
            )
            .join("\n")
        content = new Blob([csv], { type: "text/csv" })
        mimeType = "text/csv"
      } else if (format === "json") {
        content = new Blob([JSON.stringify(results, null, 2)], {
          type: "application/json",
        })
        mimeType = "application/json"
      } else if (format === "html") {
        const html = `<html><body><table border="1"><tr><th>URL</th><th>Title</th><th>Visit Time</th></tr>${results
          .map(
            (r) =>
              `<tr><td><a href="${r.url}">${r.url}</a></td><td>${
                r.title || ""
              }</td><td>${new Date(r.lastVisitTime).toLocaleString()}</td></tr>`
          )
          .join("")}</table></body></html>`
        content = new Blob([html], { type: "text/html" })
        mimeType = "text/html"
      }
      const url = URL.createObjectURL(content)
      console.log("Attempting download with chrome.downloads:", {
        filename,
        mimeType,
      })
      if (chrome.downloads && typeof chrome.downloads.download === "function") {
        chrome.downloads.download(
          { url, filename, saveAs: true },
          (downloadId) => {
            if (chrome.runtime.lastError) {
              console.error("Download error:", chrome.runtime.lastError)
              alert("Error downloading file. Please check permissions.")
            } else {
              console.log("Download started, ID:", downloadId)
            }
            URL.revokeObjectURL(url)
          }
        )
      } else {
        console.warn(
          "chrome.downloads is not available, using fallback download. Context:",
          window.location.href
        )
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.style.display = "none"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        alert(
          "File downloaded using fallback method. If the download does not start, ensure permissions are granted."
        )
      }
      document.getElementById("exportDropdown").classList.add("hidden")
    })
  }

  document
    .getElementById("exportCSVSelected")
    .addEventListener("click", () => exportData("csv", false))
  document
    .getElementById("exportCSVAll")
    .addEventListener("click", () => exportData("csv", true))
  document
    .getElementById("exportJSONSelected")
    .addEventListener("click", () => exportData("json", false))
  document
    .getElementById("exportJSONAll")
    .addEventListener("click", () => exportData("json", true))
  document
    .getElementById("exportHTMLSelected")
    .addEventListener("click", () => exportData("html", false))
  document
    .getElementById("exportHTMLAll")
    .addEventListener("click", () => exportData("html", true))
}
