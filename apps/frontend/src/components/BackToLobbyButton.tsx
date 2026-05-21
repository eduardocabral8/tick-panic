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
    <button
      onClick={handleBackToLobby}
      className={`w-full border-2 border-text-primary text-text-primary font-sans font-medium py-element rounded-button hover:border-accent hover:text-accent transition-colors duration-300 ${className}`}
    >
      volver al lobby
    </button>
  );
}
