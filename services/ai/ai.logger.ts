
export function logAIUsage(payload: {
  userId?: string;
  inputType: string;
  source?: string;
  success: boolean;
}) {
  // In production, this would send data to a monitoring service
  console.log('[AI LOG]', {
    ...payload,
    timestamp: new Date().toISOString(),
  });
}
