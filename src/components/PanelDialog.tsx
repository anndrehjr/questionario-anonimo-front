import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';

export function PanelDialog({ title, children, onClose, busy = false, danger = false }: {
  title: string; children: ReactNode; onClose: () => void; busy?: boolean; danger?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={ref} className="panel-dialog" aria-labelledby="panel-dialog-title"
    role={danger ? 'alertdialog' : 'dialog'}
    onCancel={e => { e.preventDefault(); if (!busy) onClose(); }}
    onClick={e => { if (e.target === e.currentTarget && !busy) onClose(); }}>
    <div className="dialog-body">
      <button className="desk-icon dialog-close" aria-label="Fechar" disabled={busy} onClick={onClose}><X size={18}/></button>
      <h2 id="panel-dialog-title">{title}</h2>
      {children}
    </div>
  </dialog>;
}

