'use client'

import { 
  createContext, 
  useContext, 
  useReducer, 
  ReactNode 
} from 'react'

type UIState = {
  isSidebarOpen: boolean
  activeModal: string | null
  alerts: Array<{
    id: string
    type: 'success' | 'error' | 'info' | 'warning'
    message: string
  }>
  theme: 'light' | 'dark' | 'system'
}

type UIAction = 
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_MODAL'; payload: string | null }
  | { type: 'ADD_ALERT'; payload: Omit<UIState['alerts'][0], 'id'> }
  | { type: 'REMOVE_ALERT'; payload: string }
  | { type: 'SET_THEME'; payload: UIState['theme'] }

const initialState: UIState = {
  isSidebarOpen: true,
  activeModal: null,
  alerts: [],
  theme: 'system',
}

function uiReducer(state: UIState, action: UIAction): UIState {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        isSidebarOpen: !state.isSidebarOpen,
      }
    case 'SET_MODAL':
      return {
        ...state,
        activeModal: action.payload,
      }
    case 'ADD_ALERT':
      return {
        ...state,
        alerts: [
          ...state.alerts,
          { ...action.payload, id: crypto.randomUUID() },
        ],
      }
    case 'REMOVE_ALERT':
      return {
        ...state,
        alerts: state.alerts.filter(alert => alert.id !== action.payload),
      }
    case 'SET_THEME':
      return {
        ...state,
        theme: action.payload,
      }
    default:
      return state
  }
}

const UIContext = createContext<{
  state: UIState
  dispatch: React.Dispatch<UIAction>
} | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(uiReducer, initialState)

  return (
    <UIContext.Provider value={{ state, dispatch }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context
}

// Utility hooks for common UI operations
export function useAlerts() {
  const { state, dispatch } = useUI()
  
  return {
    alerts: state.alerts,
    addAlert: (alert: Omit<UIState['alerts'][0], 'id'>) => {
      dispatch({ type: 'ADD_ALERT', payload: alert })
    },
    removeAlert: (id: string) => {
      dispatch({ type: 'REMOVE_ALERT', payload: id })
    },
  }
}

export function useModal() {
  const { state, dispatch } = useUI()
  
  return {
    activeModal: state.activeModal,
    openModal: (modalId: string) => {
      dispatch({ type: 'SET_MODAL', payload: modalId })
    },
    closeModal: () => {
      dispatch({ type: 'SET_MODAL', payload: null })
    },
  }
}

export function useTheme() {
  const { state, dispatch } = useUI()
  
  return {
    theme: state.theme,
    setTheme: (theme: UIState['theme']) => {
      dispatch({ type: 'SET_THEME', payload: theme })
    },
  }
} 