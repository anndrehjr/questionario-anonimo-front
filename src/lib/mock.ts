import type { Quiz, ResultadoQuiz } from '../types';

export const quizDemo: Quiz = {
  id: 1, slug: 'ideias-para-a-turma', titulo: 'O que faz uma boa aula?',
  descricao: 'Uma conversa rápida para entender como podemos aprender melhor juntos.', ativo: true, participacoes: 42, criadoEm: '2026-11-18',
  perguntas: [
    { id: 1, ordem: 1, enunciado: 'Qual formato ajuda você a aprender melhor?', opcoes: [{ id: 1, texto: 'Atividades práticas' }, { id: 2, texto: 'Explicações e exemplos' }, { id: 3, texto: 'Projetos em grupo' }, { id: 4, texto: 'Leitura individual' }] },
    { id: 2, ordem: 2, enunciado: 'Quanto tempo de atividade em grupo funciona bem?', opcoes: [{ id: 5, texto: 'Até 15 minutos' }, { id: 6, texto: 'De 15 a 30 minutos' }, { id: 7, texto: 'Mais de 30 minutos' }] },
    { id: 3, ordem: 3, enunciado: 'O que deixa uma aula mais interessante?', opcoes: [{ id: 8, texto: 'Conectar ao dia a dia' }, { id: 9, texto: 'Desafios e jogos' }, { id: 10, texto: 'Debates abertos' }] },
    { id: 4, ordem: 4, enunciado: 'Como prefere compartilhar uma ideia?', opcoes: [{ id: 11, texto: 'Conversando com a turma' }, { id: 12, texto: 'Escrevendo anonimamente' }, { id: 13, texto: 'Em pequenos grupos' }] },
    { id: 5, ordem: 5, enunciado: 'O que podemos fazer para melhorar?', opcoes: [{ id: 14, texto: 'Mais atividades práticas' }, { id: 15, texto: 'Mais tempo para perguntas' }, { id: 16, texto: 'Mais projetos colaborativos' }] },
  ],
};

export const demoResultado: ResultadoQuiz = {
  quizId: 1, titulo: quizDemo.titulo, totalParticipacoes: 42,
  perguntas: [
    { perguntaId: 1, enunciado: quizDemo.perguntas[0].enunciado, totalVotos: 42, opcoes: [{ opcaoId: 1, texto: 'Atividades práticas', votos: 19 }, { opcaoId: 2, texto: 'Explicações e exemplos', votos: 11 }, { opcaoId: 3, texto: 'Projetos em grupo', votos: 9 }, { opcaoId: 4, texto: 'Leitura individual', votos: 3 }] },
    { perguntaId: 2, enunciado: quizDemo.perguntas[1].enunciado, totalVotos: 42, opcoes: [{ opcaoId: 5, texto: 'Até 15 minutos', votos: 8 }, { opcaoId: 6, texto: 'De 15 a 30 minutos', votos: 22 }, { opcaoId: 7, texto: 'Mais de 30 minutos', votos: 12 }] },
    { perguntaId: 3, enunciado: quizDemo.perguntas[2].enunciado, totalVotos: 42, opcoes: [{ opcaoId: 8, texto: 'Conectar ao dia a dia', votos: 18 }, { opcaoId: 9, texto: 'Desafios e jogos', votos: 18 }, { opcaoId: 10, texto: 'Debates abertos', votos: 6 }] },
    { perguntaId: 4, enunciado: quizDemo.perguntas[3].enunciado, totalVotos: 42, opcoes: [{ opcaoId: 11, texto: 'Conversando com a turma', votos: 13 }, { opcaoId: 12, texto: 'Escrevendo anonimamente', votos: 21 }, { opcaoId: 13, texto: 'Em pequenos grupos', votos: 8 }] },
    { perguntaId: 5, enunciado: quizDemo.perguntas[4].enunciado, totalVotos: 42, opcoes: [{ opcaoId: 14, texto: 'Mais atividades práticas', votos: 18 }, { opcaoId: 15, texto: 'Mais tempo para perguntas', votos: 14 }, { opcaoId: 16, texto: 'Mais projetos colaborativos', votos: 10 }] },
  ],
};

export const isMock = import.meta.env.VITE_USE_MOCK === 'true' || (!import.meta.env.VITE_API_URL && import.meta.env.VITE_USE_MOCK !== 'false');
