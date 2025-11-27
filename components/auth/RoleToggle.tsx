"use client";

interface RoleToggleProps {
  role: "donor" | "ngo";
  setRole: (role: "donor" | "ngo") => void;
}

export default function RoleToggle({ role, setRole }: RoleToggleProps) {
  return (
    <div className="grid grid-cols-2 bg-gray-100 rounded-md">
      <button
        type="button"
        onClick={() => setRole("donor")}
        className={`
          py-2.5 text-sm font-semibold rounded-md transition-all duration-300
          ${role === "donor" 
            // ACTIVE STATE: Your custom color
            ? "bg-[#182F44] text-white shadow-md" 
            // INACTIVE STATE
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          }
        `}
      >
        Donor
      </button>
      
      <button
        type="button"
        onClick={() => setRole("ngo")}
        className={`
          py-2.5 text-sm font-semibold rounded-md transition-all duration-300
          ${role === "ngo" 
            // ACTIVE STATE: Your custom color
            ? "bg-[#182F44] text-white shadow-md" 
            // INACTIVE STATE
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
          }
        `}
      >
        NGO
      </button>
    </div>
  );
}