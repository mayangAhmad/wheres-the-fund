'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export function useInfiniteCarousel(totalItems: number, visibleItems: number) {
  const [index, setIndex] = useState(visibleItems)
  const [disableAnimation, setDisableAnimation] = useState(false)
  const [cardWidth, setCardWidth] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // 1. Measure card width
  const measure = useCallback(() => {
    if (containerRef.current) {
      const parent = containerRef.current
      const firstCard = parent.firstElementChild as HTMLElement | null
      
      if (firstCard) {
        const parentStyle = window.getComputedStyle(parent)
        const gap = parseFloat(parentStyle.columnGap) || parseFloat(parentStyle.gap) || 0
        // Calculate total movement width (card + gap)
        setCardWidth(firstCard.offsetWidth + gap)
      }
    }
  }, [])

  // 2. Reset Index when visibleItems changes (Fixes "Cards Gone" on resize)
  useEffect(() => {
    setDisableAnimation(true)
    setIndex(visibleItems)
    
    // Allow DOM to update before measuring
    const timer = setTimeout(() => {
      measure()
      setDisableAnimation(false)
    }, 50)
    
    return () => clearTimeout(timer)
  }, [visibleItems, measure])

  // 2b. Measure card width on mount and when totalItems changes
  useEffect(() => {
    const timer = setTimeout(() => {
      measure()
    }, 100)
    
    return () => clearTimeout(timer)
  }, [totalItems, measure])

  // 3. Measure on window resize
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const handleNext = useCallback(() => {
    if (isTransitioning) return 
    setIsTransitioning(true)
    setIndex((prev) => prev + 1)
  }, [isTransitioning])

  const handlePrev = useCallback(() => {
    if (isTransitioning) return 
    setIsTransitioning(true)
    setIndex((prev) => prev - 1)
  }, [isTransitioning])

  // 4. Handle "Teleport" logic
  useEffect(() => {
    const node = containerRef.current
    if (!node) return

    const handleTransitionEnd = () => {
      setIsTransitioning(false)

      if (index >= totalItems + visibleItems) {
        setDisableAnimation(true)
        setIndex(visibleItems)
      } else if (index < visibleItems) {
        setDisableAnimation(true)
        setIndex(totalItems + visibleItems - 1)
      }
    }

    node.addEventListener('transitionend', handleTransitionEnd)
    return () => node.removeEventListener('transitionend', handleTransitionEnd)
  }, [index, totalItems, visibleItems])

  // 5. Restore animation after teleport
  useEffect(() => {
    if (disableAnimation) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setDisableAnimation(false))
      })
    }
  }, [disableAnimation])

  return {
    index,
    handleNext,
    handlePrev,
    disableAnimation,
    isTransitioning,
    translateX: -(index * cardWidth),
    containerRef,
  }
}