import { useState, useCallback, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

interface UsePaginationOptions {
  defaultPage?: number
  defaultPageSize?: number
  total?: number
}

export function usePagination({
  defaultPage = 1,
  defaultPageSize = 10,
  total = 0,
}: UsePaginationOptions = {}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get initial values from URL or defaults
  const [page, setPage] = useState(() => {
    const pageParam = searchParams.get('page')
    return pageParam ? parseInt(pageParam, 10) : defaultPage
  })
  
  const [pageSize, setPageSize] = useState(() => {
    const sizeParam = searchParams.get('size')
    return sizeParam ? parseInt(sizeParam, 10) : defaultPageSize
  })

  // Calculate pagination values
  const totalPages = useMemo(() => 
    Math.ceil(total / pageSize), 
    [total, pageSize]
  )

  const offset = useMemo(() => 
    (page - 1) * pageSize, 
    [page, pageSize]
  )

  // Update URL when pagination changes
  const updateUrl = useCallback((newPage: number, newSize: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', newPage.toString())
    params.set('size', newSize.toString())
    router.push(`?${params.toString()}`)
  }, [router, searchParams])

  // Handler functions
  const goToPage = useCallback((newPage: number) => {
    const validPage = Math.max(1, Math.min(newPage, totalPages))
    setPage(validPage)
    updateUrl(validPage, pageSize)
  }, [totalPages, pageSize, updateUrl])

  const nextPage = useCallback(() => {
    if (page < totalPages) {
      goToPage(page + 1)
    }
  }, [page, totalPages, goToPage])

  const previousPage = useCallback(() => {
    if (page > 1) {
      goToPage(page - 1)
    }
  }, [page, goToPage])

  const changePageSize = useCallback((newSize: number) => {
    const newPage = Math.ceil((offset + 1) / newSize)
    setPageSize(newSize)
    setPage(newPage)
    updateUrl(newPage, newSize)
  }, [offset, updateUrl])

  return {
    page,
    pageSize,
    offset,
    totalPages,
    goToPage,
    nextPage,
    previousPage,
    changePageSize,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  }
} 