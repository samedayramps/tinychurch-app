import React, { createContext, ReactNode, useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'

interface ChurchContext {
  churchId: string | null
  churchName: string | null
  churchSettings: ChurchSettings | null
  isLoading: boolean
  error: Error | null
  refreshChurchData: () => Promise<void>
}

interface ChurchSettings {
  timezone: string
  features: string[]
  customization: {
    primaryColor: string
    logo: string
  }
}

export const ChurchContext = createContext<ChurchContext>({
  churchId: null,
  churchName: null,
  churchSettings: null,
  isLoading: true,
  error: null,
  refreshChurchData: async () => {}
})

export function ChurchProvider({ children, churchId }: { children: ReactNode, churchId: string }) {
  const [churchName, setChurchName] = useState<string | null>(null)
  const [churchSettings, setChurchSettings] = useState<ChurchSettings | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchChurchData() {
      const { data: church } = await supabase
        .from('churches')
        .select('name')
        .eq('id', churchId)
        .single()
      
      if (church) {
        setChurchName(church.name)
      }
    }

    if (churchId) {
      fetchChurchData()
    }
  }, [churchId])

  return (
    <ChurchContext.Provider value={{ churchId, churchName, churchSettings, isLoading, error, refreshChurchData: async () => {} }}>
      {children}
    </ChurchContext.Provider>
  )
}