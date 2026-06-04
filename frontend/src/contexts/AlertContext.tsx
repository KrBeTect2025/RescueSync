import { createContext, useContext, useEffect, useState } from 'react';
import { API_BASE_URL } from '@/lib/api';

interface Alert {
    id: number;
    title: string;
    message: string;
    severity: string;
    createdAt: string;
    releasedBy: string;
    active: boolean;
}

interface AlertContextType {
    activeAlert: Alert | null;
    refetchAlert: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: React.ReactNode }) => {
    const [activeAlert, setActiveAlert] = useState<Alert | null>(null);

    const refetchAlert = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/alerts/current`);
            if (response.ok) {
                const data = await response.json();
                setActiveAlert(data.activeAlert);
            }
        } catch (error) {
            console.error('Error fetching alert:', error);
        }
    };

    useEffect(() => {
        refetchAlert();
        const interval = setInterval(refetchAlert, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <AlertContext.Provider value={{ activeAlert, refetchAlert }}>
            {children}
        </AlertContext.Provider>
    );
};

export const useAlert = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within AlertProvider');
    }
    return context;
};
