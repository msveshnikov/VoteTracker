import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const style = document.createElement('style');
style.textContent = `
  /* Glass morphism effects */
  .glass {
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }
  
  .glass-dark {
    background: rgba(33, 37, 41, 0.75);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }
  
  /* Micro-interactions */
  .vote-btn {
    transition: all 0.2s ease;
  }
  
  .vote-btn:hover {
    transform: translateY(-2px);
  }
  
  .vote-btn:active {
    transform: translateY(0);
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.1);
  }
  
  ::-webkit-scrollbar-thumb {
    background: #4361EE;
    border-radius: 3px;
  }
  
  /* Progress bars animation */
  @keyframes growWidth {
    from { width: 0; }
    to { width: var(--target-width); }
  }
  
  .animate-grow-width {
    animation: growWidth 1s ease-out forwards;
  }
  
  .animate-pulse-slow {
    animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

document.head.appendChild(style);

createRoot(document.getElementById("root")!).render(<App />);
