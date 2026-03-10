import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ChevronRight, BarChart3, Sword, Trophy, TrendingUp } from 'lucide-react';
import { useApp } from '../context/AppContext';

const SLIDES = [
  {
    icon: <BarChart3 size={40} color="#FFFFFF" />,
    title: 'Статистика матчей',
    desc: 'Полная история ваших игр: KDA, GPM, XPM, предметы и многое другое. Анализируйте каждый матч в деталях.',
    accent: '#FFFFFF',
  },
  {
    icon: <Trophy size={40} color="#F59E0B" />,
    title: 'Анализ героев',
    desc: 'Отслеживайте прогресс на каждом герое. Узнайте, с кем побеждаете чаще всего и почему.',
    accent: '#F59E0B',
  },
  {
    icon: <Sword size={40} color="#60A5FA" />,
    title: 'Рекомендации сборок',
    desc: 'Персонализированные сборки на основе вашего стиля игры. Актуальные билды под текущий патч.',
    accent: '#60A5FA',
  },
  {
    icon: <TrendingUp size={40} color="#4ADE80" />,
    title: 'История прогресса',
    desc: 'Следите за ростом MMR и ставьте цели. Геймификация вашего пути к Immortal.',
    accent: '#4ADE80',
  },
];

export default function SplashScreen() {
  const navigate = useNavigate();
  const { accentColor } = useApp();
  const [phase, setPhase] = useState<'splash' | 'onboarding'>('splash');
  const [slide, setSlide] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => { setPhase('onboarding'); setVisible(true); }, 400);
    }, 2000);
    return () => clearTimeout(t);
  }, []);

  const nextSlide = () => {
    if (slide < SLIDES.length - 1) {
      setVisible(false);
      setTimeout(() => { setSlide(s => s + 1); setVisible(true); }, 200);
    }
  };

  const skip = () => navigate('/auth');

  const current = SLIDES[slide];

  if (phase === 'splash') {
    return (
      <div
        className="h-full flex flex-col items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at center, #141414 0%, #080808 70%)',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }}
      >
        {/* Decorative rings */}
        <div className="relative flex items-center justify-center mb-8">
          <div className="absolute rounded-full" style={{ width: 180, height: 180, border: `1px solid ${accentColor}12` }} />
          <div className="absolute rounded-full" style={{ width: 130, height: 130, border: `1px solid ${accentColor}20` }} />
          <div className="rounded-full flex items-center justify-center" style={{ width: 90, height: 90, background: `linear-gradient(135deg, ${accentColor}22, ${accentColor}44)`, border: `2px solid ${accentColor}55` }}>
            <span style={{ fontSize: 42 }}>◈</span>
          </div>
        </div>

        <h1 className="text-white" style={{ fontSize: 32, fontWeight: 800, letterSpacing: 1 }}>Dota Scope</h1>
        <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 8, letterSpacing: 2 }}>TRACK · ANALYSE · IMPROVE</p>

        <div className="mt-12 flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-full" style={{ width: 6, height: 6, background: 'rgba(255,255,255,0.2)', animation: `pulse ${1 + i * 0.3}s ease infinite` }} />
          ))}
        </div>

        <style>{`@keyframes pulse { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.8;transform:scale(1.2)} }`}</style>
      </div>
    );
  }

  return (
    <div
      className="h-full flex flex-col"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, #181818 0%, #080808 60%)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.3s ease',
      }}
    >
      {/* Skip */}
      <div className="flex justify-end px-6 pt-12">
        {slide < SLIDES.length - 1 && (
          <button onClick={skip} style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Пропустить</button>
        )}
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        {/* Icon */}
        <div
          className="mb-10 flex items-center justify-center rounded-3xl"
          style={{
            width: 100, height: 100,
            background: `linear-gradient(135deg, ${current.accent}18, ${current.accent}32)`,
            border: `1.5px solid ${current.accent}40`,
          }}
        >
          {current.icon}
        </div>

        <h2 className="text-white mb-4" style={{ fontSize: 26, fontWeight: 700 }}>{current.title}</h2>
        <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.65, maxWidth: 300 }}>{current.desc}</p>

        {/* Slide indicators */}
        <div className="flex gap-2 mt-12">
          {SLIDES.map((_, i) => (
            <div
              key={i}
              onClick={() => { setVisible(false); setTimeout(() => { setSlide(i); setVisible(true); }, 200); }}
              style={{
                height: 4,
                width: i === slide ? 24 : 6,
                borderRadius: 2,
                background: i === slide ? current.accent : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 pb-12 flex flex-col gap-3">
        {slide < SLIDES.length - 1 ? (
          <button
            onClick={nextSlide}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-black"
            style={{ background: current.accent, fontSize: 16, fontWeight: 700 }}
          >
            Далее <ChevronRight size={20} />
          </button>
        ) : (
          <>
            <button
              onClick={() => navigate('/auth?tab=login')}
              className="w-full py-4 rounded-2xl text-black"
              style={{ background: '#FFFFFF', fontSize: 15, fontWeight: 700 }}
            >
              Войти
            </button>
            <button
              onClick={() => navigate('/auth?tab=register')}
              className="w-full py-4 rounded-2xl text-white"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', fontSize: 15, fontWeight: 600 }}
            >
              Создать аккаунт
            </button>
            <button
              onClick={() => navigate('/app/games')}
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', paddingTop: 8 }}
            >
              Продолжить как гость
            </button>
          </>
        )}
      </div>
    </div>
  );
}


