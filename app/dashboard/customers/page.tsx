import { fetchFilteredCustomers } from '@/app/lib/data';
import { Metadata } from 'next';
import CustomersTable from '@/app/ui/customers/table';
import { CustomersTableSkeleton } from '@/app/ui/skeletons';
import { Suspense } from 'react';
import { lusitana } from '@/app/ui/fonts';
import  Search from 'app/ui/search';

export const metadata: Metadata = {
  title: 'Customers',
};

export default async function Page(props: {
  searchParams?: Promise<{
    query?: string;
  }>;
}) {
  const searchParams = await props.searchParams;
  const query = searchParams?.query || '';
  const customers = await fetchFilteredCustomers(query);

  return (
    <div>
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>
        Customers
      </h1>
      <Search placeholder="Search customers..." />
      <div className="w-full">
        <Suspense key={query} fallback={<CustomersTableSkeleton />}>
          <CustomersTable customers={customers} />
        </Suspense>
      </div>
    </div>
  );
}