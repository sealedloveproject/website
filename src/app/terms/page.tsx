import React from 'react';
import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="fade-in pt-24 pb-20 px-6 max-w-4xl mx-auto text-foreground">
      <div className="absolute inset-0 opacity-5 bg-[url('/images/pattern.svg')] bg-repeat -z-10"></div>
      
      <header className="mb-16">
        <div className="mt-10 mb-6 relative text-center">
          <div className="absolute -inset-4 rounded-full bg-primary/5 blur-xl"></div>
          <h1 className="text-3xl md:text-3xl font-bold relative inline-block">Terms of Service</h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded-full mt-4 mx-auto"></div>
          <p className="mt-6 text-lg text-foreground/80 text-center max-w-3xl mx-auto">
            Legal terms and conditions for using the Love Sealed Project
          </p>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        <div className="bg-card/50 rounded-xl p-8 mb-8 border border-border/50">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Agreement to Terms</h2>
              <p className="text-foreground/70">By using our service, you agree to these terms</p>
            </div>
          </div>
          <p className="text-foreground/80 leading-relaxed">
            By accessing and using the Love Sealed Project ("Service"), you accept and agree to be bound by the terms and provision of this agreement. 
            If you do not agree to abide by the above, please do not use this service.
          </p>
          <p className="text-foreground/80 leading-relaxed mt-4">
            <strong>Last Updated:</strong> {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Service Description
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <p className="text-foreground/80 leading-relaxed mb-4">
                Love Sealed Project is a digital platform that allows users to create, store, and preserve love stories and memories 
                for future generations through our millennium vault project. Our services include:
              </p>
              <ul className="space-y-2 text-foreground/80">
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Digital story creation and storage</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Long-term preservation services</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Community sharing features (optional)</span>
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary/60 mt-2 mr-3 flex-shrink-0"></span>
                  <span>Physical archival to permanent storage media</span>
                </li>
              </ul>
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
                  <strong>Complete Independence:</strong> The Love Sealed Project operates as a fully independent, community-driven initiative. 
                  We are entirely self-funded and have no sponsors, investors, advertisers, or external parties that could influence our operations, 
                  data management practices, or decision-making processes.
                </p>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>Self-funded operation:</strong> This project runs entirely on personal resources and voluntary community donations</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>Zero external sponsors:</strong> No corporate sponsors, advertising partners, or commercial backers</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>No investors or stakeholders:</strong> No venture capital, private equity, or external investors with data or profit demands</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>Community-first decisions:</strong> All platform decisions are made based on community needs and values, not external pressures</span>
                    </div>
                    <div className="flex items-start">
                      <span className="text-green-600 mr-3 mt-1">💚</span>
                      <span><strong>User support sustains us:</strong> Community donations and support help maintain our independence and operations</span>
                    </div>
                  </div>
                </div>
                <p className="leading-relaxed text-lg">
                  This independence ensures that our terms of service, privacy practices, and platform development are guided solely by our mission 
                  to preserve love stories for future generations, without compromise from external commercial interests or data monetization pressures.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              User Responsibilities & Content
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Content Ownership & Rights</h3>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• You retain full ownership of all content you upload</li>
                    <li>• You grant us a non-exclusive license to store, process, and preserve your content</li>
                    <li>• You must own or have permission to upload all content, including photos and text</li>
                    <li>• You are solely responsible for obtaining consent from others depicted in your content</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Prohibited Content</h3>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• Illegal, harmful, threatening, abusive, or defamatory content</li>
                    <li>• Content that violates intellectual property rights</li>
                    <li>• Content containing personal information of others without consent</li>
                    <li>• Spam, malware, or any malicious content</li>
                    <li>• Content that violates any applicable laws or regulations</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">User Conduct</h3>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• Use the service only for lawful purposes</li>
                    <li>• Respect the rights and privacy of other users</li>
                    <li>• Do not attempt to gain unauthorized access to our systems</li>
                    <li>• Do not interfere with or disrupt the service</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Limitation of Liability
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <div className="space-y-4">
                <div className="bg-secondary/10 rounded-lg p-4 border border-secondary/20">
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-secondary mr-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-6 0v3.75m12-3.75v3.75M9 21h6M12 3v6" />
                    </svg>
                    Service "As Is"
                  </h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, 
                    EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, 
                    AND NON-INFRINGEMENT.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Liability Limitations</h3>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• We are not liable for any indirect, incidental, special, or consequential damages</li>
                    <li>• Our total liability shall not exceed the amount paid by you for the service</li>
                    <li>• We are not responsible for content loss due to user error or account deletion</li>
                    <li>• We are not liable for damages arising from service interruptions or technical issues</li>
                    <li>• We are not responsible for third-party actions or content</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Force Majeure</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    We shall not be liable for any failure to perform our obligations due to circumstances beyond our reasonable control, 
                    including but not limited to natural disasters, war, terrorism, government actions, or technical failures.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Data & Privacy
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <p className="text-foreground/80 leading-relaxed mb-4">
                Your privacy is important to us. Our data handling practices are detailed in our 
                <Link href="/privacy" className="text-primary hover:text-primary/80 underline mx-1">Privacy Policy</Link>, 
                which is incorporated by reference into these terms.
              </p>
              <div className="space-y-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Key Privacy Points</h3>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• We never sell or share your personal data with third parties</li>
                    <li>• No tracking cookies or behavioral analytics</li>
                    <li>• Open source project for complete transparency</li>
                    <li>• You can delete your data before permanent archival</li>
                    <li>• GDPR and CCPA compliant</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Indemnification
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <p className="text-foreground/80 leading-relaxed mb-4">
                You agree to indemnify, defend, and hold harmless Love Sealed Project, its officers, directors, employees, 
                and agents from and against any and all claims, damages, obligations, losses, liabilities, costs, and expenses 
                (including attorney's fees) arising from:
              </p>
              <ul className="space-y-2 text-foreground/80 text-lg">
                <li>• Your use of the service</li>
                <li>• Your violation of these terms</li>
                <li>• Your violation of any third-party rights</li>
                <li>• Content you upload or share</li>
                <li>• Any claim that your content infringes upon the rights of others</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Dispute Resolution
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Governing Law</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    These terms shall be governed by and construed in accordance with the laws of [JURISDICTION], 
                    without regard to its conflict of law provisions.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Arbitration Agreement</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed mb-3">
                    Any dispute, claim, or controversy arising out of or relating to these terms or the service 
                    shall be settled by binding arbitration rather than in court, except that you may assert claims 
                    in small claims court if your claims qualify.
                  </p>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• Arbitration will be conducted by a single arbitrator</li>
                    <li>• The arbitration will take place in [JURISDICTION]</li>
                    <li>• The arbitrator's decision will be final and binding</li>
                    <li>• You waive any right to a jury trial</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Class Action Waiver</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    You agree that any arbitration or proceeding shall be limited to the dispute between us and you individually. 
                    You waive any right to participate in a class action lawsuit or class-wide arbitration.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Service Availability & Modifications
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Service Availability</h3>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• We strive for high availability but do not guarantee uninterrupted service</li>
                    <li>• Maintenance windows may temporarily affect service availability</li>
                    <li>• We reserve the right to modify or discontinue features with notice</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Terms Modifications</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    We may update these terms from time to time. We will notify users of material changes via email 
                    or prominent notice on our website. Continued use of the service after changes constitutes acceptance.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Account Termination</h3>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• You may terminate your account at any time</li>
                    <li>• We may terminate accounts for violations of these terms</li>
                    <li>• Upon termination, your access to the service will cease</li>
                    <li>• Data deletion follows our Privacy Policy guidelines</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Intellectual Property
            </h2>
            <div className="bg-card/30 rounded-lg p-6 border border-border/30">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Our Rights</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    The Love Sealed Project platform, including its design, functionality, and underlying technology, 
                    is protected by intellectual property laws. While our code is open source, our trademarks and branding remain our property.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Your Rights</h3>
                  <ul className="space-y-2 text-foreground/80 text-lg">
                    <li>• You retain all rights to your original content</li>
                    <li>• You grant us necessary rights to provide our services</li>
                    <li>• You can request content removal before permanent archival</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">DMCA Compliance</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    We respect intellectual property rights and comply with the Digital Millennium Copyright Act. 
                    If you believe content infringes your copyright, please contact us with proper notification.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Miscellaneous
            </h2>
            <div className="bg-card/50 rounded-lg p-6 border border-border/50">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Severability</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    If any provision of these terms is found to be unenforceable, the remaining provisions will remain in full force and effect.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Entire Agreement</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    These terms, together with our Privacy Policy, constitute the entire agreement between you and us regarding the service.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Assignment</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    We may assign our rights and obligations under these terms. You may not assign your rights without our written consent.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-3">Waiver</h3>
                  <p className="text-foreground/80 text-lg leading-relaxed">
                    Our failure to enforce any provision of these terms does not constitute a waiver of that provision or any other provision.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Contact Information
            </h2>
            <div className="bg-gradient-to-r from-primary/5 to-secondary/5 rounded-lg p-6 border border-border/30">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">Questions About These Terms?</h3>
                <p className="text-foreground/80 mb-4">
                  If you have any questions about these Terms of Service, please contact us.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link 
                    href="/contact" 
                    className="px-6 py-3 bg-primary text-white hover:bg-primary/90 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Contact Us
                  </Link>
                  <Link 
                    href="/privacy" 
                    className="px-6 py-3 bg-card hover:bg-card/80 border border-border rounded-lg transition-colors flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Privacy Policy
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
