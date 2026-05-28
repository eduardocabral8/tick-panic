import { useNavigate } from 'react-router-dom';

interface BackToLobbyButtonProps {
  className?: string;
}

export default function BackToLobbyButton({ className = '' }: BackToLobbyButtonProps) {
  const navigate = useNavigate();

  const handleBackToLobby = () => {
    navigate('/lobby');
  };

  return (
    <button onClick={handleBackToLobby} className={`btn-outline w-full ${className}`}>
      volver al lobby
    </button>
  );
}
