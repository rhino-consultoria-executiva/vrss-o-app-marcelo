import React, { useState } from 'react';
import { User, Plus, X, Menu } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setActiveSection?: (section: string) => void;
  onAddCustomerClick: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  notificationCount: number;
  toggleSidebar: () => void;
  activeUser?: string;
}

export default function Navbar({
  activeSection,
  activeTab,
  setActiveTab,
  setActiveSection,
  onAddCustomerClick,
  searchQuery,
  setSearchQuery,
  notificationCount,
  toggleSidebar,
  activeUser = 'Marcelo',
}: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  // Friendly mock notification content for realistic CRM events
  const notifications = [
    { id: 1, text: "Novo Lead 'Roberto Silva' aguarda diagnóstico (Urgente!)", time: "5min atrás" },
    { id: 2, text: "Bolsa de ar pneumática traseira (Audi RS6) está esgotada no estoque", time: "1h atrás" },
    { id: 3, text: "Orçamento para João Pedro (VW Golf) está pronto para envio", time: "Ontem" }
  ];

  const handleNotificationClick = (id: number) => {
    if (!setActiveSection) return;
    
    if (id === 1) {
      // Novo Lead Roberto Silva -> vai para Funil de Vendas -> Pipeline Geral
      setActiveSection('funnel');
      setActiveTab('leads');
    } else if (id === 2) {
      // Estoque -> vai para seção de Estoque Geral
      setActiveSection('inventory');
    } else if (id === 3) {
      // Orçamento João Pedro -> vai para seção de Serviços (Histórico de OS)
      setActiveSection('history');
    }
    
    setShowNotifications(false);
  };

  const getSectionTitle = () => {
    switch (activeSection) {
      case 'dashboard': return 'Painel Geral';
      case 'funnel': return 'Funil de Vendas';
      case 'customers': return 'Clientes';
      case 'history': return 'Serviços';
      case 'inventory': return 'Estoque';
      case 'reports': return 'Relatórios';
      case 'support': return 'Suporte';
      case 'settings': return 'Configurações';
      default: return 'MC CRM';
    }
  };

  return (
    <header 
      id="main-navbar" 
      className="bg-zinc-950 border-b border-zinc-800 min-h-20 py-4 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row md:items-center justify-between sticky top-0 z-40 text-zinc-100 gap-4"
    >
      {/* Title & Section Indicators */}
      <div id="nav-title-group" className="flex items-center gap-3 sm:gap-6 w-full md:w-auto flex-wrap">
        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleSidebar}
          className="md:hidden p-2 -ml-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg outline-none transition-colors cursor-pointer"
          aria-label="Abrir Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <h2 id="nav-title" className="font-sans font-semibold text-sm sm:text-base leading-none tracking-tight uppercase text-white whitespace-nowrap">
          {getSectionTitle()}
        </h2>

        {/* Inner Tabs for Funnel section */}
        {activeSection === 'funnel' && (
          <div id="funnel-tabs" className="flex gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800 overflow-x-auto max-w-[calc(100vw-32px)] sm:max-w-none">
            {['leads', 'active_jobs', 'inventory'].map((tab) => (
              <button
                key={tab}
                id={`tab-btn-${tab}`}
                onClick={() => setActiveTab(tab)}
                className={`font-mono text-[9px] sm:text-[10px] font-bold tracking-wider uppercase px-2.5 sm:px-4 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab 
                    ? 'bg-red-650 text-white' 
                    : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {tab === 'leads' && 'Pipeline Geral'}
                {tab === 'active_jobs' && 'Trabalhos Ativos'}
                {tab === 'inventory' && 'Peças em Uso'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Global Controls & Actions */}
      <div id="nav-actions-group" className="flex items-center justify-end gap-3 sm:gap-5 ml-auto">
        {/* Quick Add Customer button */}
        <button
          id="btn-add-customer-quick"
          onClick={onAddCustomerClick}
          className="border border-zinc-800 hover:border-red-500 bg-zinc-900 hover:bg-red-500/10 text-zinc-100 font-sans text-xs font-medium py-2.5 px-3 rounded-lg flex items-center gap-1.5 transition-all outline-none cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 text-red-500" />
          <span className="hidden sm:inline">Adicionar Cliente</span>
          <span className="inline sm:hidden">Novo</span>
        </button>



        {/* Divider */}
        <div className="w-px h-6 bg-zinc-800 hidden sm:block" />

        {/* User Profile Info */}
        <div id="nav-user-profile" className="flex items-center gap-2">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-semibold text-white capitalize">{activeUser}</p>
            <p className="font-mono text-[8px] text-zinc-500 leading-none uppercase">Supervisor</p>
          </div>
          <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-red-650 to-red-500 flex items-center justify-center font-semibold text-xs text-white shadow-sm shadow-red-600/15 border border-zinc-800">
            {!avatarError ? (
              <img 
                src="https://lh3.googleusercontent.com/d/1XOJO43B_azZaN1Ruy1nIW21diyXsFxUq"
                alt={activeUser}
                className="w-full h-full object-cover"
                onError={() => setAvatarError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              'M'
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
