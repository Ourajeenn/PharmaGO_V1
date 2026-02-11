import React, { createContext, useContext, useState, useEffect } from 'react';

interface DataSaverContextType {
    isDataSaverEnabled: boolean;
    toggleDataSaver: () => void;
}

const DataSaverContext = createContext<DataSaverContextType | undefined>(undefined);

export const DataSaverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isDataSaverEnabled, setIsDataSaverEnabled] = useState(false);

    useEffect(() => {
        // Check if user has previously enabled data saver
        const saved = localStorage.getItem('pharma-go-data-saver');
        if (saved) {
            setIsDataSaverEnabled(JSON.parse(saved));
        }
    }, []);

    const toggleDataSaver = () => {
        setIsDataSaverEnabled(prev => {
            const newValue = !prev;
            localStorage.setItem('pharma-go-data-saver', JSON.stringify(newValue));
            if (newValue) {
                document.body.classList.add('data-saver-mode');
            } else {
                document.body.classList.remove('data-saver-mode');
            }
            return newValue;
        });
    };

    return (
        <DataSaverContext.Provider value={{ isDataSaverEnabled, toggleDataSaver }}>
            {children}
        </DataSaverContext.Provider>
    );
};

export const useDataSaver = () => {
    const context = useContext(DataSaverContext);
    if (context === undefined) {
        throw new Error('useDataSaver must be used within a DataSaverProvider');
    }
    return context;
};
