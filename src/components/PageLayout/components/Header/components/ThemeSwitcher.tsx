import React from 'react';
import { Button } from 'react-bootstrap';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';

export const ThemeSwitcher: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();

  return (
    <Button
      id="theme-toggle-btn"
      variant="outline-secondary"
      size="sm"
      onClick={toggleTheme}
      className="p-1 d-flex align-items-center justify-content-center"
      style={{ width: '32px', height: '32px' }}
      title={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
      aria-label={theme === 'dark' ? t.common.lightMode : t.common.darkMode}
    >
      {theme === 'dark' ? (
        <Sun size={15} className="text-warning" />
      ) : (
        <Moon size={15} className="text-primary" />
      )}
    </Button>
  );
};

export default ThemeSwitcher;
