'use client';

import { useDebouncedCallback } from 'use-debounce';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
<<<<<<< HEAD
=======
import { useDebouncedCallback } from 'use-debounce';
>>>>>>> 3b16c22c1970504f867e1d53774646c3c1f2bfdd

export default function Search({ placeholder }: { placeholder: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

<<<<<<< HEAD
  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term){
      params.set('query', term);
    } else{
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`);
=======
  const handleSearch = useDebouncedCallback((term: string) => {    
    const params = new URLSearchParams(searchParams);
    params.set('page', '1');
    if (term) {
      params.set('query', term);
    } else {
      params.delete('query');
    }
    replace(`${pathname}?${params.toString()}`)
>>>>>>> 3b16c22c1970504f867e1d53774646c3c1f2bfdd
  }, 300);

  return (
    <div className="relative flex flex-1 flex-shrink-0">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <input
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
        placeholder={placeholder}
<<<<<<< HEAD
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
=======
        onChange={
          (e) => {
            handleSearch(e.target.value);
          }
        }
>>>>>>> 3b16c22c1970504f867e1d53774646c3c1f2bfdd
        defaultValue={searchParams.get('query')?.toString()}
      />
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
    </div>
  );
}
