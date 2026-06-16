import { Skeleton } from "@/components/ui/skeleton";
export default function Loading() {
  return (
  <div className="mx-auto w-full max-w-7xl space-y-6">
    <Skeleton className="h-52 rounded-2xl sm:h-72 sm:rounded-3xl" />
    <div className="grid gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[1, 2, 3].map((item) => (
        <Skeleton key={item} className="h-64 rounded-xl" />
      ))}
    </div>
  </div>
  );
}
