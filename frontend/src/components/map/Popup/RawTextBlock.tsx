import React from 'react'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Label } from '@/components/ui/label'

interface RawTextBlockProps {
  text: string
}

const RawTextBlock: React.FC<RawTextBlockProps> = ({ text }) => (
  <>
    <Separator className="my-3" />
    <div>
      <Label className="text-muted-foreground">Raw Text:</Label>
      <ScrollArea className="mt-2 h-32 rounded-md border p-3">
        <pre className="text-xs font-mono whitespace-pre-wrap break-words">
          {text}
        </pre>
      </ScrollArea>
    </div>
  </>
)

export default RawTextBlock

