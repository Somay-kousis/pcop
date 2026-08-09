import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { ClaudeChatInterface } from './components/ClaudeChatInterface';
import { RightInspectorPanel } from './components/RightInspectorPanel';
import { CustomizerDrawer, CustomizerState } from './components/CustomizerDrawer';

const STORAGE_KEY = 'pencil_customizer_config_v1';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Unilever Dove Q3 Launch');
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Initialize state from LocalStorage if available
  const [customizer, setCustomizer] = useState<CustomizerState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to load customizer config from localStorage:', e);
    }
    return {
      template: 'UGC Video & Voiceover',
      llmModel: 'Auto-Route (50+ Models)',
      visionModel: 'Adobe Firefly Image 3',
      motionModel: 'Runway Gen-3 Alpha',
      voiceModel: 'ElevenLabs Studio Voice',
      colorPalette: ['#0B1B3D', '#D4AF37', '#FFFFFF'],
      font: 'Plus Jakarta Sans',
      aspectRatio: '9:16 (Vertical Story)',
      productImageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800&auto=format&fit=crop',
      customNotes: '',
      prohibitedClaims: '',
      brandGuidelines: ''
    };
  });

  // Save customizer config to LocalStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customizer));
    } catch (e) {
      console.warn('Failed to persist customizer config to localStorage:', e);
    }
  }, [customizer]);

  return (
    <div className="h-screen w-screen bg-[#18181B] text-[#F4F4F5] font-sans flex overflow-hidden selection:bg-[#D97757] selection:text-white">
      {/* Left Claude Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Main Chat Interface */}
      <ClaudeChatInterface 
        customizer={customizer}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
      />

      {/* Right Inspector Panel */}
      <RightInspectorPanel />

      {/* Customizer Studio Drawer */}
      <CustomizerDrawer 
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        customizer={customizer}
        setCustomizer={setCustomizer}
      />
    </div>
  );
};

export default App;
