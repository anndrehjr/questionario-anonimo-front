import { describe, expect, it } from 'vitest';
import { calcularPercentuais, obterVencedoras } from './percentuais';

describe('calcularPercentuais', () => {
  it('distribui 100 pelo método do maior resto', () => {
    const resultado = calcularPercentuais([{ opcaoId: 1, texto: 'A', votos: 2 }, { opcaoId: 2, texto: 'B', votos: 2 }, { opcaoId: 3, texto: 'C', votos: 1 }]);
    expect(resultado.reduce((soma, item) => soma + item.percentual, 0)).toBe(100);
    expect(resultado.map((item) => item.percentual)).toEqual([40, 40, 20]);
  });
  it('retorna zeros sem dividir por zero', () => expect(calcularPercentuais([{ opcaoId: 1, texto: 'A', votos: 0 }])[0].percentual).toBe(0));
  it('mantém empate entre vencedoras', () => expect(obterVencedoras(calcularPercentuais([{ opcaoId: 1, texto: 'Azul', votos: 3 }, { opcaoId: 2, texto: 'Verde', votos: 3 }]))).toHaveLength(2));
  it('trata uma única opção', () => expect(calcularPercentuais([{ opcaoId: 1, texto: 'Única', votos: 7 }])[0].percentual).toBe(100));
});
