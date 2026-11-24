import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AdminGuard, PublicLayout, AdminLayout } from './components/layouts';

const QuizPage = lazy(() => import('./pages/QuizPage'));
const ThanksPage = lazy(() => import('./pages/ThanksPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const EditorPage = lazy(() => import('./pages/EditorPage'));
const ResultsPage = lazy(() => import('./pages/ResultsPage'));
const PresentationPage = lazy(() => import('./pages/PresentationPage'));

export default function App() {
  return <Suspense fallback={<div className="panel-loading" role="status"><span className="load-ring"/>Carregando...</div>}><Routes>
    <Route element={<PublicLayout />}><Route path="/" element={<Navigate to="/admin" replace />} /><Route path="/q/:slug" element={<QuizPage />} /><Route path="/q/:slug/obrigado" element={<ThanksPage />} /><Route path="*" element={<Navigate to="/admin" replace />} /></Route>
    <Route path="/admin/login" element={<LoginPage />} />
    <Route element={<AdminGuard />}><Route element={<AdminLayout />}><Route path="/admin" element={<DashboardPage />} /><Route path="/admin/novo" element={<EditorPage />} /><Route path="/admin/quiz/novo" element={<EditorPage />} /><Route path="/admin/quiz/:id/editar" element={<EditorPage />} /><Route path="/admin/quizzes/:id/editar" element={<EditorPage />} /><Route path="/admin/quiz/:id/resultados" element={<ResultsPage />} /><Route path="/admin/quizzes/:id/resultados" element={<ResultsPage />} /><Route path="/admin/quiz/:id/apresentar" element={<PresentationPage />} /></Route></Route>
  </Routes></Suspense>;
}
