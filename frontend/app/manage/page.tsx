import { Metadata } from 'next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryList } from '@/components/manage/category-list';
import { TagList } from '@/components/manage/tag-list';

export const metadata: Metadata = {
  title: 'Manage Categories & Tags',
};

export default function ManagePage() {
  return (
    <div className="mx-auto py-10 max-w-4xl container">
      <h1 className="mb-2 font-bold text-3xl">Manage Categories & Tags</h1>
      <p className="mb-8 text-muted-foreground">
        Create, update, or remove categories and tags. Changes will reflect across all transactions.
      </p>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid grid-cols-2 w-full lg:w-[400px]">
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="categories" className="mt-6">
          <CategoryList />
        </TabsContent>
        <TabsContent value="tags" className="mt-6">
          <TagList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
