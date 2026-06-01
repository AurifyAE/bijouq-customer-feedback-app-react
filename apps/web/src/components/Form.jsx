import React, { useState, useEffect, useRef } from "react";
import Confetti from "canvas-confetti";
import { ChevronLeft, Globe, ChevronDown, Phone } from "lucide-react";
import { COUNTRIES, detectCountryByTimezone } from "../utils/countries";
import { translations } from "../utils/translations";

// Branches by country
const BRANCHES_BY_COUNTRY = {
  'QA': {
    en: [
      'Place Vendome',
      'Festival City',
      'Asjad Exhibition',
      'Doha Watches and Jewellery Exhibition'
    ],
    ar: [
      'بليس فيندوم',
      'فيستيفال سيتي',
      'معرض أسجاد',
      'معرض الدوحة للساعات والمجوهرات'
    ]
  },
  'AE': {
    en: [
      'Watch & Jewellery Middle east show',
      'Jewellery & Watch Show'
    ],
    ar: [
      'معرض الساعات والمجوهرات الشرق الأوسط',
      'معرض المجوهرات والساعات'
    ]
  },
  'KW': {
    en: [
      'Qerat Jewellery Lounge',
      'Gold & Jewellery Exhibition - Mishref'
    ],
    ar: [
      'صالة قيراط للمجوهرات',
      'معرض الذهب والمجوهرات - مشرف'
    ]
  },
  'BH': {
    en: [
      'Jewellery Arabia Bahrain'
    ],
    ar: [
      'معرض مجوهرات العرب البحرين'
    ]
  },
  'SA': {
    en: [
      'Jewels Of The World'
    ],
    ar: [
      'جواهر العالم'
    ]
  },
  'OM': {
    en: [
      'MIJEX'
    ],
    ar: [
      'ميجكس'
    ]
  }
};

// Function to get branches for a specific country
const getBranchesForCountry = (countryCode, language = 'en') => {
  const countryBranches = BRANCHES_BY_COUNTRY[countryCode];
  if (!countryBranches) {
    return BRANCHES_BY_COUNTRY['QA'][language] || [];
  }
  return countryBranches[language] || [];
};

