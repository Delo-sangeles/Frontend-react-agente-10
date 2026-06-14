// App.tsx
import { useTheme } from "./hooks/useTheme";
import { ChatWindow } from "./components/Chat/ChatWindow";
import "./index.css";

function App() {
  const { theme, toggle } = useTheme();

  return (
    <ChatWindow theme={theme} onThemeToggle={toggle} />
  );
}

export default App;