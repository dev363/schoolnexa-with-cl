import React from 'react';
import { Dropdown } from 'react-bootstrap';
import { Globe } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { LanguageCode } from '@/i18n/types';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, availableLanguages } = useLanguage();

  return (
    <Dropdown align="end">
      <Dropdown.Toggle
        id="language-switcher-btn"
        variant="outline-secondary"
        size="sm"
        className="d-flex align-items-center gap-1 py-1 px-2"
        style={{ height: '32px' }}
        title="Change language"
      >
        <Globe size={14} />
        <span className="font-monospace text-uppercase" style={{ fontSize: '0.75rem' }}>
          {language}
        </span>
      </Dropdown.Toggle>

      <Dropdown.Menu className="shadow border p-1" style={{ minWidth: '160px' }}>
        {availableLanguages.map((lang) => (
          <Dropdown.Item
            key={lang.code}
            id={`lang-opt-${lang.code}`}
            active={language === lang.code}
            onClick={() => setLanguage(lang.code as LanguageCode)}
            className="d-flex align-items-center justify-content-between py-1.5 px-2 rounded small"
          >
            <span>{lang.nativeName}</span>
            <span className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
              {lang.code.toUpperCase()}
            </span>
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher;
