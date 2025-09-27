import { LogOut, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import telconovaLogo from '@/assets/telconova-logo.png';

export function Header() {
  const { logout, user } = useAuth();

  return (
    <header className="h-header bg-card border-b border-border shadow-sm px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <img 
          src={telconovaLogo} 
          alt="TelcoNova" 
          className="h-8 w-auto"
        />
        <div>
          <h1 className="text-xl font-bold text-foreground">TelcoNova</h1>
          <p className="text-sm text-muted-foreground">Sistema de Asignaciones</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground">{user?.email}</span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="gap-2"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}