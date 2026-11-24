export type Tema = 'light' | 'dark';
const CHAVE = 'voto_tema';

export function temaAtual(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo === 'light' || salvo === 'dark') return salvo;
  } catch { /* armazenamento indisponível */ }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.theme = tema;
  const meta = document.querySelector('meta[name="theme-color"]');
  meta?.setAttribute('content', tema === 'dark' ? '#121417' : '#f7f8f5');
}

export function salvarTema(tema: Tema): void {
  try { localStorage.setItem(CHAVE, tema); } catch { /* ignora */ }
  aplicarTema(tema);
}
