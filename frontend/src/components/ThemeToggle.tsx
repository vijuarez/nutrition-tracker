import s from './ThemeToggle.module.scss';
import { useTheme } from '../contexts/ThemeContext';

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <select
      className={s.ThemeToggle}
      value={theme}
      onChange={(e) => setTheme(e.target.value as 'light original' | 'dark original')}
    >
      <option value="light original">Light Original</option>
      <option value="dark original">Dark Original</option>
    </select>
  );
}
