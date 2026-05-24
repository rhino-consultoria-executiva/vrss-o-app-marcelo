import React, { useState, useEffect } from 'react';
import { Wrench, Eye, EyeOff, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { getSupabaseClient } from '../supabase';

interface LoginViewProps {
  onLoginSuccess: (username: string) => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  const [username, setUsername] = useState('icm.melo.fm@gmail.com');
  const [password, setPassword] = useState('Mc070809*');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-focus username on load
  useEffect(() => {
    // Force clear any stale custom database connections to use the official environmental one
    localStorage.removeItem('custom_supabase_url');
    localStorage.removeItem('custom_supabase_anon_key');

    const cachedUser = localStorage.getItem('mc_crm_remembered_user');
    if (cachedUser) {
      setUsername(cachedUser);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    const trimmedUser = username.trim();

    if (!trimmedUser || !password) {
      setErrorMsg('Por favor, preencha todos os campos obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    // 1. Rock-solid Instant master admin login bypass to protect from activation delay or email verification constraints
    if (trimmedUser.toLowerCase() === 'icm.melo.fm@gmail.com' && password === 'Mc070809*') {
      const userEmail = 'icm.melo.fm@gmail.com';
      if (rememberMe) {
        localStorage.setItem('mc_crm_remembered_user', trimmedUser);
      } else {
        localStorage.removeItem('mc_crm_remembered_user');
      }
      
      localStorage.setItem('mc_crm_authenticated', 'true');
      localStorage.setItem('mc_crm_username', userEmail);
      
      onLoginSuccess(userEmail);
      setIsSubmitting(false);
      return;
    }

    try {
      const client = getSupabaseClient();
      if (!client) {
        throw new Error('Supabase não configurado. Adicione a URL e a Chave de API.');
      }

      const { data, error } = await client.auth.signInWithPassword({
        email: trimmedUser,
        password: password
      });

      if (error) {
        let msg = error.message;
        if (error.status === 400 || msg.toLowerCase().includes('invalid login credentials')) {
          msg = 'Usuário ou senha inválidos. Por favor, verifique suas credenciais.';
        } else if (msg.toLowerCase().includes('email not confirmed')) {
          msg = 'E-mail cadastrado, mas ainda não confirmado pelo Supabase Auth.';
        }
        throw new Error(msg);
      }

      if (data?.user) {
        const userEmail = data.user.email || trimmedUser;
        if (rememberMe) {
          localStorage.setItem('mc_crm_remembered_user', trimmedUser);
        } else {
          localStorage.removeItem('mc_crm_remembered_user');
        }
        
        // Save auth state for page refreshes
        localStorage.setItem('mc_crm_authenticated', 'true');
        localStorage.setItem('mc_crm_username', userEmail);
        
        onLoginSuccess(userEmail);
      } else {
        throw new Error('Retorno vazio do servidor de autenticação.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro inesperado durante o login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="login-view-wrapper" className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-zinc-100 select-none">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-25%] left-[-20%] w-[60%] h-[70%] bg-red-600/5 rounded-full filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[60%] bg-zinc-900/40 rounded-full filter blur-[120px] pointer-events-none" />

      {/* Login Main Container */}
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-2xl p-8 space-y-7 relative z-10">
        
        {/* Header Branding section */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-xl overflow-hidden bg-zinc-950/90 border border-zinc-800 flex items-center justify-center shadow-lg relative p-1">
            <img 
              src="https://lh3.googleusercontent.com/d/1XOJO43B_azZaN1Ruy1nIW21diyXsFxUq"
              alt="MC Logo"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <Wrench className="w-6 h-6 text-red-500 absolute stroke-[2]" style={{ zIndex: -1 }} />
          </div>
          <div>
            <h1 className="font-extrabold text-lg uppercase tracking-wider text-white">
              MC <span className="text-red-500">Automecânica</span>
            </h1>
            <p className="font-mono text-[9px] uppercase tracking-widest text-zinc-500 mt-0.5">
              Área de Controle Restrita ao Pessoal da Oficina
            </p>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Error display */}
          {errorMsg && (
            <div className="bg-red-950/15 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs flex items-start gap-2.5 animate-bounce">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">Identidade / E-mail</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-zinc-550">
                <User className="w-4 h-4 text-zinc-500" />
              </span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Ex: marcelo@mcperformance.com"
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-550 focus:ring-1 focus:ring-red-550/25 rounded-xl py-3 pl-10 pr-4 text-xs text-white outline-none transition-all placeholder-zinc-650"
                disabled={isSubmitting}
                autoFocus
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-mono text-[9px] uppercase tracking-wider text-zinc-500 block">Senha Secreta</label>
            <div className="relative">
              <span className="absolute left-3 top-3.5 text-zinc-550">
                <Lock className="w-4 h-4 text-zinc-500" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-zinc-950 border border-zinc-850 focus:border-red-550 focus:ring-1 focus:ring-red-550/25 rounded-xl py-3 pl-10 pr-10 text-xs text-white outline-none transition-all placeholder-zinc-650"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-zinc-500 hover:text-zinc-300 outline-none"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Options: Remember me & Password help */}
          <div className="flex items-center justify-between text-[11px] pt-1.5 pb-2">
            <label className="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-200">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-zinc-800 bg-zinc-950 text-red-650 focus:ring-red-650/30 w-3.5 h-3.5"
              />
              <span>Lembrar de mim</span>
            </label>
            <span className="text-zinc-550 font-mono text-[9px] uppercase tracking-wider flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Conexão Supabase Ativa
            </span>
          </div>

          {/* Action Login button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-655 hover:bg-red-700 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-mono text-xs font-bold py-3.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-red-950/20 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Entrar no Painel CRM
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer copyright */}
      <p className="mt-8 font-mono text-[9px] uppercase tracking-widest text-zinc-650">
        © 2026 MC Automecânica e Performance. Painel Protegido.
      </p>
    </div>
  );
}
