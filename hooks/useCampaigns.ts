import { useContext } from 'react'
import { CampaignsContext } from '@/context/CampaignsContext'

export const useCampaigns = () => {
  const context = useContext(CampaignsContext)

  if (context === undefined) {
    throw new Error('useCampaigns must be used within a CampaignsProvider')
  }

  return context;
}