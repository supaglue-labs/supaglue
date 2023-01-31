import { ReactNode } from 'react';

export function Navbar({ children }: { children: ReactNode }) {
  return (
    <div
      className="sticky top-0 z-30 flex h-16 w-full justify-center bg-opacity-90 backdrop-blur transition-all duration-100 
    bg-base-100 text-base-content shadow-sm"
    >
      <div className="navbar bg-base-100">
        <a className="btn btn-ghost normal-case text-xl">{children}</a>
      </div>
    </div>
  );
}
