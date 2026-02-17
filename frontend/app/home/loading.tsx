import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Header from '@/components/header';

export default function HomeLoading() {
  return (
    <div className="flex flex-col bg-background min-h-screen">
      <Header />
      <main className="mx-auto px-4 pt-24 pb-12 max-w-7xl container">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <Skeleton className="w-[300px] h-8" />
              <Skeleton className="w-[200px] h-4" />
            </div>
            <Skeleton className="w-[200px] h-10" />
          </div>

          {/* Summary cards */}
          <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="shadow-sm border-2">
                <CardHeader className="pb-2">
                  <Skeleton className="w-[100px] h-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="w-[150px] h-8" />
                  <Skeleton className="mt-2 w-[120px] h-3" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart + table skeletons */}
          <div className="gap-8 grid grid-cols-1 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-3 shadow-sm border-2">
              <CardHeader>
                <Skeleton className="w-[150px] h-5" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-10" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-4 shadow-sm border-2">
              <CardHeader>
                <Skeleton className="w-[100px] h-5" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-[300px]" />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