function Form() {
  const [form, setForm] = useState({
    phone: "",
    fullName: "",
    emiratesId: "",
    dateOfBirth: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    hearAboutUs: [],
    hearAboutUsOther: "",
    jewelryCollections: [],
    jewelryCollectionsOther: "",
    blueDiamondBranch: "",
    feedback: "",
  });
  const [loading, setLoading] = useState(false);
  const [fetchedPhone, setFetchedPhone] = useState(null);
  const [language, setLanguage] = useState("en");
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(() => detectCountryByTimezone());
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [phoneError, setPhoneError] = useState("");

  // Refs for date input fields
  const dayInputRef = useRef(null);
  const monthInputRef = useRef(null);
  const yearInputRef = useRef(null);

  const key = import.meta.env.VITE_API_KEY;

  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const t = translations[language];

  // Phone validation function
  const validatePhoneNumber = (phone, country) => {
    if (!phone || !country) return false;
    const cleanPhone = phone.replace(/\D/g, '');
    return country.pattern.test(cleanPhone);
  };

  // Handle automatic focus movement for date fields
  const handleDateInputChange = (fieldName, value, nextFieldRef) => {
    const numericValue = value.replace(/\D/g, '');

    if (fieldName === 'birthDay') {
      const dayValue = numericValue.slice(0, 2);
      if (dayValue === '' || (parseInt(dayValue) >= 1 && parseInt(dayValue) <= 31)) {
        handleChange({ target: { name: 'birthDay', value: dayValue } });
        const dayNum = parseInt(dayValue);
        let shouldMoveFocus = false;

        if (dayValue.length === 2) {
          shouldMoveFocus = true;
        } else if (dayValue.length === 1) {
          shouldMoveFocus = dayNum >= 4 && dayNum <= 9;
        }

        if (shouldMoveFocus && nextFieldRef && nextFieldRef.current) {
          setTimeout(() => nextFieldRef.current.focus(), 0);
        }
      }
    } else if (fieldName === 'birthMonth') {
      const monthValue = numericValue.slice(0, 2);
      if (monthValue === '' || (parseInt(monthValue) >= 1 && parseInt(monthValue) <= 12)) {
        handleChange({ target: { name: 'birthMonth', value: monthValue } });
        const monthNum = parseInt(monthValue);
        let shouldMoveFocus = false;

        if (monthValue.length === 2) {
          shouldMoveFocus = true;
        } else if (monthValue.length === 1) {
          shouldMoveFocus = monthNum >= 2 && monthNum <= 9;
        }

        if (shouldMoveFocus && nextFieldRef && nextFieldRef.current) {
          setTimeout(() => nextFieldRef.current.focus(), 0);
        }
      }
    } else if (fieldName === 'birthYear') {
      const yearValue = numericValue.slice(0, 4);
      const currentYear = new Date().getFullYear();

      if (yearValue === '' ||
        yearValue.length < 4 ||
        (yearValue.length === 4 && parseInt(yearValue) >= 1900 && parseInt(yearValue) <= currentYear)) {
        handleChange({ target: { name: 'birthYear', value: yearValue } });
      }
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setForm((prev) => {
        const arr = prev[name] || [];
        if (checked) {
          return { ...prev, [name]: [...arr, value] };
        } else {
          return { ...prev, [name]: arr.filter((v) => v !== value) };
        }
      });
    } else {
      setForm((prev) => {
        const newForm = { ...prev, [name]: value };

        if (name === 'birthDay' || name === 'birthMonth' || name === 'birthYear') {
          const day = name === 'birthDay' ? value : prev.birthDay;
          const month = name === 'birthMonth' ? value : prev.birthMonth;
          const year = name === 'birthYear' ? value : prev.birthYear;

          if (day && month &&
            parseInt(day) >= 1 && parseInt(day) <= 31 &&
            parseInt(month) >= 1 && parseInt(month) <= 12) {
            newForm.dateOfBirth = year && year.length === 4
              ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
              : `${day.padStart(2, '0')}/${month.padStart(2, '0')}`;
          } else {
            newForm.dateOfBirth = '';
          }
        }

        return newForm;
      });

      if (name === 'phone') {
        const isValid = validatePhoneNumber(value, selectedCountry);
        if (value && !isValid) {
          setPhoneError(t.phoneValidationError);
        } else {
          setPhoneError('');
        }
      }
    }
  };

  const fetchUserByPhone = async (phone) => {
    try {
      const baseUrl = import.meta.env.DEV
        ? "/api"
        : `https://script.google.com/macros/s/${key}/exec`;

      const response = await fetch(
        `${baseUrl}?phone=${encodeURIComponent(phone)}`
      );

      if (!response.ok) {
        console.log("Response not ok:", response.status);
        return null;
      }

      const text = await response.text();

      try {
        const data = JSON.parse(text);
        return data.status === "success" && data.phone ? data : null;
      } catch {
        console.error("Server did not return JSON:", text.slice(0, 100));
        return null;
      }
    } catch (err) {
      console.error("Error fetching user by phone:", err);
      return null;
    }
  };

  const handleBack = () => {
    setStep((s) => Math.max(0, s - 1));
  };

  const handleNext = async () => {
    if (step === 0 && form.phone) {
      if (!validatePhoneNumber(form.phone, selectedCountry)) {
        setPhoneError(t.phoneValidationError);
        return;
      }

      const fullPhoneNumber = selectedCountry.dialCode + form.phone.replace(/\D/g, '');

      if (fullPhoneNumber !== fetchedPhone) {
        setLoading(true);
        const userData = await fetchUserByPhone(fullPhoneNumber);
        if (userData && userData.phone) {
          const dateOfBirth = userData.dateOfBirth ? new Date(userData.dateOfBirth).toISOString().slice(0, 10) : "";
          let birthDay = "", birthMonth = "", birthYear = "";

          if (dateOfBirth) {
            const [year, month, day] = dateOfBirth.split('-');
            birthDay = day;
            birthMonth = month;
            birthYear = year;
          }

          setForm((prev) => ({
            ...prev,
            phone: userData.phone ? String(userData.phone).replace(selectedCountry.dialCode, '') : prev.phone,
            fullName: userData.fullName || prev.fullName,
            emiratesId: userData.emiratesId || prev.emiratesId,
            dateOfBirth,
            birthDay,
            birthMonth,
            birthYear,
            hearAboutUs: userData.hearAboutUs
              ? userData.hearAboutUs.split(",").map((s) => s.trim())
              : [],
            jewelryCollections: userData.jewelryCollections
              ? userData.jewelryCollections.split(",").map((s) => s.trim())
              : [],
            hearAboutUsOther: userData.hearAboutUsOther || prev.hearAboutUsOther,
            jewelryCollectionsOther: userData.jewelryCollectionsOther || prev.jewelryCollectionsOther,
            blueDiamondBranch: userData.blueDiamondBranch || prev.blueDiamondBranch,
            feedback: userData.feedback || prev.feedback,
          }));
        }
        setFetchedPhone(fullPhoneNumber);
        setLoading(false);
      }
      setStep((s) => s + 1);
    } else {
      setStep((s) => s + 1);
    }
  };

  // Auto-detect country based on timezone on component mount
  useEffect(() => {
    const detectedCountry = detectCountryByTimezone();
    setSelectedCountry(detectedCountry);
  }, []);

  // Auto-focus input fields when step changes
  React.useEffect(() => {
    const timer = setTimeout(() => {
      const input = document.querySelector(
        'input[type="tel"], input[type="text"], input[type="date"], textarea'
      );
      if (input && input.focus) {
        input.focus();
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [step]);

  const handleFinalSubmit = async () => {
    const isSmallScreen = window.innerWidth <= 768;
    Confetti({
      particleCount: 200,
      spread: 70,
      origin: isSmallScreen ? { x: 0.5, y: 0.5 } : { x: 0.5, y: 0.6 },
    });

    setFinished(true);
    setStep(7);

    const englishHearAboutUs = form.hearAboutUs.map(v => hearAboutUsMap[v] || v);
    const englishJewelryCollections = form.jewelryCollections.map(v => jewelryCollectionsMap[v] || v);

    const getEnglishBranch = (branchName) => {
      if (!branchName) return "";
      const englishBranches = Object.values(BRANCHES_BY_COUNTRY).flatMap(b => b.en);
      if (englishBranches.includes(branchName.trim())) return branchName.trim();
      return branchMap[branchName.trim()] || branchName;
    };

    const englishBranch = getEnglishBranch(form.blueDiamondBranch);

    try {
      const scriptURL = `https://script.google.com/macros/s/${key}/exec`;
      const payload = {
        Timestamp: new Date().toLocaleString(),
        Phone: selectedCountry.dialCode + form.phone.replace(/\D/g, ''),
        CountryCode: selectedCountry.code,
        CountryName: selectedCountry.name,
        FullName: form.fullName,
        EmiratesId: form.emiratesId,
        DateOfBirth: form.dateOfBirth,
        HearAboutUs: englishHearAboutUs.length > 0 ? englishHearAboutUs.join(", ") : "",
        HearAboutUsOther: form.hearAboutUsOther || "",
        JewelryCollections: englishJewelryCollections.length > 0 ? englishJewelryCollections.join(", ") : "",
        JewelryCollectionsOther: form.jewelryCollectionsOther || "",
        BlueDiamondBranch: englishBranch || "",
        Feedback: form.feedback || "",
        Submitted: new Date().toLocaleString(),
        Language: language,
      };

      await fetch(scriptURL, {
        method: "POST",
        mode: "no-cors",
        body: new URLSearchParams(payload),
      });
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 w-full ${language === "ar" ? "font-arabic" : ""}`}>
            <h2
              className={`text-lg text-[#002E23] sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center ${language === "ar" ? "font-arabic" : ""}`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {t.phoneNumber}
            </h2>
            <div className={`space-y-2 sm:space-y-3 md:space-y-4 poppins-regular ${language === "ar" ? "font-arabic" : ""}`}>
              {/* Country Selector */}
              <div className="block">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-[#515151]">
                  {t.countryLabel}<span className="text-red-500">*</span>
                </span>
                <div className="relative mt-1">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="w-full p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base rounded-lg border border-gray-300 focus:ring-1 focus:ring-[#007056] focus:border-transparent transition-all bg-white flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{selectedCountry.flag}</span>
                      <span>{selectedCountry.dialCode}</span>
                      <span className="text-gray-600">| {language === 'ar' ? selectedCountry.nameAr : selectedCountry.name}</span>
                    </div>
                    <ChevronDown size={16} className={`transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showCountryDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowCountryDropdown(false)} />
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                        {COUNTRIES.map((country) => (
                          <button
                            key={country.code}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country);
                              setShowCountryDropdown(false);
                              if (form.phone) {
                                const isValid = validatePhoneNumber(form.phone, country);
                                setPhoneError(isValid ? '' : t.phoneValidationError);
                              }
                            }}
                            className={`w-full p-2 text-left hover:bg-gray-50 flex items-center gap-2 text-xs sm:text-sm ${selectedCountry.code === country.code ? 'bg-[#00916F]/10 text-[#00916F]' : ''
                              }`}
                          >
                            <span className="text-lg">{country.flag}</span>
                            <span className="font-mono">{country.dialCode}</span>
                            <span>{language === 'ar' ? country.nameAr : country.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Phone Number Input */}
              <div className="block">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-[#515151]">
                  {t.phoneNumberLabel}<span className="text-red-500">*</span>
                </span>
                <div className="relative mt-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    autoFocus
                    style={{ fontFamily: 'Montserrat, sans-serif' }}
                    className={`w-full pl-10 pr-3 py-2 sm:py-2.5 md:py-3 text-xs sm:text-sm md:text-base rounded-lg border transition-all ${phoneError ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                      }`}
                    placeholder={t.phoneFormatHint}
                    dir={language === "ar" ? "rtl" : "ltr"}
                  />
                </div>
                {phoneError && <p className="mt-1 text-xs text-red-600">{phoneError}</p>}
                <p className="mt-1 text-xs text-gray-500">{t.phoneFormatHint} ({selectedCountry.dialCode})</p>
              </div>
            </div>
            <div className={`flex gap-2 md:gap-4 mt-4 md:mt-6 w-full poppins-regular px-2 md:px-0 ${language === "ar" ? "font-arabic" : ""}`}>
              <button
                disabled={!form.phone || loading || phoneError || !validatePhoneNumber(form.phone, selectedCountry)}
                type="button"
                className="w-full bg-gradient-to-r from-[#00B389] via-[#007056] to-[#002E23] text-white py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg hover:from-[#002E23] hover:via-[#00382C] hover:to-[#002E23] transform hover:scale-105 transition-all ease-out duration-300 cursor-pointer font-semibold shadow-lg disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:text-gray-300 disabled:hover:from-gray-400 disabled:hover:via-gray-400 disabled:hover:to-gray-400 disabled:transform-none disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-none"
                onClick={handleNext}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    {t.loading}
                  </span>
                ) : t.next}
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 w-full ${language === "ar" ? "font-arabic" : ""}`}>
            <h2 className={`text-lg text-[#002E23] sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center ${language === "ar" ? "font-arabic" : ""}`} style={{ fontFamily: "Poppins, sans-serif" }}>
              {t.fullName}
            </h2>
            <div className={`space-y-2 sm:space-y-3 md:space-y-4 poppins-regular ${language === "ar" ? "font-arabic" : ""}`}>
              <div className="block">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-[#515151]">
                  {t.fullNameLabel}<span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                  autoFocus
                  className="w-full mt-1 p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t.fullNamePlaceholder}
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
            <div className={`flex gap-2 md:gap-4 mt-4 md:mt-6 w-full poppins-regular px-2 md:px-0 ${language === "ar" ? "font-arabic" : ""}`}>
              <button type="button" className="w-1/3 border border-[#002E23] text-[#002E23] py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 font-semibold" onClick={handleBack}>{t.back}</button>
              <button disabled={!form.fullName} type="button" className="w-2/3 bg-gradient-to-r from-[#00B389] via-[#007056] to-[#002E23] text-white py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg hover:from-[#002E23] hover: via-[#007056] hover:to-[#002E23] transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:text-gray-300 disabled:hover:from-gray-400 disabled:hover:via-gray-400 disabled:hover:to-gray-400 disabled:transform-none disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-none" onClick={handleNext}>{t.next}</button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 w-full ${language === "ar" ? "font-arabic" : ""}`}>
            <h2 className={`text-lg text-[#002E23] sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center ${language === "ar" ? "font-arabic" : ""}`} style={{ fontFamily: "Poppins, sans-serif" }}>
              {t.emiratesId}
            </h2>
            <div className={`space-y-2 sm:space-y-3 md:space-y-4 poppins-regular ${language === "ar" ? "font-arabic" : ""}`}>
              <div className="block">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-[#515151]">{t.emiratesIdLabel}</span>
                <input
                  type="text"
                  name="emiratesId"
                  value={form.emiratesId}
                  autoFocus
                  onChange={handleChange}
                  required
                  className="w-full mt-1 p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base rounded-lg border border-[#002E23] focus:ring-2 focus:ring-[#002E23] focus:border-[#002E23] transition-all"
                  placeholder={t.emiratesIdPlaceholder}
                  dir={language === "ar" ? "rtl" : "ltr"}
                />
              </div>
            </div>
            <div className={`flex gap-2 md:gap-4 mt-4 md:mt-6 w-full poppins-regular px-2 md:px-0 ${language === "ar" ? "font-arabic" : ""}`}>
              <button type="button" className="w-1/3 border border-[#002E23] text-[#002E23] py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 font-semibold" onClick={handleBack}>{t.back}</button>
              <button type="button" className="w-2/3 bg-gradient-to-r from-[#00B389] via-[#00382C] to-[#002E23] text-white py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg hover:from-[#002E23] hover:to-[#002E23] transform hover:scale-105 transition-all duration-300 font-semibold shadow-lg" onClick={handleNext}>{t.next}</button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 w-full ${language === "ar" ? "font-arabic" : ""}`}>
            <h2 className={`text-lg text-[#002E23] sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center ${language === "ar" ? "font-arabic" : ""}`} style={{ fontFamily: "Poppins, sans-serif" }}>
              {t.dateOfBirth}
            </h2>
            <div className={`space-y-2 sm:space-y-3 md:space-y-4 poppins-regular ${language === "ar" ? "font-arabic" : ""}`}>
              <div className="block">
                <span className="text-xs sm:text-sm md:text-base font-semibold text-[#515151]">
                  {t.dateOfBirthLabel}<span className="text-red-500">*</span>
                </span>
                <div className={`flex gap-2 mt-1 ${language === "ar" ? "flex-row-reverse" : ""}`}>
                  <div className="flex-1">
                    <input ref={dayInputRef} type="number" name="birthDay" value={form.birthDay} onChange={(e) => handleDateInputChange('birthDay', e.target.value, monthInputRef)} maxLength="2" autoFocus className="w-full p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center" placeholder={t.dayPlaceholder} dir="ltr" />
                  </div>
                  <div className="flex-1">
                    <input ref={monthInputRef} type="number" name="birthMonth" value={form.birthMonth} onChange={(e) => handleDateInputChange('birthMonth', e.target.value, yearInputRef)} maxLength="2" className="w-full p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center" placeholder={t.monthPlaceholder} dir="ltr" />
                  </div>
                </div>
                <p className="mt-1 text-xs text-gray-500 text-center">{language === "ar" ? "يوم / شهر" : "Day / Month"}</p>
              </div>
            </div>
            <div className={`flex gap-2 md:gap-4 mt-4 md:mt-6 w-full poppins-regular px-2 md:px-0 ${language === "ar" ? "font-arabic" : ""}`}>
              <button type="button" className="w-1/3 border border-[#002E23] text-[#002E23] py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 font-semibold" onClick={handleBack}>{t.back}</button>
              <button
                disabled={!form.birthDay || !form.birthMonth || parseInt(form.birthDay) < 1 || parseInt(form.birthDay) > 31 || parseInt(form.birthMonth) < 1 || parseInt(form.birthMonth) > 12}
                type="button"
                className="w-2/3 bg-gradient-to-r from-[#00B389] via-[#00382C] to-[#002E23] text-white py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg hover:from-[#002E23] hover:via-[#007056] hover:to-[#002E23] transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:text-gray-300 disabled:hover:from-gray-400 disabled:hover:via-gray-400 disabled:hover:to-gray-400 disabled:transform-none disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-none"
                onClick={handleNext}
              >{t.next}</button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 w-full ${language === "ar" ? "font-arabic" : ""}`}>
            <div className={`space-y-2 sm:space-y-3 md:space-y-4 poppins-regular ${language === "ar" ? "font-arabic" : ""}`}>
              <div className="block">
                <h2 className={`text-lg text-[#002E23] sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center ${language === "ar" ? "font-arabic" : ""}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                  {t.howHearAboutUs}<span className="text-red-500">*</span>
                  <br />
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-[#515151]">
                    <p style={{ fontSize: "12px" }}>{t.chooseMany}</p>
                  </span>
                </h2>
                <div className={`mt-3 space-y-2 ${language === "ar" ? "font-arabic" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
                  {t.hearAboutUsOptions.map((option) => (
                    <label key={option} className={`flex items-center gap-2 text-xs sm:text-sm md:text-base text-[#515151] ${language === "ar" ? "flex-row-reverse" : ""}`}>
                      <input type="checkbox" name="hearAboutUs" value={option} checked={form.hearAboutUs.includes(option)} onChange={handleChange} className="w-6 h-6 rounded border-gray-300 focus:ring-green-500 accent-green-600" />
                      <span>{option}</span>
                    </label>
                  ))}
                  {form.hearAboutUs.includes(language === "en" ? "Others" : "أخرى") && (
                    <input type="text" name="hearAboutUsOther" value={form.hearAboutUsOther} onChange={handleChange} autoFocus className="w-full mt-1 p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#002E23] focus:border-transparent transition-all" placeholder={t.specifyPlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                  )}
                </div>
              </div>
            </div>
            <div className={`flex gap-2 md:gap-4 mt-4 md:mt-6 w-full poppins-regular px-2 md:px-0 ${language === "ar" ? "font-arabic" : ""}`}>
              <button type="button" className="w-1/3 border border-[#002E23] text-[#002E23] py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 font-semibold" onClick={handleBack}>{t.back}</button>
              <button type="button" disabled={form.hearAboutUs.length === 0} className="w-2/3 bg-gradient-to-r from-[#00B389] via-[#00382C] to-[#002E23] text-white py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg hover:from-[#002E23] hover:via-[#007056] hover:to-[#002E23] transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:text-gray-300 disabled:hover:from-gray-400 disabled:hover:via-gray-400 disabled:hover:to-gray-400 disabled:transform-none disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-none" onClick={handleNext}>{t.next}</button>
            </div>
          </div>
        );

      case 5:
        return (
          <div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 w-full ${language === "ar" ? "font-arabic" : ""}`}>
            <div className={`space-y-2 sm:space-y-3 md:space-y-4 poppins-regular ${language === "ar" ? "font-arabic" : ""}`}>
              <div className="block">
                <h2 className={`text-lg text-[#002E23] sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center ${language === "ar" ? "font-arabic" : ""}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                  {t.jewelryCollections}<span className="text-red-500">*</span>
                  <br />
                  <span className={`text-xs sm:text-sm md:text-base font-semibold text-[#515151] ${language === "ar" ? "font-arabic" : ""}`}>
                    <p style={{ fontSize: "12px" }}>{t.chooseMany}</p>
                  </span>
                </h2>
                <div className={`mt-3 space-y-2 ${language === "ar" ? "font-arabic" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
                  {t.jewelryOptions.map((collection) => (
                    <label key={collection} className={`flex items-center gap-2 text-xs sm:text-sm md:text-base text-[#515151] ${language === "ar" ? "flex-row-reverse" : ""}`}>
                      <input type="checkbox" name="jewelryCollections" value={collection} autoFocus checked={form.jewelryCollections.includes(collection)} onChange={handleChange} className="w-6 h-6 rounded border-gray-300 focus:ring-green-500 accent-green-600" />
                      <span>{collection}</span>
                    </label>
                  ))}
                  {form.jewelryCollections.includes(language === "en" ? "Other" : "أخرى") && (
                    <input type="text" name="jewelryCollectionsOther" value={form.jewelryCollectionsOther} onChange={handleChange} autoFocus className="w-full mt-1 p-2 sm:p-2.5 md:p-3 text-xs sm:text-sm md:text-base rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#002E23] focus:border-transparent transition-all" placeholder={t.specifyJewelryPlaceholder} dir={language === "ar" ? "rtl" : "ltr"} />
                  )}
                </div>
              </div>
            </div>
            <div className={`flex gap-2 md:gap-4 mt-4 md:mt-6 w-full poppins-regular px-2 md:px-0 ${language === "ar" ? "font-arabic" : ""}`}>
              <button type="button" className="w-1/3 border border-[#002E23] text-[#002E23] py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 font-semibold" onClick={handleBack}>{t.back}</button>
              <button type="button" disabled={form.jewelryCollections.length === 0} className="w-2/3 bg-gradient-to-r from-[#00B389] via-[#00382C] to-[#002E23] text-white py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg hover:from-[#002E23] hover:via-[#007056] hover:to-[#002E23] transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:text-gray-300 disabled:hover:from-gray-400 disabled:hover:via-gray-400 disabled:hover:to-gray-400 disabled:transform-none disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-none" onClick={handleNext}>{t.next}</button>
            </div>
          </div>
        );

      case 6:
        return (
          <div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 w-full ${language === "ar" ? "font-arabic" : ""}`}>
            <div className={`space-y-2 sm:space-y-3 md:space-y-4 poppins-regular ${language === "ar" ? "font-arabic" : ""}`}>
              <div className="block">
                <h2 className={`text-lg text-[#002E23] sm:text-xl md:text-2xl lg:text-3xl mb-2 sm:mb-3 md:mb-4 text-center ${language === "ar" ? "font-arabic" : ""}`} style={{ fontFamily: "Poppins, sans-serif" }}>
                  {t.blueDiamondBranch}<span className="text-red-500">*</span>
                </h2>
                <div className={`mt-3 space-y-2 ${language === "ar" ? "font-arabic" : ""}`} dir={language === "ar" ? "rtl" : "ltr"}>
                  {getBranchesForCountry(selectedCountry.code, language).map((branch) => (
                    <label key={branch} className={`flex items-center gap-2 text-xs sm:text-sm md:text-base text-[#515151] ${language === "ar" ? "flex-row-reverse" : ""}`}>
                      <input type="radio" name="blueDiamondBranch" value={branch} checked={form.blueDiamondBranch === branch} autoFocus onChange={handleChange} className="w-6 h-6 border-gray-300 accent-green-600 focus:ring-green-500" />
                      <span>{branch}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className={`flex gap-2 md:gap-4 mt-4 md:mt-6 w-full poppins-regular px-2 md:px-0 ${language === "ar" ? "font-arabic" : ""}`}>
              <button type="button" className={`w-1/3 border border-[#002E23] text-[#002E23] py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg bg-white hover:bg-blue-50 transition-all duration-200 font-semibold ${language === "ar" ? "font-arabic" : ""}`} onClick={handleBack}>{t.back}</button>
              <button type="button" disabled={!form.blueDiamondBranch} className="w-2/3 bg-gradient-to-r from-[#00B389] via-[#00382C] to-[#002E23] text-white py-2 md:py-3 px-2 md:px-6 text-xs md:text-base rounded-lg hover:from-[#002E23] hover:via-[#007056] hover:to-[#002E23] transform hover:scale-105 transition-all duration-200 font-semibold shadow-lg disabled:from-gray-400 disabled:via-gray-400 disabled:to-gray-400 disabled:text-gray-300 disabled:hover:from-gray-400 disabled:hover:via-gray-400 disabled:hover:to-gray-400 disabled:transform-none disabled:hover:scale-100 disabled:cursor-not-allowed disabled:shadow-none" onClick={handleFinalSubmit}>{t.submit}</button>
            </div>
          </div>
        );

      case 7:
        return (
          <div className={`flex flex-col items-center justify-center h-full poppins-regular relative ${language === "ar" ? "font-arabic" : ""}`}>
            <div className="relative z-10 text-center">
              <div className="bg-[#F2EEE9] bg-opacity-90 backdrop-blur-sm p-4 sm:p-6 rounded-lg shadow-lg border border-[#F2EEE9]">
                <h2 className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-[#515151] ${language === "ar" ? "font-arabic" : ""}`}>{t.thankYou}</h2>
                <p className={`text-sm sm:text-base md:text-lg text-[#515151] mb-4 ${language === "ar" ? "font-arabic" : ""}`}>{t.successMessage}</p>
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                    <span className="text-white text-xl sm:text-2xl font-bold">✓</span>
                  </div>
                </div>
                <p className={`text-xs sm:text-sm text-[#666] italic ${language === "ar" ? "font-arabic" : ""}`}>{t.thankYouMessage}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Mapping between English and Arabic options
  const hearAboutUsMap = {
    "Instagram / snapchat": "انستقرام / سناب شات",
    "Regular customer": "عميل دائم",
    "Recommendation from friend": "توصية من صديق",
    "Exhibitions / Events": "المعارض / الفعاليات",
    Others: "أخرى",
    "انستقرام / سناب شات": "Instagram / snapchat",
    "عميل دائم": "Regular customer",
    "توصية من صديق": "Recommendation from friend",
    "المعارض / الفعاليات": "Exhibitions / Events",
    أخرى: "Others",
  };

  const jewelryCollectionsMap = {
    "Unique wedding set": "طقم زفاف فريد",
    "Tennis bracelets / earrings": "أساور / أقراط التنس",
    "Gold jewellery": "مجوهرات ذهبية",
    "Gifts below 15000": "هدايا تحت 15000",
    "Daily wear Diamond collections": "مجموعات الماس للاستخدام اليومي",
    "Gemstone collections": "مجموعات الأحجار الكريمة",
    Other: "أخرى",
    "طقم زفاف فريد": "Unique wedding set",
    "أساور / أقراط التنس": "Tennis bracelets / earrings",
    "مجوهرات ذهبية": "Gold jewellery",
    "هدايا تحت 15000": "Gifts below 15000",
    "مجموعات الماس للاستخدام اليومي": "Daily wear Diamond collections",
    "مجموعات الأحجار الكريمة": "Gemstone collections",
    أخرى: "Other",
  };

  const branchMap = {
    "Place Vendome": "بليس فيندوم",
    "Festival City": "فيستيفال سيتي",
    "Asjad Exhibition": "معرض أسجاد",
    "Doha Watches and Jewellery Exhibition": "معرض الدوحة للساعات والمجوهرات",
    "بليس فيندوم": "Place Vendome",
    "فيستيفال سيتي": "Festival City",
    "معرض أسجاد": "Asjad Exhibition",
    "معرض الدوحة للساعات والمجوهرات": "Doha Watches and Jewellery Exhibition",
    "Watch& Jewellery Middle east show": "معرض الساعات والمجوهرات الشرق الأوسط",
    "Jewellery & Watch Show": "معرض المجوهرات والساعات",
    "معرض الساعات والمجوهرات الشرق الأوسط": "Watch& Jewellery Middle east show",
    "معرض المجوهرات والساعات": "Jewellery & Watch Show",
    "Qerat Jewellery Lounge": "صالة قيراط للمجوهرات",
    "Gold & Jewellery Exhibition- Mishref": "معرض الذهب والمجوهرات - مشرف",
    "صالة قيراط للمجوهرات": "Qerat Jewellery Lounge",
    "معرض الذهب والمجوهرات - مشرف": "Gold & Jewellery Exhibition- Mishref",
    "Jewellery Arabia Bahrain": "معرض مجوهرات العرب البحرين",
    "معرض مجوهرات العرب البحرين": "Jewellery Arabia Bahrain",
    "Jewels Of The World": "جواهر العالم",
    "جواهر العالم": "Jewels Of The World",
    "MIJEX": "ميجكس",
    "ميجكس": "MIJEX",
  };

  // Sync selected values on language change
  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      hearAboutUs: prev.hearAboutUs.map((v) => hearAboutUsMap[v] || v),
      jewelryCollections: prev.jewelryCollections.map((v) => jewelryCollectionsMap[v] || v),
      blueDiamondBranch: prev.blueDiamondBranch ? (branchMap[prev.blueDiamondBranch] || prev.blueDiamondBranch) : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center p-2 sm:p-4 md:p-8 ${language === "ar" ? "font-arabic" : ""}`}
      style={{
        background: "linear-gradient(135deg, #F2EEE9 0%, #D9CDBE 50%, #C0AC93 100%)",
        direction: language === "ar" ? "rtl" : "ltr",
        position: "relative",
      }}
    >
      {/* Watermark Logo */}
      <div
        className="fixed inset-0 flex items-center justify-center pointer-events-none z-0"
        style={{
          backgroundImage: 'url("/images/bludiamond-watermark.svg")',
          backgroundSize: "35% auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          opacity: 0.03,
        }}
      ></div>

      {/* Language Selector */}
      <div className={`fixed z-50 ${language === "ar" ? "font-arabic" : ""}`} style={{ top: 24, right: 24 }}>
        <div className="relative">
          <button
            onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
            className="flex items-center gap-3 px-5 py-3 bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-xl hover:shadow-2xl text-sm font-semibold text-[#002E23] hover:text-[#002E23] hover:bg-opacity-100 transition-all duration-300 min-w-[140px] group"
          >
            <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-r from-[#002E23] to-[#007056] rounded-full">
              <Globe size={14} className="text-white" />
            </div>
            <span className="font-semibold">{language === "en" ? "EN" : "عر"}</span>
            <ChevronDown size={16} className={`transition-transform duration-200 ${showLanguageDropdown ? "rotate-180" : ""} group-hover:text-blue-600`} />
          </button>

          {showLanguageDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowLanguageDropdown(false)} />
              <div
                className="absolute top-full mt-3 bg-white rounded-2xl border border-blue-100 shadow-2xl overflow-hidden min-w-[220px] z-50 backdrop-blur-sm"
                style={{ right: language === "ar" ? 0 : "auto", left: language === "ar" ? "auto" : 0 }}
              >
                <div className="p-1">
                  {["en", "ar"].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => { setLanguage(lang); setShowLanguageDropdown(false); }}
                      className={`w-full px-4 py-3 text-left text-sm rounded-lg transition-all duration-150 flex items-center gap-3 ${language === lang
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-[#002E23] font-semibold border border-blue-200"
                        : "hover:bg-gray-50 text-[#002E23]"
                        }`}
                    >
                      <div className="w-4 h-4 rounded-full bg-[#002E23] flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#002E23]"></div>
                      </div>
                      {lang === "en" ? t.english : t.arabic}
                      {language === lang && <div className="ml-auto"><div className="w-2 h-2 rounded-full bg-[#002E23]"></div></div>}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main container */}
      <div
        style={{ position: "relative", zIndex: 10 }}
        className={`bg-white shadow-2xl p-4 sm:p-6 md:p-8 lg:p-10 rounded-2xl flex flex-col gap-4 sm:gap-6 md:gap-8 w-[95%] sm:w-[85%] md:w-[75%] lg:w-[65%] xl:w-[55%] max-w-2xl border border-gray-100 ${language === "ar" ? "font-arabic" : ""}`}
      >
        {/* Logo */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <img
            src="/images/bijouq-logo.svg"
            alt="Bijouq Jewellery Logo"
            className="h-16 sm:h-20 md:h-24 lg:h-28 w-auto object-contain transition-all duration-300 hover:scale-105"
          />
        </div>

        {/* Progress indicator */}
        {step < 7 && (
          <div className={`mb-6 sm:mb-8 poppins-regular ${language === "ar" ? "font-arabic" : ""}`}>
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-600">{t.step} {step + 1} {t.of} 7</span>
              <span className="text-sm font-medium text-[#002E23]">{Math.round(((step + 1) / 7) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 shadow-inner">
              <div
                className="bg-gradient-to-r from-[#00B389] via-[#007056] to-[#002E23] h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                style={{ width: `${((step + 1) / 7) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        {step >= 1 && !finished && (
          <button
            className="absolute top-4 bg-blue-50 hover:bg-blue-100 text-blue-700 p-3 rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-blue-200"
            style={{ left: language === "ar" ? "auto" : "1rem", right: language === "ar" ? "1rem" : "auto" }}
            onClick={handleBack}
          >
            <ChevronLeft className="w-5 h-5" style={{ transform: language === "ar" ? "rotate(180deg)" : "none" }} />
          </button>
        )}

        {renderStep()}
      </div>
    </div>
  );
}

export default Form;