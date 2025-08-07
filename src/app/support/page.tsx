"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslations } from 'next-intl';

export default function DonatePage() {
  const t = useTranslations('Support');
  
  // Generate Patreon button HTML
  const getPatreonButtonHtml = useCallback(() => {
    const buttonText = t('patreon.buttonText');
    return `
      <a href="https://patreon.com/SealedLoveProject" target="_blank" style="
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(90deg, #F96854, #E64C3B);
        color: #ffffff;
        border: none;
        border-radius: 12px;
        padding: 16px 32px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        max-width: 320px;
        margin: 0 auto;
        text-decoration: none;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(249, 104, 84, 0.3);
      ">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" style="height: 24px; margin-right: 12px; fill: currentColor;">
          <path d="M512 194.8c0 101.3-82.4 183.8-183.8 183.8-101.7 0-184.4-82.4-184.4-183.8 0-101.6 82.7-184.3 184.4-184.3C429.6 10.5 512 93.2 512 194.8zM0 501.5h90v-491H0v491z"/>
        </svg>
        ${buttonText}
      </a>
    `;
  }, [t]);
  
  // Generate PayPal donation button HTML
  const getPayPalButtonHtml = useCallback(() => {
    const buttonText = t('paypal.buttonText');
    return `
      <a href="https://www.paypal.com/donate/?hosted_button_id=KSCYYHTMBVMUL" target="_blank" style="
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(90deg, #0070BA, #1546A0);
        color: #ffffff;
        border: none;
        border-radius: 12px;
        padding: 16px 32px;
        font-size: 18px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        max-width: 320px;
        margin: 0 auto;
        text-decoration: none;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(0, 112, 186, 0.3);
      ">
        <img src="https://www.paypalobjects.com/webstatic/en_US/i/buttons/PP_logo_h_100x26.png" 
          alt="PayPal Logo" style="height: 24px; margin-right: 12px;" />
        ${buttonText}
      </a>
    `;
  }, [t]);
  
  // Initialize donation buttons when component mounts
  useEffect(() => {
    // Update Patreon button
    const patreonButtonContainer = document.getElementById('patreon-button-container');
    if (patreonButtonContainer) {
      patreonButtonContainer.innerHTML = getPatreonButtonHtml();
    }
    
    // Update PayPal button
    const paypalButtonContainer = document.getElementById('paypal-button-container');
    if (paypalButtonContainer) {
      paypalButtonContainer.innerHTML = getPayPalButtonHtml();
    }
  }, [getPatreonButtonHtml, getPayPalButtonHtml]);

  return (
    <div className="fade-in pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto text-foreground">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      <header className="mb-16">
        <div className="mt-10 mb-6 relative text-center">
          <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl"></div>
          <h1 className="text-3xl md:text-3xl font-bold relative inline-block">{t('title')}</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
          <p className="mt-6 text-lg text-foreground/80 text-center max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
          <p className="mt-4 text-md text-foreground/60 text-center max-w-3xl mx-auto">
            {t('description')}
          </p>
        </div>
      </header>
      
      <div className="max-w-4xl mx-auto">
        {/* Patreon Support Section */}
        <div className="bg-card rounded-2xl p-8 shadow-sm border border-border mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-3">{t('patreon.title')}</h2>
              <p className="text-foreground/80 mb-4">
                {t('patreon.description')}
              </p>
            </div>
            <div className="md:w-1/3">
              <div id="patreon-button-container" className="w-full flex items-center justify-center">
                {/* Patreon button will be inserted here by JavaScript */}
              </div>
            </div>
          </div>
        </div>
        
        {/* PayPal Support Section */}
        <div className="bg-card rounded-2xl p-8 shadow-sm border border-border mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="md:w-2/3">
              <h2 className="text-2xl font-bold mb-3">{t('paypal.title')}</h2>
              <p className="text-foreground/80 mb-4">
                {t('paypal.description')}
              </p>
              <p className="text-xs text-muted-foreground">
                {t('paypal.note')}
              </p>
            </div>
            <div className="md:w-1/3">
              <div id="paypal-button-container" className="w-full flex items-center justify-center">
                {/* PayPal button will be inserted here by JavaScript */}
              </div>
            </div>
          </div>
        </div>
        
        {/* Info sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Right column - Info */}
          <div className="md:col-span-3">
            {/* Why donate section */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border mb-8">
              <h3 className="text-xl font-bold mb-4">{t('whyDonate.title')}</h3>
              <ul className="space-y-4">
                {[0, 1, 2, 3].map((index) => {
                  const reasonKey = `whyDonate.reason${index + 1}`;
                  // Check if this reason exists in translations
                  try {
                    const reason = t(reasonKey);
                    return (
                      <li key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-primary">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <span>{reason}</span>
                      </li>
                    );
                  } catch (e) {
                    // If this reason doesn't exist, don't render anything
                    return null;
                  }
                }).filter(Boolean)}
              </ul>
            </div>
            
            {/* Other ways to support */}
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <h3 className="text-xl font-bold mb-4">{t('otherWays.title')}</h3>
              <ul className="space-y-4">
                {[0, 1, 2].map((index) => {
                  const wayKey = `otherWays.way${index + 1}`;
                  // Define icons for each way
                  const icons = [
                    <path key="share" strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />,
                    <path key="volunteer" strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796a3.765 3.765 0 00-2.528 0m4.796 4.796c-.181.506-.475.982-.88 1.388a3.736 3.736 0 01-1.388.88m2.268-2.268l4.138 3.448m0 0a9.027 9.027 0 01-1.306 1.652c-.51.51-1.064.944-1.652 1.306m0 0l-3.448-4.138m3.448 4.138a9.014 9.014 0 01-9.424 0m5.976-4.138a3.765 3.765 0 01-2.528 0m0 0a3.736 3.736 0 01-1.388-.88 3.737 3.737 0 01-.88-1.388m2.268 2.268L7.288 19.67m0 0a9.024 9.024 0 01-1.652-1.306 9.027 9.027 0 01-1.306-1.652m0 0l4.138-3.448M4.33 16.712a9.014 9.014 0 010-9.424m4.138 5.976a3.765 3.765 0 010-2.528m0 0c.181-.506.475-.982.88-1.388a3.736 3.736 0 011.388-.88m-2.268 2.268L4.33 7.288m6.406 1.18L7.288 4.33m0 0a9.024 9.024 0 00-1.652 1.306A9.025 9.025 0 004.33 7.288" />,
                    <path key="create" strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  ];
                  
                  // Check if this way exists in translations
                  try {
                    const way = t(wayKey);
                    return (
                      <li key={index} className="flex gap-3">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-secondary">
                            {icons[index % icons.length]}
                          </svg>
                        </div>
                        <span>{way}</span>
                      </li>
                    );
                  } catch (e) {
                    // If this way doesn't exist, don't render anything
                    return null;
                  }
                }).filter(Boolean)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
