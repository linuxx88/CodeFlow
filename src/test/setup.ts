import '@testing-library/jest-dom'

class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ResizeObserver = ResizeObserverMock

// Mock getBoundingClientRect
window.HTMLElement.prototype.getBoundingClientRect = function() {
  return {
    width: 100,
    height: 50,
    top: 0,
    left: 0,
    bottom: 50,
    right: 100,
    x: 0,
    y: 0,
    toJSON() { return {}; }
  }
}

// Mock getClientRects
window.HTMLElement.prototype.getClientRects = function() {
  return [] as unknown as DOMRectList
}

// Mock URL.createObjectURL if needed
if (typeof window.URL.createObjectURL === 'undefined') {
  window.URL.createObjectURL = () => ''
}
