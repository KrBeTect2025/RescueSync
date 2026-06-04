import { useAlert } from '@/contexts/AlertContext';
import { X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

export const EmergencyAlertOverlay = () => {
    const { activeAlert, refetchAlert } = useAlert();
    const { language } = useLanguage();

    if (!activeAlert || !activeAlert.active) {
        return null;
    }

    const handleDismiss = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://rescuesync.onrender.com'}/api/alerts/clear`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
            });
            if (response.ok) {
                await refetchAlert();
            }
        } catch (error) {
            console.error('Error dismissing alert:', error);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-red-600 flex items-center justify-center p-4 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-red-900 opacity-90" />

            <div className="relative max-w-3xl w-full">
                <div className="bg-red-900 border-4 border-red-400 rounded-2xl shadow-2xl p-8 md:p-12 text-center space-y-6 animate-bounce">
                    <div className="flex justify-center">
                        <AlertTriangle className="h-20 w-20 md:h-32 md:w-32 text-yellow-300 animate-spin" />
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl md:text-6xl font-black text-yellow-300 uppercase tracking-wider">
                            {language === 'hi' ? '🚨 आपातकालीन सतर्कता 🚨' : '🚨 EMERGENCY ALERT 🚨'}
                        </h1>

                        <h2 className="text-2xl md:text-4xl font-bold text-white">
                            {activeAlert.title}
                        </h2>

                        <div className="bg-red-800 border-2 border-yellow-300 rounded-lg p-6 md:p-8 my-6">
                            <p className="text-lg md:text-2xl text-white leading-relaxed font-semibold">
                                {activeAlert.message}
                            </p>
                        </div>

                        <p className="text-yellow-300 text-sm md:text-lg font-bold uppercase">
                            {language === 'hi' ? `गंभीरता: ${activeAlert.severity}` : `Severity: ${activeAlert.severity}`}
                        </p>

                        <p className="text-red-200 text-xs md:text-sm">
                            {language === 'hi' ? 'सक्रिय किया गया:' : 'Activated:'} {new Date(activeAlert.createdAt).toLocaleString()}
                        </p>
                    </div>

                    <div className="pt-4 flex gap-4 justify-center flex-wrap">
                        <Button
                            onClick={handleDismiss}
                            size="lg"
                            className="bg-yellow-400 text-red-900 hover:bg-yellow-300 font-bold text-lg px-8"
                        >
                            <X className="mr-2 h-5 w-5" />
                            {language === 'hi' ? 'स्वीकार करें' : 'Acknowledge'}
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes pulse-alert {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }
        .animate-pulse {
          animation: pulse-alert 0.5s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
};
