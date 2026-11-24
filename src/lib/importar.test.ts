import { describe, expect, it } from 'vitest';
import { lerQuizJson, MODELO_IMPORTACAO } from './importar';

describe('lerQuizJson', () => {
  it('aceita o modelo oficial', () => {
    const q = lerQuizJson(JSON.stringify(MODELO_IMPORTACAO));
    expect(q.titulo).toBe('Título do questionário');
    expect(q.perguntas).toHaveLength(2);
    expect(q.perguntas[0].opcoes.map((o) => o.texto)).toEqual(['Opção A', 'Opção B', 'Opção C']);
    expect(q.perguntas[1].ordem).toBe(2);
  });
  it('aceita opções como objetos {texto}', () => {
    const q = lerQuizJson(JSON.stringify({ titulo: 'T', perguntas: [{ enunciado: 'P', opcoes: [{ texto: 'a' }, { texto: 'b' }] }] }));
    expect(q.perguntas[0].opcoes[1].texto).toBe('b');
  });
  it('lê coletaPerfil', () => {
    expect(lerQuizJson(JSON.stringify({ ...MODELO_IMPORTACAO, coletaPerfil: true })).coletaPerfil).toBe(true);
    expect(lerQuizJson(JSON.stringify(MODELO_IMPORTACAO)).coletaPerfil).toBe(false);
  });
  it('rejeita JSON inválido, sem título e pergunta com menos de 2 opções', () => {
    expect(() => lerQuizJson('{oi')).toThrow('JSON válido');
    expect(() => lerQuizJson('{"perguntas":[]}')).toThrow('titulo');
    expect(() => lerQuizJson(JSON.stringify({ titulo: 'T', perguntas: [{ enunciado: 'P', opcoes: ['a'] }] }))).toThrow('2 opções');
  });
});
