import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

// Google Fonts - Rajdhani (headings) + Barlow (body)
const link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Barlow:wght@300;400;500;600&display=swap";
document.head.appendChild(link);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<React.StrictMode><App /></React.StrictMode>);
