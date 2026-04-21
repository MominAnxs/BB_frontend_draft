'use client';

import { useState } from 'react';
import { Building2, Users, Briefcase, CheckCircle, Clock, X, Mic, ChevronDown, ChevronUp, ChevronRight, Key, FileText, Upload } from 'lucide-react';
import { UserInfo } from '../types';

interface OnboardingSectionProps {
  userInfo: UserInfo;
}

export function OnboardingSection({ userInfo }: OnboardingSectionProps) {
  const [activeService, setActiveService] = useState<'performance' | 'finance'>('performance');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerSection, setDrawerSection] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(0);
  
  // Performance Marketing data
  const [setupBasicsData, setSetupBasicsData] = useState({
    brandUSPs: '',
    objectives: '',
    guidelines: ''
  });
  const [competitorData, setCompetitorData] = useState('');
  const [productData, setProductData] = useState('');

  // Accounts & Taxation - Data Access (13 items)
  const [dataAccessCompleted, setDataAccessCompleted] = useState<Record<string, boolean>>({
    gstPortal: false,
    tdsPortal: false,
    itrLogin: false,
    ptCptCredentials: false,
    eInvoiceLogin: false,
    internalSoftware: false,
    tallyLogin: false,
    paymentCredentials: false,
    posSystem: false,
    payrollLogin: false,
    prepaidPartner: false,
    codPayment: false,
    ecommercePortals: false
  });

  // Accounts & Taxation - Requirements (12 items)
  const [requirementsCompleted, setRequirementsCompleted] = useState<Record<string, boolean>>({
    auditedFinancials: false,
    tallyBackup: false,
    companyDocuments: false,
    bankStatement: false,
    nbfcSchedule: false,
    purchaseExpenses: false,
    creditCardStatement: false,
    reimbursementData: false,
    salaryRegister: false,
    tdsGstWorkings: false,
    pettyCashRegister: false,
    salesData: false
  });

  const dataAccessItems = [
    { id: 'gstPortal', title: 'GST Portal Login' },
    { id: 'tdsPortal', title: 'TDS Portal Login' },
    { id: 'itrLogin', title: 'ITR Login' },
    { id: 'ptCptCredentials', title: 'PT/CPT Credentials [PTEC/PTRC]' },
    { id: 'eInvoiceLogin', title: 'E-invoice Login [Website & Software]' },
    { id: 'internalSoftware', title: 'Internal Software Access + Credentials' },
    { id: 'tallyLogin', title: 'Tally Login ID\'s' },
    { id: 'paymentCredentials', title: 'Payment Credentials' },
    { id: 'posSystem', title: 'POS System' },
    { id: 'payrollLogin', title: 'Payroll Login ID\'s' },
    { id: 'prepaidPartner', title: 'Prepaid Partner Credentials' },
    { id: 'codPayment', title: 'COD Payment Credentials' },
    { id: 'ecommercePortals', title: 'Ecommerce Portals Login' }
  ];

  const requirementsItems = [
    { id: 'auditedFinancials', title: 'Audited Financial Statement' },
    { id: 'tallyBackup', title: 'Latest Tally Backup' },
    { id: 'companyDocuments', title: 'Company/LLP Document' },
    { id: 'bankStatement', title: 'Latest Bank Statement' },
    { id: 'nbfcSchedule', title: 'NBFC [Loan re-payment schedule/statement]' },
    { id: 'purchaseExpenses', title: 'Purchase/Expenses data' },
    { id: 'creditCardStatement', title: 'Credit Card Statement' },
    { id: 'reimbursementData', title: 'Reimbursement Data' },
    { id: 'salaryRegister', title: 'Salary Register' },
    { id: 'tdsGstWorkings', title: 'Past TDS & GST workings' },
    { id: 'pettyCashRegister', title: 'Petty Cash Register' },
    { id: 'salesData', title: 'Sales Data' }
  ];

  // Calculate completion percentage
  const calculateProgress = () => {
    if (activeService === 'performance') {
      let completed = 0;
      if (setupBasicsData.brandUSPs || setupBasicsData.objectives || setupBasicsData.guidelines) completed++;
      if (competitorData) completed++;
      if (productData) completed++;
      return Math.round((completed / 3) * 100);
    } else {
      const dataAccessTotal = Object.values(dataAccessCompleted).filter(v => v).length;
      const requirementsTotal = Object.values(requirementsCompleted).filter(v => v).length;
      const total = 25; // 13 + 12
      const completed = dataAccessTotal + requirementsTotal;
      return Math.round((completed / total) * 100);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Service Onboarding</h1>
        <p className="text-sm text-gray-600">Complete your service setup and provide essential business information</p>
      </div>

      {/* Service Selection Card */}
      <div className="bg-brand-light rounded-xl border border-brand/10 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Selected Service</h3>
            <p className="text-xs text-gray-600 mt-0.5">Your current service package</p>
          </div>
          <span className="px-2.5 py-0.5 bg-green-500 text-white text-xs font-medium rounded-full flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Active
          </span>
        </div>

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setActiveService('performance')}
            className={`flex-1 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 ${
              activeService === 'performance'
                ? 'bg-[rgba(32,76,199,0.03)] border-brand shadow-[0_2px_10px_rgba(32,76,199,0.08)]'
                : 'bg-white border-gray-200 hover:border-brand/30'
            }`}
          >
            <span className={`text-sm font-medium ${
              activeService === 'performance' ? 'text-brand' : 'text-gray-900'
            }`}>Performance Marketing</span>
          </button>

          <button
            onClick={() => setActiveService('finance')}
            className={`flex-1 px-3 py-2.5 rounded-lg border-2 transition-all duration-200 ${
              activeService === 'finance'
                ? 'bg-[rgba(32,76,199,0.03)] border-brand shadow-[0_2px_10px_rgba(32,76,199,0.08)]'
                : 'bg-white border-gray-200 hover:border-brand/30'
            }`}
          >
            <span className={`text-sm font-medium ${
              activeService === 'finance' ? 'text-brand' : 'text-gray-900'
            }`}>Accounts & Taxation</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Setup Progress</h3>
            <p className="text-sm text-gray-600 mt-0.5">Track your onboarding completion</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-brand">
              {calculateProgress()}%
            </div>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-brand h-3 rounded-full transition-all duration-500"
            style={{ width: `${calculateProgress()}%` }}
          ></div>
        </div>
      </div>

      {/* Performance Marketing Content */}
      {activeService === 'performance' && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">General Information</h3>
              <p className="text-sm text-gray-600 mt-1">Provide details about your brand and business</p>
            </div>

            <div className="space-y-2">
              {/* Setup Basics */}
              <button
                onClick={() => {
                  setDrawerSection('setup-basics');
                  setDrawerOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    (setupBasicsData.brandUSPs || setupBasicsData.objectives || setupBasicsData.guidelines)
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {(setupBasicsData.brandUSPs || setupBasicsData.objectives || setupBasicsData.guidelines) && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">Setup Basics</span>
                </div>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <ChevronRight className="w-4 h-4 text-brand" />
                </div>
              </button>

              {/* Competitor Details */}
              <button
                onClick={() => {
                  setDrawerSection('competitor-details');
                  setDrawerOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    competitorData
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {competitorData && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">Competitor Details</span>
                </div>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <ChevronRight className="w-4 h-4 text-brand" />
                </div>
              </button>

              {/* Product Info */}
              <button
                onClick={() => {
                  setDrawerSection('product-info');
                  setDrawerOpen(true);
                }}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    productData
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 bg-white'
                  }`}>
                    {productData && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="text-sm font-medium text-gray-900">Product Info</span>
                </div>
                <div className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <ChevronRight className="w-4 h-4 text-brand" />
                </div>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Accounts & Taxation Content */}
      {activeService === 'finance' && (
        <>
          {/* Data Access Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">Data Access</h3>
              <p className="text-sm text-gray-600 mt-1">Portal logins and system credentials</p>
            </div>

            <div className="space-y-2">
              {dataAccessItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDrawerSection(item.id);
                    setDrawerOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      dataAccessCompleted[item.id]
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {dataAccessCompleted[item.id] && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.title}</span>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <ChevronRight className="w-4 h-4 text-brand" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* List of Requirements Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="mb-6">
              <h3 className="text-base font-semibold text-gray-900">List of Requirements</h3>
              <p className="text-sm text-gray-600 mt-1">Documents and data needed</p>
            </div>

            <div className="space-y-2">
              {requirementsItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setDrawerSection(item.id);
                    setDrawerOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200 group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                      requirementsCompleted[item.id]
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 bg-white'
                    }`}>
                      {requirementsCompleted[item.id] && (
                        <CheckCircle className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.title}</span>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <ChevronRight className="w-4 h-4 text-brand" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Drawer Panel */}
      {drawerOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 h-full w-[600px] bg-white z-50 flex flex-col" style={{ boxShadow: '-12px 0 40px rgba(32, 76, 199, 0.12), -4px 0 12px rgba(32, 76, 199, 0.06)' }}>
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-brand-light">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {drawerSection === 'setup-basics' && 'Setup Basics'}
                  {drawerSection === 'competitor-details' && 'Competitor Details'}
                  {drawerSection === 'product-info' && 'Product Information'}
                  {dataAccessItems.find(item => item.id === drawerSection)?.title}
                  {requirementsItems.find(item => item.id === drawerSection)?.title}
                </h2>
                <p className="text-sm text-gray-600 mt-0.5">
                  {drawerSection === 'setup-basics' && '3 questions · ~5 mins'}
                  {drawerSection === 'competitor-details' && '1 question · ~2 mins'}
                  {drawerSection === 'product-info' && '1 question · ~2 mins'}
                  {dataAccessItems.find(item => item.id === drawerSection) && 'Enter credentials and access details'}
                  {requirementsItems.find(item => item.id === drawerSection) && 'Upload or mark as completed'}
                </p>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Performance Marketing Drawers */}
              {drawerSection === 'setup-basics' && (
                <div className="space-y-6">
                  {/* Question 1 */}
                  <div className="bg-white rounded-xl border border-gray-200">
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === 0 ? null : 0)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      aria-expanded={expandedQuestion === 0}
                      aria-controls="faq-panel-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-brand-light rounded-lg flex items-center justify-center text-brand text-sm font-semibold">
                          1
                        </div>
                        <span className="font-medium text-gray-900">What is your brand about & what are your USPs?</span>
                      </div>
                      {expandedQuestion === 0 ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedQuestion === 0 && (
                      <div id="faq-panel-0" className="p-4 pt-0 space-y-3">
                        <div className="relative">
                          <textarea
                            value={setupBasicsData.brandUSPs}
                            onChange={(e) => setSetupBasicsData({ ...setupBasicsData, brandUSPs: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200 resize-none"
                            placeholder="Describe your brand, unique selling propositions, and what sets you apart..."
                          />
                          <button
                            onClick={() => setIsRecording(!isRecording)}
                            className={`absolute bottom-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              isRecording
                                ? 'bg-red-500 text-white'
                                : 'bg-brand text-white hover:bg-brand-hover'
                            }`}
                          >
                            <Mic className="w-5 h-5" />
                          </button>
                        </div>
                        {isRecording && (
                          <div className="flex items-center gap-2 text-sm text-red-600 animate-pulse">
                            <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                            <span>Recording...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Question 2 */}
                  <div className="bg-white rounded-xl border border-gray-200">
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === 1 ? null : 1)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      aria-expanded={expandedQuestion === 1}
                      aria-controls="faq-panel-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-brand-light rounded-lg flex items-center justify-center text-brand text-sm font-semibold">
                          2
                        </div>
                        <span className="font-medium text-gray-900">What objectives is your brand trying to achieve?</span>
                      </div>
                      {expandedQuestion === 1 ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedQuestion === 1 && (
                      <div id="faq-panel-1" className="p-4 pt-0 space-y-3">
                        <div className="relative">
                          <textarea
                            value={setupBasicsData.objectives}
                            onChange={(e) => setSetupBasicsData({ ...setupBasicsData, objectives: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200 resize-none"
                            placeholder="Share your business goals, targets, and key objectives..."
                          />
                          <button
                            onClick={() => setIsRecording(!isRecording)}
                            className={`absolute bottom-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              isRecording
                                ? 'bg-red-500 text-white'
                                : 'bg-brand text-white hover:bg-brand-hover'
                            }`}
                          >
                            <Mic className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Question 3 */}
                  <div className="bg-white rounded-xl border border-gray-200">
                    <button
                      onClick={() => setExpandedQuestion(expandedQuestion === 2 ? null : 2)}
                      className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                      aria-expanded={expandedQuestion === 2}
                      aria-controls="faq-panel-2"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 bg-brand-light rounded-lg flex items-center justify-center text-brand text-sm font-semibold">
                          3
                        </div>
                        <span className="font-medium text-gray-900">Brand Guidelines & Links</span>
                      </div>
                      {expandedQuestion === 2 ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    {expandedQuestion === 2 && (
                      <div id="faq-panel-2" className="p-4 pt-0 space-y-3">
                        <div className="relative">
                          <textarea
                            value={setupBasicsData.guidelines}
                            onChange={(e) => setSetupBasicsData({ ...setupBasicsData, guidelines: e.target.value })}
                            rows={6}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200 resize-none"
                            placeholder="Share brand guidelines, style guides, documentation links, etc..."
                          />
                          <button
                            onClick={() => setIsRecording(!isRecording)}
                            className={`absolute bottom-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                              isRecording
                                ? 'bg-red-500 text-white'
                                : 'bg-brand text-white hover:bg-brand-hover'
                            }`}
                          >
                            <Mic className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {drawerSection === 'competitor-details' && (
                <div className="space-y-4">
                  <div className="bg-brand-light rounded-xl p-4 border border-brand/10">
                    <p className="text-sm text-gray-700">
                      Share information about your key competitors, their strategies, and market positioning.
                    </p>
                  </div>
                  <div className="relative">
                    <textarea
                      value={competitorData}
                      onChange={(e) => setCompetitorData(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200 resize-none"
                      placeholder="Describe your competitors, their strengths, weaknesses, and how you differentiate..."
                    />
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isRecording
                          ? 'bg-red-500 text-white'
                          : 'bg-brand text-white hover:bg-brand-hover'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-2 text-sm text-red-600 animate-pulse">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Recording...</span>
                    </div>
                  )}
                </div>
              )}

              {drawerSection === 'product-info' && (
                <div className="space-y-4">
                  <div className="bg-brand-light rounded-xl p-4 border border-brand/10">
                    <p className="text-sm text-gray-700">
                      Provide detailed information about your products or services, features, and benefits.
                    </p>
                  </div>
                  <div className="relative">
                    <textarea
                      value={productData}
                      onChange={(e) => setProductData(e.target.value)}
                      rows={12}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200 resize-none"
                      placeholder="Describe your products/services, key features, pricing, target audience..."
                    />
                    <button
                      onClick={() => setIsRecording(!isRecording)}
                      className={`absolute bottom-3 right-3 w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-200 ${
                        isRecording
                          ? 'bg-red-500 text-white'
                          : 'bg-brand text-white hover:bg-brand-hover'
                      }`}
                    >
                      <Mic className="w-5 h-5" />
                    </button>
                  </div>
                  {isRecording && (
                    <div className="flex items-center gap-2 text-sm text-red-600 animate-pulse">
                      <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                      <span>Recording...</span>
                    </div>
                  )}
                </div>
              )}

              {/* Data Access Drawers */}
              {dataAccessItems.find(item => item.id === drawerSection) && (
                <div className="space-y-4">
                  <div className="bg-brand-light rounded-xl p-4 border border-brand/10">
                    <p className="text-sm text-gray-700">
                      Enter the login credentials and access information for this portal/system.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Username / Email</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                        placeholder="Enter username or email"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                      <input
                        type="password"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200"
                        placeholder="Enter password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Additional Notes (Optional)</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200 resize-none"
                        placeholder="Any additional information or notes..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Requirements Drawers */}
              {requirementsItems.find(item => item.id === drawerSection) && (
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <p className="text-sm text-gray-700">
                      Upload the required document or mark as completed if already provided.
                    </p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Upload Document</label>
                      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-brand/40 transition-colors duration-200 cursor-pointer">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm font-medium text-gray-900 mb-1">Click to upload or drag and drop</p>
                        <p className="text-xs text-gray-500">PDF, DOC, XLS up to 10MB</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                      <textarea
                        rows={4}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all duration-200 resize-none"
                        placeholder="Any additional notes about this document..."
                      />
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                      <input
                        type="checkbox"
                        id="completed"
                        checked={requirementsCompleted[drawerSection || ''] || false}
                        onChange={(e) => {
                          if (drawerSection) {
                            setRequirementsCompleted({
                              ...requirementsCompleted,
                              [drawerSection]: e.target.checked
                            });
                          }
                        }}
                        className="w-5 h-5 text-brand border-gray-300 rounded focus:ring-brand/20"
                      />
                      <label htmlFor="completed" className="text-sm font-medium text-gray-900 cursor-pointer">
                        Mark as completed
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-200 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // Save logic - mark data access items as completed when saving
                    if (drawerSection && dataAccessItems.find(item => item.id === drawerSection)) {
                      setDataAccessCompleted({
                        ...dataAccessCompleted,
                        [drawerSection]: true
                      });
                    }
                    setDrawerOpen(false);
                  }}
                  className="px-6 py-2.5 bg-brand text-white rounded-lg font-medium hover:bg-brand-hover transition-all duration-200 shadow-sm"
                >
                  Save & Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
