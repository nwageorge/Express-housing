'use client';

import { cn } from '@/lib/utils';
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle, useMemo, useCallback, createContext, Children } from 'react';
import { cva } from 'class-variance-authority';
import { ArrowRight, Mail, Lock, Eye, EyeOff, ArrowLeft, X, AlertCircle, PartyPopper, Loader, Heart, Building2, Activity } from 'lucide-react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// --- CONFETTI LOGIC ---
const Confetti = forwardRef((props, ref) => {
  const { options, globalOptions = { resize: true, useWorker: true }, manualstart = false, ...rest } = props;
  const instanceRef = useRef(null);
  const canvasRef = useCallback((node) => {
    if (node !== null) {
      if (instanceRef.current) return;
      instanceRef.current = confetti.create(node, { ...globalOptions, resize: true });
    } else {
      if (instanceRef.current) {
        instanceRef.current.reset();
        instanceRef.current = null;
      }
    }
  }, [globalOptions]);
  const fire = useCallback((opts = {}) => instanceRef.current?.({ ...options, ...opts }), [options]);
  const api = useMemo(() => ({ fire }), [fire]);
  useImperativeHandle(ref, () => api, [api]);
  useEffect(() => { if (!manualstart) fire(); }, [manualstart, fire]);
  return <canvas ref={canvasRef} {...rest} />;
});
Confetti.displayName = 'Confetti';

