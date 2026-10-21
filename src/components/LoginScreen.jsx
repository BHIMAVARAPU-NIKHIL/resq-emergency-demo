import React, { useState } from 'react';
import { ShieldCheck, Bike, HeartHandshake, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import GradientPlaceholder from './GradientPlaceholder';

const ROLES = [
  {
    id: 'guardian',
    name: 'Guardian',
    subtitle: 'Nikhil',
    description: 'The person who takes care of the member',
    defaultPhone: 'Sample account',
    icon: ShieldCheck,
    color: 'text-tealbrand-700 bg-tealbrand-50 border-tealbrand-200'
  },
  {
    id: 'responder',
    name: 'Responder',
    subtitle: 'Akshay (Bike Unit)',
    description: 'Driver or rider nearby who can help first',
    defaultPhone: 'Sample account',
    icon: Bike,
    color: 'text-amber-800 bg-amber-50 border-amber-200'
  },
  {
    id: 'member',
    name: 'Member',
    subtitle: 'Bavitha (51 yrs)',
    description: 'The person who needs protection',
    defaultPhone: 'Sample account',
    icon: HeartHandshake,
    color: 'text-emergency-700 bg-emergency-50 border-emergency-200'
  }
];

export default function LoginScreen({ onLoginSuccess }) {
  const [step, setStep] = useState('select_role'); // 'select_role' | 'enter_phone' | 'enter_otp'
  const [selectedRole, setSelectedRole] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const simulationAccessCode = '123456';

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setPhoneNumber(role.defaultPhone);
    setErrorMessage('');
    setStep('enter_phone');
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setErrorMessage('Please enter the account label.');
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('enter_otp');
    }, 400);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    // This public simulation accepts a six-digit access code.
    if (otp.trim() === simulationAccessCode || /^\d{6}$/.test(otp.trim())) {
      setErrorMessage('');
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        onLoginSuccess(selectedRole.id);
      }, 300);
    } else {
      setErrorMessage('Invalid code format. Enter the six-digit access code.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col justify-center items-center px-4 py-8 font-sans">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-lg p-6 sm:p-8 shadow-xs">
        <GradientPlaceholder
          label="ResQ emergency response simulation"
          filename="resq-hero.webp"
          className="mb-5 h-28"
        />
        {/* App Identity */}
        <div className="mb-6">
          <img src="/resq-logo.svg" alt="ResQ logo" className="w-20 h-20 object-contain mb-3" />
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded bg-tealbrand-50 border border-tealbrand-200 text-tealbrand-800 text-[11px] font-semibold mb-2">
            <span>Emergency Response Network</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">
            Welcome to ResQ
          </h1>
          <p className="text-sm text-stone-600 mt-1">
            Help reaches you first. Choose your role to explore the simulation.
          </p>
        </div>

        {/* Visible error message banner */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-emergency-50 border border-emergency-200 rounded text-xs text-emergency-800 flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-emergency-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Step 1: Select Role */}
        {step === 'select_role' && (
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-500 block">
              Select access role:
            </span>
            {ROLES.map((role) => {
              const Icon = role.icon;
              return (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role)}
                  className="w-full text-left p-3.5 rounded border border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50 transition-colors flex items-start space-x-3 group"
                >
                  <div className={`w-10 h-10 rounded border flex items-center justify-center flex-shrink-0 ${role.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-stone-900">{role.name}</span>
                      <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-stone-700 transition-colors" />
                    </div>
                    <span className="text-xs font-medium text-tealbrand-700 block mt-0.5">{role.subtitle}</span>
                    <span className="text-xs text-stone-500 block mt-0.5">{role.description}</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Step 2: Enter account label */}
        {step === 'enter_phone' && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setStep('select_role');
              }}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to role selection</span>
            </button>

            <div className="p-3 bg-stone-50 border border-stone-200 rounded">
              <span className="text-[11px] uppercase font-semibold text-stone-500 block">Role</span>
              <span className="text-sm font-bold text-stone-900">{selectedRole?.name}</span>
              <span className="text-xs text-stone-600 block">{selectedRole?.description}</span>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Enter account label:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Sample account"
                  className="w-full text-sm px-3 py-2 border border-stone-300 rounded focus:outline-none focus:border-tealbrand-600 font-mono"
                  autoFocus
                />
              </div>
              <span className="text-[11px] text-stone-500 block mt-1">
                Simulation only: no real phone number is used or contacted.
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tealbrand-700 hover:bg-tealbrand-800 text-white text-sm font-semibold py-2.5 rounded transition-colors flex items-center justify-center space-x-1.5"
            >
              <span>{isLoading ? 'Sending code...' : 'Continue'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Step 3: Enter OTP */}
        {step === 'enter_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setStep('enter_phone');
              }}
              className="text-xs text-stone-500 hover:text-stone-800 flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Change account</span>
            </button>

            <div>
              <span className="text-xs text-stone-600 block">
                Simulation access for <strong className="text-stone-900">{phoneNumber}</strong>
              </span>
              <div className="mt-2 p-2.5 bg-tealbrand-50 border border-tealbrand-200 rounded text-xs text-tealbrand-900 flex items-center space-x-2">
                <Info className="w-4 h-4 text-tealbrand-700 flex-shrink-0" />
                <span>Public simulation only: use <strong>{simulationAccessCode}</strong>. No real verification message is sent.</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Enter 6-digit OTP code:
              </label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full text-center text-lg tracking-widest font-mono py-2 border border-stone-300 rounded focus:outline-none focus:border-tealbrand-600"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-tealbrand-700 hover:bg-tealbrand-800 text-white text-sm font-semibold py-2.5 rounded transition-colors flex items-center justify-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Verify & Enter Dashboard'}</span>
            </button>
          </form>
        )}
      </div>

      {/* Footer info */}
      <div className="mt-4 text-center text-xs text-stone-500 max-w-sm">
        ResQ public simulation &bull; no real calls or emergency response &bull; sample data only
      </div>
    </div>
  );
}
