import React from 'react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="fade-in pt-24 pb-20 px-6 max-w-4xl mx-auto text-foreground">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      
      <header className="mb-16">
        <div className="mt-10 mb-6 relative text-center">
          <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl"></div>
          <h1 className="text-3xl md:text-3xl font-bold relative inline-block">Privacy Policy</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
          <p className="mt-6 text-lg text-foreground/80 text-center max-w-3xl mx-auto">
            Your privacy and the security of your love stories matter deeply to us
          </p>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        <div className="bg-card/50 rounded-xl p-8 mb-8 border border-border/50">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">Our Commitment</h2>
              <p className="text-foreground/70">Your stories are sacred to us</p>
            </div>
          </div>
          <p className="text-foreground/80 leading-relaxed">
            At Sealed Love Project, we understand that the stories you share with us are deeply personal and precious. 
            This privacy policy explains how we collect, use, and protect your information when you use our platform.
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Information We Collect
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <h3 className="text-lg font-semibold text-foreground mb-3">Personal Information</h3>
              <ul className="space-y-2 text-foreground/80 mb-4">
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>First name, last name, and email address when you create an account</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Profile information you choose to provide</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>The stories, memories, and content you create and share</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>User country information (automatically detected via Cloudflare when posting stories)</span>
                </li>
              </ul>
              
              <h3 className="text-lg font-semibold text-foreground mb-3">Technical Information</h3>
              <ul className="space-y-2 text-foreground/80">
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-secondary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Basic device information and browser type (for compatibility)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-secondary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Essential functionality data only (no tracking or analytics)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-secondary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Client IP addresses (stored separately for system protection, API abuse prevention, and request throttling - not directly linked to user accounts, no IP tracking or location tracking performed)</span>
                </li>
              </ul>
              
              <h3 className="text-lg font-semibold text-foreground mb-3 mt-6 text-green-600">What We DON'T Collect</h3>
              <ul className="space-y-2 text-foreground/80">
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>❌ No tracking cookies or analytics cookies</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>❌ No IP address logging or location tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-red-500 mt-2 mr-3 flex-shrink-0"></span>
                  <span>❌ No advertising data or behavioral tracking</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              How We Use Your Information
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <ul className="space-y-3 text-foreground/80">
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span>To provide and maintain our love story preservation service</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623A11.99 11.99 0 0018.402 6 11.959 11.959 0 0112 2.713z" />
                  </svg>
                  <span>To secure and backup your precious memories for the millennium</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <span>To personalize your experience and improve our platform</span>
                </li>
                <li className="flex items-start">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mt-0.5 mr-3 flex-shrink-0">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                  <span>To communicate with you about your account and our services</span>
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your Story Privacy Controls
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                    Private Stories
                  </h3>
                  <p className="text-foreground/70 text-lg">
                    Stories marked as private are only visible to you and remain completely confidential.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3s-4.5 4.03-4.5 9 2.015 9 4.5 9z" />
                    </svg>
                    Public Stories
                  </h3>
                  <p className="text-foreground/70 text-lg">
                    Stories you choose to make public are shared with the community but you can change this anytime.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Data Security & Storage
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-green-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623A11.99 11.99 0 0018.402 6 11.959 11.959 0 0112 2.713z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Encryption</h3>
                    <p className="text-foreground/70 text-lg">
                      All your stories are encrypted both in transit and at rest using industry-standard security protocols.
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-blue-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3V6a3 3 0 013-3h13.5a3 3 0 013 3v5.25a3 3 0 01-3 3m-16.5 0a3 3 0 013 3v6.75a3 3 0 01-3-3v-6.75a3 3 0 013-3m-16.5 0h16.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Secure Storage</h3>
                    <p className="text-foreground/70 text-lg">Your data is stored on secure, redundant servers with regular backups to ensure your memories are preserved.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-orange-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Cloudflare Protection</h3>
                    <p className="text-foreground/70 text-lg">We use Cloudflare for security and performance. Cloudflare may process technical data for DDoS protection and caching, but we don't use their analytics or tracking features.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-purple-600">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">Access Control</h3>
                    <p className="text-foreground/70 text-lg">Strict access controls ensure only authorized personnel can access systems, never your personal content.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Data Sharing & Third Parties
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.623A11.99 11.99 0 0018.402 6 11.959 11.959 0 0112 2.713z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Zero Data Sharing Promise</h3>
                  <p className="text-foreground/70 text-lg">Your personal information stays with us, period.</p>
                </div>
              </div>
              <div className="space-y-3 text-foreground/80">
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✅</span>
                  <span><strong>We never sell</strong> your personal information, stories, or any data to third parties</span>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✅</span>
                  <span><strong>We never share</strong> your name, email, or personal details with advertisers or marketers</span>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✅</span>
                  <span><strong>We don't use ads</strong> or advertising networks that would access your data</span>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✅</span>
                  <span><strong>No analytics companies</strong> receive your personal information or browsing data</span>
                </div>
                <div className="flex items-start">
                  <span className="text-primary mr-3 mt-1">✅</span>
                  <span><strong>Only exception:</strong> Cloudflare processes technical data for security (DDoS protection, caching) but has no access to your stories or personal information</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Transparency & Trust
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">🌟 Open Source Project</h3>
                    <p className="text-foreground/80 leading-relaxed">
                      <strong>Complete transparency:</strong> Our entire project is open source, meaning you can inspect every line of code that handles your data. 
                      This isn't just about trust, it's about proving our commitment to your privacy through complete transparency. 
                      You can verify exactly how we store, process, and protect your stories.
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-secondary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12V16.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">⏰ Deletion Window</h3>
                    <p className="text-foreground/80 leading-relaxed">
                      <strong>You're in control:</strong> You can delete your stories at any moment before we begin the physical disk writing process for the millennium vault. 
                      We will clearly announce to the entire community when we start the permanent archiving process, giving you full transparency about the timeline. 
                      Until that announcement, your stories remain fully editable and deletable.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Community Funding & Independence
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">100% Community Project</h3>
                  <p className="text-foreground/70 text-lg">Self-funded and independent from external influence</p>
                </div>
              </div>
              <div className="space-y-4 text-foreground/80">
                <p className="leading-relaxed">
                  <strong>Complete Independence:</strong> The Love Sealed Project is entirely self-funded and community-supported. 
                  We have no sponsors, investors, advertisers, or external parties that could influence how we manage your data or operate our platform.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>Self-funded:</strong> This project runs on personal resources and community donations</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>No sponsors:</strong> We have zero corporate sponsors or advertising partners</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>No investors:</strong> No venture capital or external investors with data demands</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>Community-driven:</strong> Decisions are made based on community needs, not profit motives</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>Your support matters:</strong> User donations and support help keep this project independent</span>
                    </div>
                  </div>
                </div>
                <p className="leading-relaxed text-sm">
                  This independence means we can make decisions based solely on what's best for preserving your love stories and protecting your privacy, 
                  without any external pressure to monetize your data or compromise our values.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Your Rights
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498m-10.065 7.498L12 21l-6.364-6.364M12 21l6.364-6.364M12 21V9m-6.364 3.636L12 9l6.364 3.636M12 9V3" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-foreground">Access your data</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    <span className="font-medium text-foreground">Correct your information</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    <span className="font-medium text-foreground">Download your stories</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L12 21l-6.364-6.364M12 21l6.364-6.364M12 21V9m-6.364 3.636L12 9l6.364 3.636M12 9V3" />
                    </svg>
                    <span className="font-medium text-foreground">Restrict processing</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    <span className="font-medium text-foreground">Delete your account</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.627 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                    <span className="font-medium text-foreground">Contact us anytime</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              User Responsibilities & Content Guidelines
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-secondary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12V16.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">Your Content, Your Responsibility</h3>
                  <p className="text-foreground/70 text-lg">You are responsible for the content you upload and share</p>
                </div>
              </div>
              <div className="space-y-3 text-foreground/80">
                <div className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">⚠️</span>
                  <span><strong>Legal compliance:</strong> You are responsible for ensuring your stories comply with all applicable laws and regulations</span>
                </div>
                <div className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">⚠️</span>
                  <span><strong>Content ownership:</strong> You must own or have permission to share all content, including photos, text, and other materials</span>
                </div>
                <div className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">⚠️</span>
                  <span><strong>Prohibited content:</strong> No illegal, harmful, defamatory, or copyrighted content without permission</span>
                </div>
                <div className="flex items-start">
                  <span className="text-secondary mr-3 mt-1">⚠️</span>
                  <span><strong>Privacy of others:</strong> Ensure you have consent from others mentioned or depicted in your stories</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Legal Basis & Regulatory Compliance
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    GDPR Compliance (EU Users)
                  </h3>
                  <ul className="space-y-2 text-foreground/80 text-sm ml-7">
                    <li>• <strong>Legal basis:</strong> Consent (Article 6(1)(a)) for processing your personal data</li>
                    <li>• <strong>Data retention:</strong> Until you delete your account or request data deletion</li>
                    <li>• <strong>Your rights:</strong> Access, rectification, erasure, portability, restriction, and objection</li>
                    <li>• <strong>Data transfers:</strong> No international transfers outside secure infrastructure</li>
                    <li>• <strong>Contact:</strong> Designated contact for GDPR inquiries available below</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    CCPA Compliance (California Users)
                  </h3>
                  <ul className="space-y-2 text-foreground/80 text-sm ml-7">
                    <li>• <strong>Categories collected:</strong> Personal identifiers (name, email), user-generated content</li>
                    <li>• <strong>No sale:</strong> We do not sell personal information to third parties</li>
                    <li>• <strong>Your rights:</strong> Know, delete, opt-out, and non-discrimination rights</li>
                    <li>• <strong>Retention:</strong> Personal information retained until account deletion or upon request</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    General US Privacy Laws
                  </h3>
                  <ul className="space-y-2 text-foreground/80 text-sm ml-7">
                    <li>• <strong>Data minimization:</strong> We only collect data necessary for our services</li>
                    <li>• <strong>Purpose limitation:</strong> Data used only for stated purposes</li>
                    <li>• <strong>Security measures:</strong> Appropriate technical and organizational safeguards</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Contact & Updates
            </h2>
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border border-border/30">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Questions about your privacy?</h3>
                <p className="text-foreground/70 mb-4">
                  We're here to help. Reach out to us anytime with privacy concerns or questions.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/support" 
                    className="btn-primary inline-flex items-center gap-2 group"
                  >
                    Contact Support
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                  <Link 
                    href="/about" 
                    className="btn-secondary inline-flex items-center gap-2 group"
                  >
                    Learn More About Us
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 transform group-hover:translate-x-1 transition-transform">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-border/30 text-center">
          <p className="text-sm text-foreground/60 mb-4">
            This privacy policy was last updated on <span className="font-medium">January 2025</span>
          </p>
          <p className="text-sm text-foreground/60">
            We may update this policy from time to time. We'll notify you of any significant changes.
          </p>
        </div>
      </div>
    </div>
  );
}
