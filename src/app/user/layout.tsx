import React from 'react';

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 md:pt-10 pb-8 border-t border-border/30 sm:border-t-0 mt-12 sm:mt-16">
      {children}
    </div>
  );
}
