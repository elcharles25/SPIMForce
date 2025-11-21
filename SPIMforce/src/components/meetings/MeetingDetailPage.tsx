import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { db } from '@/lib/db-adapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateES } from '@/utils/dateFormatter';
import { Mail, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Pencil, Trash2, Calendar, User } from 'lucide-react';

interface Meeting {
  id: string;
  opportunity_id: string | null;
  contact_id: string;
  meeting_type: string;
  meeting_date: string;
  feeling: string;
  notes: string | null;
  created_at: string;
}

interface Contact {
  id: string;
  first_name: string;
  last_name: string;
  organization: string;
  email: string;
  title: string;
}

interface Opportunity {
  id: string;
  proposed_solution: string;
  status: string;
}

const FEELING_OPTIONS = [
  { value: 'Excelente', label: 'Excelente', color: 'bg-green-500' },
  { value: 'Bien', label: 'Bien', color: 'bg-blue-500' },
  { value: 'Neutral', label: 'Neutral', color: 'bg-yellow-500' },
  { value: 'Mal', label: 'Mal', color: 'bg-orange-500' },
  { value: 'Muy mal', label: 'Muy mal', color: 'bg-red-500' },
  { value: 'N/A', label: 'N/A', color: 'bg-gray-500' },
];
const PROMPT_FOLLOW_UP = `Analiza las notas de la siguiente reunión y extrae la información en formato JSON:

1. Identifica las principales iniciativas o prioridades que se comentaron durante la reunión:
   - Para cada iniciativa, incluye:
     * Título de la iniciativa
     * Actividades que se deban de realizar dentro de la iniciativa. Dbe haber entre 1 y 3 actividades (mínimo 90 caracteres)

2. Identifica los próximos pasos acordados en la reunión:
   - Para cada próximo paso, incluye:
     * Actividad a realizar (mínimo 60 caracteres)
     * Responsable de la actividad

Estructura de la respuesta (devuelve SOLO JSON sin markdown):
{
  "initiatives": [
    {
      "title": "Título de la iniciativa",
      "activity_1": "Actividad a ejecutar"
      "activity_2": "Actividad a ejecutar" (si hay más de una actividad)
      "activity_3": "Actividad a ejecutar" (si hay más de una actividad)
    }
  ],
  "next_steps": [
    {
      "activity": "Actividad a realizar",
      "owner": "Responsable"
    }
  ]
}

Si no hay iniciativas:
{
  "initiatives": []
}

Si no hay próximos pasos:
{
  "next_steps": []
}

NOTAS DE LA REUNIÓN:
`;
export default function MeetingDetailPage() {
  const navigate = useNavigate();
  const { meetingId } = useParams();
  const location = useLocation();
  const { toast } = useToast();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [contact, setContact] = useState<Contact | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [formData, setFormData] = useState({
    opportunity_id: "Sin oportunidad",
    meeting_type: "",
    meeting_date: "",
    feeling: "Neutral",
    notes: "",
  });

  // Obtener información de origen de la navegación
  const from = location.state?.from;
  const contactId = location.state?.contactId;
  const opportunityId = location.state?.opportunityId;

  const handleGoBack = () => {
    if (from === 'opportunity' && opportunityId) {
      navigate(`/opportunities/${opportunityId}`);
    } else if (from === 'contact' && contactId) {
      navigate(`/crm/${contactId}`);
    } else if (contact?.id) {
      // Fallback: ir al contacto si existe
      navigate(`/crm/${contact.id}`);
    } else {
      // Fallback final: ir a CRM
      navigate('/crm');
    }
  };

  const getBackButtonText = () => {
    if (from === 'opportunity') {
      return 'Volver a Oportunidad';
    } else if (from === 'contact') {
      return 'Volver a Contacto';
    }
    return 'Volver';
  };

  useEffect(() => {
    if (meetingId) {
      loadData();
    }
  }, [meetingId]);

  const analyzeWithGemini = async (notesContent: string, promptText: string): Promise<string> => {
  const geminiKey = (window as any).__GEMINI_API_KEY__ || '';

  if (!geminiKey) {
    throw new Error('GEMINI_API_KEY no configurada. Por favor, configúrala en Settings.');
  }

  const fullPrompt = `${promptText}

${notesContent}`;

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 120000);

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 20000,
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error Gemini API: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      throw new Error('Respuesta inesperada de Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado tiempo. Intenta de nuevo.');
    }
    throw new Error(`Error analizando con Gemini: ${err instanceof Error ? err.message : String(err)}`);
  }
};

  const loadData = async () => {
    try {
      setLoading(true);
      const meetingData = await db.getMeeting(meetingId!);
      setMeeting(meetingData);

      if (meetingData.contact_id) {
        const contactData = await db.getContact(meetingData.contact_id);
        setContact(contactData);

        // Cargar oportunidades del contacto
        const allOpportunities = await db.getOpportunities();
        const contactOpportunities = (allOpportunities || []).filter(
          (opp: any) => opp.contact_id === meetingData.contact_id
        );
        setOpportunities(contactOpportunities);
      }

      if (meetingData.opportunity_id) {
        try {
          const oppData = await db.getOpportunity(meetingData.opportunity_id);
          setOpportunity(oppData);
        } catch (error) {
          console.warn('Oportunidad no encontrada:', meetingData.opportunity_id);
          setOpportunity(null);
        }
      } else {
        setOpportunity(null);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la reunión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFeelingColor = (feeling: string) => {
    const option = FEELING_OPTIONS.find(f => f.value === feeling);
    return option?.color || 'bg-gray-500';
  };

  const getFeelingLabel = (feeling: string) => {
    const option = FEELING_OPTIONS.find(f => f.value === feeling);
    return option?.label || feeling;
  };

  const openEditDialog = () => {
    if (!meeting) return;
    
    setFormData({
      opportunity_id: meeting.opportunity_id || "Sin oportunidad",
      meeting_type: meeting.meeting_type,
      meeting_date: meeting.meeting_date,
      feeling: meeting.feeling,
      notes: meeting.notes || "",
    });
    setIsEditDialogOpen(true);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.meeting_type) {
    toast({
      title: "Campo obligatorio",
      description: "Por favor selecciona un tipo de reunión.",
      variant: "destructive",
    });
    return;
  }
  if (!formData.meeting_date) {
    toast({
      title: "Campo obligatorio",
      description: "Por favor selecciona una fecha.",
      variant: "destructive",
    });
    return;
  }

  const payload = {
    contact_id: meeting?.contact_id,
    opportunity_id: (formData.opportunity_id === "none" || formData.opportunity_id === "Sin oportunidad") 
      ? "Sin oportunidad" 
      : formData.opportunity_id,
    meeting_type: formData.meeting_type,
    meeting_date: formData.meeting_date,
    feeling: formData.feeling,
    notes: formData.notes || null,
  };

  try {
    await db.updateMeeting(meetingId!, payload);
    toast({ title: "Éxito", description: "Reunión actualizada correctamente" });
    setIsEditDialogOpen(false);
    loadData();
  } catch (error) {
    toast({
      title: "Error",
      description: `Error al actualizar la reunión: ${error instanceof Error ? error.message : "Desconocido"}`,
      variant: "destructive",
    });
  }
};

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de eliminar esta reunión?")) return;

    try {
      await db.deleteMeeting(meetingId!);
      toast({ title: "Éxito", description: "Reunión eliminada" });
      handleGoBack();
    } catch (error) {
      toast({ title: "Error", description: "No se pudo eliminar la reunión", variant: "destructive" });
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Cargando...</div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p>Reunión no encontrada</p>
      </div>
    );
  }

const handleGenerateFollowUp = async () => {
  if (!meeting?.notes || !contact) {
    toast({
      title: 'Sin información',
      description: 'No hay notas de reunión o contacto disponible',
      variant: 'destructive',
    });
    return;
  }

  setGeminiLoading(true);
  try {
    console.log('📊 Analizando notas para follow-up...');

    const result = await analyzeWithGemini(meeting.notes, PROMPT_FOLLOW_UP);

    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const initiatives = parsed.initiatives || [];
    const nextSteps = parsed.next_steps || [];

    // Obtener Account Manager y Firma
    const amSetting = await db.getSetting("account_manager");
    const accountManagerName = amSetting?.value?.name || '';

    const signatureSetting = await db.getSetting("email_signature");
    let signature = '';
    if (signatureSetting?.value) {
      const value = signatureSetting.value;
      signature = value?.signature || "";
      signature = signature.trim();
      if (signature.startsWith('"') && signature.endsWith('"')) {
        signature = signature.slice(1, -1);
      }
      signature = signature.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\\//g, '/');
    }

    let emailBody = `<body>
    <div>
    <p><span style="font-size:11.0pt;">Hola ${contact.first_name},
    <br><br>Muchas gracias por tu tiempo en la sesión de ayer.
    <br><br>Te adjunto el documento que estuvimos revisando en la sesión. Adicionalmente, describo, a alto nivel, mi entendimiento de tus prioridades clave que comentamos:
    <br><br>`;

    if (initiatives.length > 0) {
      initiatives.forEach((initiative: any) => {
        emailBody += `<p style="margin:0;"><strong>${initiative.title}</strong><ul></p>`;
        
        // Añadir activity_1 si existe
        if (initiative.activity_1) {
          emailBody += `<li><p style="margin:0;">${initiative.activity_1}</p></li>`;
        }
        
        // Añadir activity_2 si existe
        if (initiative.activity_2) {
          emailBody += `<li><p style="margin:0;">${initiative.activity_2}</p></li>`;
        }
        
        // Añadir activity_3 si existe
        if (initiative.activity_3) {
          emailBody += `<li><p style="margin:0;">${initiative.activity_3}</p></li>`;
        }
        
        emailBody += `</ul><br>`;
      });
    }
    emailBody += `<br>`;
    if (nextSteps.length > 0) {
      emailBody += `Como siguientes pasos, hemos acordado:`;
      emailBody += `<ul>`;
      nextSteps.forEach((step: any) => {
        emailBody += `<li><p style="margin:0;"><strong>${step.owner}</strong>: ${step.activity}</p></li>`;
      });
      emailBody += `</ul></div>`;
    }

    emailBody = emailBody + signature +`</body>`;

    const subject = `Follow-up sesión con ${contact.first_name} - Gartner`;

    try {
      const response = await fetch('http://localhost:3002/api/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contact.email,
          subject: subject,
          body: emailBody,
          attachments: [],
          contactEmail: contact.email
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al crear borrador');
      }

      toast({
        title: 'Email generado',
        description: 'Se ha abierto Outlook con el email de follow-up',
      });
    } catch (outlookError) {
      console.error('Error abriendo Outlook:', outlookError);
      toast({
        title: 'Error',
        description: outlookError instanceof Error ? outlookError.message : 'No se pudo abrir Outlook',
        variant: 'destructive',
      });
    }
  } catch (error) {
    console.error('Error generando follow-up:', error);
    toast({
      title: 'Error',
      description: error instanceof Error ? error.message : 'Error al generar follow-up',
      variant: 'destructive',
    });
  } finally {
    setGeminiLoading(false);
  }
};

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

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">
            {meeting.meeting_type}
          </h1>
          <p className="text-xl text-muted-foreground mt-1">
            {new Date(meeting.meeting_date).toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
       <div className="flex gap-2">
  <Button
    variant="outline"
    onClick={handleGenerateFollowUp}
    disabled={geminiLoading || !meeting.notes}
    className="rounded-full px-6 shadow-sm hover:shadow-md transition-shadow"
  >
    {geminiLoading ? (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    ) : (
      <Mail className="mr-2 h-4 w-4" />
    )}
    Generar email Follow-up
  </Button>
  <Button
    variant="outline"
    onClick={openEditDialog}
    className="rounded-full px-6 shadow-sm hover:shadow-md transition-shadow"
  >
    <Pencil className="mr-2 h-4 w-4" />
    Editar
  </Button>
</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Reunión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Fecha:</span>
              <span>{formatDateES(meeting.meeting_date)}</span>
            </div>
            <div>
              <span className="font-medium">Tipo:</span>{' '}
              <Badge variant="outline">{meeting.meeting_type}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Sensación:</span>
              <div className={`w-4 h-4 rounded-full ${getFeelingColor(meeting.feeling)}`} />
              <span>{getFeelingLabel(meeting.feeling)}</span>
            </div>
            {opportunity && (
              <div className="pt-2 border-t">
                <span className="font-medium">Oportunidad:</span>{' '}
                <div className="mt-1">
                  <Badge variant="secondary">{opportunity.status}</Badge>
                  <p className="text-sm mt-1">{opportunity.proposed_solution}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {contact && (
          <Card>
            <CardHeader>
              <CardTitle>Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <button
                  onClick={() => navigate(`/crm/${contact.id}`)}
                  className="text-primary hover:underline font-medium"
                >
                  {contact.first_name} {contact.last_name}
                </button>
              </div>
              <div>
                <span className="font-medium">Cargo:</span>{' '}
                {contact.title}
              </div>
              <div>
                <span className="font-medium">Organización:</span>{' '}
                {contact.organization}
              </div>
              <div>
                <span className="font-medium">Email:</span>{' '}
                <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                  {contact.email}
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {meeting.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notas / Minutas de la Reunión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap font-mono text-sm bg-muted p-4 rounded-md">
              {meeting.notes}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Reunión</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meeting_type">Tipo de Reunión *</Label>
                <Select 
                  value={formData.meeting_type} 
                  onValueChange={(value) => setFormData({ ...formData, meeting_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SKO">SKO</SelectItem>
                    <SelectItem value="QBR 90">QBR 90</SelectItem>
                    <SelectItem value="QBR Midyear">QBR Midyear</SelectItem>
                    <SelectItem value="QBR AA90">QBR AA90</SelectItem>
                    <SelectItem value="Delivery">Delivery</SelectItem>
                    <SelectItem value="Qualification">Qualification</SelectItem>
                    <SelectItem value="Cap. Alignment">Cap. Alignment</SelectItem>
                    <SelectItem value="IPW">IPW</SelectItem>
                    <SelectItem value="POC">POC</SelectItem>
                    <SelectItem value="EP POC">EP POC</SelectItem>
                    <SelectItem value="Proposal">Proposal</SelectItem>
                    <SelectItem value="Email">Email</SelectItem>
                    <SelectItem value="Teléfono">Teléfono</SelectItem>
                    <SelectItem value="Otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="meeting_date">Fecha *</Label>
                <Input
                  id="meeting_date"
                  type="date"
                  value={formData.meeting_date}
                  onChange={(e) => setFormData({ ...formData, meeting_date: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="feeling">Sensación de la Reunión</Label>
                <Select 
                  value={formData.feeling} 
                  onValueChange={(value) => setFormData({ ...formData, feeling: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FEELING_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${option.color}`} />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="opportunity_id">Oportunidad (opcional)</Label>
                <Select 
                  value={formData.opportunity_id} 
                  onValueChange={(value) => setFormData({ ...formData, opportunity_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sin oportunidad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin oportunidad</SelectItem>
                    {opportunities.map((opp) => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.proposed_solution} - {opp.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="meeting_notes">Notas / Minutas de la Reunión</Label>
              <Textarea
                id="meeting_notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={30}
                placeholder="Detalles de la reunión, minutas, acuerdos alcanzados, próximos pasos..."
                className="font-mono text-sm"
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                className="mr-auto rounded-full"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button type="button" 
                className="rounded-full"
                variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
              className="rounded-full shadow-sm hover:shadow-md transition-shadow bg-indigo-500 hover:bg-indigo-600"
              type="submit">Actualizar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}