import React from 'react'
import { Label } from '@/components/ui/label'

interface InfoRowProps {
  label: string
  value: React.ReactNode
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div>
    <Label className="text-muted-foreground">{label}</Label>
    <p className="font-medium mt-1 break-words">{value}</p>
  </div>
)

export default InfoRow

