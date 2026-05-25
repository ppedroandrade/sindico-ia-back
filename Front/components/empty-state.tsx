import { Card } from "@/components/ui/card"

type EmptyStateProps = {
  title: string
  description?: string
  className?: string
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <Card className={className ?? "p-6"}>
      <div className="flex min-h-32 flex-col items-center justify-center text-center">
        <p className="text-sm font-medium">{title}</p>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
    </Card>
  )
}
