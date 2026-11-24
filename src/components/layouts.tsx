import { Suspense, useEffect, useState, type ReactNode } from 'react';
import { Link, Outlet, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, CircleHelp, FilePlus2, FolderOpen, GraduationCap, LayoutDashboard, LogOut, Menu, PanelLeft, ShieldCheck, Sparkles, X } from 'lucide-react';
import { toast } from 'sonner';
import { verificarSessao, sair } from '../lib/api';
import { ThemeToggle } from './ThemeToggle';

export function PublicLayout() {
  return <><header className="public-header"><span className="brand"><span className="brand-mark"><CircleHelp size={18}/></span> voto</span><span className="privacy-pill"><span className="privacy-dot"/> Anônimo e seguro</span></header><main><Outlet/></main></>;
}

export function PanelLoading({ text = 'Carregando painel…' }: { text?: string }) {
  return <div className="panel-loading" role="status"><span className="load-ring"/>{text}</div>;
}

export function AdminGuard() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);
  const location = useLocation();
  useEffect(() => {
    let ativo = true;
    verificarSessao().then(sessao => { if (ativo) setAutorizado(sessao); });
    return () => { ativo = false; };
  }, [location.pathname]);
  if (autorizado === null) return <PanelLoading text="Verificando acesso…"/>;
  return autorizado ? <Outlet/> : <Navigate to="/admin/login" replace state={{ from: location.pathname }}/>;
}

function Wordmark() {
  return <span className="desk-brand"><span className="voto-symbol" aria-hidden="true"><i/><i/><i/></span>voto<span className="brand-stop">.</span></span>;
}

export function AdminLayout() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const home = pathname.replace(/\/$/, '') === '/admin';
  const collection = home && hash === '#questionarios';
  const create = pathname.endsWith('/novo');
  const current = home ? collection ? 'Questionários' : 'Visão geral' : create ? 'Novo questionário'
    : pathname.endsWith('/editar') ? 'Editar questionário' : pathname.endsWith('/apresentar') ? 'Apresentação' : 'Resultados';
  useEffect(() => {
    setMobileOpen(false);
    if (hash !== '#questionarios') window.scrollTo(0, 0);
  }, [pathname, hash]);
  useEffect(() => {
    if (!mobileOpen) return;
    const dismiss = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', dismiss);
    return () => window.removeEventListener('keydown', dismiss);
  }, [mobileOpen]);
  const handleSair = async () => {
    try { await sair(); navigate('/admin/login'); }
    catch { toast.error('Não foi possível sair do painel. Tente novamente.'); }
  };
  const links = [
    { to: '/admin', label: 'Visão geral', icon: LayoutDashboard, active: home && !collection },
    { to: '/admin#questionarios', label: 'Questionários', icon: FolderOpen, active: collection },
    { to: '/admin/novo', label: 'Novo questionário', icon: FilePlus2, active: create },
  ];
  return <div className="desk">
    <a className="desk-skip" href="#conteudo">Ir para o conteúdo</a>
    <aside className={'desk-side' + (mobileOpen ? ' open' : '')}>
      <div className="side-head"><Link to="/admin" aria-label="Voto, início"><Wordmark/></Link>
        <button className="desk-icon mobile-menu" aria-controls="desk-navigation" aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Fechar navegação' : 'Abrir navegação'} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X/> : <Menu/>}</button></div>
      <div className="side-body" id="desk-navigation">
        <div className="side-label">Navegação</div>
        <nav aria-label="Menu do professor">{links.map(({to, label, icon: Icon, active}) =>
          <Link key={to} className={'side-link' + (active ? ' selected' : '')} to={to} aria-current={active ? 'page' : undefined}
            onClick={() => { setMobileOpen(false); if (home && to === '/admin#questionarios') document.getElementById('questionarios')?.scrollIntoView(); }}>
            <Icon size={18}/>{label}{active && <i/>}</Link>)}</nav>
        <div className="side-bottom"><div className="side-person"><span><GraduationCap size={20}/></span><div><b>Educador</b><small>Espaço do professor</small></div></div>
          <button className="side-link" onClick={handleSair}><LogOut size={17}/>Sair do painel</button></div>
      </div>
    </aside>
    <div className="desk-main"><header className="desk-top"><div className="crumbs"><PanelLeft size={16}/><Link to="/admin">Painel</Link><ChevronRight size={13}/><strong>{current}</strong></div>
      <div className="top-right"><span><ShieldCheck size={15}/> Ambiente anônimo</span><ThemeToggle/></div></header>
      <main id="conteudo" className="desk-content"><Suspense fallback={<PanelLoading/>}><Outlet/></Suspense></main></div>
  </div>;
}

export function SectionHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return <div className="section-header"><div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}<h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</div>;
}
export function BackLink({ to = '/admin', children = 'Voltar aos questionários' }: { to?: string; children?: string }) {
  return <Link className="back-link" to={to}><ArrowLeft size={15}/>{children}</Link>;
}
export function EmptyPublicState({ title, text }: { title: string; text: string }) {
  return <section className="public-state"><div className="state-icon"><Sparkles size={23}/></div><h1>{title}</h1><p>{text}</p></section>;
}

