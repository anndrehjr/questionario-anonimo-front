import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { BarChart3, Copy, Download, MonitorPlay, RotateCcw, ShieldCheck, Users } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { obterResultados, listarQuizzes, zerarRespostas } from '../lib/api';
import { baixarResultados } from '../lib/downloads';
import { CORES_GRAFICO } from '../lib/cores';
import { calcularPercentuais } from '../lib/percentuais';
import { BackLink, PanelLoading, SectionHeader } from '../components/layouts';
import { PanelDialog } from '../components/PanelDialog';
import { isMock } from '../lib/mock';
import type { ResultadoPergunta } from '../types';

function QuestionResult({ pergunta, numero, faixas }: { pergunta: ResultadoPergunta; numero: number; faixas: { chave: string; rotulo: string }[] }) {
  const opcoes = calcularPercentuais(pergunta.opcoes);
  const max = Math.max(0, ...opcoes.map(o => o.votos));
  return <article className="result-card"><div className="result-card-heading">
    <span className="result-number">{String(numero).padStart(2,'0')}</span>
    <div><h2>{pergunta.enunciado}</h2><span>{pergunta.totalVotos} {pergunta.totalVotos === 1 ? 'resposta' : 'respostas'}</span></div></div>
    <div className="result-visual"><div className="result-bars">{opcoes.map((o,i) => {
      const cor = CORES_GRAFICO[i % CORES_GRAFICO.length];
      return <div className="bar-row" key={o.opcaoId}><div className="bar-caption"><span><i style={{background:cor}}/>{o.texto}
        {max > 0 && o.votos === max && <b className="winner-tag">Mais escolhida</b>}</span><span className="bar-stat">{o.votos} <b>{o.percentual}%</b></span></div>
        <div className="bar-track"><div style={{width:o.percentual + '%', backgroundColor:cor}}/></div></div>;
    })}</div><div className="pie-wrap" aria-hidden="true">{max > 0 && <ResponsiveContainer width="100%" height="100%">
      <PieChart><Pie data={opcoes} dataKey="votos" nameKey="texto" innerRadius="70%" outerRadius="95%" paddingAngle={2} stroke="none" isAnimationActive={false}>
        {opcoes.map((o,i) => <Cell key={o.opcaoId} fill={CORES_GRAFICO[i % CORES_GRAFICO.length]}/>)}</Pie>
        <Tooltip formatter={v => [String(v), 'Votos']}/></PieChart></ResponsiveContainer>}
      <div className="pie-center"><strong>{pergunta.totalVotos}</strong><span>respostas</span></div></div></div>
    {faixas.length > 0 && <details className="perfil-detalhes"><summary>Por gênero e faixa etária</summary><div className="perfil-tabela-wrap"><table className="perfil-tabela"><thead><tr><th>Alternativa</th><th>Homem</th><th>Mulher</th>{faixas.map(f => <th key={f.chave}>{f.rotulo}</th>)}</tr></thead>
      <tbody>{pergunta.opcoes.map(o => <tr key={o.opcaoId}><td>{o.texto}</td><td>{o.porGenero?.homem ?? 0}</td><td>{o.porGenero?.mulher ?? 0}</td>{faixas.map(f => <td key={f.chave}>{o.porFaixa?.[f.chave] ?? 0}</td>)}</tr>)}</tbody></table></div></details>}</article>;
}

export default function ResultsPage() {
  const {id} = useParams();
  const quizId = Number(id);
  const [confirmar, setConfirmar] = useState(false);
  const client = useQueryClient();
  const result = useQuery({ queryKey: ['resultados',quizId], queryFn: () => obterResultados(quizId) });
  const quizzes = useQuery({ queryKey: ['quizzes'], queryFn: listarQuizzes });
  const quiz = quizzes.data?.find(q => q.id === quizId);
  const reset = useMutation({ mutationFn: () => zerarRespostas(quizId),
    onSuccess: () => {
      client.invalidateQueries({queryKey:['resultados',quizId]}); client.invalidateQueries({queryKey:['quizzes']});
      setConfirmar(false); toast.success('Respostas zeradas.');
    }, onError: () => toast.error('Não foi possível zerar as respostas.'),
  });
  if (result.isPending) return <PanelLoading text="Carregando resultados…"/>;
  if (!result.data) return <section className="panel-surface collection-empty"><BarChart3/><h2>Resultados indisponíveis</h2>
    <button className="desk-btn" onClick={() => result.refetch()}>Tentar novamente</button><BackLink/></section>;
  const dados = result.data;
  return <div className="insights"><BackLink/><SectionHeader title={dados.titulo} description="Participação e distribuição das respostas por pergunta."
    action={<div className="results-actions"><Link className="desk-btn" to={'/admin/quiz/' + quizId + '/apresentar'}><MonitorPlay size={16}/>Apresentar</Link>
      <button className="desk-btn accent" onClick={() => baixarResultados(dados, quiz?.slug ?? String(quizId))}><Download size={16}/>Exportar CSV</button></div>}/>
    <div className="results-summary"><div className="summary-icon"><Users size={20}/></div><div><span>Participações</span><strong>{dados.totalParticipacoes.toLocaleString('pt-BR')}</strong></div>
      <div className="summary-divider"/><div><span>Perguntas</span><strong>{dados.perguntas.length}</strong></div>
      <button className="desk-btn results-share" disabled={!quiz} onClick={async () => {
        if (!quiz) return;
        try { await navigator.clipboard.writeText(window.location.origin + '/q/' + encodeURIComponent(quiz.slug)); toast.success('Link copiado.'); }
        catch { toast.error('Não foi possível copiar o link.'); }
      }}><Copy size={15}/>Copiar link</button></div>
    <div className="results-list">{dados.perguntas.map((p,i) => <QuestionResult key={p.perguntaId} numero={i + 1} pergunta={p} faixas={dados.faixas ?? []}/>)}</div>
    <div className="desk-foot result-foot"><span><ShieldCheck size={16}/>Resultados anônimos e agrupados por pergunta.</span>
      {!isMock && <button className="template-link" onClick={() => setConfirmar(true)}><RotateCcw size={14}/>Zerar respostas</button>}</div>
    {confirmar && <PanelDialog title="Zerar respostas?" danger busy={reset.isPending} onClose={() => setConfirmar(false)}>
      <p>Todas as respostas deste questionário serão removidas permanentemente.</p><div className="dialog-buttons">
        <button className="desk-btn" disabled={reset.isPending} onClick={() => setConfirmar(false)}>Cancelar</button>
        <button className="desk-btn destructive" disabled={reset.isPending} onClick={() => reset.mutate()}>{reset.isPending ? 'Zerando…' : 'Zerar respostas'}</button></div></PanelDialog>}
  </div>;
}

