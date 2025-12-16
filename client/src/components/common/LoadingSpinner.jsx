import { motion } from "framer-motion";

const LoadingSpinner = ({ fullScreen = true, size = "lg", text = "Loading..." }) => {
  // Ukuran Spinner berdasarkan props
  const sizeClasses = {
    sm: "w-5 h-5 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-16 h-16 border-4",
  };

  // Konten Spinner
  const SpinnerContent = () => (
    <div className="flex flex-col items-center justify-center gap-4">
      <motion.div
        className={`rounded-full border-gray-200 border-t-[#1B211A] ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      {/* Tampilkan teks hanya jika ukurannya bukan small (misal bukan di dalam tombol) */}
      {size !== "sm" && text && (
        <motion.p
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
          className="text-[#1B211A] font-semibold text-sm tracking-widest uppercase"
        >
          {text}
        </motion.p>
      )}
    </div>
  );

  // Jika Full Screen (Overlay)
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
        <SpinnerContent />
      </div>
    );
  }

  // Jika Inline (misal di tengah div)
  return (
    <div className="flex justify-center items-center py-4 w-full h-full min-h-50">
      <SpinnerContent />
    </div>
  );
};

export default LoadingSpinner;
