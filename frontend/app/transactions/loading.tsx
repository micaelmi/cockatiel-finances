import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Header from '@/components/header';

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="mx-auto px-4 pt-24 pb-12 max-w-7xl container">
        <div className="space-y-8">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="w-[200px] h-8" />
              <Skeleton className="w-[300px] h-4" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="w-[100px] h-10" />
              <Skeleton className="w-[100px] h-10" />
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-4 p-4 border rounded-xl">
            <Skeleton className="w-[140px] h-10" />
            <Skeleton className="w-[240px] h-10" />
            <Skeleton className="ml-auto w-[200px] h-10" />
          </div>

          {/* Table */}
          <Card className="shadow-sm border-2">
            <CardHeader>
              <div className="flex gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-[100px] h-4" />
                ))}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="w-full h-12" />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Summary cards */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="shadow-sm border-2">
                <CardHeader className="pb-2">
                  <Skeleton className="w-[100px] h-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="w-[150px] h-8" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
