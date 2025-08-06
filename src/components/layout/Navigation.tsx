"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useId } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "@/components/ui/Button";
import { useTranslations } from 'next-intl';
import LanguageSelector from '../LanguageSelector';

export default function Navigation() {
  const t = useTranslations('Navigation');
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, openSignInModal, signOut } = useAuth();
  const { theme } = useTheme();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isUserMenuOpen && !target.closest('[data-menu="user"]')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isUserMenuOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Set mounted state for client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navItems = [
    { 
      path: '/stories', 
      label: t('stories'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
        </svg>
      )
    },
    { 
      path: '/about', 
      label: t('about'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    { 
      path: '/support', 
      label: t('support'), 
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      )
    }
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border/20 shadow-md' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center shadow-md transform transition-all duration-300 group-hover:scale-110">
                  {mounted && (
                    <svg 
                      className="w-6 h-6" 
                      fill={theme === 'dark' ? 'white' : 'black'} 
                      stroke={theme === 'dark' ? 'white' : 'black'}
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  )}
                </div>
                <div suppressHydrationWarning className="absolute -inset-1.5 bg-gradient-to-br from-primary/30 to-secondary/30 rounded blur-md opacity-0 group-hover:opacity-70 transition-opacity duration-300"></div>
              </div>
              <div className="block">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold gradient-text dark:text-white dark:bg-clip-text dark:bg-gradient-to-r dark:from-primary dark:to-secondary">sealed</span>
                  <span className="text-2xl font-bold love-text">.love</span>
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400 tracking-wider">@sealedloveproject</span>
              </div>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1.5">
            
            {/* Theme Toggle */}
            <ThemeToggle className="mr-1" />
            
            {/* Language Selector */}
            <LanguageSelector variant="dropdown" />
            
            {navItems.map(({ path, label, icon }) => (
              <div key={path} className="group">
                <Link 
                  href={path} 
                  className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-md font-medium transition-all duration-200 ${
                    isActive(path) 
                      ? 'text-primary' 
                      : 'text-foreground/80 hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  <span className="flex items-center justify-center w-5 h-5 transition-all duration-200">
                    {icon}
                  </span>
                  <span className="text-lg">{label}</span>
                  {isActive(path) && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-md"></span>
                  )}
                </Link>
              </div>
            ))}
            
            {/* User Menu / Sign In */}
            <div className="relative ml-2" data-menu="user">
              {isAuthenticated ? (
                <>
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className={`flex items-center space-x-2 px-3 py-2 rounded transition-all duration-300 ${isUserMenuOpen ? 'bg-foreground/10 shadow-sm' : 'hover:bg-foreground/5'}`}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="true"
                  >
                    <div className={`w-8 h-8 rounded-md ${user?.isAdmin ? 'bg-gradient-to-br from-amber-500 to-red-600' : 'bg-gradient-to-br from-primary to-secondary'} flex items-center justify-center text-white relative overflow-hidden shadow-md group`}>
                      <span className="text-sm font-bold">{user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}</span>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-foreground/60 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 py-2 rounded-md shadow-lg ring-1 ring-border/10 focus:outline-none z-50 min-w-[280px] w-max bg-white dark:bg-slate-800 text-gray-800 dark:text-white border border-gray-200 dark:border-slate-700 user-menu-dropdown">
                      {/* User header with avatar and info */}
                      <div className="px-4 py-3 border-b border-border/30 bg-foreground/5 dark:bg-slate-700 dark:border-slate-600">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 rounded-md ${user?.isAdmin ? 'bg-gradient-to-br from-amber-500 to-red-600' : 'bg-gradient-to-br from-primary to-secondary'} flex items-center justify-center text-white relative overflow-hidden shadow-md`}>
                            <span className="text-lg font-bold">{user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            {user?.firstName && user?.lastName && (
                              <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[180px]">{user.firstName} {user.lastName}</p>
                            )}
                            <p className="text-xs text-gray-600 dark:text-gray-300 truncate max-w-[180px]">{user?.email}</p>
                            {user?.isAdmin && (
                              <span className="inline-flex items-center mt-1 px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900/70 text-amber-800 dark:text-amber-200 rounded-md">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                {t('admin')}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* User actions section */}
                      <div className="p-2 border-b border-border/30 dark:border-gray-700/50">
                        <p className="px-3 py-1 text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{t('account')}</p>
                        <Link
                          href="/user/profile"
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-foreground/10 dark:hover:bg-gray-800 rounded transition-colors duration-200 text-gray-800 dark:text-white group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-foreground/5 dark:bg-gray-700 mr-3 transition-colors group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">{t('profile')} {t('settings')}</span>
                        </Link>
                        <Link
                          href="/user/stories"
                          className="flex items-center w-full px-3 py-2 text-left hover:bg-foreground/10 dark:hover:bg-gray-800 rounded transition-colors duration-200 text-gray-800 dark:text-white group"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-foreground/5 dark:bg-gray-700 mr-3 transition-colors group-hover:bg-primary/10 dark:group-hover:bg-primary/20 group-hover:text-primary">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">{t('myStories')}</span>
                        </Link>
                      </div>
                      
                      {/* Admin section - only shown to admins */}
                      {user?.isAdmin && (
                        <div className="p-2 border-b border-border/30 dark:border-gray-700/50">
                          <p className="px-3 py-1 text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">{t('admin')} {t('dashboard')}</p>
                          <Link
                            href="/admin/stories"
                            className="flex items-center w-full px-3 py-2 text-left hover:bg-amber-50/50 dark:hover:bg-amber-900/80 rounded transition-colors duration-200 text-amber-800 dark:text-amber-200 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-100/50 dark:bg-amber-800/50 mr-3 transition-colors group-hover:bg-amber-200/70 dark:group-hover:bg-amber-700/70">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                              </svg>
                            </div>
                            <span className="font-medium text-amber-800 dark:text-amber-200">{t('stories')}</span>
                          </Link>
                          <Link
                            href="/admin/reports"
                            className="flex items-center w-full px-3 py-2 text-left hover:bg-amber-50/50 dark:hover:bg-amber-900/80 rounded transition-colors duration-200 text-amber-800 dark:text-amber-200 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-100/50 dark:bg-amber-800/50 mr-3 transition-colors group-hover:bg-amber-200/70 dark:group-hover:bg-amber-700/70">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                              </svg>
                            </div>
                            <span className="font-medium text-amber-800 dark:text-amber-200">{t('reports')}</span>
                          </Link>
                          <Link
                            href="/admin/users"
                            className="flex items-center w-full px-3 py-2 text-left hover:bg-amber-50/50 dark:hover:bg-amber-900/80 rounded transition-colors duration-200 text-amber-800 dark:text-amber-200 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-100/50 dark:bg-amber-800/50 mr-3 transition-colors group-hover:bg-amber-200/70 dark:group-hover:bg-amber-700/70">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                            </div>
                            <span className="font-medium text-amber-800 dark:text-amber-200">{t('users')}</span>
                          </Link>
                          <Link
                            href="/admin/vault"
                            className="flex items-center w-full px-3 py-2 text-left hover:bg-amber-50/50 dark:hover:bg-amber-900/80 rounded transition-colors duration-200 text-amber-800 dark:text-amber-200 group"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-amber-100/50 dark:bg-amber-800/50 mr-3 transition-colors group-hover:bg-amber-200/70 dark:group-hover:bg-amber-700/70">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                              </svg>
                            </div>
                            <span className="font-medium text-amber-800 dark:text-amber-200">{t('vaults')}</span>
                          </Link>
                        </div>
                      )}
                      
                      {/* Sign out section */}
                      <div className="p-2">
                        <button
                          onClick={() => {
                            signOut();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center w-full px-4 py-2.5 text-left hover:bg-foreground/10 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-800 dark:text-white rounded-md"
                        >
                          <div className="flex items-center justify-center w-9 h-9 rounded-md bg-foreground/5 dark:bg-gray-700 mr-3 group-hover:bg-red-50 dark:group-hover:bg-red-900/30 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">{t('signOut')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <button
                  onClick={openSignInModal}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-foreground/10 hover:bg-foreground/15 transition-colors duration-200"
                >
                  <svg className="w-5 h-5 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="text-foreground text-lg">{t('signIn')}</span>
                </button>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`relative p-2 rounded-md transition-all duration-200 active:scale-95 ${
                isMenuOpen 
                  ? 'bg-primary/10 text-primary' 
                  : 'bg-foreground/5 text-foreground/80 hover:bg-foreground/10'
              }`}
              aria-expanded={isMenuOpen}
              aria-label="Toggle navigation"
            >
              <div className="w-5 h-5 flex flex-col justify-center items-center">
                <span 
                  className={`block h-0.5 w-4 bg-current rounded-md transition-all duration-200 ${isMenuOpen ? 'rotate-45 translate-y-0.5' : '-translate-y-1'}`}
                />
                <span 
                  className={`block h-0.5 w-4 bg-current rounded-md transition-opacity duration-200 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                />
                <span 
                  className={`block h-0.5 w-4 bg-current rounded-md transition-all duration-200 ${isMenuOpen ? '-rotate-45 -translate-y-0.5' : 'translate-y-1'}`}
                />
              </div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity duration-300" 
            onClick={() => setIsMenuOpen(false)}
          />
          <div 
            className="absolute top-full left-0 right-0 mt-2 mx-4 shadow-2xl z-50 transition-all duration-300 rounded-2xl max-h-[80vh] overflow-y-auto mobile-menu-dropdown"
            style={{
              backgroundColor: theme === 'dark' ? '#3b4252' : 'white',
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: theme === 'dark' ? '#4c566a' : 'var(--border)'
            }}
          >
            <div className="p-6 space-y-2" style={{ backgroundColor: theme === 'dark' ? '#3b4252' : 'white', color: theme === 'dark' ? '#eceff4' : 'inherit' }}>
              {navItems.map(({ path, label, icon }, index) => (
                <div
                  key={path}
                  className="slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Link 
                    href={path} 
                    className={`flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                      isActive(path) 
                        ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-primary dark:text-primary-400 font-medium' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800/80 text-gray-800'
                    }`}
                    style={theme === 'dark' ? { color: 'white' } : {}}
                  >
                    <div className="flex items-center justify-center w-10 h-10">
                      {icon}
                    </div>
                    <span className="font-medium text-lg">{label}</span>
                    {isActive(path) && (
                      <span className="ml-auto">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    )}
                  </Link>
                </div>
              ))}
              

              
              {/* Mobile Language Selector */}
              <div 
                className="pt-4 mb-4 slide-up"
                style={{ animationDelay: `${(navItems.length + 1) * 0.1}s` }}
              >
                <div className="px-4 py-2 text-gray-600 text-sm font-medium" style={theme === 'dark' ? { color: 'white' } : {}}>{t('selectLanguage')}</div>
                <div className="px-4">
                  <LanguageSelector variant="grid" />
                </div>
              </div>
              
              {/* Mobile Theme Toggle */}
              <div 
                className="pt-4 mb-4 slide-up"
                style={{ animationDelay: `${(navItems.length + 2) * 0.1}s` }}
              >
                <div className="px-4 py-2 text-gray-600 text-sm font-medium" style={theme === 'dark' ? { color: 'white' } : {}}>{t('theme')}</div>
                <div className="px-4">
                  <ThemeToggle variant="icon" />
                </div>
              </div>
              
              {/* Mobile Language Selector */}
              <LanguageSelector variant="dropdown" />
              
              {/* Store Story button removed from mobile navigation */}
              
              {/* Mobile Sign In / User Profile */}
              <div
                className="pt-4 border-t border-border/50 slide-up"
                style={{ animationDelay: `${(navItems.length + 2) * 0.1}s` }}
              >
                {isAuthenticated ? (
                  <div className="px-4 py-3">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 rounded-md bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-lg relative overflow-hidden shadow-md">
                        <span className="font-bold">{user?.firstName ? user.firstName.charAt(0).toUpperCase() : user?.email.charAt(0).toUpperCase()}</span>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-50"></div>
                      </div>
                      <div className="flex-1 min-w-0 overflow-hidden">
                        {user?.firstName && user?.lastName && (
                          <p className="text-sm font-medium text-gray-800 truncate max-w-full" style={theme === 'dark' ? { color: 'white' } : {}}>{user.firstName} {user.lastName}</p>
                        )}
                        <p className="text-sm text-gray-600 truncate max-w-full" style={theme === 'dark' ? { color: 'white' } : {}}>{user?.email}</p>
                      </div>
                    </div>
                    <Link
                      href="/user/stories"
                      className="w-full flex items-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded transition-colors mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      <span>{t('myStories')}</span>
                    </Link>
                    <Link
                      href="/user/profile"
                      className="w-full flex items-center space-x-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded transition-colors mb-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{t('profile')} {t('settings')}</span>
                    </Link>
                    
                    {user?.isAdmin && (
                      <>
                        <Link
                          href="/admin/stories"
                          className="w-full flex items-center space-x-2 px-4 py-2.5 bg-amber-50/30 dark:bg-amber-900/30 hover:bg-amber-50/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded transition-colors mb-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                          <span>{t('stories')}</span>
                        </Link>
                        <Link
                          href="/admin/reports"
                          className="w-full flex items-center space-x-2 px-4 py-2.5 bg-amber-50/30 dark:bg-amber-900/30 hover:bg-amber-50/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded transition-colors mb-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                          </svg>
                          <span>{t('reports')}</span>
                        </Link>
                        <Link
                          href="/admin/users"
                          className="w-full flex items-center space-x-2 px-4 py-2.5 bg-amber-50/30 dark:bg-amber-900/30 hover:bg-amber-50/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded transition-colors mb-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          <span>{t('users')}</span>
                        </Link>
                        <Link
                          href="/admin/vault"
                          className="w-full flex items-center space-x-2 px-4 py-2.5 bg-amber-50/30 dark:bg-amber-900/30 hover:bg-amber-50/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 rounded transition-colors mb-2"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                          <span>{t('vaults')}</span>
                        </Link>
                      </>
                    )}
                    <Button
                      onClick={signOut}
                      variant="secondary"
                      className="w-full flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>{t('signOut')}</span>
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => {
                      setIsMenuOpen(false);
                      openSignInModal();
                    }}
                    variant="secondary"
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-lg font-medium">{t('signIn')}</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
