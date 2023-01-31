import Link from 'next/link';

export function DrawerHeader({ name }: { name: string }) {
  return (
    <div className="z-20 bg-base-200 bg-opacity-90 backdrop-blur sticky top-0 items-center gap-2 px-4 py-2 hidden lg:flex shadow-sm">
      <Link href="/" aria-current="page" aria-label="Homepage" className="flex-0 btn btn-ghost px-2">
        <div className="font-title text-primary inline-flex text-lg transition-all duration-200 md:text-3xl">
          <span className="lowercase">{name}</span> <span className="text-base-content ">io</span>
        </div>
      </Link>
    </div>
  );
}
