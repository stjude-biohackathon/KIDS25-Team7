import React, { useState, useEffect } from "react";
import { Button } from "react-bootstrap";
import { Sun, Moon } from "lucide-react"; // Import icons
import Cookies from "js-cookie"; //for light dark mode persistence

const ThemeChanger: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  // On mount, detect current theme
  useEffect(() => {
    const savedTheme = Cookies.get("theme") || "light";
    setDarkMode(savedTheme === "dark");
    document.documentElement.setAttribute("data-bs-theme", savedTheme);
  }, []);
  

  const toggleTheme = () => {
    const newTheme = darkMode ? "light" : "dark";
    document.documentElement.setAttribute("data-bs-theme", newTheme);
    setDarkMode(!darkMode);
        // Save preference in a cookie for 30 days
    Cookies.set("theme", newTheme, { expires: 30 });
  };

  return (
    <Button
  onClick={toggleTheme}
  variant={darkMode ? "light" : "dark"}
  className="d-flex justify-content-center align-items-center p-2"
>
  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
</Button>
  );
};

export default ThemeChanger;
