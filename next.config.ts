/** @type {import('next').NextConfig} */
const nextConfig = {
  i18n: {
    locales: ['ar'],
    defaultLocale: 'ar',
    localeDetection: false, // لا تكتشف لغة المتصفح
  },
  reactStrictMode: true,
};

export default nextConfig;
