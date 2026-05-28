export function mapServerError(error: unknown, fallbackMessage: string): string {
  if (
    error &&
    typeof error === 'object' &&
    'response' in error &&
    error.response &&
    typeof error.response === 'object' &&
    'data' in error.response &&
    error.response.data &&
    typeof error.response.data === 'object' &&
    'error' in error.response.data &&
    typeof error.response.data.error === 'string'
  ) {
    const serverError = error.response.data.error;
    switch (serverError) {
      case 'Invalid credentials':
        return 'usuario o contraseña inválidos';
      case 'Username already exists':
        return 'nombre ya en uso';
      case 'Game has already started':
        return 'host ya empezó el juego';
      case 'Player already in game':
        return 'nombre ya en uso';
      case 'Game not found':
        return 'código inválido';
      case 'At least 2 players are required':
        return 'se requieren al menos 2 jugadores';
      case 'At least 3 categories are required':
        return 'se requieren al menos 3 categorías';
      case 'Only the host can start the game':
        return 'solo el host puede empezar el juego';
      case 'Cannot validate your own answer':
        return 'no puedes validar tu propia respuesta';
      case 'Time limit exceeded':
        return 'tiempo límite excedido';
      case 'Maximum answers reached for this turn':
        return 'máximo de respuestas alcanzado';
      default:
        return serverError.toLowerCase();
    }
  }
  return fallbackMessage;
}