// --- TEXT LOOP ANIMATION COMPONENT ---
function TextLoop({ children, className, interval = 2, transition = { duration: 0.3 }, variants, onIndexChange, stopOnEnd = false }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = Children.toArray(children);
  useEffect(() => {
    const intervalMs = interval * 1000;
    const timer = setInterval(() => {
      setCurrentIndex((current) => {
        if (stopOnEnd && current === items.length - 1) {
          clearInterval(timer);
          return current;
        }
        const next = (current + 1) % items.length;
        onIndexChange?.(next);
        return next;
      });
    }, intervalMs);
    return () => clearInterval(timer);
  }, [items.length, interval, onIndexChange, stopOnEnd]);
  const motionVariants = {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: -20, opacity: 0 },
  };
  return (
    <div className={cn('relative inline-block whitespace-nowrap', className)}>
      <AnimatePresence mode='popLayout' initial={false}>
        <motion.div key={currentIndex} initial='initial' animate='animate' exit='exit' transition={transition} variants={variants || motionVariants}>
          {items[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- BLUR FADE ANIMATION COMPONENT ---
function BlurFade({ children, className, variant, duration = 0.4, delay = 0, yOffset = 6, inView = true, inViewMargin = '-50px', blur = '6px' }) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const defaultVariants = {
    hidden: { y: yOffset, opacity: 0, filter: `blur(${blur})` },
    visible: { y: -yOffset, opacity: 1, filter: `blur(0px)` },
  };
  const combinedVariants = variant || defaultVariants;
  return (
    <motion.div ref={ref} initial="hidden" animate={isInView ? 'visible' : 'hidden'} exit="hidden" variants={combinedVariants} transition={{ delay: 0.04 + delay, duration, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
}

// --- GLASS BUTTON COMPONENT ---
const glassButtonVariants = cva('relative isolate all-unset cursor-pointer rounded-full transition-all', { variants: { size: { default: 'text-base font-medium', sm: 'text-sm font-medium', lg: 'text-lg font-medium', icon: 'h-10 w-10' } }, defaultVariants: { size: 'default' } });
const glassButtonTextVariants = cva('glass-button-text relative block select-none tracking-tighter', { variants: { size: { default: 'px-6 py-3.5', sm: 'px-4 py-2', lg: 'px-8 py-4', icon: 'flex h-10 w-10 items-center justify-center' } }, defaultVariants: { size: 'default' } });

const GlassButton = React.forwardRef(({ className, children, size, contentClassName, onClick, ...props }, ref) => {
  const handleWrapperClick = (e) => {
    const button = e.currentTarget.querySelector('button');
    if (button && e.target !== button) button.click();
  };
  return (
    <div className={cn('glass-button-wrap cursor-pointer rounded-full relative', className)} onClick={handleWrapperClick}>
      <button className={cn('glass-button relative z-10', glassButtonVariants({ size }))} ref={ref} onClick={onClick} {...props}>
        <span className={cn(glassButtonTextVariants({ size }), contentClassName)}>{children}</span>
      </button>
      <div className="glass-button-shadow rounded-full pointer-events-none"></div>
    </div>
  );
});
GlassButton.displayName = 'GlassButton';

// --- GRADIENT BACKGROUND ---
const GradientBackground = () => (
  <>
    <style>
      {`@keyframes float1 { 0% { transform: translate(0, 0); } 50% { transform: translate(-10px, 10px); } 100% { transform: translate(0, 0); } } @keyframes float2 { 0% { transform: translate(0, 0); } 50% { transform: translate(10px, -10px); } 100% { transform: translate(0, 0); } }`}
    </style>
    <svg width="100%" height="100%" viewBox="0 0 800 600" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="absolute top-0 left-0 w-full h-full">
      <defs>
        <linearGradient id="rev_grad1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: '#a8998a', stopOpacity:0.8}} /><stop offset="100%" style={{stopColor: '#d4c4b0', stopOpacity:0.6}} /></linearGradient>
        <linearGradient id="rev_grad2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style={{stopColor: '#c9b99a', stopOpacity:0.9}} /><stop offset="50%" style={{stopColor: '#e8ddd0', stopOpacity:0.7}} /><stop offset="100%" style={{stopColor: '#f5f0e8', stopOpacity:0.6}} /></linearGradient>
        <radialGradient id="rev_grad3" cx="50%" cy="50%" r="50%"><stop offset="0%" style={{stopColor: '#b8a898', stopOpacity:0.8}} /><stop offset="100%" style={{stopColor: '#d4c8b8', stopOpacity:0.4}} /></radialGradient>
        <filter id="rev_blur1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="35"/></filter>
        <filter id="rev_blur2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="25"/></filter>
        <filter id="rev_blur3" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="45"/></filter>
      </defs>
      <g style={{ animation: 'float1 20s ease-in-out infinite' }}>
        <ellipse cx="200" cy="500" rx="250" ry="180" fill="url(#rev_grad1)" filter="url(#rev_blur1)" transform="rotate(-30 200 500)"/>
        <rect x="500" y="100" width="300" height="250" rx="80" fill="url(#rev_grad2)" filter="url(#rev_blur2)" transform="rotate(15 650 225)"/>
      </g>
      <g style={{ animation: 'float2 25s ease-in-out infinite' }}>
        <circle cx="650" cy="450" r="150" fill="url(#rev_grad3)" filter="url(#rev_blur3)" opacity="0.7"/>
        <ellipse cx="50" cy="150" rx="180" ry="120" fill="#e8e0d8" filter="url(#rev_blur2)" opacity="0.8"/>
      </g>
    </svg>
  </>
);

// --- GOOGLE ICON ---
const GoogleIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-6 h-6">
    <g fillRule="evenodd" fill="none">
      <g fillRule="nonzero" transform="translate(3, 2)">
        <path fill="#4285F4" d="M57.8123233,30.1515267 C57.8123233,27.7263183 57.6155321,25.9565533 57.1896408,24.1212666 L29.4960833,24.1212666 L29.4960833,35.0674653 L45.7515771,35.0674653 C45.4239683,37.7877475 43.6542033,41.8844383 39.7213169,44.6372555 L39.6661883,45.0037254 L48.4223791,51.7870338 L49.0290201,51.8475849 C54.6004021,46.7020943 57.8123233,39.1313952 57.8123233,30.1515267"></path>
        <path fill="#34A853" d="M29.4960833,58.9921667 C37.4599129,58.9921667 44.1456164,56.3701671 49.0290201,51.8475849 L39.7213169,44.6372555 C37.2305867,46.3742596 33.887622,47.5868638 29.4960833,47.5868638 C21.6960582,47.5868638 15.0758763,42.4415991 12.7159637,35.3297782 L12.3700541,35.3591501 L3.26524241,42.4054492 L3.14617358,42.736447 C7.9965904,52.3717589 17.959737,58.9921667 29.4960833,58.9921667"></path>
        <path fill="#FBBC05" d="M12.7159637,35.3297782 C12.0932812,33.4944915 11.7329116,31.5279353 11.7329116,29.4960833 C11.7329116,27.4640054 12.0932812,25.4976752 12.6832029,23.6623884 L12.6667095,23.2715173 L3.44779955,16.1120237 L3.14617358,16.2554937 C1.14708246,20.2539019 0,24.7439491 0,29.4960833 C0,34.2482175 1.14708246,38.7380388 3.14617358,42.736447 L12.7159637,35.3297782"></path>
        <path fill="#EB4335" d="M29.4960833,11.4050769 C35.0347044,11.4050769 38.7707997,13.7975244 40.9011602,15.7968415 L49.2255853,7.66898166 C44.1130815,2.91684746 37.4599129,0 29.4960833,0 C17.959737,0 7.9965904,6.62018183 3.14617358,16.2554937 L12.6832029,23.6623884 C15.0758763,16.5505675 21.6960582,11.4050769 29.4960833,11.4050769"></path>
      </g>
    </g>
  </svg>
);

const modalSteps = [
  { message: 'Setting up your account...', icon: <Loader className="w-12 h-12 text-stone-600 animate-spin" /> },
  { message: 'Preparing your dashboard...', icon: <Loader className="w-12 h-12 text-stone-600 animate-spin" /> },
  { message: 'Almost there...', icon: <Loader className="w-12 h-12 text-stone-600 animate-spin" /> },
  { message: 'Welcome to Adltrack!', icon: <PartyPopper className="w-12 h-12 text-green-500" /> }
];
const TEXT_LOOP_INTERVAL = 1.5;

// --- ADLTRACK LOGO ---
const AdltrackLogo = () => (
  <div className="bg-stone-800 text-white rounded-xl p-1.5">
    <Activity className="h-4 w-4" />
  </div>
);

// --- USER TYPE SELECTION ---
const UserTypeSelection = ({ selectedType, onSelect }) => (
  <div className="flex flex-col gap-3 w-full">
    <button
      type="button"
      onClick={() => onSelect('family')}
      className={cn(
        'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
        selectedType === 'family'
          ? 'border-stone-800 bg-stone-50 shadow-md'
          : 'border-stone-200 hover:border-stone-300 bg-white/50'
      )}
    >
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
        selectedType === 'family' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
      )}>
        <Heart className="w-6 h-6" />
      </div>
      <div>
        <p className="font-semibold text-stone-800">Family Seeking Care</p>
        <p className="text-sm text-stone-500">Find trusted in-home caregivers</p>
      </div>
    </button>
    <button
      type="button"
      onClick={() => onSelect('agency')}
      className={cn(
        'flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left',
        selectedType === 'agency'
          ? 'border-stone-800 bg-stone-50 shadow-md'
          : 'border-stone-200 hover:border-stone-300 bg-white/50'
      )}
    >
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
        selectedType === 'agency' ? 'bg-stone-800 text-white' : 'bg-stone-100 text-stone-600'
      )}>
        <Building2 className="w-6 h-6" />
      </div>
      <div>
        <p className="font-semibold text-stone-800">Care Agency</p>
        <p className="text-sm text-stone-500">List your services & find clients</p>
      </div>
    </button>
  </div>
);

