import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const { login, register, error } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let success: boolean;
    if (isRegistering) {
      success = await register(username, password, 'player');
    } else {
      success = await login(username, password);
    }
    if (success) {
      navigate('/lobby');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="font-mono text-4xl font-bold text-text-primary mb-section">15 segundos</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-section">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="usuario"
          className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="contraseña"
          className="w-full border-b-2 border-text-primary bg-transparent py-element text-text-primary placeholder:text-text-secondary focus:border-accent focus:outline-none"
        />
        {error && <div className="text-error text-sm">{error}</div>}
        <button
          type="submit"
          className="w-full bg-accent text-background font-sans font-medium py-element rounded-button"
        >
          {isRegistering ? 'registrarse' : 'entrar'}
        </button>
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
          className="w-full text-text-secondary text-sm"
        >
          {isRegistering ? 'ya tengo cuenta' : 'crear cuenta'}
        </button>
      </form>
    </div>
  );
}
