import React from 'react';
import { 
  LayoutDashboard, 
  Layers, 
  Users, 
  History, 
  Package, 
  BarChart3, 
  HelpCircle, 
  Settings, 
  Plus,
  Wrench,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  onNewOrderClick: () => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export default function Sidebar({ 
  activeSection, 
  setActiveSection, 
  onNewOrderClick,
  isOpen,
  onClose,
  onLogout
}: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'funnel', label: 'Funil de Vendas', icon: Layers },
    { id: 'customers', label: 'Base de Clientes', icon: Users },
    { id: 'history', label: 'Histórico de Serviços', icon: History },
    { id: 'inventory', label: 'Estoque de Peças', icon: Package },
    { id: 'reports', label: 'Relatórios', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Back-drop overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden transition-all duration-300"
        />
      )}

      <aside 
        id="sidebar-container" 
        className={`w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between h-screen fixed top-0 bottom-0 left-0 z-50 md:z-30 font-sans text-zinc-100 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } transition-transform duration-300 ease-in-out`}
      >
      <div>
        {/* Logo / Header */}
        <div id="sidebar-logo-area" className="p-6 border-b border-zinc-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden bg-zinc-950/80 flex items-center justify-center border border-zinc-800 shadow-inner">
            <img 
              src="https://lh3.googleusercontent.com/d/1XOJO43B_azZaN1Ruy1nIW21diyXsFxUq"
              alt="MC Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // fallback to wrench icon
                e.currentTarget.style.display = 'none';
              }}
            />
            <Wrench className="w-4 h-4 text-red-500 absolute stroke-[2]" style={{ zIndex: -1 }} />
          </div>
          <div>
            <h1 id="brand-header" className="font-semibold text-base leading-tight tracking-tight uppercase text-white">
              MC <span className="text-red-500 font-bold">Mecânica</span>
            </h1>
            <p id="brand-subtitle" className="font-mono text-[9px] uppercase tracking-widest text-zinc-500">
              CRM WORKSHOP v1.4
            </p>
          </div>
        </div>
 
        {/* Action Button */}
        <div id="sidebar-action-container" className="px-4 py-5">
          <button
            id="btn-new-order-quick"
            onClick={onNewOrderClick}
            translate="no"
            className="notranslate w-full bg-red-650 hover:bg-red-705 text-white font-mono text-xs font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            Nova Ordem de Serviço
          </button>
        </div>
 
        {/* Navigation Menu */}
        <nav id="sidebar-nav" className="px-3 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => {
                  setActiveSection(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium text-sm text-left transition-all relative cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-800 text-red-500 border-l-2 border-red-600 pl-[14px]' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-zinc-400 opacity-80'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <span className="absolute right-3 w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
 
      {/* Footer / Utilities */}
      <div id="sidebar-footer" className="p-4 border-t border-zinc-800 space-y-1 bg-zinc-950/20">
        <button
          id="btn-sidebar-support"
          onClick={() => {
            setActiveSection('support');
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide text-left transition-all cursor-pointer ${
            activeSection === 'support' 
              ? 'bg-zinc-800 text-red-500 border-l-2 border-red-600 pl-[14px]' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
          }`}
        >
          <HelpCircle className="w-4 h-4 text-inherit" />
          <span>Central de Suporte</span>
        </button>
 
        <button
          id="btn-sidebar-settings"
          onClick={() => {
            setActiveSection('settings');
            onClose();
          }}
          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide text-left transition-all cursor-pointer ${
            activeSection === 'settings' 
              ? 'bg-zinc-800 text-red-500 border-l-2 border-red-600 pl-[14px]' 
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/40'
          }`}
        >
          <Settings className="w-4 h-4 text-inherit" />
          <span>Configurações</span>
        </button>

        <button
          id="btn-sidebar-logout"
          onClick={() => {
            onLogout();
            onClose();
          }}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide text-left text-zinc-400 hover:text-red-400 hover:bg-red-950/10 transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Sair do Sistema</span>
        </button>
 
        <div id="sidebar-badge-user" className="pt-2 text-center">
          <p className="font-mono text-[8px] text-zinc-600 tracking-wider">
            SISTEMA OPERACIONAL ESTÁVEL
          </p>
        </div>
      </div>
    </aside>
    </>
  );
}