// --- MAIN AUTH COMPONENT ---
export const AuthComponent = ({ mode = 'signup' }) => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authStep, setAuthStep] = useState(mode === 'login' ? 'email' : 'userType');
  const [modalStatus, setModalStatus] = useState('closed');
  const [modalErrorMessage, setModalErrorMessage] = useState('');
  const [error, setError] = useState('');
  const confettiRef = useRef(null);

  const isEmailValid = /\S+@\S+\.\S+/.test(email);
  const isPasswordValid = password.length >= 6;
  const isNameValid = name.length >= 2;
  
  const passwordInputRef = useRef(null);
  const emailInputRef = useRef(null);
  const nameInputRef = useRef(null);
  
  const fireSideCanons = () => {
    const fire = confettiRef.current?.fire;
    if (fire) {
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const particleCount = 50;
      fire({ ...defaults, particleCount, origin: { x: 0, y: 1 }, angle: 60 });
      fire({ ...defaults, particleCount, origin: { x: 1, y: 1 }, angle: 120 });
    }
  };

  const handleLogin = async () => {
    setModalStatus('loading');
    try {
      const response = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      fireSideCanons();
      setModalStatus('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setModalErrorMessage(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setModalStatus('error');
    }
  };

  const handleSignup = async () => {
    setModalStatus('loading');
    try {
      const response = await axios.post(`${API}/auth/signup`, { 
        name, 
        email, 
        password,
        role: userType === 'agency' ? 'agency' : 'client'
      });
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      const loadingStepsCount = modalSteps.length - 1;
      const totalDuration = loadingStepsCount * TEXT_LOOP_INTERVAL * 1000;
      setTimeout(() => {
        fireSideCanons();
        setModalStatus('success');
        setTimeout(() => navigate('/dashboard'), 1500);
      }, totalDuration);
    } catch (err) {
      setModalErrorMessage(err.response?.data?.detail || 'Signup failed. Please try again.');
      setModalStatus('error');
    }
  };

  const handleFinalSubmit = (e) => {
    e.preventDefault();
    if (modalStatus !== 'closed') return;
    
    if (mode === 'login') {
      if (authStep === 'password' && isPasswordValid) {
        handleLogin();
      }
    } else {
      if (authStep === 'password' && isPasswordValid) {
        handleSignup();
      }
    }
  };

  const handleProgressStep = () => {
    setError('');
    if (mode === 'signup') {
      if (authStep === 'userType' && userType) {
        setAuthStep('name');
      } else if (authStep === 'name' && isNameValid) {
        setAuthStep('email');
      } else if (authStep === 'email' && isEmailValid) {
        setAuthStep('password');
      } else if (authStep === 'password' && isPasswordValid) {
        handleSignup();
      }
    } else {
      if (authStep === 'email' && isEmailValid) {
        setAuthStep('password');
      } else if (authStep === 'password' && isPasswordValid) {
        handleLogin();
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleProgressStep();
    }
  };

  const handleGoBack = () => {
    setError('');
    if (mode === 'signup') {
      if (authStep === 'password') setAuthStep('email');
      else if (authStep === 'email') setAuthStep('name');
      else if (authStep === 'name') setAuthStep('userType');
    } else {
      if (authStep === 'password') setAuthStep('email');
    }
  };

  const closeModal = () => {
    setModalStatus('closed');
    setModalErrorMessage('');
  };

  useEffect(() => {
    if (authStep === 'password') setTimeout(() => passwordInputRef.current?.focus(), 500);
    else if (authStep === 'email') setTimeout(() => emailInputRef.current?.focus(), 500);
    else if (authStep === 'name') setTimeout(() => nameInputRef.current?.focus(), 500);
  }, [authStep]);

  const Modal = () => (
    <AnimatePresence>
      {modalStatus !== 'closed' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative bg-white/90 backdrop-blur-xl border-2 border-stone-200 rounded-2xl p-8 w-full max-w-sm flex flex-col items-center gap-4 mx-4 shadow-2xl">
            {(modalStatus === 'error' || modalStatus === 'success') && (
              <button onClick={closeModal} className="absolute top-3 right-3 p-1 text-stone-400 hover:text-stone-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            )}
            {modalStatus === 'error' && (
              <>
                <AlertCircle className="w-12 h-12 text-red-500" />
                <p className="text-lg font-medium text-stone-800 text-center">{modalErrorMessage}</p>
                <GlassButton onClick={closeModal} size="sm" className="mt-4">Try Again</GlassButton>
              </>
            )}
            {modalStatus === 'loading' && (
              <TextLoop interval={TEXT_LOOP_INTERVAL} stopOnEnd={true}>
                {modalSteps.slice(0, -1).map((step, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                    {step.icon}
                    <p className="text-lg font-medium text-stone-800">{step.message}</p>
                  </div>
                ))}
              </TextLoop>
            )}
            {modalStatus === 'success' && (
              <div className="flex flex-col items-center gap-4">
                {modalSteps[modalSteps.length - 1].icon}
                <p className="text-lg font-medium text-stone-800">{modalSteps[modalSteps.length - 1].message}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-stone-50 min-h-screen w-full flex flex-col">
      <style>{`
        @property --angle-1 { syntax: "<angle>"; inherits: false; initial-value: -75deg; }
        @property --angle-2 { syntax: "<angle>"; inherits: false; initial-value: -45deg; }
        .glass-button-wrap { --anim-time: 400ms; --anim-ease: cubic-bezier(0.25, 1, 0.5, 1); --border-width: clamp(1px, 0.0625em, 4px); position: relative; z-index: 2; transform-style: preserve-3d; transition: transform var(--anim-time) var(--anim-ease); }
        .glass-button-wrap:has(.glass-button:active) { transform: rotateX(25deg); }
        .glass-button-shadow { --shadow-cutoff-fix: 2em; position: absolute; width: calc(100% + var(--shadow-cutoff-fix)); height: calc(100% + var(--shadow-cutoff-fix)); top: calc(0% - var(--shadow-cutoff-fix) / 2); left: calc(0% - var(--shadow-cutoff-fix) / 2); filter: blur(clamp(2px, 0.125em, 12px)); transition: filter var(--anim-time) var(--anim-ease); pointer-events: none; z-index: 0; }
        .glass-button-shadow::after { content: ""; position: absolute; inset: 0; border-radius: 9999px; background: linear-gradient(180deg, rgba(120,113,108,0.2), rgba(120,113,108,0.1)); width: calc(100% - var(--shadow-cutoff-fix) - 0.25em); height: calc(100% - var(--shadow-cutoff-fix) - 0.25em); top: calc(var(--shadow-cutoff-fix) - 0.5em); left: calc(var(--shadow-cutoff-fix) - 0.875em); padding: 0.125em; box-sizing: border-box; mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; transition: all var(--anim-time) var(--anim-ease); opacity: 1; }
        .glass-button { -webkit-tap-highlight-color: transparent; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all var(--anim-time) var(--anim-ease); background: linear-gradient(-75deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2), rgba(255,255,255,0.05)); box-shadow: inset 0 0.125em 0.125em rgba(120,113,108,0.05), inset 0 -0.125em 0.125em rgba(255,255,255,0.5), 0 0.25em 0.125em -0.125em rgba(120,113,108,0.2), 0 0 0.1em 0.25em inset rgba(255,255,255,0.2); }
        .glass-button:hover { transform: scale(0.975); backdrop-filter: blur(0.01em); }
        .glass-button-text { color: rgba(68,64,60,0.9); text-shadow: 0em 0.25em 0.05em rgba(68,64,60,0.1); transition: all var(--anim-time) var(--anim-ease); }
        .glass-input-wrap { position: relative; z-index: 2; transform-style: preserve-3d; border-radius: 9999px; }
        .glass-input { display: flex; position: relative; width: 100%; align-items: center; gap: 0.5rem; border-radius: 9999px; padding: 0.25rem; backdrop-filter: blur(clamp(1px, 0.125em, 4px)); transition: all 400ms cubic-bezier(0.25, 1, 0.5, 1); background: linear-gradient(-75deg, rgba(255,255,255,0.05), rgba(255,255,255,0.2), rgba(255,255,255,0.05)); box-shadow: inset 0 0.125em 0.125em rgba(120,113,108,0.05), inset 0 -0.125em 0.125em rgba(255,255,255,0.5), 0 0.25em 0.125em -0.125em rgba(120,113,108,0.2), 0 0 0.1em 0.25em inset rgba(255,255,255,0.2); }
        .glass-input::after { content: ""; position: absolute; z-index: 1; inset: 0; border-radius: 9999px; width: calc(100% + clamp(1px, 0.0625em, 4px)); height: calc(100% + clamp(1px, 0.0625em, 4px)); top: calc(0% - clamp(1px, 0.0625em, 4px) / 2); left: calc(0% - clamp(1px, 0.0625em, 4px) / 2); padding: clamp(1px, 0.0625em, 4px); box-sizing: border-box; background: conic-gradient(from var(--angle-1) at 50% 50%, rgba(120,113,108,0.5) 0%, transparent 5% 40%, rgba(120,113,108,0.5) 50%, transparent 60% 95%, rgba(120,113,108,0.5) 100%), linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.5)); mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite: exclude; pointer-events: none; }
        .glass-input-text-area { position: absolute; inset: 0; border-radius: 9999px; pointer-events: none; }
      `}</style>

      <Confetti ref={confettiRef} manualstart className="fixed top-0 left-0 w-full h-full pointer-events-none z-[999]" />
      <Modal />

      {/* Header */}
      <Link to="/" className="fixed top-4 left-4 z-20 flex items-center gap-2 md:left-1/2 md:-translate-x-1/2">
        <AdltrackLogo />
        <h1 className="text-base font-bold text-stone-800">Adltrack</h1>
      </Link>

      <div className="flex w-full flex-1 h-full items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 z-0"><GradientBackground /></div>
        
        <fieldset disabled={modalStatus !== 'closed'} className="relative z-10 flex flex-col items-center gap-6 w-full max-w-[340px] mx-auto p-4">
          <AnimatePresence mode="wait">
            {/* User Type Selection (Signup Only) */}
            {mode === 'signup' && authStep === 'userType' && (
              <motion.div key="userType-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="w-full flex flex-col items-center gap-6">
                <BlurFade delay={0.1} className="w-full text-center">
                  <p className="font-light text-3xl sm:text-4xl tracking-tight text-stone-800">Join Adltrack</p>
                  <p className="text-sm text-stone-500 mt-2">Select how you'd like to use Adltrack</p>
                </BlurFade>
                <BlurFade delay={0.2} className="w-full">
                  <UserTypeSelection selectedType={userType} onSelect={setUserType} />
                </BlurFade>
                <BlurFade delay={0.3} className="w-full">
                  <GlassButton 
                    onClick={handleProgressStep} 
                    disabled={!userType}
                    className={cn("w-full", !userType && "opacity-50 cursor-not-allowed")}
                  >
                    <span className="flex items-center justify-center gap-2">
                      Continue <ArrowRight className="w-4 h-4" />
                    </span>
                  </GlassButton>
                </BlurFade>
                <BlurFade delay={0.4}>
                  <p className="text-sm text-stone-500">
                    Already have an account?{' '}
                    <Link to="/login" className="text-stone-800 font-medium hover:underline">Sign in</Link>
                  </p>
                </BlurFade>
              </motion.div>
            )}

            {/* Name Step (Signup Only) */}
            {mode === 'signup' && authStep === 'name' && (
              <motion.div key="name-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="w-full flex flex-col items-center gap-6">
                <BlurFade delay={0} className="w-full text-center">
                  <p className="font-light text-3xl sm:text-4xl tracking-tight text-stone-800">
                    {userType === 'agency' ? "Your Agency Name" : "What's your name?"}
                  </p>
                </BlurFade>
                <BlurFade delay={0.1} className="w-full">
                  <div className="glass-input-wrap w-full">
                    <div className="glass-input">
                      <span className="glass-input-text-area"></span>
                      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                        {userType === 'agency' ? <Building2 className="h-5 w-5 text-stone-600" /> : <Heart className="h-5 w-5 text-stone-600" />}
                      </div>
                      <input
                        ref={nameInputRef}
                        type="text"
                        placeholder={userType === 'agency' ? "Agency name" : "Full name"}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="relative z-10 h-full w-0 flex-grow bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none py-3"
                      />
                      <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isNameValid ? "w-10 pr-1" : "w-0")}>
                        <GlassButton type="button" onClick={handleProgressStep} size="icon" contentClassName="text-stone-600 hover:text-stone-800">
                          <ArrowRight className="w-5 h-5" />
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </BlurFade>
                <BlurFade inView delay={0.2}>
                  <button type="button" onClick={handleGoBack} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Go back
                  </button>
                </BlurFade>
              </motion.div>
            )}

            {/* Email Step */}
            {authStep === 'email' && (
              <motion.div key="email-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="w-full flex flex-col items-center gap-6">
                <BlurFade delay={0} className="w-full text-center">
                  <p className="font-light text-3xl sm:text-4xl tracking-tight text-stone-800">
                    {mode === 'login' ? 'Welcome Back' : 'Enter your email'}
                  </p>
                  {mode === 'login' && <p className="text-sm text-stone-500 mt-2">Sign in to your Adltrack account</p>}
                </BlurFade>
                
                {mode === 'login' && (
                  <BlurFade delay={0.1}>
                    <div className="flex items-center justify-center gap-4 w-full">
                      <GlassButton contentClassName="flex items-center justify-center gap-2" size="sm">
                        <GoogleIcon /><span className="font-semibold text-stone-800">Google</span>
                      </GlassButton>
                    </div>
                    <div className="flex items-center w-full gap-2 py-4 mt-4">
                      <hr className="w-full border-stone-300"/>
                      <span className="text-xs font-semibold text-stone-400">OR</span>
                      <hr className="w-full border-stone-300"/>
                    </div>
                  </BlurFade>
                )}

                <BlurFade delay={mode === 'login' ? 0.2 : 0.1} className="w-full">
                  <div className="glass-input-wrap w-full">
                    <div className="glass-input">
                      <span className="glass-input-text-area"></span>
                      <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                        <Mail className="h-5 w-5 text-stone-600" />
                      </div>
                      <input
                        ref={emailInputRef}
                        type="email"
                        placeholder="Email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="relative z-10 h-full w-0 flex-grow bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none py-3"
                      />
                      <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isEmailValid ? "w-10 pr-1" : "w-0")}>
                        <GlassButton type="button" onClick={handleProgressStep} size="icon" contentClassName="text-stone-600 hover:text-stone-800">
                          <ArrowRight className="w-5 h-5" />
                        </GlassButton>
                      </div>
                    </div>
                  </div>
                </BlurFade>

                {mode === 'signup' && (
                  <BlurFade inView delay={0.2}>
                    <button type="button" onClick={handleGoBack} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                      <ArrowLeft className="w-4 h-4" /> Go back
                    </button>
                  </BlurFade>
                )}

                <BlurFade delay={0.3}>
                  <p className="text-sm text-stone-500">
                    {mode === 'login' ? (
                      <>Don't have an account? <Link to="/signup" className="text-stone-800 font-medium hover:underline">Sign up</Link></>
                    ) : (
                      <>Already have an account? <Link to="/login" className="text-stone-800 font-medium hover:underline">Sign in</Link></>
                    )}
                  </p>
                </BlurFade>
              </motion.div>
            )}

            {/* Password Step */}
            {authStep === 'password' && (
              <motion.div key="password-content" initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: 'easeOut' }} className="w-full flex flex-col items-center gap-6">
                <BlurFade delay={0} className="w-full text-center">
                  <p className="font-light text-3xl sm:text-4xl tracking-tight text-stone-800">
                    {mode === 'login' ? 'Enter your password' : 'Create a password'}
                  </p>
                  <p className="text-sm text-stone-500 mt-2">
                    {mode === 'login' ? `Signing in as ${email}` : 'At least 6 characters'}
                  </p>
                </BlurFade>
                
                <form onSubmit={handleFinalSubmit} className="w-full">
                  <BlurFade delay={0.1} className="w-full">
                    <div className="glass-input-wrap w-full">
                      <div className="glass-input">
                        <span className="glass-input-text-area"></span>
                        <div className="relative z-10 flex-shrink-0 flex items-center justify-center w-10 pl-2">
                          {isPasswordValid ? (
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-stone-600 hover:text-stone-800 transition-colors p-1 rounded-full">
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          ) : (
                            <Lock className="h-5 w-5 text-stone-600" />
                          )}
                        </div>
                        <input
                          ref={passwordInputRef}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          onKeyDown={handleKeyDown}
                          className="relative z-10 h-full w-0 flex-grow bg-transparent text-stone-800 placeholder:text-stone-400 focus:outline-none py-3"
                        />
                        <div className={cn("relative z-10 flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out", isPasswordValid ? "w-10 pr-1" : "w-0")}>
                          <GlassButton type="submit" size="icon" contentClassName="text-stone-600 hover:text-stone-800">
                            <ArrowRight className="w-5 h-5" />
                          </GlassButton>
                        </div>
                      </div>
                    </div>
                  </BlurFade>
                </form>

                <BlurFade inView delay={0.2}>
                  <button type="button" onClick={handleGoBack} className="flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Go back
                  </button>
                </BlurFade>
              </motion.div>
            )}
          </AnimatePresence>
        </fieldset>
      </div>
    </div>
  );
};

export default AuthComponent;
