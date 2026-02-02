import s from './ThemeToggle.module.scss';
import { useTheme } from '../contexts/ThemeContext';
import { FaSun, FaMoon, FaAdjust } from 'react-icons/fa';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className={s.ThemeToggle}>
      <button
        className={`${s.themeButton} ${theme === 'light' ? s.active : ''}`}
        onClick={() => setTheme('light')}
        title="Light theme"
      >
        <FaSun />
      </button>
      <button
        className={`${s.themeButton} ${theme === 'dark' ? s.active : ''}`}
        onClick={() => setTheme('dark')}
        title="Dark theme"
      >
        <FaMoon />
      </button>
      <button
        className={`${s.themeButton} ${theme === 'high-contrast' ? s.active : ''}`}
        onClick={() => setTheme('high-contrast')}
        title="High contrast theme"
      >
        <FaAdjust />
      </button>
    </div>
  );
}
