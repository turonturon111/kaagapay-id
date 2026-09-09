import React, { useState, useEffect } from 'react';
import { TabType, BottomNavBar } from './components/BottomNavBar';
import { TopAppBar } from './components/TopAppBar';
import { HomeTab } from './components/HomeTab';
import { MyIDTab } from './components/MyIDTab';
import { HistoryTab } from './components/HistoryTab';
import { ProfileTab } from './components/ProfileTab';
import { LoginScreen } from './components/LoginScreen';
import { SplashScreen } from './components/SplashScreen';
import { EmergencyModal } from './components/EmergencyModal';
import { NearbyStoresModal } from './components/NearbyStoresModal';
import { AccessibilityModal } from './components/AccessibilityModal';
import { NotificationsModal } from './components/NotificationsModal';
import { AddTransactionModal } from './components/AddTransactionModal';
import { EditTransactionModal } from './components/EditTransactionModal';
import { EditProfileModal } from './components/EditProfileModal';
import { RegisterModal } from './components/RegisterModal';
import { AvatarUploadModal } from './components/AvatarUploadModal';
import { UserAccount, loadStoredAccounts, saveStoredAccounts } from './utils/auth';

// Screens & Views
import { MedicineTrackerScreen } from './components/MedicineTrackerScreen';
import { AppointmentsScreen } from './components/AppointmentsScreen';
import { BenefitsGuideScreen } from './components/BenefitsGuideScreen';
import { DiscountCalculatorScreen } from './components/DiscountCalculatorScreen';
import { AssistanceUpdatesScreen } from './components/AssistanceUpdatesScreen';
import { CashierVerifierView } from './components/CashierVerifierView';

import {
  initialProfile,
  initialTransactions,
  mockNearbyStores,
  initialNotifications,
  initialMedicinePurchases,
  initialAppointments,
  mockBenefitsList,
  initialAssistanceUpdates,
  initialVerificationLogs,
} from './mockData';

import {
  UserProfile,
  Transaction,
  NearbyStore,
  NotificationItem,
  AccessibilitySettings,
  MedicinePurchase,
  Appointment,
  AppRole,
  VerificationLog,
} from './types';

import { speakText, getElementSpeechText, triggerHapticFeedback } from './utils/audioAndTTS';
import { Language } from './utils/translations';

export type SubScreenType = 'medicines' | 'appointments' | 'benefits' | 'calculator' | 'updates' | null;

// LocalStorage Persistence Helpers
const loadLocal = <T,>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (!saved || saved === 'undefined' || saved === 'null') return fallback;
    const parsed = JSON.parse(saved);
    if (parsed === null || parsed === undefined) return fallback;
    if (typeof fallback === 'object' && fallback !== null && !Array.isArray(fallback)) {
      return { ...fallback, ...parsed };
    }
    return parsed;
  } catch (e) {
    console.error(`Failed to load ${key} from localStorage:`, e);
    return fallback;
  }
};

