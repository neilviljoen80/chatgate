interface DashboardShellProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export function DashboardShell({
  title,
  description,
  children,
  action,
  noPadding,
}: DashboardShellProps) {
  return (
    <div className={noPadding ? "flex-1 flex flex-col" : "flex-1 space-y-6 p-5 md:p-8"}>
      {!noPadding && (
        <div className="flex items-start justify-between gap-4">
          <div className="animate-fade-in">
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {description && (
              <p className="text-muted-foreground mt-1 text-sm">{description}</p>
            )}
          </div>
          {action && <div className="shrink-0 animate-fade-in">{action}</div>}
        </div>
      )}
      <div className={noPadding ? "flex-1 flex flex-col" : "animate-slide-up"}>
        {children}
      </div>
    </div>
  );
}
