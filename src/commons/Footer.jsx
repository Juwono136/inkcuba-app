export default function Footer() {
  return (
    <footer className="bg-gray-200 border-t border-gray-300 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          {/* Left side - Brand */}
          <div className="flex items-center">
            <span className="font-semibold text-base">InkCuba</span>
          </div>

          {/* Right side - Copyright */}
          <div>
            © 2025 InkCuba. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}