'use client';

import { useState, useRef, useEffect } from 'react';
import { UserInfo } from '../../types';
import { ChevronDown, Search, X, ArrowRight, User, Building2, Phone, MapPin, Globe } from 'lucide-react';

interface BasicInfoFormProps {
  onSubmit: (data: UserInfo) => void;
  initialEmail?: string;
  initialFullName?: string;
}

const services = [
  'Performance Marketing',
  'Accounts & Taxation',
  // 'Both Services' // Temporarily hidden
];

// Popular countries at the top, followed by all countries alphabetically
const countries = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'United Arab Emirates',
  '---', // Separator
  'Afghanistan',
  'Albania',
  'Algeria',
  'Argentina',
  'Austria',
  'Bangladesh',
  'Belgium',
  'Brazil',
  'Bulgaria',
  'China',
  'Colombia',
  'Czech Republic',
  'Denmark',
  'Egypt',
  'Finland',
  'France',
  'Germany',
  'Greece',
  'Hong Kong',
  'Hungary',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Japan',
  'Jordan',
  'Kenya',
  'Kuwait',
  'Malaysia',
  'Mexico',
  'Morocco',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'Norway',
  'Pakistan',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Saudi Arabia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Taiwan',
  'Thailand',
  'Turkey',
  'Ukraine',
  'Vietnam'
];

