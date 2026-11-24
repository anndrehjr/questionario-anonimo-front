import type { Quiz } from '../types';

export const MODELO_IMPORTACAO = {
  titulo: 'Título do questionário',
  descricao: 'Texto opcional de introdução',
  coletaPerfil: false, // true = pede idade e gênero antes das perguntas
  perguntas: [
    { enunciado: 'Primeira pergunta?', opcoes: ['Opção A', 'Opção B', 'Opção C'] },
    { enunciado: 'Segunda pergunta?', opcoes: ['Sim', 'Não'] },
  ],
};

const texto = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Lê um arquivo JSON com {titulo, descricao?, perguntas:[{enunciado, opcoes:[string | {texto}]}]}. */
export function lerQuizJson(conteudo: string): Pick<Quiz, 'titulo' | 'descricao' | 'perguntas' | 'coletaPerfil'> {
  let dados: unknown;
  try { dados = JSON.parse(conteudo.replace(/^﻿/, '')); } catch { throw new Error('O arquivo não é um JSON válido.'); }
  const raiz = dados as { coletaPerfil?: unknown; titulo?: unknown; descricao?: unknown; perguntas?: unknown };
  const titulo = texto(raiz?.titulo);
  if (!titulo) throw new Error('Falta o "titulo" do questionário.');
  if (titulo.length > 100) throw new Error('O título passa de 100 caracteres.');
  if (!Array.isArray(raiz.perguntas) || raiz.perguntas.length === 0) throw new Error('Inclua ao menos uma pergunta em "perguntas".');
  if (raiz.perguntas.length > 100) throw new Error('Máximo de 100 perguntas.');

  const perguntas = raiz.perguntas.map((p: { enunciado?: unknown; opcoes?: unknown }, i: number) => {
    const enunciado = texto(p?.enunciado);
    if (!enunciado) throw new Error(`A pergunta ${i + 1} está sem "enunciado".`);
    if (!Array.isArray(p.opcoes) || p.opcoes.length < 2) throw new Error(`A pergunta ${i + 1} precisa de ao menos 2 opções.`);
    if (p.opcoes.length > 20) throw new Error(`A pergunta ${i + 1} passa de 20 opções.`);
    const opcoes = p.opcoes.map((o: unknown, j: number) => {
      const t = texto(typeof o === 'string' ? o : (o as { texto?: unknown })?.texto);
      if (!t) throw new Error(`A opção ${j + 1} da pergunta ${i + 1} está vazia.`);
      return { id: j + 1, texto: t };
    });
    return { id: i + 1, ordem: i + 1, enunciado, opcoes };
  });
  const descricao = texto(raiz.descricao).slice(0, 220);
  return { titulo, descricao: descricao || undefined, perguntas, coletaPerfil: raiz.coletaPerfil === true };
}
