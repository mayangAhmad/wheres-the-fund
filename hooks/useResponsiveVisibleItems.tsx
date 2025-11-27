'use client'

import { useState, useEffect } from "react";

export function useResponsiveVisibleItems() {
  const [visibleItems, setVisibleItems] = useState(3);

  useEffect(() => {
    const updateItems = () => {
      // Mobile (< 640px): 1 Card
      if (window.innerWidth < 640) {
        setVisibleItems(1);
      } 
      // Tablet & Desktop (>= 640px): 3 Cards
      else {
        setVisibleItems(3);
      }
    };

    updateItems();
    window.addEventListener("resize", updateItems);
    return () => window.removeEventListener("resize", updateItems);
  }, []);

  return visibleItems;
}