// Cities organized by country
const citiesByCountry: Record<string, string[]> = {
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad'],
  'United States': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose', 'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte', 'San Francisco', 'Indianapolis', 'Seattle', 'Denver', 'Boston'],
  'United Kingdom': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow', 'Liverpool', 'Newcastle', 'Sheffield', 'Bristol', 'Edinburgh', 'Leicester', 'Nottingham', 'Coventry', 'Belfast', 'Cardiff', 'Bradford', 'Southampton', 'Brighton', 'Oxford', 'Cambridge'],
  'Canada': ['Toronto', 'Montreal', 'Vancouver', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Quebec City', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Oshawa', 'Windsor', 'Saskatoon', 'Regina', 'St. Catharines', 'Barrie', 'Kelowna'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Gold Coast', 'Canberra', 'Newcastle', 'Wollongong', 'Logan City', 'Geelong', 'Hobart', 'Townsville', 'Cairns', 'Darwin', 'Toowoomba', 'Ballarat', 'Bendigo', 'Albury', 'Launceston'],
  'Singapore': ['Singapore'],
  'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain', 'Al Ain'],
  'Germany': ['Berlin', 'Hamburg', 'Munich', 'Cologne', 'Frankfurt', 'Stuttgart', 'Düsseldorf', 'Dortmund', 'Essen', 'Leipzig', 'Bremen', 'Dresden', 'Hanover', 'Nuremberg', 'Duisburg', 'Bochum', 'Wuppertal', 'Bielefeld', 'Bonn', 'Münster'],
  'France': ['Paris', 'Marseille', 'Lyon', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille', 'Rennes', 'Reims', 'Le Havre', 'Saint-Étienne', 'Toulon', 'Grenoble', 'Dijon', 'Angers', 'Nîmes', 'Villeurbanne'],
  'China': ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Chengdu', 'Hangzhou', 'Wuhan', 'Nanjing', "Xi'an", 'Chongqing', 'Tianjin', 'Suzhou', 'Dongguan', 'Qingdao', 'Dalian', 'Zhengzhou', 'Jinan', 'Harbin', 'Changsha', 'Kunming'],
  'Japan': ['Tokyo', 'Yokohama', 'Osaka', 'Nagoya', 'Sapporo', 'Fukuoka', 'Kobe', 'Kyoto', 'Kawasaki', 'Saitama', 'Hiroshima', 'Sendai', 'Chiba', 'Kitakyushu', 'Sakai', 'Niigata', 'Hamamatsu', 'Kumamoto', 'Sagamihara', 'Okayama'],
  'Brazil': ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Porto Alegre', 'Belém', 'Goiânia', 'Guarulhos', 'Campinas', 'São Luís', 'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Natal', 'Teresina'],
  'Mexico': ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Tijuana', 'León', 'Juárez', 'Zapopan', 'Mérida', 'San Luis Potosí', 'Aguascalientes', 'Hermosillo', 'Saltillo', 'Mexicali', 'Culiacán', 'Querétaro', 'Chihuahua', 'Morelia', 'Cancún', 'Veracruz'],
  'South Korea': ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon', 'Gwangju', 'Suwon', 'Ulsan', 'Changwon', 'Goyang', 'Yongin', 'Seongnam', 'Bucheon', 'Cheongju', 'Ansan', 'Jeonju', 'Anyang', 'Pohang', 'Uijeongbu', 'Jeju City']
};

// Shared input class
const inputBase = 'w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all duration-200 bg-white placeholder-gray-400';
const inputNormal = `${inputBase} border-gray-200`;
const inputError = `${inputBase} border-red-400 ring-1 ring-red-100`;
const labelClass = 'block text-sm text-gray-700 mb-1.5';

export function BasicInfoForm({ onSubmit, initialEmail, initialFullName }: BasicInfoFormProps) {
  // Split fullName into first/last
  const nameParts = (initialFullName || '').trim().split(/\s+/);
  const initialFirst = nameParts[0] || '';
  const initialLast = nameParts.slice(1).join(' ') || '';

  const [formData, setFormData] = useState<UserInfo>({
    firstName: initialFirst,
    lastName: initialLast,
    country: '',
    city: '',
    phoneNumber: '',
    companyName: '',
    companyWebsite: '',
    selectedService: '', // Will be set in chat flow
    selectedSector: '',
    email: initialEmail || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserInfo, string>>>({});
  
  // Dropdown states
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  
  // Refs for click outside detection
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setCountryDropdownOpen(false);
        setCountrySearch('');
      }
      if (cityDropdownRef.current && !cityDropdownRef.current.contains(event.target as Node)) {
        setCityDropdownOpen(false);
        setCitySearch('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof UserInfo]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle country selection
  const handleCountrySelect = (country: string) => {
    setFormData(prev => ({ ...prev, country, city: '' })); // Reset city when country changes
    setCountryDropdownOpen(false);
    setCountrySearch('');
    if (errors.country) {
      setErrors(prev => ({ ...prev, country: '' }));
    }
  };

  // Handle city selection
  const handleCitySelect = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
    setCityDropdownOpen(false);
    setCitySearch('');
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: '' }));
    }
  };

  // Get filtered countries
  const getFilteredCountries = () => {
    const searchTerm = countrySearch.toLowerCase();
    return countries.filter(country => 
      country !== '---' && country.toLowerCase().includes(searchTerm)
    );
  };

  // Get filtered cities
  const getFilteredCities = () => {
    if (!formData.country || !citiesByCountry[formData.country]) {
      return [];
    }
    const searchTerm = citySearch.toLowerCase();
    return citiesByCountry[formData.country].filter(city =>
      city.toLowerCase().includes(searchTerm)
    );
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof UserInfo, string>> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const filledFields = [formData.firstName, formData.lastName, formData.country, formData.city, formData.phoneNumber, formData.companyName].filter(f => f.trim() !== '').length;
  const totalFields = 6;

  return (
    <div className="animate-fadeIn max-w-[520px] mx-auto w-full">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-gray-900 mb-1.5" style={{ fontSize: '24px' }}>Let's get started</h2>
        <p className="text-gray-500 text-sm">Tell us about yourself and your business</p>
      </div>

      {/* Progress indicator */}
      

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* First Name & Last Name */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className={labelClass}>
              First Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`${errors.firstName ? inputError : inputNormal} pl-10`}
                placeholder="Sufyan"
              />
            </div>
            {errors.firstName && <p className="text-red-500 text-xs mt-1.5">{errors.firstName}</p>}
          </div>

          <div>
            <label htmlFor="lastName" className={labelClass}>
              Last Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? inputError : inputNormal}
              placeholder="Doe"
            />
            {errors.lastName && <p className="text-red-500 text-xs mt-1.5">{errors.lastName}</p>}
          </div>
        </div>

        {/* Country & City */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="country" className={labelClass}>
              Country <span className="text-red-400">*</span>
            </label>
            <div className="relative" ref={countryDropdownRef}>
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <button
                type="button"
                onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
                className={`${errors.country ? inputError : inputNormal} pl-10 text-left flex items-center justify-between`}
                aria-expanded={countryDropdownOpen}
                aria-controls="country-dropdown-menu"
              >
                <span className={formData.country ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.country || 'Select country'}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${countryDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {errors.country && <p className="text-red-500 text-xs mt-1.5">{errors.country}</p>}
              
              {countryDropdownOpen && (
                <div id="country-dropdown-menu" className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden animate-fadeIn">
                  {/* Search Input */}
                  <div className="p-2.5 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={countrySearch}
                        onChange={(e) => setCountrySearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all bg-gray-50/50 text-sm"
                        placeholder="Search country..."
                        autoFocus
                      />
                      {countrySearch && (
                        <button
                          onClick={() => setCountrySearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                          aria-label="Clear country search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* Country List */}
                  <div className="max-h-52 overflow-y-auto scrollbar-thin">
                    {getFilteredCountries().length > 0 ? (
                      <>
                        {getFilteredCountries().map((country, index) => {
                          const isPopular = index < 7 && !countrySearch;
                          return (
                            <button
                              key={country}
                              type="button"
                              onClick={() => handleCountrySelect(country)}
                              className={`w-full text-left px-4 py-2.5 hover:bg-brand-light transition-colors flex items-center justify-between group ${
                                formData.country === country ? 'bg-brand-light text-brand' : 'text-gray-700'
                              } ${isPopular && index === 7 ? 'border-t border-gray-100 mt-0.5' : ''}`}
                            >
                              <span className="text-sm">{country}</span>
                              {formData.country === country && (
                                <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                              )}
                            </button>
                          );
                        })}
                      </>
                    ) : (
                      <div className="px-4 py-6 text-center text-gray-400 text-sm">
                        No countries found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="city" className={labelClass}>
              City <span className="text-red-400">*</span>
            </label>
            <div className="relative" ref={cityDropdownRef}>
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />
              <button
                type="button"
                onClick={() => {
                  if (formData.country) {
                    setCityDropdownOpen(!cityDropdownOpen);
                  }
                }}
                disabled={!formData.country}
                className={`${errors.city ? inputError : inputNormal} pl-10 text-left flex items-center justify-between ${!formData.country ? 'opacity-50 cursor-not-allowed bg-gray-50' : ''}`}
                aria-expanded={cityDropdownOpen}
                aria-controls="city-dropdown-menu"
              >
                <span className={formData.city ? 'text-gray-900' : 'text-gray-400'}>
                  {formData.city || (formData.country ? 'Select city' : 'Select country first')}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${cityDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {errors.city && <p className="text-red-500 text-xs mt-1.5">{errors.city}</p>}
              
              {cityDropdownOpen && formData.country && (
                <div id="city-dropdown-menu" className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] overflow-hidden animate-fadeIn">
                  {/* Search Input */}
                  <div className="p-2.5 border-b border-gray-100">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                      <input
                        type="text"
                        value={citySearch}
                        onChange={(e) => setCitySearch(e.target.value)}
                        className="w-full pl-9 pr-8 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand/40 transition-all bg-gray-50/50 text-sm"
                        placeholder="Search city..."
                        autoFocus
                      />
                      {citySearch && (
                        <button
                          onClick={() => setCitySearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-0.5"
                          aria-label="Clear city search"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {/* City List */}
                  <div className="max-h-52 overflow-y-auto scrollbar-thin">
                    {getFilteredCities().length > 0 ? (
                      getFilteredCities().map((city) => (
                        <button
                          key={city}
                          type="button"
                          onClick={() => handleCitySelect(city)}
                          className={`w-full text-left px-4 py-2.5 hover:bg-brand-light transition-colors flex items-center justify-between group ${
                            formData.city === city ? 'bg-brand-light text-brand' : 'text-gray-700'
                          }`}
                        >
                          <span className="text-sm">{city}</span>
                          {formData.city === city && (
                            <div className="w-1.5 h-1.5 rounded-full bg-brand"></div>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center">
                        <p className="text-gray-400 text-sm mb-1">
                          {citySearch ? 'No cities found' : 'No cities available'}
                        </p>
                        {!citiesByCountry[formData.country] && (
                          <p className="text-xs text-gray-400">You can type your city name in the search</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phoneNumber" className={labelClass}>
            Phone Number <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className={`${errors.phoneNumber ? inputError : inputNormal} pl-10`}
              placeholder="+91 98765 43210"
            />
          </div>
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1.5">{errors.phoneNumber}</p>}
        </div>

        {/* Company Name */}
        <div>
          <label htmlFor="companyName" className={labelClass}>
            Company Name <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.companyName}
              onChange={handleChange}
              className={`${errors.companyName ? inputError : inputNormal} pl-10`}
              placeholder="Your Company Pvt Ltd"
            />
          </div>
          {errors.companyName && <p className="text-red-500 text-xs mt-1.5">{errors.companyName}</p>}
        </div>

        {/* Continue Button */}
        <button
          type="submit"
          className="w-full py-3 bg-brand text-white rounded-xl text-sm font-medium hover:bg-brand-hover transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm active:scale-[0.98] mt-7"
        >
          Continue
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>
      </form>
    </div>
  );
}
