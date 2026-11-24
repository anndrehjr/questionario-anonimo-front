import { afterEach, expect, it, vi } from 'vitest';
import { baixarResultados } from './downloads';

afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals(); vi.useRealTimers(); });

it('exporta votos e percentuais e conserva aspas e separadores presentes na pergunta', async () => {
  const link = { href: '', download: '', click: vi.fn() };
  vi.stubGlobal('document', { createElement: () => link });
  vi.stubGlobal('window', { setTimeout });
  let arquivo: Blob | undefined;
  vi.spyOn(URL, 'createObjectURL').mockImplementation(blob => { arquivo = blob as Blob; return 'blob:teste'; });
  baixarResultados({
    quizId: 1, titulo: 'Turma A', totalParticipacoes: 4, perguntas: [{
      perguntaId: 1, enunciado: 'Escolha; "tema"', totalVotos: 4, opcoes: [
        { opcaoId: 1, texto: 'Leitura', votos: 3 }, { opcaoId: 2, texto: 'Escrita', votos: 1 },
      ],
    }],
  }, 'turma-a');
  expect(link.click).toHaveBeenCalledOnce();
  expect(link.download).toBe('resultados-turma-a.csv');
  const csv = await arquivo!.text();
  expect(csv).toContain('"Turma A";"Escolha; ""tema""";"Leitura";"3";"75%"');
  expect(csv).toContain('"Escrita";"1";"25%"');
});

it('inclui colunas de gênero e faixa etária quando o questionário coleta perfil', async () => {
  const link = { href: '', download: '', click: vi.fn() };
  vi.stubGlobal('document', { createElement: () => link });
  vi.stubGlobal('window', { setTimeout });
  let arquivo: Blob | undefined;
  vi.spyOn(URL, 'createObjectURL').mockImplementation(blob => { arquivo = blob as Blob; return 'blob:teste'; });
  baixarResultados({
    quizId: 1, titulo: 'Turma B', totalParticipacoes: 3, coletaPerfil: true,
    faixas: [{ chave: 'ate10', rotulo: 'Até 10 anos' }, { chave: '15-17', rotulo: '15 a 17 anos' }],
    perguntas: [{ perguntaId: 1, enunciado: 'P', totalVotos: 3, opcoes: [
      { opcaoId: 1, texto: 'A', votos: 3, porGenero: { homem: 1, mulher: 2 }, porFaixa: { ate10: 1, '15-17': 2 } },
      { opcaoId: 2, texto: 'B', votos: 0, porGenero: {}, porFaixa: {} },
    ] }],
  }, 'turma-b');
  const csv = await arquivo!.text();
  expect(csv).toContain('"Homem";"Mulher";"Até 10 anos";"15 a 17 anos"');
  expect(csv).toContain('"A";"3";"100%";"1";"2";"1";"2"');
  expect(csv).toContain('"B";"0";"0%";"0";"0";"0";"0"');
});
