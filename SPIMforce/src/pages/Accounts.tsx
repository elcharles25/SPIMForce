import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '@/lib/db-adapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Plus, Building2, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface Account {
  id: string;
  name: string;
  full_name: string;
  sector: string;
  web_site: string;
  address: string;
  logo: string | null;
  created_at: string;
}

export default function AccountsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filteredAccounts, setFilteredAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    full_name: '',
    sector: '',
    web_site: '',
    address: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredAccounts(
        accounts.filter(
          (account) =>
            account.name?.toLowerCase().includes(query) ||
            account.full_name?.toLowerCase().includes(query) ||
            account.sector?.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredAccounts(accounts);
    }
  }, [searchQuery, accounts]);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await db.getAccounts();
      setAccounts(data);
      setFilteredAccounts(data);
    } catch (error) {
      console.error('Error cargando cuentas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las cuentas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.name) {
    toast({
      title: 'Campo obligatorio',
      description: 'El nombre es obligatorio',
      variant: 'destructive',
    });
    return;
  }

  try {
    const payload = {
      ...formData,
      logo: null, // Nueva cuenta sin logo inicialmente
    };
    
    await db.createAccount(payload);
    toast({
      title: 'Éxito',
      description: 'Cuenta creada correctamente',
    });
    setIsCreateDialogOpen(false);
    setFormData({
      name: '',
      full_name: '',
      sector: '',
      web_site: '',
      address: '',
    });
    loadAccounts();
  } catch (error) {
    toast({
      title: 'Error',
      description: `Error al crear la cuenta: ${error instanceof Error ? error.message : 'Desconocido'}`,
      variant: 'destructive',
    });
  }
};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            Gestión de Cuentas
          </h1>
          <p className="text-slate-600 mt-1">
            Gestiona las organizaciones y empresas
          </p>
        </div>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          className="rounded-full shadow-sm hover:shadow-md transition-shadow bg-indigo-500 hover:bg-indigo-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cuenta
        </Button>
      </div>

      <Card className="shadow-sm rounded-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre, nombre completo o sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredAccounts.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">
                {searchQuery ? 'No se encontraron cuentas' : 'No hay cuentas registradas'}
              </p>
              {!searchQuery && (
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  variant="outline"
                  className="rounded-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera cuenta
                </Button>
              )}
            </div>
          ) : (
        <div className="overflow-x-auto">
            <Table>
            <TableHeader>
                <TableRow className="bg-muted hover:bg-muted/50">
                <TableHead className="w-[80px]">Logo</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Nombre Completo</TableHead>
                <TableHead>Sector</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredAccounts.map((account) => (
                <TableRow
                    key={account.id}
                    className="cursor-pointer hover:bg-slate-50 h-[70px]"
                    onClick={() => navigate(`/accounts/${account.id}`)}
                >
                    <TableCell className="p-2">
                    <div className="h-15 w-20 flex items-center justify-center  overflow-hidden">
                        {account.logo ? (
                        <img
                            src={`http://localhost:3001${account.logo}`}
                            alt={account.name}
                            className="h-full w-full object-contain p-1"
                        />
                        ) : (
                        <Building2 className="h-6 w-6 text-slate-300" />
                        )}
                    </div>
                    </TableCell>
                    <TableCell className="font-medium">
                    {account.name || '-'}
                    </TableCell>
                    <TableCell>{account.full_name || '-'}</TableCell>
                    <TableCell>{account.sector || '-'}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nueva Cuenta</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="full_name">Nombre Completo</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                />
              </div>
                <div>
                <Label htmlFor="sector">Sector</Label>
                <Select
                    value={formData.sector}
                    onValueChange={(value) =>
                    setFormData({ ...formData, sector: value })
                    }
                >
                    <SelectTrigger>
                    <SelectValue placeholder="Seleccionar sector" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Banking and Finance">Banking and Finance</SelectItem>
                    <SelectItem value="Insurance">Insurance</SelectItem>
                    <SelectItem value="Energy and Utilities">Energy and Utilities</SelectItem>
                    <SelectItem value="Technology and Telecom">Technology and Telecom</SelectItem>
                    <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="Healthcare">Healthcare</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Services">Services</SelectItem>
                    </SelectContent>
                </Select>
                </div>
              <div>
                <Label htmlFor="web_site">Sitio Web</Label>
                <Input
                  id="web_site"
                  type="url"
                  placeholder="https://..."
                  value={formData.web_site}
                  onChange={(e) =>
                    setFormData({ ...formData, web_site: e.target.value })
                  }
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="address">Dirección</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="rounded-full"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="rounded-full shadow-sm hover:shadow-md transition-shadow bg-indigo-500 hover:bg-indigo-600"
              >
                Crear Cuenta
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}