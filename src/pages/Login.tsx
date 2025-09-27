import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import telconovaLogo from '@/assets/telconova-logo.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const { login } = useAuth();
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    if (!email || !password) {
      setMessage({ type: 'error', text: 'Todos los campos son requeridos' });
      return;
    }

    if (!validateEmail(email)) {
      setMessage({ type: 'error', text: 'Por favor ingrese un correo electrónico válido' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const result = await login(email, password);
      
      if (result.success) {
        setMessage({ type: 'success', text: result.message });
        toast({
          title: "Login exitoso",
          description: "Bienvenido a TelcoNova",
        });
      } else {
        setMessage({ type: 'error', text: result.message });
        toast({
          title: "Error de autenticación",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error interno del sistema' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-subtle px-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and title */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <img 
              src={telconovaLogo} 
              alt="TelcoNova" 
              className="h-16 w-auto"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">TelcoNova</h1>
            <p className="text-muted-foreground">Sistema de Asignaciones Técnicas</p>
          </div>
        </div>

        {/* Login form */}
        <Card className="shadow-lg border-border">
          <CardHeader className="text-center pb-6">
            <CardTitle className="flex items-center gap-2 justify-center">
              <Shield className="h-5 w-5 text-primary" />
              Iniciar Sesión
            </CardTitle>
            <CardDescription>
              Ingrese sus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email field */}
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="supervisor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 focus-visible:ring-primary"
                    disabled={isLoading}
                    aria-describedby="email-error"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingrese su contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 focus-visible:ring-primary"
                    disabled={isLoading}
                    aria-describedby="password-error"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Message display */}
              {message && (
                <Alert className={message.type === 'success' ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'}>
                  <AlertDescription className={message.type === 'success' ? 'text-success-foreground' : 'text-destructive-foreground'}>
                    {message.text}
                  </AlertDescription>
                </Alert>
              )}

              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full bg-gradient-primary hover:bg-primary-hover shadow-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                <strong>Credenciales de demostración:</strong><br />
                Email: supervisor@example.com<br />
                Contraseña: Admin123.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security info */}
        <div className="text-center text-xs text-muted-foreground">
          <p>Después de 3 intentos fallidos, la cuenta será bloqueada por 15 minutos</p>
        </div>
      </div>
    </div>
  );
}