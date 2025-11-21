import { useState, useEffect, useRef, useCallback } from 'react'

export function useInfiniteScroll(items, itemsPerPage = 20) {
  const [displayedItems, setDisplayedItems] = useState(items.slice(0, itemsPerPage))
  const [hasMore, setHasMore] = useState(items.length > itemsPerPage)
  const observerTarget = useRef(null)

  // Reset cuando cambian los items (filtros aplicados)
  useEffect(() => {
    setDisplayedItems(items.slice(0, itemsPerPage))
    setHasMore(items.length > itemsPerPage)
  }, [items, itemsPerPage])

  // Cargar más items
  const loadMore = useCallback(() => {
    setDisplayedItems((prev) => {
      const newItems = items.slice(0, prev.length + itemsPerPage)
      setHasMore(newItems.length < items.length)
      return newItems
    })
  }, [items, itemsPerPage])

  // Intersection Observer para detectar cuando llegamos al final
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current)
      }
    }
  }, [hasMore, loadMore])

  return {
    displayedItems,
    hasMore,
    observerTarget,
    loadMore,
  }
}
