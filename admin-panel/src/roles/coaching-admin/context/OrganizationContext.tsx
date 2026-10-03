import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
// Define the available modules in our SaaS
export type Module = 
  | 'DASHBOARD'
  | 'STUDENTS'
  | 'TEACHERS'
  | 'BATCHES'
  | 'PARENTS'
  | 'LMS'
  | 'COURSE_STORE'
  | 'QUESTION_BANK'
  | 'TESTS'
  | 'RESULTS'
  | 'FEES'
  | 'ATTENDANCE'
  | 'NOTIFICATIONS'
  | 'AI_MANAGEMENT'
  | 'SETTINGS';

interface OrganizationContextType {
  orgName: string;
  adminName: string;
  activeModules: Module[];
  toggleModule: (module: Module) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  // Mocking modules for now
  const [activeModules, setActiveModules] = useState<Module[]>([
    'DASHBOARD',
    'STUDENTS',
    'FEES',
    'ATTENDANCE',
    'NOTIFICATIONS',
    'TEACHERS',
    'BATCHES',
    'PARENTS',
    'LMS',
    'COURSE_STORE',
    'QUESTION_BANK',
    'TESTS',
    'RESULTS',
    'AI_MANAGEMENT',
    'SETTINGS',
  ]);

  const toggleModule = (module: Module) => {
    setActiveModules((prev) => 
      prev.includes(module) ? prev.filter(m => m !== module) : [...prev, module]
    );
  };

  return (
    <OrganizationContext.Provider value={{ 
      orgName: user?.organizationName || 'Coaching Center', 
      adminName: user?.name || 'Admin', 
      activeModules,
      toggleModule
    }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
