import { createFileRoute } from '@tanstack/react-router';
import { TradingCalculatorWidget } from '../components/trading/TradingCalculatorWidget';
import { MemoryManager } from '../components/brain/MemoryManager';

export const Route = createFileRoute('/control-panel')({
  component: ControlPanel,
});

function ControlPanel() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-12 overflow-y-auto" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
        
        <header className="mb-10">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-blue-500 inline-block">
            واجهة التحكم والذكاء الصناعي
          </h1>
          <p className="text-gray-400 mt-2">
            إدارة إعدادات العقل الصناعي الخاص بك واستخدام أدوات التداول المتقدمة.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Column 1: Trading Tools */}
          <div className="space-y-8">
            <TradingCalculatorWidget />
          </div>

          {/* Column 2: Brain & Memory Settings */}
          <div className="space-y-8">
            <MemoryManager />
          </div>
        </div>

      </div>
    </div>
  );
}
