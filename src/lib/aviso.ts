import { toast } from 'sonner';

type SakugaToast = HTMLElement & { show?: (texto?: string) => void; hide?: () => void };

/** Mostra o aviso "salvo" com o efeito Sakuga (elemento <sakuga-toast> do index.html).
 *  Se o elemento não carregou, cai no aviso comum, para o usuário sempre ver a confirmação. */
export function avisarSalvo(texto: string): void {
  const el = document.querySelector<SakugaToast>('sakuga-toast');
  if (el && typeof el.show === 'function') el.show(texto);
  else toast.success(texto);
}
