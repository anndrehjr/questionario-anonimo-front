import axios from 'axios';
import type { Perfil, Quiz, ResultadoQuiz, Resposta } from '../types';
import { demoResultado, isMock, quizDemo } from './mock';

export const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '', withCredentials: true, headers: { 'Content-Type': 'application/json' } });
api.interceptors.response.use((response) => response, (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401 && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') window.location.assign('/admin/login');
  return Promise.reject(error);
});

const quizzesMock: Quiz[] = [quizDemo];
export async function buscarQuiz(slug: string): Promise<Quiz> {
  if (isMock) { const quiz = quizzesMock.find((item) => item.slug === slug); if (!quiz) throw { response: { status: 404 } }; if (!quiz.ativo) throw { response: { status: 410 } }; return quiz; }
  return (await api.get<Quiz>(`/api/public/quiz/${slug}`)).data;
}
export async function enviarRespostas(slug: string, quizId: number, respostas: Resposta[], perfil?: Perfil): Promise<void> {
  if (isMock) { await new Promise((resolve) => window.setTimeout(resolve, 650)); return; }
  await api.post(`/api/public/quiz/${encodeURIComponent(slug)}/respostas`, { quizId, respostas, ...(perfil ? { perfil } : {}) });
}
export async function listarQuizzes(): Promise<Quiz[]> {
  if (isMock) return structuredClone(quizzesMock);
  return (await api.get<Quiz[]>('/api/admin/quizzes')).data;
}
export async function obterResultados(id: number): Promise<ResultadoQuiz> {
  if (isMock) {
    const quiz = quizzesMock.find(item => item.id === id);
    if (!quiz) throw new Error('Questionário indisponível.');
    const original = id === demoResultado.quizId ? demoResultado : undefined;
    return {
      quizId: id, titulo: quiz.titulo, totalParticipacoes: quiz.participacoes ?? 0,
      perguntas: quiz.perguntas.map(pergunta => {
        const dados = original?.perguntas.find(p => p.perguntaId === pergunta.id);
        const opcoes = pergunta.opcoes.map(o => ({
          opcaoId: o.id, texto: o.texto, votos: dados?.opcoes.find(item => item.opcaoId === o.id)?.votos ?? 0,
        }));
        return { perguntaId: pergunta.id, enunciado: pergunta.enunciado, opcoes,
          totalVotos: opcoes.reduce((total, o) => total + o.votos, 0) };
      }),
    };
  }
  return (await api.get<ResultadoQuiz>(`/api/admin/quizzes/${id}/resultados`)).data;
}
export async function login(usuario: string, senha: string): Promise<void> {
  if (isMock) { if (usuario !== 'professor' || senha !== 'sala123') throw new Error('Credenciais inválidas'); return; }
  await api.post('/api/auth/login', { usuario, senha });
}
export async function verificarSessao(): Promise<boolean> {
  if (isMock) return sessionStorage.getItem('sessao-admin') === '1';
  try { await api.get('/api/auth/me'); return true; } catch { return false; }
}
export async function sair(): Promise<void> { if (isMock) sessionStorage.removeItem('sessao-admin'); else await api.post('/api/auth/logout'); }
export async function salvarQuiz(quiz: Partial<Quiz>, id?: number): Promise<void> {
  if (isMock) {
    if (id !== undefined) {
      const atual = quizzesMock.find(q => q.id === id);
      if (!atual) throw new Error('Questionário indisponível.');
      Object.assign(atual, quiz);
    } else {
      quizzesMock.push({ ...quiz, id: Date.now(), criadoEm: new Date().toISOString(), perguntas: quiz.perguntas ?? [], ativo: true } as Quiz);
    }
    return;
  }
  if (id) await api.put(`/api/admin/quizzes/${id}`, quiz); else await api.post('/api/admin/quizzes', quiz);
}
export async function alterarAtivo(id: number, ativo: boolean): Promise<void> { if (!isMock) await api.patch(`/api/admin/quizzes/${id}/ativo`, { ativo }); else { const quiz = quizzesMock.find((item) => item.id === id); if (quiz) quiz.ativo = ativo; } }
export async function excluirQuiz(id: number): Promise<void> { if (!isMock) await api.delete(`/api/admin/quizzes/${id}`); else { const index = quizzesMock.findIndex((item) => item.id === id); if (index >= 0) quizzesMock.splice(index, 1); } }
export async function zerarRespostas(id: number): Promise<void> { if (!isMock) await api.delete(`/api/admin/quizzes/${id}/respostas`); }
