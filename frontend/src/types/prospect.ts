export type Prospect = {
  id?: string
  title: string
  note?: string
  estimatedValue?: string | number
  estimatedCommission?: string | number
  clientsProspected?: number
  probability?: string | number
  status?: string
  closedValue?: string | number | null
  closeDate?: string | null
}

export type ProspectFormData = {
  title: string
  note?: string
  estimatedValue?: string | number
  estimatedCommission?: string | number
  clientsProspected?: number
  probability?: string | number
  status?: string
  closedValue?: string | number | null
  closeDate?: string | null
}

export type ProspectStats = {
  avgSale?: number
  avgCommission?: number
  clientsProspected?: number
  conversionRate?: number
}
