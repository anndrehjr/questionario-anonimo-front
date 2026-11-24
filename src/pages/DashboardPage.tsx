import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import { Activity, ArrowDownUp, BarChart3, ChartPie, Check, ChevronDown, Copy, Download, FileQuestion, Files, FolderOpen, Layers3, Link2, ListFilter, MonitorPlay, MoreHorizontal, Pencil, Plus, QrCode, RefreshCw, Search, ShieldCheck, Trash2, Upload, Users, Waves, X } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toast } from 'sonner';
import { alterarAtivo, excluirQuiz, listarQuizzes, obterResultados, salvarQuiz } from '../lib/api';
import { lerQuizJson, MODELO_IMPORTACAO } from '../lib/importar';
import { baixarArquivo, baixarResultados } from '../lib/downloads';
import { slugify } from '../lib/utils';
import { isMock } from '../lib/mock';
import { SignalField } from '../components/SignalField';
import { PanelDialog } from '../components/PanelDialog';
import type { Quiz } from '../types';

const numero = new Intl.NumberFormat('pt-BR');
const formatoData = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
const normalizar = (texto: string) => texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR').trim();
function dataCriacao(valor?: string) {
  if (!valor) return '';
  const data = new Date(valor.length === 10 ? valor + 'T12:00:00' : valor);
  return Number.isNaN(data.getTime()) ? '' : formatoData.format(data);
}
const linkPublico = (quiz: Quiz) => window.location.origin + '/q/' + encodeURIComponent(quiz.slug);
type Filtro = 'todos' | 'ativos' | 'encerrados';
type Modal = { tipo: 'qr' | 'excluir'; quiz: Quiz };

function Metric({ kind, label, value, note }: { kind: 'sheets' | 'signal' | 'bars'; label: string; value?: number; note: string }) {
  const Icon = { sheets: Files, signal: Activity, bars: Users }[kind];
  return <article className={'metric ' + kind}><div className="metric-top"><Icon size={17}/><h2>{label}</h2></div>
    <strong>{value === undefined ? '—' : numero.format(value)}</strong><small>{note}</small>
    <div className="metric-art" aria-hidden="true"><i/><i/><i/></div></article>;
}

function CollectionStatus({ total, active, ready, onFilter }: { total: number; active: number; ready: boolean; onFilter: (f: Filtro) => void }) {
  const percent = total > 0 ? Math.round(100 * active / total) : 0;
  return <aside className="collection-summary panel-surface"><header><ChartPie size={18}/><h2>Status da coleta</h2></header>
    <div className="ring-stage"><div className="collection-ring" style={{background: 'conic-gradient(var(--aqua) 0 ' + (ready && total ? active / total * 360 : 0) + 'deg, var(--ring-track) 0)'}}>
      <div><strong>{ready && total ? percent + '%' : '—'}</strong><small>em coleta</small></div></div></div>
    <div className="ring-legend">
      <button onClick={() => onFilter('ativos')}><i/>Recebendo<strong>{ready ? numero.format(active) : '—'}</strong></button>
      <button onClick={() => onFilter('encerrados')}><i/>Encerrados<strong>{ready ? numero.format(total - active) : '—'}</strong></button>
    </div></aside>;
}

