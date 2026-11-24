import { calcularPercentuais } from './percentuais';
import type { ResultadoQuiz } from '../types';

export function baixarArquivo(nome: string, conteudo: string, tipo: string) {
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  link.download = nome;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

export function baixarResultados(resultado: ResultadoQuiz, slug: string) {
  const faixas = resultado.coletaPerfil ? resultado.faixas ?? [] : [];
  const extra = (o: { porGenero?: { homem?: number; mulher?: number }; porFaixa?: Record<string, number> }) =>
    faixas.length ? [String(o.porGenero?.homem ?? 0), String(o.porGenero?.mulher ?? 0), ...faixas.map(f => String(o.porFaixa?.[f.chave] ?? 0))] : [];
  const linhas = [
    ['Questionário', 'Pergunta', 'Alternativa', 'Votos', 'Percentual', ...(faixas.length ? ['Homem', 'Mulher', ...faixas.map(f => f.rotulo)] : [])],
    ...resultado.perguntas.flatMap(p => calcularPercentuais(p.opcoes).map(o =>
      [resultado.titulo, p.enunciado, o.texto, String(o.votos), o.percentual + '%', ...extra(o)])),
  ];
  const citar = (valor: string) => '"' + (/^\s*[=+@-]/.test(valor) ? "'" : '') + valor.replaceAll('"', '""') + '"';
  const csv = linhas.map(linha => linha.map(citar).join(';')).join('\r\n');
  baixarArquivo('resultados-' + slug + '.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8');
}

