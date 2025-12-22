import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="text-center py-8 mt-16 border-t border-gray-800">
      <p className="text-gray-400 text-sm">
        تمامی حقوق برای <span className="font-semibold text-cyan-400">مکمل فیت پرو</span> محفوظ است.
      </p>
      <p className="text-gray-500 text-xs mt-2">
        این وب‌سایت با عشق و دقت توسط آریان مرادیان طراحی و توسعه داده شده است.
      </p>
    </footer>
  );
};

export default Footer;
