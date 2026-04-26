export function EmptyChart({ icon: Icon, title, description }) {
  return (
    <div className="h-[300px] flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-lg gap-3">
      <div className="rounded-full bg-muted p-4">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs mt-1">{description}</p>
      </div>
    </div>
  );
}
