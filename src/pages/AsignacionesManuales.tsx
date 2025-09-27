import { useState, useEffect } from 'react';
import { Plus, Search, Clock, MapPin, User, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/Header';
import { SeleccionarTecnico } from '@/components/SeleccionarTecnico';
import { Order, Technician } from '@/utils/mockData';
import { getOrders, getTechnicians, addOrder, initializeStorage } from '@/utils/storage';
import { zonas } from '@/utils/mockData';

export default function AsignacionesManuales() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isTechnicianModalOpen, setIsTechnicianModalOpen] = useState(false);
  
  // Form states
  const [newOrder, setNewOrder] = useState({
    zona: '',
    servicio: '',
    descripcion: ''
  });
  
  const { toast } = useToast();

  useEffect(() => {
    initializeStorage();
    setOrders(getOrders());
    setTechnicians(getTechnicians());
  }, []);

  // Filter orders
  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.servicio.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingOrders = filteredOrders.filter(order => !order.assignedTo);
  const assignedOrders = filteredOrders.filter(order => order.assignedTo);

  const handleCreateOrder = () => {
    if (!newOrder.zona || !newOrder.servicio || !newOrder.descripcion) {
      toast({
        title: "Error de validación",
        description: "Todos los campos son requeridos",
        variant: "destructive",
      });
      return;
    }

    const order = addOrder({
      ...newOrder,
      creadoEn: new Date().toISOString(),
      assignedTo: null
    });

    setOrders(getOrders());
    setNewOrder({ zona: '', servicio: '', descripcion: '' });
    setIsCreateModalOpen(false);
    
    toast({
      title: "Orden creada",
      description: `Orden ${order.id} creada exitosamente`,
    });
  };

  const handleAssignOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsTechnicianModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTechnicianName = (techId: string) => {
    const tech = technicians.find(t => t.id === techId);
    return tech ? tech.nombre : 'Técnico no encontrado';
  };

  const handleComingSoon = (feature: string) => {
    toast({
      title: "Próximamente",
      description: `${feature} estará disponible pronto.`,
    });
  };

  const OrderCard = ({ order, isPending = false }: { order: Order; isPending?: boolean }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">{order.id}</CardTitle>
          <Badge variant={isPending ? "secondary" : "default"} className="gap-1">
            {isPending ? (
              <>
                <AlertCircle className="h-3 w-3" />
                Pendiente
              </>
            ) : (
              <>
                <CheckCircle className="h-3 w-3" />
                Asignada
              </>
            )}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-2 text-sm">
          <MapPin className="h-3 w-3" />
          {order.zona}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium text-sm text-foreground">{order.servicio}</p>
          <p className="text-xs text-muted-foreground">{order.descripcion}</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatDate(order.creadoEn)}
        </div>

        {order.assignedTo && (
          <div className="flex items-center gap-2 text-xs">
            <User className="h-3 w-3 text-primary" />
            <span className="text-foreground">{getTechnicianName(order.assignedTo)}</span>
          </div>
        )}
        
        <Button
          onClick={() => handleAssignOrder(order)}
          className="w-full"
          variant={isPending ? "default" : "outline"}
          size="sm"
        >
          {isPending ? 'Asignar' : 'Reasignar'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header section */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Asignaciones Manuales</h1>
              <p className="text-muted-foreground">Gestione las asignaciones de órdenes de servicio</p>
            </div>
            
            <div className="flex gap-2">
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="gap-2 bg-gradient-primary hover:bg-primary-hover">
                    <Plus className="h-4 w-4" />
                    Crear Orden
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nueva Orden</DialogTitle>
                    <DialogDescription>
                      Complete los detalles de la nueva orden de servicio
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="zona">Zona</Label>
                      <Select value={newOrder.zona} onValueChange={(value) => setNewOrder(prev => ({ ...prev, zona: value }))}>
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
                    
                    <div className="space-y-2">
                      <Label htmlFor="servicio">Nombre del Servicio</Label>
                      <Input
                        id="servicio"
                        value={newOrder.servicio}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, servicio: e.target.value }))}
                        placeholder="Ej: Instalación eléctrica"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="descripcion">Descripción</Label>
                      <Textarea
                        id="descripcion"
                        value={newOrder.descripcion}
                        onChange={(e) => setNewOrder(prev => ({ ...prev, descripcion: e.target.value }))}
                        placeholder="Descripción detallada del servicio"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleCreateOrder}>
                        Crear Orden
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Navigation tabs */}
          <Tabs defaultValue="manual" className="space-y-6">
            <TabsList>
              <TabsTrigger value="manual">Asignación Manual</TabsTrigger>
              <TabsTrigger value="automatica" onClick={() => handleComingSoon('Asignación Automática')}>
                Asignación Automática
              </TabsTrigger>
              <TabsTrigger value="reporte" onClick={() => handleComingSoon('Reporte de Asignaciones')}>
                Reporte de Asignaciones
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              {/* Search bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número de orden..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Orders grid - Split layout */}
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Pending orders */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-warning" />
                      Órdenes Pendientes ({pendingOrders.length})
                    </h2>
                  </div>
                  
                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {pendingOrders.length > 0 ? (
                      pendingOrders.map(order => (
                        <OrderCard key={order.id} order={order} isPending />
                      ))
                    ) : (
                      <Card className="p-6 text-center">
                        <p className="text-muted-foreground">No hay órdenes pendientes</p>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Assigned orders */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-success" />
                      Órdenes Asignadas ({assignedOrders.length})
                    </h2>
                  </div>
                  
                  <div className="space-y-3 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {assignedOrders.length > 0 ? (
                      assignedOrders.map(order => (
                        <OrderCard key={order.id} order={order} />
                      ))
                    ) : (
                      <Card className="p-6 text-center">
                        <p className="text-muted-foreground">No hay órdenes asignadas</p>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Technician selection modal */}
      {selectedOrder && (
        <SeleccionarTecnico
          isOpen={isTechnicianModalOpen}
          onClose={() => {
            setIsTechnicianModalOpen(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onAssign={() => {
            setOrders(getOrders());
            setTechnicians(getTechnicians());
          }}
        />
      )}
    </div>
  );
}