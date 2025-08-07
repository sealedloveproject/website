'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ChevronRightIcon } from '@heroicons/react/20/solid';

interface BreadcrumbItem {
  label: string;
  href?: string;
  isLast?: boolean;
}

export default function UserBreadcrumbs() {
  const t = useTranslations('User');
  const pathname = usePathname();

  // Only process paths that start with /user
  if (!pathname.startsWith('/user')) {
    return null;
  }

  // Split the path into segments and remove empty segments
  const segments = pathname.split('/').filter(Boolean);
  
  // Generate breadcrumb items based on the path
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Always add dashboard as the first item
  breadcrumbs.push({
    label: t('dashboard.title'),
    href: '/user',
  });

  // Process the remaining segments
  if (segments.length > 1) {
    // Handle known paths
    if (segments[1] === 'stories') {
      breadcrumbs.push({
        label: t('stories.title'),
        href: segments.length > 2 ? '/user/stories' : undefined,
        isLast: segments.length === 2,
      });

      // Handle story actions
      if (segments.length > 2) {
        if (segments[2] === 'new') {
          breadcrumbs.push({
            label: t('createStory.header.title'),
            isLast: true,
          });
        } else if (segments[2] === 'edit' && segments.length > 3) {
          breadcrumbs.push({
            label: t('editStory.header.title'),
            isLast: true,
          });
        } else if (segments[2] === 'view' && segments.length > 3) {
          breadcrumbs.push({
            label: t('viewStory.title', { fallback: 'View Story' }),
            isLast: true,
          });
        }
      }
    } else if (segments[1] === 'profile') {
      breadcrumbs.push({
        label: t('profile.title'),
        isLast: true,
      });
    } else if (segments[1] === 'settings') {
      breadcrumbs.push({
        label: t('settings.title', { fallback: 'Settings' }),
        isLast: true,
      });
    } else {
      // For unknown paths, just capitalize the segment
      breadcrumbs.push({
        label: segments[1].charAt(0).toUpperCase() + segments[1].slice(1),
        isLast: true,
      });
    }
  }

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 md:space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <li key={index} className="inline-flex items-center">
            {index > 0 && (
              <ChevronRightIcon className="h-4 w-4 text-gray-400 mx-1" aria-hidden="true" />
            )}
            {breadcrumb.isLast || !breadcrumb.href ? (
              <span className="text-sm font-semibold text-gray-500">{breadcrumb.label}</span>
            ) : (
              <Link 
                href={breadcrumb.href} 
                className="text-sm font-semibold text-primary hover:text-primary/80"
              >
                {breadcrumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
