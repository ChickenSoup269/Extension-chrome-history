export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function toggleSelect(url, element, forceSelect = null, selectedItems) {
  if (forceSelect !== null) {
    element.classList.toggle("selected", forceSelect)
    if (forceSelect) selectedItems.add(url)
    else selectedItems.delete(url)
  } else {
    const isSelected = element.classList.contains("selected")
    element.classList.toggle("selected")
    if (isSelected) selectedItems.delete(url)
    else selectedItems.add(url)
  }
}
