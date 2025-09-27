import { useState } from 'react';
import { User, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { addTechnician } from '@/utils/storage';
import { zonas, especialidades, horarios } from '@/utils/mockData';

interface CrearTecnicoProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface TechnicianForm {
  nombre: string;
  email: string;
  telefono: string;
  zona: string;
  especialidad: string;
  carga: number;
  disponibilidad: string[];
}

export function CrearTecnico({ isOpen, onClose, onCreated }: CrearTecnicoProps) {
  const [formData, setFormData] = useState<TechnicianForm>({
    nombre: '',
    email: '',
    telefono: '',
    zona: '',
    especialidad: '',
    carga: 0,
    disponibilidad: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const resetForm = () => {
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      zona: '',
      especialidad: '',
      carga: 0,
      disponibilidad: []
    });
  };

  const validateForm = () => {
    if (!formData.nombre.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre es requerido",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast({
        title: "Error de validación",
        description: "Ingrese un correo electrónico válido",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.telefono.trim()) {
      toast({
        title: "Error de validación",
        description: "El teléfono es requerido",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.zona) {
      toast({
        title: "Error de validación",
        description: "Seleccione una zona",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.especialidad) {
      toast({
        title: "Error de validación",
        description: "Seleccione una especialidad",
        variant: "destructive",
      });
      return false;
    }

    if (formData.disponibilidad.length === 0) {
      toast({
        title: "Error de validación",
        description: "Seleccione al menos un horario de disponibilidad",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const newTechnician = addTechnician(formData);
      
      toast({
        title: "Técnico creado",
        description: `${newTechnician.nombre} ha sido agregado exitosamente`,
      });
      
      resetForm();
      onCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear el técnico. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleDisponibilidad = (horario: string) => {
    setFormData(prev => ({
      ...prev,
      disponibilidad: prev.disponibilidad.includes(horario)
        ? prev.disponibilidad.filter(h => h !== horario)
        : [...prev.disponibilidad, horario]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Crear Nuevo Técnico
          </DialogTitle>
          <DialogDescription>
            Complete la información del nuevo técnico
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Ej: Carlos Pérez"
                disabled={isLoading}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Correo Electrónico *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="carlos.perez@example.com"
                disabled={isLoading}
              />
            </div>

            {/* Teléfono */}
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                placeholder="+57-300-1234567"
                disabled={isLoading}
              />
            </div>

            {/* Zona */}
            <div className="space-y-2">
              <Label>Zona *</Label>
              <Select 
                value={formData.zona} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, zona: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar zona" />
                </SelectTrigger>
                <SelectContent>
                  {zonas.map(zona => (
                    <SelectItem key={zona} value={zona}>{zona}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Especialidad */}
            <div className="space-y-2">
              <Label>Especialidad *</Label>
              <Select 
                value={formData.especialidad} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, especialidad: value }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar especialidad" />
                </SelectTrigger>
                <SelectContent>
                  {especialidades.map(esp => (
                    <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Carga inicial */}
            <div className="space-y-2">
              <Label>Carga de Trabajo Inicial</Label>
              <Select 
                value={formData.carga.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, carga: parseInt(value) }))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}/5 {num === 0 ? '(Sin carga)' : num === 5 ? '(Carga máxima)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="space-y-3">
            <Label>Disponibilidad Horaria *</Label>
            <div className="grid grid-cols-2 gap-3">
              {horarios.map(horario => (
                <div key={horario} className="flex items-center space-x-2">
                  <Checkbox
                    id={`horario-${horario}`}
                    checked={formData.disponibilidad.includes(horario)}
                    onCheckedChange={() => toggleDisponibilidad(horario)}
                    disabled={isLoading}
                  />
                  <Label htmlFor={`horario-${horario}`} className="text-sm">
                    {horario}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="gap-2"
            >
              <Save className="h-4 w-4" />
              {isLoading ? 'Creando...' : 'Crear Técnico'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}