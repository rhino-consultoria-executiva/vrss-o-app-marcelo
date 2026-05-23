import React, { useState } from 'react';
import { Search, Bell, User, Plus, X, Menu } from 'lucide-react';

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
      <div id="nav-actions-group" className="flex items-center justify-between md:justify-end gap-3 sm:gap-5 w-full md:w-auto">
        {/* Search Input Bar */}
        <div id="search-input-wrapper" className="relative flex-1 sm:flex-initial sm:w-48 lg:w-64">
          <input
            id="global-search-input"
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-red-500 text-xs font-sans rounded-lg pl-8 pr-7 py-2.5 text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:ring-1 focus:ring-red-500/20"
          />
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-zinc-500" />
          {searchQuery && (
            <button 
              id="clear-search-btn"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-3 text-zinc-400 hover:text-red-400"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

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

        {/* Notifications Button */}
        <div id="notification-bell-wrapper" className="relative">
          <button
            id="btn-show-notifications"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-9 h-9 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 flex items-center justify-center transition-all text-zinc-400 hover:text-red-400 outline-none cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {notificationCount > 0 && (
              <span id="notification-badge" className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center font-mono">
                {notificationCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifications && (
            <div id="notifications-panel" className="absolute right-0 mt-2 w-72 sm:w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl p-4 z-50">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2 mb-2">
                <span className="font-sans font-bold text-xs uppercase tracking-wider text-red-500">Avisos de Oficina</span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 font-semibold">{notificationCount} pendentes</span>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notifications.map((n) => (
                  <button 
                    key={n.id} 
                    onClick={() => handleNotificationClick(n.id)}
                    className="w-full p-2.5 hover:bg-zinc-850 hover:border-red-500/25 rounded-lg transition-all text-left flex flex-col gap-1 cursor-pointer outline-none focus:bg-zinc-850"
                  >
                    <p className="text-xs text-zinc-300 font-sans leading-snug hover:text-white transition-colors">{n.text}</p>
                    <span className="font-mono text-[9px] text-zinc-500 block">{n.time}</span>
                  </button>
                ))}
              </div>
              <div className="border-t border-zinc-800 pt-2 mt-2 text-center">
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="font-sans text-[10px] text-red-550 hover:underline uppercase tracking-widest cursor-pointer"
                >
                  Fechar Painel
                </button>
              </div>
            </div>
          )}
        </div>

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
