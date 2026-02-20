const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/**
 * Un limiteur de débit simple en mémoire.
 * Note : En environnement serverless (Vercel), la mémoire est réinitialisée
 * lors des "cold starts", mais cela reste une première barrière efficace.
 */
export function rateLimit(
  ip: string,
  limit: number = 3,
  windowMs: number = 60000,
) {
  const now = Date.now();
  const userData = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  // Réinitialise si la fenêtre de temps est passée
  if (now - userData.lastReset > windowMs) {
    userData.count = 1;
    userData.lastReset = now;
  } else {
    userData.count++;
  }

  rateLimitMap.set(ip, userData);

  return {
    success: userData.count <= limit,
    remaining: Math.max(0, limit - userData.count),
    reset: userData.lastReset + windowMs,
  };
}
