export function initExport(searchQuery, selectedDate, maxResults, texts) {
  async function exportData(format) {
    const query = {
      text: searchQuery,
      maxResults,
      startTime: selectedDate ? new Date(selectedDate).setHours(0, 0, 0, 0) : 0,
      endTime: selectedDate
        ? new Date(selectedDate).setHours(23, 59, 59, 999)
        : undefined,
    }
    chrome.history.search(query, (results) => {
      if (chrome.runtime.lastError) return
      let content
      const filename = `history_${
        new Date().toISOString().split("T")[0]
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
      } else if (format === "json") {
        content = new Blob([JSON.stringify(results, null, 2)], {
          type: "application/json",
        })
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
      }
      const url = URL.createObjectURL(content)
      chrome.downloads.download({ url, filename, saveAs: true })
    })
  }

  document
    .getElementById("exportCSV")
    .addEventListener("click", () => exportData("csv"))
  document
    .getElementById("exportJSON")
    .addEventListener("click", () => exportData("json"))
  document
    .getElementById("exportHTML")
    .addEventListener("click", () => exportData("html"))
}
