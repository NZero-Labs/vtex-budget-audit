import {
  Table as BaseTable,
  TableBody as BaseBody,
  TableCell as BaseCell,
  TableHead as BaseHead,
  TableHeader as BaseHeader,
  TableRow as BaseRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Table = BaseTable;
export const TableHeader = BaseHeader;
export const TableBody = BaseBody;
export const TableRow = BaseRow;
export function TableHead({
  align = "left",
  className,
  ...props
}: React.ComponentProps<typeof BaseHead> & {
  align?: "left" | "center" | "right";
}) {
  return (
    <BaseHead
      className={cn(
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
      {...props}
    />
  );
}
export function TableCell({
  align = "left",
  className,
  ...props
}: React.ComponentProps<typeof BaseCell> & {
  align?: "left" | "center" | "right";
}) {
  return (
    <BaseCell
      className={cn(
        align === "center" && "text-center",
        align === "right" && "text-right",
        className,
      )}
      {...props}
    />
  );
}