const saveLocal = <T,>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to localStorage:`, e);
  }
};

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [subScreen, setSubScreen] = useState<SubScreenType>(null);
  const [language, setLanguage] = useState<Language>('en');

  // Role Switcher State ('user' = Citizen, 'verifier' = Cashier/Auditor)
  const [appRole, setAppRole] = useState<AppRole>(() => loadLocal<AppRole>('kaagapay_app_role', 'user'));

  // Persistent CRUD App States
  const [profile, setProfile] = useState<UserProfile>(() => loadLocal<UserProfile>('kaagapay_profile', initialProfile));
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadLocal<Transaction[]>('kaagapay_transactions', initialTransactions));
  const [stores] = useState<NearbyStore[]>(mockNearbyStores);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => loadLocal<NotificationItem[]>('kaagapay_notifications', initialNotifications));
  const [medicinePurchases, setMedicinePurchases] = useState<MedicinePurchase[]>(() => loadLocal<MedicinePurchase[]>('kaagapay_medicines', initialMedicinePurchases));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadLocal<Appointment[]>('kaagapay_appointments', initialAppointments));
  const [verificationLogs, setVerificationLogs] = useState<VerificationLog[]>(() => loadLocal<VerificationLog[]>('kaagapay_verification_logs', initialVerificationLogs));
  const [benefits] = useState(mockBenefitsList);
  const [assistanceUpdates] = useState(initialAssistanceUpdates);

  // Persistent Accessibility Settings State
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(() =>
    loadLocal<AccessibilitySettings>('kaagapay_accessibility_settings', {
      fontSize: 'normal',
      highContrast: false,
      colorVisionMode: 'standard',
      voiceReaderEnabled: false,
      soundAlerts: true,
      hapticFeedback: true,
    })
  );

  // Modal Visibility States
  const [isEmergencyOpen, setIsEmergencyOpen] = useState(false);
  const [isNearbyStoresOpen, setIsNearbyStoresOpen] = useState(false);
  const [isAccessibilityOpen, setIsAccessibilityOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddTxOpen, setIsAddTxOpen] = useState(false);
  const [isEditTxOpen, setIsEditTxOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Registered Accounts State with Persistence
  const [registeredAccounts, setRegisteredAccounts] = useState<UserAccount[]>(loadStoredAccounts);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    if (accessibilitySettings.voiceReaderEnabled) {
      speakText(message, language);
    }
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Sync state changes with localStorage
  useEffect(() => {
    saveLocal('kaagapay_app_role', appRole);
  }, [appRole]);

  useEffect(() => {
    saveLocal('kaagapay_profile', profile);
  }, [profile]);

  useEffect(() => {
    saveLocal('kaagapay_transactions', transactions);
  }, [transactions]);

  useEffect(() => {
    saveLocal('kaagapay_notifications', notifications);
  }, [notifications]);

  useEffect(() => {
    saveLocal('kaagapay_medicines', medicinePurchases);
  }, [medicinePurchases]);

  useEffect(() => {
    saveLocal('kaagapay_appointments', appointments);
  }, [appointments]);

  useEffect(() => {
    saveLocal('kaagapay_verification_logs', verificationLogs);
  }, [verificationLogs]);

  useEffect(() => {
    saveLocal('kaagapay_accessibility_settings', accessibilitySettings);
  }, [accessibilitySettings]);

  // Sync Accessibility Settings with HTML Document
  useEffect(() => {
    const root = document.documentElement;
    // Sync Font Scaling (5-point scale)
    root.classList.remove('font-scale-compact', 'font-scale-normal', 'font-scale-large', 'font-scale-xlarge', 'font-scale-huge');
    if (accessibilitySettings.fontSize === 'compact') {
      root.classList.add('font-scale-compact');
    } else if (accessibilitySettings.fontSize === 'large') {
      root.classList.add('font-scale-large');
    } else if (accessibilitySettings.fontSize === 'xlarge') {
      root.classList.add('font-scale-xlarge');
    } else if (accessibilitySettings.fontSize === 'huge') {
      root.classList.add('font-scale-huge');
    } else {
      root.classList.add('font-scale-normal');
    }

    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (accessibilitySettings.largeTouchTargets) {
      root.classList.add('large-touch-targets');
    } else {
      root.classList.remove('large-touch-targets');
    }

    // Color Vision & Senior Eye Clarity Filter Modes
    root.classList.remove('cvd-senior-clarity', 'cvd-deuteranopia', 'cvd-tritanopia', 'cvd-achromatopsia');
    if (accessibilitySettings.colorVisionMode === 'senior-clarity') {
      root.classList.add('cvd-senior-clarity');
    } else if (accessibilitySettings.colorVisionMode === 'deuteranopia') {
      root.classList.add('cvd-deuteranopia');
    } else if (accessibilitySettings.colorVisionMode === 'tritanopia') {
      root.classList.add('cvd-tritanopia');
    } else if (accessibilitySettings.colorVisionMode === 'achromatopsia') {
      root.classList.add('cvd-achromatopsia');
    }
  }, [accessibilitySettings]);

  // Global Click Listener: Handles Voice Reader speech and tactile haptics on mobile interaction
  useEffect(() => {
    const handleGlobalClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      // Find the closest interactive or descriptive element
      const interactive = target.closest<HTMLElement>(
        'button, a, input, select, textarea, [role="button"], [role="tab"], [role="switch"], [role="checkbox"], [data-voice], .clickable-card, label, summary, [tabindex="0"]'
      );

      if (interactive) {
        if (accessibilitySettings.hapticFeedback) {
          triggerHapticFeedback(25);
        }

        if (accessibilitySettings.voiceReaderEnabled) {
          const textToSpeak = getElementSpeechText(interactive, language);
          if (textToSpeak && textToSpeak.trim()) {
            speakText(textToSpeak, language);
          }
        }
      }
    };

    window.addEventListener('click', handleGlobalClick, { capture: true });
    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
    };
  }, [accessibilitySettings.voiceReaderEnabled, accessibilitySettings.hapticFeedback, language]);

  // Tab change handler with voice assistance
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSubScreen(null);
    if (accessibilitySettings.voiceReaderEnabled) {
      const labels: Record<TabType, { en: string; tl: string }> = {
        home: { en: 'Home Screen', tl: 'Pangunahing Screen' },
        id: { en: 'My Digital ID Screen', tl: 'Aking Digital ID Screen' },
        history: { en: 'Transaction History Screen', tl: 'Kasaysayan ng Transaksyon' },
        profile: { en: 'Profile and Settings Screen', tl: 'Profile at mga Setting' },
      };
      speakText(labels[tab][language] || labels[tab].en, language);
    }
  };

  // Toggle Role between Citizen (User) and Cashier/Auditor (Verifier)
  const handleToggleRole = () => {
    setAppRole((prev) => {
      const nextRole: AppRole = prev === 'user' ? 'verifier' : 'user';
      showToast(
        nextRole === 'verifier'
          ? 'Switched to Cashier / Merchant Verifier Mode'
          : 'Switched to Senior / PWD Citizen Mode'
      );
      return nextRole;
    });
  };

  // -------------------------------------------------------------
  // MEDICINE PURCHASES CRUD
  // -------------------------------------------------------------
  const handleAddMedicinePurchase = (newMed: Omit<MedicinePurchase, 'id'>) => {
    const created: MedicinePurchase = {
      ...newMed,
      id: `med_${Date.now()}`,
    };
    setMedicinePurchases((prev) => [created, ...prev]);

    // Sync to transactions list
    const tx: Transaction = {
      id: `tx_${Date.now()}`,
      storeName: created.pharmacyName,
      category: 'pharmacy',
      amountSaved: created.discountReceived,
      originalPaid: created.amountPaid,
      date: created.purchaseDate,
      time: 'Just now',
      timestamp: Date.now(),
      notes: created.medicineName,
    };
    setTransactions((prev) => [tx, ...prev]);
    showToast(`Logged medicine purchase! Saved ₱${created.discountReceived.toFixed(2)}`);
  };

  const handleEditMedicinePurchase = (updated: MedicinePurchase) => {
    setMedicinePurchases((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
    showToast(`Updated medicine record for ${updated.medicineName}`);
  };

  const handleDeleteMedicinePurchase = (id: string) => {
    setMedicinePurchases((prev) => prev.filter((m) => m.id !== id));
  };

  // -------------------------------------------------------------
  // APPOINTMENTS CRUD
  // -------------------------------------------------------------
  const handleAddAppointment = (newApp: Omit<Appointment, 'id'>) => {
    const created: Appointment = {
      ...newApp,
      id: `app_${Date.now()}`,
    };
    setAppointments((prev) => [created, ...prev]);
    showToast(`Appointment scheduled at ${created.hospitalName}`);
  };

  const handleEditAppointment = (updated: Appointment) => {
    setAppointments((prev) => prev.map((app) => (app.id === updated.id ? updated : app)));
    showToast(`Updated appointment at ${updated.hospitalName}`);
  };

  const handleDeleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((app) => app.id !== id));
    showToast('Deleted appointment record');
  };

  const handleToggleReminder = (id: string) => {
    setAppointments((prev) =>
      prev.map((app) => {
        if (app.id === id) {
          const nextStatus = app.reminderStatus === 'Active' ? 'Muted' : 'Active';
          showToast(`Reminder ${nextStatus === 'Active' ? 'activated' : 'muted'} for ${app.hospitalName}`);
          return { ...app, reminderStatus: nextStatus };
        }
        return app;
      })
    );
  };

  // -------------------------------------------------------------
  // TRANSACTIONS CRUD
  // -------------------------------------------------------------
  const handleAddTransaction = (newTx: Omit<Transaction, 'id' | 'timestamp'>) => {
    const created: Transaction = {
      ...newTx,
      id: `tx_${Date.now()}`,
      timestamp: Date.now(),
    };
    setTransactions((prev) => [created, ...prev]);

    const notif: NotificationItem = {
      id: `nt_${Date.now()}`,
      title: `Discount Applied at ${created.storeName}`,
      message: `Saved ₱${created.amountSaved.toFixed(2)} on your purchase.`,
      time: 'Just now',
      read: false,
      type: 'discount',
    };
    setNotifications((prev) => [notif, ...prev]);
    showToast(`Saved ₱${created.amountSaved.toFixed(2)} at ${created.storeName}!`);
  };

  const handleEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsEditTxOpen(true);
  };

  const handleSaveEditedTransaction = (updated: Transaction) => {
    setTransactions((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    showToast(`Updated transaction record for ${updated.storeName}`);
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    showToast(`Deleted transaction log for ${target ? target.storeName : 'record'}`);
  };

  const handleClearAllTransactions = () => {
    setTransactions([]);
    showToast('All transaction logs have been cleared');
  };

  // -------------------------------------------------------------
  // VERIFICATION LOGS CRUD (Cashier / Verifier)
  // -------------------------------------------------------------
  const handleAddVerificationLog = (log: Omit<VerificationLog, 'id' | 'timestamp'>) => {
    const newLog: VerificationLog = {
      ...log,
      id: `vlog_${Date.now()}`,
      timestamp: Date.now(),
    };
    setVerificationLogs((prev) => [newLog, ...prev]);
  };

  const handleDeleteVerificationLog = (id: string) => {
    setVerificationLogs((prev) => prev.filter((l) => l.id !== id));
    showToast('Removed audit verification entry');
  };

  const handleClearVerificationLogs = () => {
    setVerificationLogs([]);
    showToast('Cleared all verification audit logs');
  };

  // Toggle Senior vs PWD ID Type
  const handleToggleIDType = () => {
    setProfile((prev) => {
      const newType = prev.idType === 'senior' ? 'pwd' : 'senior';
      const newNumber = newType === 'senior' ? 'SC-2024-008912' : 'PWD-2024-041920';
      const typeLabel = newType === 'senior' ? 'Senior Citizen ID' : 'PWD Digital ID';
      showToast(`Switched to ${typeLabel}`);
      return {
        ...prev,
        idType: newType,
        idNumber: newNumber,
      };
    });
  };

  // Login action with profile loading
  const handleLoginSuccess = (loggedInProfile: UserProfile) => {
    const safeProfile = { ...initialProfile, ...(loggedInProfile || {}) };
    setProfile(safeProfile);
    setIsLoggedIn(true);
    const firstName = (safeProfile.name || 'Kabayan').trim().split(' ')[0];
    showToast(`Welcome back, ${firstName}!`);
  };

  // Register action with persistence
  const handleRegisterSuccess = (newAccount: UserAccount) => {
    const updated = [newAccount, ...registeredAccounts];
    setRegisteredAccounts(updated);
    saveStoredAccounts(updated);
    const safeProfile = { ...initialProfile, ...(newAccount?.profile || {}) };
    setProfile(safeProfile);
    setIsLoggedIn(true);
    const firstName = (safeProfile.name || 'Kabayan').trim().split(' ')[0];
    showToast(`Registration successful! Welcome, ${firstName}!`);
  };

  // Get TopAppBar Title
  const getTopAppBarTitle = () => {
    if (appRole === 'verifier') return 'Cashier Verifier';
    if (subScreen === 'medicines') return 'Medicine Tracker';
    if (subScreen === 'appointments') return 'Medical Appointments';
    if (subScreen === 'benefits') return 'Benefits Guide';
    if (subScreen === 'calculator') return 'Discount Calculator';
    if (subScreen === 'updates') return 'Assistance Updates';

    if (activeTab === 'home') return 'KaagapayID';
    if (activeTab === 'id') return 'KaagapayID';
    if (activeTab === 'history') return 'History';
    return 'KaagapayID';
  };

  // Render Splash Screen initially on launch
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // If user is logged out, render the Login Screen and Register Modal
  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenRegister={() => setIsRegisterOpen(true)}
          onForgotPassword={() => {
            showToast('Password reset link sent to your registered mobile number.');
          }}
          registeredAccounts={registeredAccounts}
        />
        <RegisterModal
          isOpen={isRegisterOpen}
          onClose={() => setIsRegisterOpen(false)}
          onRegisterSuccess={handleRegisterSuccess}
          registeredAccounts={registeredAccounts}
        />
        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-emerald-950 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-emerald-400/50">
            <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="font-bold text-xs sm:text-sm text-white text-center leading-tight break-words">
              {toastMessage}
            </span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-[#181c20] flex justify-center font-sans relative selection:bg-emerald-100">
      {/* W3C Mobile & Keyboard Skip Link */}
      <a href="#main-content" className="skip-link">
        {language === 'tl' ? 'Lumaktaw sa Pangunahing Nilalaman' : 'Skip to main content'}
      </a>

      <div className="w-full max-w-md mx-auto bg-[#f8fafc] min-h-[100dvh] flex flex-col relative pb-16">
        {/* Top App Header */}
        <TopAppBar
          title={getTopAppBarTitle()}
          showBack={appRole === 'verifier' ? true : subScreen !== null || activeTab !== 'home'}
          onBack={() => {
            if (appRole === 'verifier') {
              setAppRole('user');
            } else if (subScreen !== null) {
              setSubScreen(null);
            } else {
              setActiveTab('home');
            }
          }}
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAccessibility={() => setIsAccessibilityOpen(true)}
          language={language}
          onToggleLanguage={() => setLanguage((prev) => (prev === 'en' ? 'tl' : 'en'))}
          appRole={appRole}
          onToggleRole={handleToggleRole}
        />

        {/* Main Tab / Subscreen / Cashier Canvas */}
        <main id="main-content" tabIndex={-1} className="flex-1 w-full overflow-y-auto outline-none">
          {/* 1. Cashier & Verifier Role View */}
          {appRole === 'verifier' && (
            <CashierVerifierView
              currentProfile={profile}
              verificationLogs={verificationLogs}
              onAddVerificationLog={handleAddVerificationLog}
              onDeleteVerificationLog={handleDeleteVerificationLog}
              onClearVerificationLogs={handleClearVerificationLogs}
              onSwitchToUserRole={() => setAppRole('user')}
              onShowToast={showToast}
              language={language}
            />
          )}

          {/* 2. Citizen Subscreens */}
          {appRole === 'user' && subScreen === 'medicines' && (
            <MedicineTrackerScreen
              purchases={medicinePurchases}
              onAddPurchase={handleAddMedicinePurchase}
              onEditPurchase={handleEditMedicinePurchase}
              onDeletePurchase={handleDeleteMedicinePurchase}
              onShowToast={showToast}
              language={language}
            />
          )}

          {appRole === 'user' && subScreen === 'appointments' && (
            <AppointmentsScreen
              appointments={appointments}
              onAddAppointment={handleAddAppointment}
              onEditAppointment={handleEditAppointment}
              onDeleteAppointment={handleDeleteAppointment}
              onToggleReminder={handleToggleReminder}
              onShowToast={showToast}
              language={language}
            />
          )}

          {appRole === 'user' && subScreen === 'benefits' && (
            <BenefitsGuideScreen
              benefits={benefits}
              language={language}
            />
          )}

          {appRole === 'user' && subScreen === 'calculator' && (
            <DiscountCalculatorScreen
              onShowToast={showToast}
              language={language}
            />
          )}

          {appRole === 'user' && subScreen === 'updates' && (
            <AssistanceUpdatesScreen
              updates={assistanceUpdates}
              onShowToast={showToast}
              language={language}
            />
          )}

          {/* 3. Citizen Primary Tabs */}
          {appRole === 'user' && subScreen === null && activeTab === 'home' && (
            <HomeTab
              profile={profile}
              transactions={transactions}
              language={language}
              onNavigateToID={() => handleTabChange('id')}
              onNavigateToHistory={() => handleTabChange('history')}
              onOpenNearbyStores={() => setIsNearbyStoresOpen(true)}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
              onNavigateToMedicines={() => setSubScreen('medicines')}
              onNavigateToAppointments={() => setSubScreen('appointments')}
              onNavigateToBenefits={() => setSubScreen('benefits')}
              onNavigateToCalculator={() => setSubScreen('calculator')}
              onNavigateToUpdates={() => setSubScreen('updates')}
              onSelectUpdateBanner={() => setSubScreen('updates')}
            />
          )}

          {appRole === 'user' && subScreen === null && activeTab === 'id' && (
            <MyIDTab
              profile={profile}
              language={language}
              onToggleIDType={handleToggleIDType}
              onShowToast={showToast}
            />
          )}

          {appRole === 'user' && subScreen === null && activeTab === 'history' && (
            <HistoryTab
              transactions={transactions}
              language={language}
              onOpenAddTransaction={() => setIsAddTxOpen(true)}
              onEditTransaction={handleEditTransaction}
              onDeleteTransaction={handleDeleteTransaction}
              onClearAllTransactions={handleClearAllTransactions}
              onSelectTransaction={(tx) => {
                showToast(`${tx.storeName}: Saved ₱${tx.amountSaved.toFixed(2)} on ${tx.date}`);
              }}
            />
          )}

          {appRole === 'user' && subScreen === null && activeTab === 'profile' && (
            <ProfileTab
              profile={profile}
              accessibilitySettings={accessibilitySettings}
              language={language}
              onOpenAccessibility={() => setIsAccessibilityOpen(true)}
              onEditPersonalInfo={() => setIsEditProfileOpen(true)}
              onOpenHelp={() => setIsEmergencyOpen(true)}
              onOpenEmergency={() => setIsEmergencyOpen(true)}
              onLogout={() => {
                setIsLoggedIn(false);
                setActiveTab('home');
                setSubScreen(null);
                setAppRole('user');
                showToast('Logged out of KaagapayID');
              }}
              onUpdateAvatar={() => setIsAvatarModalOpen(true)}
            />
          )}
        </main>

        {/* Bottom Navigation (Shown in Citizen Mode) */}
        {appRole === 'user' && (
          <BottomNavBar activeTab={activeTab} onTabChange={handleTabChange} language={language} />
        )}

        {/* Interactive Modals */}
        <EmergencyModal
          isOpen={isEmergencyOpen}
          onClose={() => setIsEmergencyOpen(false)}
          emergencyContactName={profile.emergencyContactName}
          emergencyContactPhone={profile.emergencyContactPhone}
        />

        <NearbyStoresModal
          isOpen={isNearbyStoresOpen}
          onClose={() => setIsNearbyStoresOpen(false)}
          stores={stores}
          onPresentIDAtStore={(st) => {
            setIsNearbyStoresOpen(false);
            handleTabChange('id');
            showToast(`Presenting KaagapayID at ${st.name}`);
          }}
        />

        <AccessibilityModal
          isOpen={isAccessibilityOpen}
          onClose={() => setIsAccessibilityOpen(false)}
          settings={accessibilitySettings}
          onUpdateSettings={(newSettings) => {
            setAccessibilitySettings((prev) => ({ ...prev, ...newSettings }));
            showToast('Accessibility settings updated');
          }}
          language={language}
        />

        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={() => {
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
            showToast('All notifications marked as read');
          }}
          onClearNotifications={() => {
            setNotifications([]);
            showToast('Notifications cleared');
          }}
        />

        <AddTransactionModal
          isOpen={isAddTxOpen}
          onClose={() => setIsAddTxOpen(false)}
          onAddTransaction={handleAddTransaction}
        />

        <EditTransactionModal
          isOpen={isEditTxOpen}
          onClose={() => {
            setIsEditTxOpen(false);
            setEditingTransaction(null);
          }}
          transaction={editingTransaction}
          onSaveTransaction={handleSaveEditedTransaction}
          language={language}
        />

        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          profile={profile}
          onSaveProfile={(updated) => {
            setProfile((prev) => {
              const newProf = { ...prev, ...updated };
              const updatedAccounts = registeredAccounts.map((acc) => {
                if (acc.profile.idNumber === newProf.idNumber || acc.emailOrMobile === newProf.mobile) {
                  return { ...acc, profile: newProf };
                }
                return acc;
              });
              setRegisteredAccounts(updatedAccounts);
              saveStoredAccounts(updatedAccounts);
              return newProf;
            });
            showToast(language === 'tl' ? 'Na-update ang impormasyon ng profile!' : 'Personal information updated!');
          }}
        />

        <AvatarUploadModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
          currentPhotoUrl={profile.photoUrl}
          language={language}
          onSavePhoto={(newPhotoUrl) => {
            setProfile((prev) => {
              const updated = { ...prev, photoUrl: newPhotoUrl };
              const updatedAccounts = registeredAccounts.map((acc) => {
                if (acc.profile.idNumber === updated.idNumber || acc.emailOrMobile === updated.mobile) {
                  return { ...acc, profile: updated };
                }
                return acc;
              });
              setRegisteredAccounts(updatedAccounts);
              saveStoredAccounts(updatedAccounts);
              return updated;
            });
            showToast(language === 'tl' ? 'Matagumpay na napalitan ang larawan ng profile!' : 'Profile picture updated successfully!');
          }}
        />

        {/* Toast Notification Micro-interaction */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            aria-atomic="true"
            className="fixed bottom-[84px] sm:bottom-[92px] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-emerald-950 text-white px-4 sm:px-5 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2.5 animate-in fade-in slide-in-from-bottom-4 duration-300 border border-emerald-400/50"
          >
            <span className="material-symbols-outlined text-emerald-400 text-[20px] shrink-0" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
            <span className="font-bold text-xs sm:text-sm text-white text-center leading-tight break-words">
              {toastMessage}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
