import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { db } from '@/lib/db-adapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Mail, Calendar, User, Building2, Briefcase, Send, Pencil, Trash2 } from 'lucide-react';
import { formatDateES } from '@/utils/dateFormatter';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

interface Campaign {
  id: string;
  contact_id: string;
  template_id: string | null;
  start_campaign: boolean;
  email_1_date: string | null;
  email_2_date: string | null;
  email_3_date: string | null;
  email_4_date: string | null;
  email_5_date: string | null;
  status: string;
  emails_sent: number;
  has_replied: boolean;
  last_reply_date: string | null;
  response_text: string | null;
  email_incorrect?: boolean;
  contacts: {
    first_name: string;
    last_name: string;
    email: string;
    organization: string;
    gartner_role: string;
    title: string;
    contact_type: string;
  };
  campaign_templates?: {
    name: string;
  };
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  organization: string;
  title: string;
  gartner_role: string;
  contact_type: string;
}

export default function CampaignDetailPage() {
  const navigate = useNavigate();
  const { campaignId } = useParams();
  const location = useLocation();
  const { toast } = useToast();
  
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<any[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    template_id: "",
    start_campaign: false,
    email_1_date: "",
    email_2_date: "",
    email_3_date: "",
    email_4_date: "",
    email_5_date: "",
  });

  const from = location.state?.from;
  const contactId = location.state?.contactId;

  useEffect(() => {
    if (campaignId) {
      loadData();
    }
  }, [campaignId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const campaignData = await db.getCampaign(campaignId!);
      setCampaign(campaignData);

      if (campaignData.contact_id) {
        const contactData = await db.getContact(campaignData.contact_id);
        setContact(contactData);
      }

      // Cargar templates
      const templatesData = await db.getTemplates();
      setTemplates(templatesData || []);
      
      // Filtrar templates por el rol del contacto
      if (campaignData.contacts?.gartner_role) {
        const filtered = (templatesData || []).filter(
          (t: any) => t.gartner_role === campaignData.contacts.gartner_role
        );
        setFilteredTemplates(filtered);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la campaña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (!campaign) return;

    // Preparar datos del formulario
    setFormData({
      template_id: campaign.template_id || "",
      start_campaign: campaign.start_campaign,
      email_1_date: campaign.email_1_date ? new Date(campaign.email_1_date).toLocaleDateString('en-CA') : "",
      email_2_date: campaign.email_2_date ? new Date(campaign.email_2_date).toLocaleDateString('en-CA') : "",
      email_3_date: campaign.email_3_date ? new Date(campaign.email_3_date).toLocaleDateString('en-CA') : "",
      email_4_date: campaign.email_4_date ? new Date(campaign.email_4_date).toLocaleDateString('en-CA') : "",
      email_5_date: campaign.email_5_date ? new Date(campaign.email_5_date).toLocaleDateString('en-CA') : "",
    });

    setIsEditDialogOpen(true);
  };

  const handleDateChange = (emailNumber: number, newDate: string) => {
    if (!newDate) {
      setFormData({ ...formData, [`email_${emailNumber}_date`]: newDate });
      return;
    }
    
    const dates: any = { ...formData };
    const baseDate = new Date(newDate);
    baseDate.setHours(0, 0, 0, 0);

    for (let i = emailNumber; i <= 5; i++) {
      if (i === emailNumber) {
        dates[`email_${i}_date`] = newDate;
      } else if (dates[`email_${i-1}_date`]) {
        const previousDate = new Date(dates[`email_${i-1}_date`]);
        previousDate.setHours(0, 0, 0, 0);
        previousDate.setDate(previousDate.getDate() + 3);
        
        const year = previousDate.getFullYear();
        const month = String(previousDate.getMonth() + 1).padStart(2, '0');
        const day = String(previousDate.getDate()).padStart(2, '0');
        dates[`email_${i}_date`] = `${year}-${month}-${day}`;
      }
    }

    setFormData(dates);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.template_id) {
      toast({
        title: "Error de validación",
        description: "Por favor selecciona una plantilla",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      template_id: formData.template_id,
      start_campaign: formData.start_campaign,
      email_1_date: formData.email_1_date,
      email_2_date: formData.email_2_date,
      email_3_date: formData.email_3_date,
      email_4_date: formData.email_4_date,
      email_5_date: formData.email_5_date,
    };

    try {
      await db.updateCampaign(campaignId!, payload);
      toast({ title: "Éxito", description: "Campaña actualizada" });
      setIsEditDialogOpen(false);
      loadData(); // Recargar datos
    } catch (error: any) {
      console.error("Error actualizando campaña:", error);
      toast({
        title: "Error",
        description: error.message || "Error desconocido",
        variant: "destructive",
      });
    }
  };

  const handleGoBack = () => {
    if (from === 'contact' && contactId) {
      navigate(`/crm/${contactId}`);
    } else {
      navigate('/campaigns');
    }
  };

  const getBackButtonText = () => {
    if (from === 'contact') {
      return 'Volver a Contacto';
    }
    return 'Volver a Campañas';
  };

  const getCampaignStatus = () => {
    if (!campaign) return { status: "Desconocido", variant: "outline" as const };

    if (campaign.email_incorrect) {
      return { status: "Email incorrecto", variant: "destructive" as const };
    }
    if (campaign.has_replied) {
      return { status: "Respondido", variant: "default" as const };
    }
    if (campaign.emails_sent >= 5) {
      return { status: "Completada sin respuesta", variant: "secondary" as const };
    }
    if (campaign.start_campaign && campaign.email_1_date) {
      return { status: "En curso", variant: "outline" as const };
    }
    return { status: "Pendiente", variant: "outline" as const };
  };

  const formatDateTime = (dateString: string | null | undefined): string => {
    if (!dateString) return '-';
    
    try {
      if (/^\d{2}\/\d{2}\/\d{4}\s+\d{2}:\d{2}$/.test(dateString)) {
        return dateString;
      }
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return dateString;
    }
  };

  const renderTextWithLinks = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline break-all"
          >
            {part}
          </a>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta campaña?")) return;

    try {
      await db.deleteCampaign(campaignId!);
      toast({ title: "Éxito", description: "Campaña eliminada" });
      handleGoBack();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la campaña", variant: "destructive" });
    }
  };


  if (loading) {
    return <div className="container mx-auto py-8 px-4">Cargando...</div>;
  }

  if (!campaign) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>No se encontró la campaña</p>
      </div>
    );
  }

  const campaignStatus = getCampaignStatus();

  return (
    <div className="container mx-auto py-8 px-4">
      <Button
        variant="ghost"
        onClick={handleGoBack}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        {getBackButtonText()}
      </Button>

      <div className="space-y-6">
        {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-3">
                  Campaña: {campaign.contacts.first_name} {campaign.contacts.last_name} ({campaign.campaign_templates.name})
                </CardTitle>
                <p className="text-lg text-muted-foreground mt-2">
                  {campaign.contacts.title} - {campaign.contacts.organization}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEdit}
                  disabled={campaign.has_replied || campaign.emails_sent >= 5 || campaign.email_incorrect}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Eliminar
                </Button>
              </div>
            </div>
        {/* Estado de la campaña */}
        
        <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Estado de la Campaña</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
              <div className="flex-1 text-sm items-center text-muted-foreground gap-4">
                <p className="text-sm items-center text-muted-foreground gap-4">Estado</p>
                <Badge 
                  variant={campaignStatus.variant}
                  className={`mt-1 ${
                    campaignStatus.status === "Email incorrecto"
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : campaignStatus.status === "Respondido" 
                      ? "bg-green-500 hover:bg-green-600 text-white" 
                      : campaignStatus.status === "En curso"
                      ? "bg-gray-400 hover:bg-gray-600 text-white"
                      : campaignStatus.status === "Completada sin respuesta"
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : ""
                  }`}
                >
                  {campaignStatus.status}
                </Badge>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Tipo de campaña</p>
                <p className="text-sm font-semibold">{campaign.campaign_templates.name}</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Emails enviados</p>
                <p className="text-sm font-semibold">{campaign.emails_sent} / 5</p>
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">Campaña activa</p>
                <p className="text-sm font-semibold">{campaign.start_campaign ? 'Sí' : 'No'}</p>
              </div>

          </CardContent>
        </Card>

        {/* Información del contacto */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">Información del Contacto
                <Button
                variant="link"
                className="p-3 h-auto"
                onClick={() => navigate(`/crm/${campaign.contact_id}`)}>
                Ver perfil del contacto →
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nombre</p>
                  <p className="font-medium">{campaign.contacts.first_name} {campaign.contacts.last_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{campaign.contacts.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Organización</p>
                  <p className="font-medium">{campaign.contacts.organization}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Cargo</p>
                  <p className="font-medium">{campaign.contacts.title}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
        
        {/* Cronograma de emails */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Envío de Emails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex w-full gap-4">
              {[1, 2, 3, 4, 5].map((num) => {
                const dateField = `email_${num}_date` as keyof Campaign;
                const emailDate = campaign[dateField] as string | null;
                const isSent = campaign.emails_sent >= num;

                return (
                  
                  <div
                    key={num}
                    className={`flex-1 flex items-center justify-between p-3 rounded-lg border ${
                      isSent ? 'bg-green-50 border-green-200' : 'bg-muted'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isSent ? 'bg-green-500 text-white' : 'bg-muted-foreground text-white'
                      }`}>
                        {isSent ? '✓' : num}
                      </div>
                      <div>
                        <p className="font-medium">Email {num}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateES(emailDate)}
                        </p>
                      </div>
                    </div>
                    {isSent && (
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        Enviado
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
      {campaign.has_replied && (  
      <Card>
         <CardHeader>
            <CardTitle>Respuesta del contacto</CardTitle>
          </CardHeader>
          <CardContent >
              <div>
                <p className="text-sm font-semibold text-green-600 mb-2">✓ El contacto ha respondido</p>
                <p className="text-sm text-muted-foreground">
                  Fecha de respuesta: {formatDateTime(campaign.last_reply_date)}
                </p>
                {campaign.response_text && (
                  <div className="mt-3 p-3 bg-muted rounded-md max-h-300 overflow-y-auto">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Respuesta:</p>
                    <div className="text-sm text-foreground whitespace-pre-wrap break-all">
                      {renderTextWithLinks(campaign.response_text)}
                    </div>
                  </div>
                )}
              </div>
              </CardContent>
            </Card>
            )}          
      </div>
      {/* Diálogo de edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Campaña</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Contacto</Label>
              <Input 
                value={`${campaign?.contacts.first_name} ${campaign?.contacts.last_name}`} 
                disabled 
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {campaign?.contacts.email} - {campaign?.contacts.organization}
              </p>
            </div>

            <div>
              <Label>Plantilla</Label>
              <Select 
                value={formData.template_id} 
                onValueChange={(v) => setFormData({ ...formData, template_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar plantilla" />
                </SelectTrigger>
                <SelectContent>
                  {filteredTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <Label className="text-base font-semibold">Fechas de Envío</Label>
              <p className="text-xs text-muted-foreground mb-3">
                Al cambiar una fecha, las siguientes se recalcularán automáticamente (+3 días)
              </p>

              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Fecha Email 1</Label>
                    <Input
                      type="date"
                      value={formData.email_1_date || ''}
                      onChange={(e) => handleDateChange(1, e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Fecha Email 2</Label>
                    <Input
                      type="date"
                      value={formData.email_2_date || ''}
                      onChange={(e) => handleDateChange(2, e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <Label>Fecha Email 3</Label>
                    <Input
                      type="date"
                      value={formData.email_3_date || ''}
                      onChange={(e) => handleDateChange(3, e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Fecha Email 4</Label>
                    <Input
                      type="date"
                      value={formData.email_4_date || ''}
                      onChange={(e) => handleDateChange(4, e.target.value)}
                    />
                  </div>
                </div>

                <div className="w-1/2">
                  <Label>Fecha Email 5</Label>
                  <Input
                    type="date"
                    value={formData.email_5_date || ''}
                    onChange={(e) => handleDateChange(5, e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox 
                checked={formData.start_campaign} 
                onCheckedChange={(v) => setFormData({ ...formData, start_campaign: v as boolean })} 
              />
              <Label>Iniciar automáticamente la campaña</Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Actualizar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}