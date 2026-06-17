import { createContext, useContext, useState } from 'react'

type ConsultationCountCtx = {
  pendingCount: number
  setPendingCount: (n: number) => void
}

const ConsultationCountContext = createContext<ConsultationCountCtx>({
  pendingCount: 0,
  setPendingCount: () => {},
})

export function ConsultationCountProvider({ children }: { children: React.ReactNode }) {
  const [pendingCount, setPendingCount] = useState(0)
  return (
    <ConsultationCountContext.Provider value={{ pendingCount, setPendingCount }}>
      {children}
    </ConsultationCountContext.Provider>
  )
}

export const useConsultationCount = () => useContext(ConsultationCountContext)
