import { useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { salvarTema, temaAtual, type Tema } from '../lib/tema';

export function ThemeToggle() {
  const [tema, setTema] = useState<Tema>(temaAtual);
  const alternar = () => { const novo: Tema = tema === 'dark' ? 'light' : 'dark'; salvarTema(novo); setTema(novo); };
  return (
    <button type="button" className="theme-toggle" onClick={alternar} aria-label={tema === 'dark' ? 'Usar tema claro' : 'Usar tema escuro'} title={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}>
      {tema === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
