import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Shield, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  React.useEffect(() => {
    if (message && duration) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration, onClose]);

  const icons = {
    success: <CheckCircle2 className="w-6 h-6" />,
    error: <Shield className="w-6 h-6" />,
    warning: <AlertCircle className="w-6 h-6" />,
  };

  const bgColors = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-yellow-600 text-white',
  };

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 ${bgColors[type] || bgColors.success}`}
        >
          {icons[type] || icons.success}
          <span className="font-semibold">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;
