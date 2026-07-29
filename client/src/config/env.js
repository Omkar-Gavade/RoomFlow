/** Frontend runtime config (Vite exposes only VITE_* vars). */
export const env = Object.freeze({
  API_URL: import.meta.env.VITE_API_URL || '/api/v1',
  isProduction: import.meta.env.PROD,
});

export default env;
