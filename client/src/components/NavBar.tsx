import { NavLink } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/prompts", label: "Prompts" },
];

export default function NavBar() {
  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-gray-900/80 backdrop-blur border-b border-gray-800">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-1">
        <span className="font-bold text-white mr-6 text-lg">Draw My Slop</span>
        {links.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              [
                "px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-700 text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800",
              ].join(" ")
            }
          >
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
