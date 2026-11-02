import React, { useEffect } from 'react';
import { useFarmStore } from './store/useFarmStore';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { NotificationsModal } from './components/common/NotificationsModal';
import { ExhibitionGuideModal } from './components/common/ExhibitionGuideModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { AIAssistantPage } from './pages/AIAssistantPage';
import { CropDisease } from './pages/CropDisease';
import { IrrigationControl } from './pages/IrrigationControl';
import { SensorMonitoring } from './pages/SensorMonitoring';
import { CropCalendarPage } from './pages/CropCalendarPage';
import { MandiPricesPage } from './pages/MandiPricesPage';
import { WeatherPage } from './pages/WeatherPage';
import { VoiceAssistant } from './pages/VoiceAssistant';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { activeTab, simulateSensorTick } = useFarmStore();

  useEffect(() => {
    const interval = setInterval(() => {
      simulateSensorTick();
    }, 3000);
    return () => clearInterval(interval);
  }, [simulateSensorTick]);

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'assistant':
        return <AIAssistantPage />;
      case 'disease':
        return <CropDisease />;
      case 'irrigation':
        return <IrrigationControl />;
      case 'sensors':
        return <SensorMonitoring />;
      case 'calendar':
        return <CropCalendarPage />;
      case 'market':
        return <MandiPricesPage />;
      case 'weather':
        return <WeatherPage />;
      case 'voice':
        return <VoiceAssistant />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* Top Navbar */}
      <Header />

      {/* Main Layout Area */}
      <div className="flex-1 w-full flex">
        
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 min-w-0 overflow-y-auto max-w-[1600px]">
          {renderActiveTab()}
        </main>

      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav />

      {/* Alerts and Announcements Drawer */}
      <NotificationsModal />

      {/* Science Fair Model Rig Transparency Guide */}
      <ExhibitionGuideModal />

    </div>
  );
};

export default App;
