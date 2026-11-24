import { useState, type FormEvent } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { login } from '../lib/api';
import { isMock } from '../lib/mock';
import { ThemeToggle } from '../components/ThemeToggle';

export default function LoginPage() {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [visivel, setVisivel] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const mutation = useMutation({
    mutationFn: () => login(usuario, senha),
    onSuccess: () => { if (isMock) sessionStorage.setItem('sessao-admin', '1'); navigate(location.state?.from || '/admin'); },
    onError: () => toast.error('Usuário ou senha incorretos.'),
  });
  const submit = (event: FormEvent) => { event.preventDefault(); mutation.mutate(); };
  return (
    <main className="glass-page">
      <div className="glass-blob" aria-hidden="true" />
      <div className="glass-corner"><ThemeToggle /></div>
      <section className="glass-card">
        <h1>voto</h1>
        <p>Entre para gerenciar seus questionários.</p>
        <form onSubmit={submit}>
          <label htmlFor="usuario">Usuário</label>
          <input id="usuario" autoComplete="username" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
          <label htmlFor="senha">Senha</label>
          <div className="pw">
            <input id="senha" type={visivel ? 'text' : 'password'} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <button type="button" aria-label={visivel ? 'Ocultar senha' : 'Mostrar senha'} onClick={() => setVisivel(!visivel)}>{visivel ? <EyeOff size={17} /> : <Eye size={17} />}</button>
          </div>
          <button className="glass-submit" disabled={mutation.isPending}>{mutation.isPending ? 'Entrando…' : 'Entrar'}</button>
        </form>
      </section>
    </main>
  );
}
