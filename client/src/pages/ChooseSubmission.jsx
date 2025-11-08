import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserIcon, UserGroupIcon } from "@heroicons/react/24/outline";
import NavBar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ChooseSubmission() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState(null);

  const handleSelection = (type) => {
    setSelectedType(type);

    if (type === "individual") {
      navigate("/submit/individual");
    } else {
      navigate("/submit/group");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* NavBar */}
      <NavBar />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-16 flex-1 flex flex-col items-center justify-center">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            Choose Your Submission
          </h1>
          <p className="text-gray-600">
            Please select whether you are submitting individually / as a group
          </p>
        </div>

        {/* Selection Cards */}
        <div className="w-full max-w-md space-y-6">
          {/* Individual Card */}
          <button
            onClick={() => handleSelection("individual")}
            className="w-full bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-gray-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 group"
          >
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                <UserIcon className="w-8 h-8 text-gray-600" />
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Individual
              </h2>
              
              {/* Description */}
              <p className="text-sm text-gray-500">
                Submit your own project
              </p>
            </div>
          </button>

          {/* Group Card */}
          <button
            onClick={() => handleSelection("group")}
            className="w-full bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-gray-300 hover:shadow-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 group"
          >
            <div className="flex flex-col items-center">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-gray-200 transition-colors">
                <UserGroupIcon className="w-8 h-8 text-gray-600" />
              </div>
              
              {/* Title */}
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                Group
              </h2>
              
              {/* Description */}
              <p className="text-sm text-gray-500">
                Submit your group's project
              </p>
            </div>
          </button>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}