export default function DashboardPage() {
  const client = useQueryClient();
  const { hash } = useLocation();
  const file = useRef<HTMLInputElement>(null);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [ordem, setOrdem] = useState('recentes');
  const [menu, setMenu] = useState<number | null>(null);
  const [modal, setModal] = useState<Modal | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const query = useQuery({ queryKey: ['quizzes'], queryFn: listarQuizzes });
  const items = query.data;
  const total = items?.length ?? 0;
  const ativos = items?.filter(q => q.ativo).length ?? 0;
  const participacoes = items?.reduce((soma, q) => soma + (q.participacoes ?? 0), 0);
  const visiveis = useMemo(() => (items ?? []).filter(q =>
    normalizar(q.titulo).includes(normalizar(busca)) && (filtro === 'todos' || q.ativo === (filtro === 'ativos')))
    .sort((a, b) => ordem === 'nome' ? a.titulo.localeCompare(b.titulo, 'pt-BR')
      : ordem === 'respostas' ? (b.participacoes ?? 0) - (a.participacoes ?? 0) || b.id - a.id : b.id - a.id),
    [items, busca, filtro, ordem]);
  useEffect(() => {
    if (hash === '#questionarios') document.getElementById('questionarios')?.scrollIntoView();
  }, [hash]);
  useEffect(() => {
    if (menu === null) return;
    const outside = (e: PointerEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenu(null); };
    const escape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { menuRef.current?.querySelector('button')?.focus(); setMenu(null); }
    };
    window.addEventListener('pointerdown', outside);
    window.addEventListener('keydown', escape);
    return () => { window.removeEventListener('pointerdown', outside); window.removeEventListener('keydown', escape); };
  }, [menu]);
  const refresh = () => client.invalidateQueries({ queryKey: ['quizzes'] });
  const importar = useMutation({
    mutationFn: async (arquivo: File) => {
      const q = lerQuizJson(await arquivo.text());
      await salvarQuiz({ ...q, slug: isMock ? slugify(q.titulo) : '', ativo: true });
    },
    onSuccess: () => { refresh(); toast.success('Questionário importado.'); },
    onError: e => toast.error(e instanceof Error && !('response' in e) ? e.message : 'Falha ao importar o questionário.'),
  });
  const toggle = useMutation({
    mutationFn: (q: Quiz) => alterarAtivo(q.id, !q.ativo),
    onSuccess: refresh, onError: () => toast.error('Não foi possível alterar a coleta.'),
  });
  const remover = useMutation({
    mutationFn: excluirQuiz, onSuccess: () => { refresh(); setModal(null); toast.success('Questionário excluído.'); },
    onError: () => toast.error('Não foi possível excluir o questionário.'),
  });
  const exportar = async (q: Quiz) => {
    setMenu(null);
    try { baixarResultados(await obterResultados(q.id), q.slug); toast.success('CSV exportado.'); }
    catch { toast.error('Não foi possível exportar os resultados.'); }
  };
  const copiar = async (q: Quiz) => {
    setMenu(null);
    try { await navigator.clipboard.writeText(linkPublico(q)); toast.success('Link copiado.'); }
    catch { setModal({ tipo: 'qr', quiz: q }); toast.info('Selecione o link para copiá-lo.'); }
  };
  const limpar = () => { setBusca(''); setFiltro('todos'); };
  return <div className="overview">
    <section className="desk-hero"><SignalField/><div className="hero-body">
      <span className="hero-kicker"><Waves size={18}/>Painel do educador</span>
      <h1>Visão geral da turma</h1>
      <p>Crie questionários e acompanhe a participação da turma.</p>
      <div className="hero-buttons"><Link className="desk-btn bright" to="/admin/novo"><Plus size={17}/>Novo questionário</Link>
        <button className="desk-btn ghost" disabled={importar.isPending} onClick={() => file.current?.click()}><Upload size={16}/>{importar.isPending ? 'Importando…' : 'Importar JSON'}</button>
        <input hidden ref={file} type="file" accept="application/json,.json" aria-label="Arquivo JSON" onChange={e => { const f = e.target.files?.[0]; e.target.value = ''; if (f) importar.mutate(f); }}/>
      </div></div></section>
    <div className="overview-metrics">
      <Metric kind="sheets" label="Questionários" value={items?.length} note="Criados neste painel"/>
      <Metric kind="signal" label="Em coleta" value={items ? ativos : undefined} note="Com link ativo"/>
      <Metric kind="bars" label="Participações" value={participacoes} note="Envios da turma"/>
    </div>
    <div className="collection-layout"><section id="questionarios" className="collection panel-surface" aria-labelledby="collection-title">
      <header className="collection-head"><div><FolderOpen size={19}/><h2 id="collection-title">Meus questionários</h2></div>
        <button className="template-link" onClick={() => baixarArquivo('modelo-questionario.json', JSON.stringify(MODELO_IMPORTACAO, null, 2), 'application/json')}><Download size={15}/>Modelo JSON</button></header>
      <div className="collection-tools"><label className="desk-search"><Search size={16}/><input aria-label="Buscar questionários" placeholder="Buscar questionário" value={busca} onChange={e => setBusca(e.target.value)}/>{busca && <button aria-label="Limpar busca" onClick={() => setBusca('')}><X size={15}/></button>}</label>
        <label className="desk-select"><ArrowDownUp size={15}/><select aria-label="Ordenar questionários" value={ordem} onChange={e => setOrdem(e.target.value)}><option value="recentes">Mais recentes</option><option value="nome">Nome (A–Z)</option><option value="respostas">Mais participações</option></select><ChevronDown size={13}/></label></div>
      <div className="collection-filters" aria-label="Filtrar por status">{([['todos','Todos'],['ativos','Em coleta'],['encerrados','Encerrados']] as const).map(([value, label]) =>
        <button key={value} aria-pressed={filtro === value} onClick={() => setFiltro(value)}>{label}</button>)}</div>
      {query.isPending ? <div className="list-skeleton" role="status" aria-label="Carregando questionários"><i/><i/></div>
        : query.isError && !items ? <div className="collection-empty" role="alert"><ListFilter/><h3>Não foi possível carregar os questionários</h3><button className="desk-btn" onClick={() => query.refetch()}><RefreshCw size={15}/>Tentar novamente</button></div>
        : !visiveis.length ? <div className="collection-empty"><FileQuestion/><h3>{total ? 'Nenhum questionário encontrado' : 'Crie seu primeiro questionário'}</h3>
          {total ? <button className="desk-btn" onClick={limpar}>Limpar filtros</button> : <Link className="desk-btn" to="/admin/novo"><Plus size={16}/>Novo questionário</Link>}</div>
        : <ul className="quiz-rows">{visiveis.map(q => {
          const resultados = '/admin/quizzes/' + q.id + '/resultados';
          const date = dataCriacao(q.criadoEm);
          return <li className="quiz-row" key={q.id}><div className="row-title"><span className="quiz-glyph"><Layers3 size={21}/></span><div><Link to={resultados}>{q.titulo}</Link>
            <small>{q.perguntas.length} {q.perguntas.length === 1 ? 'pergunta' : 'perguntas'}{date && ' · ' + date}</small></div></div>
            <div className="row-details"><span className="row-count" title="Participações"><Users size={15}/>{numero.format(q.participacoes ?? 0)}<span className="sr-only"> participações</span></span>
              <button className={'collect-badge' + (q.ativo ? ' active' : '')} aria-label={(q.ativo ? 'Encerrar' : 'Reabrir') + ' coleta de ' + q.titulo} title={q.ativo ? 'Encerrar coleta' : 'Reabrir coleta'} disabled={toggle.isPending} onClick={() => toggle.mutate(q)}><i/>{q.ativo ? 'Em coleta' : 'Encerrado'}</button></div>
            <div className="row-actions"><Link className="desk-icon" to={resultados} aria-label={'Resultados de ' + q.titulo} title="Ver resultados"><BarChart3 size={17}/></Link>
              <button className="desk-icon" title="Compartilhar" aria-label={'Compartilhar ' + q.titulo} onClick={() => setModal({ tipo: 'qr', quiz: q })}><QrCode size={17}/></button>
              <div className="more-wrap" ref={menu === q.id ? menuRef : undefined}><button className="desk-icon" aria-label={'Mais ações para ' + q.titulo} aria-expanded={menu === q.id}
                onClick={() => setMenu(menu === q.id ? null : q.id)}><MoreHorizontal size={18}/></button>
                {menu === q.id && <div className="desk-drop"><Link to={'/admin/quizzes/' + q.id + '/editar'}><Pencil/>Editar</Link>
                  <Link to={'/admin/quiz/' + q.id + '/apresentar'}><MonitorPlay/>Apresentar</Link>
                  <button onClick={() => copiar(q)}><Copy/>Copiar link</button><button onClick={() => exportar(q)}><Download/>Exportar CSV</button>
                  <button className="danger-text" onClick={() => { setMenu(null); setModal({ tipo: 'excluir', quiz: q }); }}><Trash2/>Excluir</button></div>}</div></div>
          </li>;
        })}</ul>}
      <footer className="collection-footer"><span>{items ? visiveis.length + ' de ' + total + (total === 1 ? ' questionário' : ' questionários') : 'Questionários'}</span>
        <button disabled={query.isFetching} onClick={() => query.refetch()}><RefreshCw size={13} className={query.isFetching ? 'spin' : ''}/>{query.isFetching ? 'Atualizando…' : 'Atualizar'}</button></footer>
    </section><CollectionStatus total={total} active={ativos} ready={!!items} onFilter={f => { setFiltro(f); setBusca(''); document.getElementById('questionarios')?.scrollIntoView({ block: 'nearest' }); }}/></div>
    <footer className="desk-foot"><span><ShieldCheck size={16}/>As respostas da turma são anônimas.</span><span><i className={query.isError ? 'offline' : ''}/>{isMock ? 'Modo demonstração' : query.isError ? 'Falha na conexão' : query.isPending ? 'Conectando…' : 'Conectado à API'}</span></footer>
    {modal?.tipo === 'qr' && <PanelDialog title="Compartilhar questionário" onClose={() => setModal(null)}>
      <p>{modal.quiz.titulo}</p><div className="share-qr"><QRCodeSVG size={172} value={linkPublico(modal.quiz)} level="M" marginSize={3}/></div>
      <label className="share-field"><Link2 size={16}/><input readOnly aria-label="Link do questionário" value={linkPublico(modal.quiz)} onFocus={e => e.target.select()}/></label>
      <button className="desk-btn accent" onClick={() => copiar(modal.quiz)}><Copy size={16}/>Copiar link</button></PanelDialog>}
    {modal?.tipo === 'excluir' && <PanelDialog danger title="Excluir questionário?" busy={remover.isPending} onClose={() => setModal(null)}>
      <p>O questionário “{modal.quiz.titulo}” e suas respostas serão excluídos permanentemente.</p>
      <div className="dialog-buttons"><button className="desk-btn" disabled={remover.isPending} onClick={() => setModal(null)}><X size={15}/>Cancelar</button>
        <button className="desk-btn destructive" disabled={remover.isPending} onClick={() => remover.mutate(modal.quiz.id)}><Check size={16}/>{remover.isPending ? 'Excluindo…' : 'Excluir'}</button></div></PanelDialog>}
  </div>;
}

