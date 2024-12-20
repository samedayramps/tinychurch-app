'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useDebounce from '../utils/use-debounce'

interface UseSearchOptions<T extends Record<string, any>> {
  defaultValues?: Partial<T>
  debounceMs?: number
  onSearch?: (filters: T) => void
}

export function useSearch<T extends Record<string, any>>({
  defaultValues = {} as T,
  debounceMs = 300,
  onSearch,
}: UseSearchOptions<T> = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Initialize state from URL parameters
  const [filters, setFilters] = useState<T>(() => {
    const params = Object.fromEntries(searchParams.entries())
    return {
      ...defaultValues,
      ...params,
    } as T
  })

  // Debounce filter changes
  const debouncedFilters = useDebounce(filters, debounceMs)

  // Update URL with current filters
  const updateUrl = useCallback((newFilters: T) => {
    const params = new URLSearchParams(searchParams.toString())
    
    // Remove empty values and update params
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value === undefined || value === null || value === '') {
        params.delete(key)
      } else {
        params.set(key, String(value))
      }
    })

    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  // Handle filter changes
  const setFilter = useCallback((
    key: keyof T,
    value: T[keyof T]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(() => defaultValues as T)
    updateUrl(defaultValues as T)
  }, [defaultValues, updateUrl])

  // Call onSearch when filters change
  useEffect(() => {
    onSearch?.(debouncedFilters)
  }, [debouncedFilters, onSearch])

  // Update URL when filters change
  useEffect(() => {
    updateUrl(debouncedFilters)
  }, [debouncedFilters, updateUrl])

  return {
    filters,
    setFilter,
    resetFilters,
    isFiltered: Object.keys(filters).some(
      key => filters[key] !== defaultValues[key]
    ),
  }
} 