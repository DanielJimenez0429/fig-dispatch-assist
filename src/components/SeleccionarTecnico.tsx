import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, User, Phone, Mail, MapPin, Wrench, Battery, Clock, X, Check, Undo2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Order, Technician } from '@/utils/mockData';
import { getTechnicians, assignOrder, addTechnician } from '@/utils/storage';
import { zonas, especialidades, horarios } from '@/utils/mockData';
import { CrearTecnico } from '@/components/CrearTecnico';

interface SeleccionarTecnicoProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order;
  onAssign: () => void;
}

interface Filters {
  zonas: string[];
  especialidades: string[];
  horarios: string[];
  maxCarga: number;
}

export function SeleccionarTecnico({ isOpen, onClose, order, onAssign }: SeleccionarTecnicoProps) {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState<Technician | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isCreateTechModalOpen, setIsCreateTechModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    zonas: [],
    especialidades: [],
    horarios: [],
    maxCarga: 5
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setTechnicians(getTechnicians());
      setSearchTerm('');
      setSelectedTechnician(null);
      setFilters({
        zonas: [],
        especialidades: [],
        horarios: [],
        maxCarga: 5
      });
    }
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      // Search functionality is handled in useMemo
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const filteredTechnicians = useMemo(() => {
    let filtered = technicians;

    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(tech => 
        tech.nombre.toLowerCase().includes(search) ||
        tech.email.toLowerCase().includes(search) ||
        tech.telefono.toLowerCase().includes(search)
      );
    }

    // Zone filter
    if (filters.zonas.length > 0) {
      filtered = filtered.filter(tech => filters.zonas.includes(tech.zona));
    }

    // Specialty filter
    if (filters.especialidades.length > 0) {
      filtered = filtered.filter(tech => filters.especialidades.includes(tech.especialidad));
    }

    // Schedule filter
    if (filters.horarios.length > 0) {
      filtered = filtered.filter(tech => 
        tech.disponibilidad.some(horario => filters.horarios.includes(horario))
      );
    }

    // Workload filter
    filtered = filtered.filter(tech => tech.carga <= filters.maxCarga);

    // Sort by workload (ascending - prefer less loaded technicians)
    return filtered.sort((a, b) => a.carga - b.carga);
  }, [technicians, searchTerm, filters]);

  const handleAssign = () => {
    if (!selectedTechnician) return;

    const previousTechId = order.assignedTo;
    assignOrder(order.id, selectedTechnician.id, previousTechId || undefined);
    
    setIsConfirmModalOpen(false);
    onAssign();
    onClose();

    const action = previousTechId ? 'reasignada' : 'asignada';
    toast({
      title: `Orden ${action}`,
      description: `Orden ${order.id} ${action} a ${selectedTechnician.nombre}`,
      action: (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => handleUndo(previousTechId)}
          className="gap-1"
        >
          <Undo2 className="h-3 w-3" />
          Deshacer
        </Button>
      ),
    });
  };

  const handleUndo = (previousTechId: string | null) => {
    assignOrder(order.id, previousTechId, selectedTechnician?.id);
    onAssign();
    
    toast({
      title: "Asignación deshecha",
      description: "La asignación ha sido revertida",
    });
  };

  const updateFilter = (type: keyof Filters, value: string) => {
    setFilters(prev => {
      if (type === 'maxCarga') return prev; // Handle separately
      
      const currentArray = prev[type] as string[];
      return {
        ...prev,
        [type]: currentArray.includes(value)
          ? currentArray.filter(item => item !== value)
          : [...currentArray, value]
      };
    });
  };

  const clearFilters = () => {
    setFilters({
      zonas: [],
      especialidades: [],
      horarios: [],
      maxCarga: 5
    });
  };

  const getWorkloadColor = (carga: number) => {
    if (carga === 0) return 'text-success';
    if (carga <= 2) return 'text-success';
    if (carga <= 3) return 'text-warning';
    if (carga === 4) return 'text-orange-500';
    return 'text-destructive';
  };

  const getWorkloadBadgeVariant = (carga: number) => {
    if (carga <= 2) return 'default';
    if (carga <= 3) return 'secondary';
    return 'destructive';
  };

  const isAvailable = (tech: Technician) => tech.carga < 5;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Seleccionar Técnico - {order.id}
            </DialogTitle>
            <DialogDescription>
              {order.servicio} en {order.zona}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            {/* Search and actions */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="gap-2"
                >
                  <Filter className="h-4 w-4" />
                  Filtros
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateTechModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Crear Técnico
                </Button>
              </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Zones filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Zonas</Label>
                    <div className="space-y-1">
                      {zonas.map(zona => (
                        <div key={zona} className="flex items-center space-x-2">
                          <Checkbox
                            id={`zona-${zona}`}
                            checked={filters.zonas.includes(zona)}
                            onCheckedChange={() => updateFilter('zonas', zona)}
                          />
                          <Label htmlFor={`zona-${zona}`} className="text-xs">
                            {zona}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Specialties filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Especialidades</Label>
                    <div className="space-y-1">
                      {especialidades.map(esp => (
                        <div key={esp} className="flex items-center space-x-2">
                          <Checkbox
                            id={`esp-${esp}`}
                            checked={filters.especialidades.includes(esp)}
                            onCheckedChange={() => updateFilter('especialidades', esp)}
                          />
                          <Label htmlFor={`esp-${esp}`} className="text-xs">
                            {esp}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Schedule filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Disponibilidad</Label>
                    <div className="space-y-1">
                      {horarios.map(horario => (
                        <div key={horario} className="flex items-center space-x-2">
                          <Checkbox
                            id={`horario-${horario}`}
                            checked={filters.horarios.includes(horario)}
                            onCheckedChange={() => updateFilter('horarios', horario)}
                          />
                          <Label htmlFor={`horario-${horario}`} className="text-xs">
                            {horario}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Workload filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Carga máxima</Label>
                    <Select value={filters.maxCarga.toString()} onValueChange={(value) => 
                      setFilters(prev => ({ ...prev, maxCarga: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Hasta 3/5</SelectItem>
                        <SelectItem value="4">Hasta 4/5</SelectItem>
                        <SelectItem value="5">Mostrar todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={clearFilters} size="sm">
                    Limpiar filtros
                  </Button>
                </div>
              </Card>
            )}

            {/* Technicians grid */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="grid gap-3">
                {filteredTechnicians.length > 0 ? (
                  filteredTechnicians.map(tech => (
                    <Card 
                      key={tech.id} 
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedTechnician?.id === tech.id ? 'ring-2 ring-primary' : ''
                      } ${!isAvailable(tech) ? 'opacity-50' : ''}`}
                      onClick={() => isAvailable(tech) && setSelectedTechnician(tech)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium">
                              {tech.nombre.charAt(0)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-foreground">{tech.nombre}</h3>
                                {!isAvailable(tech) && (
                                  <Badge variant="destructive" className="text-xs">No disponible</Badge>
                                )}
                              </div>
                              
                              <div className="space-y-1 mt-1">
                                <div className="flex items-center gap-2 text-sm">
                                  <Mail className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{tech.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-muted-foreground">{tech.telefono}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right space-y-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{tech.zona}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Wrench className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{tech.especialidad}</span>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Battery className={`h-3 w-3 ${getWorkloadColor(tech.carga)}`} />
                              <Badge 
                                variant={getWorkloadBadgeVariant(tech.carga)}
                                className="text-xs"
                              >
                                {tech.carga}/5
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap gap-1 mt-2">
                              {tech.disponibilidad.map(horario => (
                                <Badge key={horario} variant="outline" className="text-xs">
                                  <Clock className="h-2 w-2 mr-1" />
                                  {horario}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">
                      No se encontraron técnicos que coincidan con los criterios de búsqueda
                    </p>
                  </Card>
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button 
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={!selectedTechnician}
                className="gap-2"
              >
                <Check className="h-4 w-4" />
                {order.assignedTo ? 'Reasignar' : 'Asignar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar {order.assignedTo ? 'Reasignación' : 'Asignación'}</DialogTitle>
            <DialogDescription>
              ¿Está seguro que desea {order.assignedTo ? 'reasignar' : 'asignar'} la orden {order.id} a {selectedTechnician?.nombre}?
            </DialogDescription>
          </DialogHeader>
          
          {selectedTechnician && (
            <div className="space-y-3 py-4">
              <div className="bg-muted rounded-lg p-3 space-y-2">
                <p><strong>Técnico:</strong> {selectedTechnician.nombre}</p>
                <p><strong>Especialidad:</strong> {selectedTechnician.especialidad}</p>
                <p><strong>Zona:</strong> {selectedTechnician.zona}</p>
                <p><strong>Carga actual:</strong> {selectedTechnician.carga}/5 → {selectedTechnician.carga + 1}/5</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssign}>
              Confirmar {order.assignedTo ? 'Reasignación' : 'Asignación'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create technician modal */}
      <CrearTecnico
        isOpen={isCreateTechModalOpen}
        onClose={() => setIsCreateTechModalOpen(false)}
        onCreated={() => {
          setTechnicians(getTechnicians());
          setIsCreateTechModalOpen(false);
        }}
      />
    </>
  );
}