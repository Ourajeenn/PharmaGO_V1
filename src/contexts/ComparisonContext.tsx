import { createContext, useContext, useState, ReactNode } from 'react'

interface Medicine {
  id: number
  name: string
  category: string
  price: number
  rating: number
  inStock: boolean
  prescription: boolean
  image: string
  images?: string[]
  description?: string
  composition?: string
  dosage?: string
  sideEffects?: string[]
  manufacturer?: string
}

interface ComparisonContextType {
  comparisonList: Medicine[]
  addToComparison: (medicine: Medicine) => void
  removeFromComparison: (medicineId: number) => void
  clearComparison: () => void
  isInComparison: (medicineId: number) => boolean
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined)

export const ComparisonProvider = ({ children }: { children: ReactNode }) => {
  const [comparisonList, setComparisonList] = useState<Medicine[]>([])

  const addToComparison = (medicine: Medicine) => {
    if (comparisonList.length >= 4) {
      return
    }
    if (!comparisonList.find(m => m.id === medicine.id)) {
      setComparisonList([...comparisonList, medicine])
    }
  }

  const removeFromComparison = (medicineId: number) => {
    setComparisonList(comparisonList.filter(m => m.id !== medicineId))
  }

  const clearComparison = () => {
    setComparisonList([])
  }

  const isInComparison = (medicineId: number) => {
    return comparisonList.some(m => m.id === medicineId)
  }

  return (
    <ComparisonContext.Provider value={{
      comparisonList,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison
    }}>
      {children}
    </ComparisonContext.Provider>
  )
}

export const useComparison = () => {
  const context = useContext(ComparisonContext)
  if (!context) {
    throw new Error('useComparison must be used within ComparisonProvider')
  }
  return context
}
