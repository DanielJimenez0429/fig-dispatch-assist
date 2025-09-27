interface LoginAttempt {
  count: number;
  lastAttempt: number;
  blockedUntil?: number;
}

const LOGIN_ATTEMPTS_KEY = 'telconova-login-attempts';
const MAX_ATTEMPTS = 3;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes

export function getLoginAttempts(email: string): LoginAttempt {
  const attempts = localStorage.getItem(`${LOGIN_ATTEMPTS_KEY}-${email}`);
  if (!attempts) {
    return { count: 0, lastAttempt: 0 };
  }
  return JSON.parse(attempts);
}

export function recordFailedAttempt(email: string): LoginAttempt {
  const attempts = getLoginAttempts(email);
  const now = Date.now();
  
  const newAttempts: LoginAttempt = {
    count: attempts.count + 1,
    lastAttempt: now,
    blockedUntil: attempts.count + 1 >= MAX_ATTEMPTS ? now + BLOCK_DURATION : undefined
  };

  localStorage.setItem(`${LOGIN_ATTEMPTS_KEY}-${email}`, JSON.stringify(newAttempts));
  return newAttempts;
}

export function clearLoginAttempts(email: string): void {
  localStorage.removeItem(`${LOGIN_ATTEMPTS_KEY}-${email}`);
}

export function isAccountBlocked(email: string): { blocked: boolean; unblockTime?: Date } {
  const attempts = getLoginAttempts(email);
  
  if (attempts.blockedUntil && attempts.blockedUntil > Date.now()) {
    return {
      blocked: true,
      unblockTime: new Date(attempts.blockedUntil)
    };
  }
  
  return { blocked: false };
}

export function formatBlockTime(date: Date): string {
  return date.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}