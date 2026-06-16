import {
  Card as BaseCard,
  CardContent as BaseContent,
  CardDescription,
  CardHeader as BaseHeader,
  CardTitle,
} from "@/components/ui/card";

export function Card({
  children,
  className,
  title,
  subtitle,
}: React.PropsWithChildren<{
  className?: string;
  title?: string;
  subtitle?: string;
}>) {
  return (
    <BaseCard className={className}>
      {(title || subtitle) && (
        <BaseHeader>
          {title && <CardTitle>{title}</CardTitle>}
          {subtitle && <CardDescription>{subtitle}</CardDescription>}
        </BaseHeader>
      )}
      <BaseContent className={title || subtitle ? "min-w-0" : "min-w-0 pt-6"}>
        {children}
      </BaseContent>
    </BaseCard>
  );
}
export const CardHeader = BaseHeader;
export const CardContent = BaseContent;
