import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Eye, EyeOff, ArrowLeft, Mail, Lock, User, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Capacitor } from '@capacitor/core';
import { App as CapacitorApp } from '@capacitor/app';
import { safeBack } from '../core/navigation';

type Tab = 'login' | 'register' | 'forgot';

type AuthInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  icon: React.ReactNode;
};

function AuthInput({ icon, ...props }: AuthInputProps) {
  return (
    <div className="relative">
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2">{icon}</div>
      <input
        {...props}
        className="w-full pl-10 pr-4 py-3.5 rounded-xl text-white placeholder:text-white/30 outline-none"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14 }}
      />
    </div>
  );
}

export default function AuthScreen() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login, register, forgotPassword, resetPassword, showToast, accentColor } = useApp();

  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'login');
  const [identity, setIdentity] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStage, setResetStage] = useState<'request' | 'confirm'>('request');
  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const listenerPromise = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) safeBack(navigate, '/');
      else navigate('/');
    });
    return () => {
      listenerPromise.then(listener => listener.remove());
    };
  }, [navigate]);


  const validate = () => {
    if (tab !== 'forgot' && password.length < 6) return 'Пароль минимум 6 символов';
    if (tab === 'register' && name.length < 2) return 'Введите имя';
    if (!identity.trim()) return 'Введите email или username';
    if (identity.includes('@') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(identity.trim())) {
      return 'Некорректный email (пример: name@domain.com)';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    const err = validate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    try {
      if (tab === 'forgot') {
        if (resetStage === 'request') {
          const code = await forgotPassword(identity);
          setResetStage('confirm');
          setSuccess(`Код отправлен. Dev-код: ${code}`);
          return;
        }
        await resetPassword(identity, resetCode, newPassword);
        setSuccess('Пароль обновлен. Теперь выполните вход.');
        setTab('login');
        setResetStage('request');
        setResetCode('');
        setNewPassword('');
        return;
      }

      if (tab === 'login') {
        await login(identity, password);
        showToast('Вход выполнен', 'success');
      } else {
        await register(identity, password, name);
        showToast('Аккаунт создан', 'success');
      }
      navigate('/app/games');
    } catch (e: any) {
      setError(e?.message || 'Операция не выполнена');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col" style={{ background: 'radial-gradient(ellipse at 50% 0%, #1a1a1a 0%, #080808 60%)' }}>
      <div className="px-4 pt-12 pb-2">
        <button onClick={() => safeBack(navigate, '/')} className="flex items-center gap-2" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
          <ArrowLeft size={18} /> Назад
        </button>
      </div>

      <div className="flex flex-col items-center pt-6 pb-8">
        <div style={{ width: 60, height: 60, borderRadius: 18, background: `linear-gradient(135deg, ${accentColor}25, ${accentColor}45)`, border: `1.5px solid ${accentColor}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 28 }}>?</span>
        </div>
        <h1 className="text-white" style={{ fontSize: 24, fontWeight: 800 }}>Dota Scope</h1>
      </div>

      {tab !== 'forgot' && (
        <div className="flex mx-6 mb-6 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
          {(['login', 'register'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(''); setSuccess(''); }}
              className="flex-1 py-2.5 rounded-lg transition-all"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: tab === t ? '#000' : 'rgba(255,255,255,0.5)',
                background: tab === t ? accentColor : 'transparent',
              }}
            >
              {t === 'login' ? 'Войти' : 'Регистрация'}
            </button>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-1 px-6 flex flex-col gap-4">
        {tab === 'forgot' && (
          <div className="mb-2">
            <button type="button" onClick={() => { setTab('login'); setError(''); setSuccess(''); setResetStage('request'); }} className="flex items-center gap-2 mb-4" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>
              <ArrowLeft size={16} /> Назад к входу
            </button>
            <h2 className="text-white" style={{ fontSize: 22, fontWeight: 700, marginBottom: 8 }}>Восстановить пароль</h2>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)' }}>Email/username + код подтверждения</p>
          </div>
        )}

        {tab === 'register' && (
          <AuthInput icon={<User size={16} color="rgba(255,255,255,0.35)" />} type="text" placeholder="Имя пользователя" value={name} onChange={e => setName(e.target.value)} />
        )}

        <AuthInput icon={<Mail size={16} color="rgba(255,255,255,0.35)" />} type="text" placeholder="Email или username" value={identity} onChange={e => setIdentity(e.target.value)} />

        {tab !== 'forgot' && (
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2"><Lock size={16} color="rgba(255,255,255,0.35)" /></div>
            <input
              type={showPass ? 'text' : 'password'}
              placeholder="Пароль"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-10 pr-12 py-3.5 rounded-xl text-white placeholder:text-white/30 outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', fontSize: 14 }}
            />
            <button type="button" className="absolute right-3.5 top-1/2 -translate-y-1/2" onClick={() => setShowPass(!showPass)}>
              {showPass ? <EyeOff size={16} color="rgba(255,255,255,0.35)" /> : <Eye size={16} color="rgba(255,255,255,0.35)" />}
            </button>
          </div>
        )}

        {tab === 'forgot' && resetStage === 'confirm' && (
          <>
            <AuthInput icon={<KeyRound size={16} color="rgba(255,255,255,0.35)" />} type="text" placeholder="Код из письма" value={resetCode} onChange={e => setResetCode(e.target.value)} />
            <AuthInput icon={<Lock size={16} color="rgba(255,255,255,0.35)" />} type="password" placeholder="Новый пароль" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          </>
        )}

        {tab === 'login' && (
          <button type="button" onClick={() => { setTab('forgot'); setError(''); setSuccess(''); }} className="text-right" style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Забыли пароль?
          </button>
        )}

        {error && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertCircle size={15} color="#F87171" />
            <span style={{ fontSize: 13, color: '#F87171' }}>{error}</span>
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
            <CheckCircle size={15} color="#4ADE80" />
            <span style={{ fontSize: 13, color: '#4ADE80' }}>{success}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl flex items-center justify-center"
          style={{ background: accentColor, fontSize: 15, fontWeight: 700, color: '#000', opacity: loading ? 0.7 : 1, marginTop: 4 }}
        >
          {loading
            ? 'Загрузка...'
            : tab === 'login'
              ? 'Войти'
              : tab === 'register'
                ? 'Создать аккаунт'
                : resetStage === 'request'
                  ? 'Отправить код'
                  : 'Сбросить пароль'}
        </button>

        {tab !== 'forgot' && (
          <div className="rounded-xl p-3" style={{ background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.2)' }}>
            <p style={{ fontSize: 12, color: '#93C5FD' }}>
              Dev login: `demo@dotascope.dev` / `123456`
            </p>
          </div>
        )}
      </form>

      <div className="pb-8 pt-4 text-center">
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.5 }}>
          Продолжая, вы соглашаетесь с <span style={{ color: 'rgba(255,255,255,0.45)' }}>условиями использования</span>
        </p>
      </div>
    </div>
  );
}


