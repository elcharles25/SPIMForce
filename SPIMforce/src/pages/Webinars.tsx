import { useState, useEffect } from "react";
import { db } from "@/lib/db-adapter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Settings, Send, Trash2, FileText, X } from "lucide-react";
import { WebinarEmailEditor } from "@/components/webinars/WebinarEmailEditor";
import { useOutlookDraftBatch } from "@/hooks/useOutlookDraft";
import { formatDateES } from "@/utils/dateFormatter";

interface WebinarDistribution {
  id: string;
  month: string;
  file_url: string;
  file_name: string;
  email_subject: string;
  email_html: string;
  sent: boolean;
  sent_at: string | null;
  created_at: string;
}

interface WebinarInfo {
  title: string;
  date: string;
  time: string;
  analyst: string;
  reason: string;
}

interface UploadedPdf {
  name: string;
  url: string;
  filename: string;
  size: number;
}

const Webinars = () => {
  const [distributions, setDistributions] = useState<WebinarDistribution[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showEmailEditor, setShowEmailEditor] = useState(false);
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [creatingDrafts, setCreatingDrafts] = useState(false);
  const [uploadedPdf, setUploadedPdf] = useState<UploadedPdf | null>(null);
  const { toast } = useToast();
  const { mutate: createDraftsBatch, isPending: isCreatingDrafts } = useOutlookDraftBatch();
  const [webinarsByRole, setWebinarsByRole] = useState<Record<string, WebinarInfo[]>>({});
  const [analyzingDistId, setAnalyzingDistId] = useState<string | null>(null);
  const [completedAnalysisDistIds, setCompletedAnalysisDistIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchDistributions();
  }, []);

  const fetchDistributions = async () => {
    try {
      const data = await db.getDistributions();
      console.log('📋 Distribuciones cargadas:', data);
      setDistributions(data || []);
    } catch (error) {
      console.error("Error cargando distribuciones:", error);
      toast({ 
        title: "Error", 
        description: "No se pudieron cargar las distribuciones", 
        variant: "destructive" 
      });
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast({
        title: "Error",
        description: "Solo se permiten archivos PDF",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);

    try {
      console.log(`📤 Subiendo ${file.name}...`);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/upload-webinar', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Error subiendo archivo');
      }

      const result = await response.json();
      
      console.log(`✅ Archivo subido: ${result.name}`);
      
      // Guardar información del PDF subido
      setUploadedPdf({
        name: result.name,
        url: result.url,
        filename: result.filename,
        size: result.size
      });
      
      toast({ 
        title: "Éxito", 
        description: `PDF "${result.name}" subido correctamente` 
      });

      // Limpiar input
      e.target.value = '';
      
    } catch (error) {
      console.error(`❌ Error subiendo archivo:`, error);
      toast({ 
        title: "Error", 
        description: `No se pudo subir el archivo`, 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePdf = () => {
    setUploadedPdf(null);
    toast({
      title: "PDF eliminado",
      description: "Puedes subir otro archivo"
    });
  };

  const extractTextFromPdf = async (pdfUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const pdfjsScript = document.createElement('script');
      pdfjsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      
      pdfjsScript.onload = async () => {
        try {
          const pdfjsLib = (window as any)['pdfjs-dist/build/pdf'] || (window as any).pdfjsLib;
          
          if (!pdfjsLib) {
            throw new Error('PDF.js no cargó correctamente');
          }
          
          pdfjsLib.GlobalWorkerOptions.workerSrc = 
            'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

          const fullUrl = pdfUrl.startsWith('http') 
            ? pdfUrl 
            : `http://localhost:3001${pdfUrl}`;

          console.log('📄 Extrayendo texto de:', fullUrl);

          const pdf = await pdfjsLib.getDocument(fullUrl).promise;
          let fullText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
          }

          console.log(`✅ Texto extraído: ${fullText.length} caracteres`);
          resolve(fullText);
        } catch (err) {
          reject(new Error(`Error extrayendo PDF: ${err instanceof Error ? err.message : String(err)}`));
        }
      };
      
      pdfjsScript.onerror = () => {
        reject(new Error('No se pudo cargar PDF.js desde CDN'));
      };
      
      document.head.appendChild(pdfjsScript);
    });
  };

  const analyzeWithGemini = async (pdfText: string): Promise<Record<string, WebinarInfo[]>> => {
    const geminiKey = (window as any).__GEMINI_API_KEY__ || '';
    
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY no configurada');
    }

    const prompt = `Analiza este contenido de webinars e identifica para cada rol los temas/webinars más relevantes que sean en inglés o español.

Roles a considerar: CIO, CISO, CDAO, Talent, Workplace, Procurement, Enterprise Architect, CAIO, Infrastructure & Operations

Para cada rol:
1. Identifica sus principales prioridades y desafíos
2. Selecciona los 2 webinars/temas más relevantes
3. Explica por qué son relevantes

Contenido del PDF (primeros 8000 caracteres):
${pdfText.substring(0, 8000)}

Devuelve SOLO un JSON válido (sin markdown, sin comillas adicionales) con esta estructura exacta:
{
  "CIO": [
    { "title": "Título del webinar 1", "date": "2025-01-15", "time": "14:00", "analyst": "Nombre Analista" },
    { "title": "Título del webinar 2", "date": "2025-01-22", "time": "15:30", "analyst": "Nombre Analista" }
  ],
  "CISO": [
    { "title": "Título del webinar 1", "date": "2025-01-15", "time": "14:00", "analyst": "Nombre Analista" },
    { "title": "Título del webinar 2", "date": "2025-01-22", "time": "15:30", "analyst": "Nombre Analista" }
  ]
}`;

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
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

      const responseText = data.candidates[0].content.parts[0].text;
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        throw new Error('No se pudo extraer JSON de la respuesta de Gemini');
      }

      return JSON.parse(jsonMatch[0]);
    } catch (err) {
      throw new Error(`Error analizando con Gemini: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleAnalysisStart = async (distributionId: string, pdfUrl: string) => {
    setAnalyzingDistId(distributionId);
    
    try {
      const pdfText = await extractTextFromPdf(pdfUrl);
      
      if (!pdfText || typeof pdfText !== 'string' || pdfText.length < 100) {
        throw new Error('El PDF parece estar vacío o no contiene texto suficiente');
      }

      const analysisData = await analyzeWithGemini(pdfText);
      setWebinarsByRole(analysisData);
      console.log('✅ Datos de webinars recibidos:', analysisData);
      
      toast({
        title: "Éxito",
        description: "Análisis completado correctamente",
      });
      
      setCompletedAnalysisDistIds(prev => new Set(prev).add(distributionId));
      setAnalyzingDistId(null);
    } catch (error) {
      console.error('💥 Error en análisis:', error);
      toast({
        title: "Error",
        description: `Error al analizar: ${error instanceof Error ? error.message : 'Desconocido'}`,
        variant: "destructive",
      });
      setAnalyzingDistId(null);
    }
  };

  const handleSaveDistribution = async () => {
    if (!uploadedPdf) {
      toast({ 
        title: "Error", 
        description: "Primero debes subir un PDF", 
        variant: "destructive" 
      });
      return;
    }

    if (!month) {
      toast({ 
        title: "Error", 
        description: "Selecciona un mes", 
        variant: "destructive" 
      });
      return;
    }

    setUploading(true);

    try {
      console.log('💾 Guardando distribución...');
      console.log('   Mes:', month);
      console.log('   PDF:', uploadedPdf);

      const settings = await db.getSetting('webinar_email_template');
      const emailTemplate = settings?.value || { subject: '', html: '' };
      
      const newDistribution = {
        month,
        file_name: uploadedPdf.name,
        file_url: `http://localhost:3001${uploadedPdf.url}`,
        email_subject: emailTemplate.subject || '',
        email_html: emailTemplate.html || '',
        sent: false,
        sent_at: null,
      };

      console.log('📦 Distribución a crear:', newDistribution);

      await db.createDistribution(newDistribution);

      toast({ 
        title: "Éxito", 
        description: "Distribución guardada correctamente" 
      });
      
      setUploadedPdf(null);
      await fetchDistributions();
      
    } catch (error) {
      console.error("Error guardando distribución:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo guardar la distribución", 
        variant: "destructive" 
      });
    } finally {
      setUploading(false);
    }
  };

  const replaceWebinarVariables = (html: string, role: string): string => {
    let modifiedHtml = html;
    const roleWebinars = webinarsByRole[role] || [];

    const simpleReplace = (text: string, pattern: string, replacement: string): string => {
      return text.split(pattern).join(replacement);
    };

    for (let i = 0; i < 10; i++) {
      const webinarIndex = i + 1;
      const webinar = roleWebinars[i];

      if (webinar) {
        modifiedHtml = simpleReplace(modifiedHtml, '{{Webinar' + webinarIndex + '}}', webinar.title);
        modifiedHtml = simpleReplace(modifiedHtml, '{{Titulo' + webinarIndex + '}}', webinar.title);
        modifiedHtml = simpleReplace(modifiedHtml, '{{Título' + webinarIndex + '}}', webinar.title);
        modifiedHtml = simpleReplace(modifiedHtml, '{{Fecha' + webinarIndex + '}}', webinar.date);
        modifiedHtml = simpleReplace(modifiedHtml, '{{Hora' + webinarIndex + '}}', webinar.time);
        modifiedHtml = simpleReplace(modifiedHtml, '{{Analista' + webinarIndex + '}}', webinar.analyst);
        modifiedHtml = simpleReplace(modifiedHtml, '{{Razon' + webinarIndex + '}}', webinar.reason);
      } else {
        modifiedHtml = simpleReplace(modifiedHtml, '{{Webinar' + webinarIndex + '}}', '');
        modifiedHtml = simpleReplace(modifiedHtml, '{{Titulo' + webinarIndex + '}}', '');
        modifiedHtml = simpleReplace(modifiedHtml, '{{Título' + webinarIndex + '}}', '');
        modifiedHtml = simpleReplace(modifiedHtml, '{{Fecha' + webinarIndex + '}}', '');
        modifiedHtml = simpleReplace(modifiedHtml, '{{Hora' + webinarIndex + '}}', '');
        modifiedHtml = simpleReplace(modifiedHtml, '{{Analista' + webinarIndex + '}}', '');
        modifiedHtml = simpleReplace(modifiedHtml, '{{Razon' + webinarIndex + '}}', '');
      }
    }

    return modifiedHtml;
  };

  const handleCreateDrafts = async (distId: string) => {
    if (Object.keys(webinarsByRole).length === 0) {
      toast({ 
        title: "Error", 
        description: "Primero debes analizar el PDF con IA", 
        variant: "destructive" 
      });
      return;
    }

    setCreatingDrafts(true);

    try {
      const allContacts = await db.getContacts();
      const contactsWithWebinars = allContacts.filter((c: any) => 
        c.webinars_subscribed && 
        Array.isArray(c.webinars_subscribed) && 
        c.webinars_subscribed.length > 0
      );

      if (contactsWithWebinars.length === 0) {
        toast({ 
          title: "Sin contactos", 
          description: "No hay contactos suscritos a webinars", 
          variant: "destructive" 
        });
        return;
      }

      const accountManagerSetting = await db.getSetting('account_manager');
      const emailSignatureSetting = await db.getSetting('email_signature');
      const emailTemplateSetting = await db.getSetting('webinar_email_template');

      const accountManager = accountManagerSetting?.value || {};
      const signature = emailSignatureSetting?.value?.signature || '';
      const emailTemplate = emailTemplateSetting?.value || {};

      const draftsToCreate = contactsWithWebinars.map((contact: any) => {
        const role = contact.gartner_role || contact.webinar_role;
        const webinars = webinarsByRole[role] || [];

        let emailBody = emailTemplate.html || '';
        
        emailBody = emailBody
          .replace(/{{Nombre}}/g, contact.first_name || '')
          .replace(/{{mes}}/g, month.split('-')[1])
          .replace(/{{anio}}/g, month.split('-')[0]);

        if (webinars.length > 0) {
          const webinarRows = webinars.map((w: WebinarInfo, idx: number) => `
            <tr>
              <td>${w.date}</td>
              <td>${w.time}</td>
              <td>${w.title}</td>
              <td>${w.analyst}</td>
            </tr>
          `).join('');
          
          emailBody = emailBody.replace(
            '</table>',
            webinarRows + '</table>'
          );
        }

        emailBody += signature;

        return {
          to: contact.email,
          subject: emailTemplate.subject || `Webinars Gartner ${month}`,
          body: emailBody,
        };
      });

      createDraftsBatch({ emails: draftsToCreate }, {
        onSuccess: async () => {
          toast({ 
            title: "Éxito", 
            description: `${draftsToCreate.length} borradores creados en Outlook` 
          });

          await db.updateDistribution(distId, { 
            sent: true, 
            sent_at: new Date().toISOString() 
          });
          
          fetchDistributions();
        },
        onError: (error) => {
          toast({ 
            title: "Error", 
            description: "No se pudieron crear los borradores", 
            variant: "destructive" 
          });
        }
      });

    } catch (error) {
      console.error("Error creando drafts:", error);
      toast({ 
        title: "Error", 
        description: "Error al preparar los borradores", 
        variant: "destructive" 
      });
    } finally {
      setCreatingDrafts(false);
    }
  };

  const handleDelete = async (id: string, fileUrl: string) => {
    if (!confirm("¿Eliminar esta distribución?")) return;

    try {
      await db.deleteDistribution(id);

      toast({ 
        title: "Éxito", 
        description: "Distribución eliminada" 
      });
      
      fetchDistributions();
      
    } catch (error) {
      console.error("Error eliminando distribución:", error);
      toast({ 
        title: "Error", 
        description: "No se pudo eliminar", 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Gestión de Webinars</h1>
          <Button 
            variant= "outline" 
            className="rounded-full shadow-sm hover:shadow-md transition-shadow hover:bg-indigo-100"
            onClick={() => setShowEmailEditor(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Configurar Email
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cargar Nuevo Webinar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="month">Mes</Label>
                <Input 
                  id="month" 
                  type="month" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)} 
                />
              </div>
              
              <div>
                <Label htmlFor="pdf-upload">Calendario PDF</Label>
                <Input
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={uploading || !!uploadedPdf}
                  className="cursor-pointer"
                />
              </div>
            </div>

            {/* Mostrar PDF cargado */}
            {uploadedPdf && (
              <div className="mt-2">
                <div className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="flex items-center text-sm">
                    <FileText className="h-4 w-4 mr-2" />
                    {uploadedPdf.name}
                    <span className="text-xs text-muted-foreground ml-2">
                      ({(uploadedPdf.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </span>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    onClick={handleRemovePdf}
                    disabled={uploading}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            <div className="flex justify-end">
              <Button 
                onClick={handleSaveDistribution} 
                disabled={uploading || !uploadedPdf || !month} 
                className="rounded-full shadow-sm hover:shadow-md transition-shadow bg-indigo-500 hover:bg-indigo-600"
              >
                <FileText className="h-4 w-4 mr-2" />
                Guardar Distribución
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuciones de Webinars</CardTitle>
          </CardHeader>
          <CardContent>
            {distributions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No hay distribuciones creadas. Carga un PDF y guarda una distribución.
              </p>
            ) : (
            <div className="bg-card rounded-lg shadow overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted/50">
                    <TableHead className="text-center">Mes</TableHead>
                    <TableHead className="text-center">Archivo</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Fecha Envío</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {distributions.map((dist) => (
                    <TableRow key={dist.id} className="text-sm leading-tight text-center align-middle">
                      <TableCell className="p-4">{dist.month}</TableCell>
                      <TableCell className="p-4">
                        <a href={dist.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                          {dist.file_name}
                        </a>
                      </TableCell>
                      <TableCell className="p-4">
                        <span className={`leading-tight rounded text-xs ${dist.sent ? "px-10 py-2.5 bg-green-500/20" : "px-9 py-2.5 bg-yellow-500/20"}`}>
                          {dist.sent ? "Enviado" : "Pendiente"}
                        </span>
                      </TableCell>
                      <TableCell className="p-4">{formatDateES(dist.sent_at)}</TableCell>
                      <TableCell className="p-4">
                        <div className="flex justify-center gap-3">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 px-2 py-0" 
                            onClick={() => handleAnalysisStart(dist.id, dist.file_url)} 
                            disabled={dist.sent || analyzingDistId === dist.id || completedAnalysisDistIds.has(dist.id)}
                            title={
                              dist.sent 
                                ? "No se puede analizar - webinar enviado" 
                                : analyzingDistId === dist.id 
                                ? "Analizando..."
                                : completedAnalysisDistIds.has(dist.id)
                                ? "Análisis completado"
                                : "Analizar con AI"
                            }
                          >
                            {analyzingDistId === dist.id 
                              ? 'Analizando con IA...' 
                              : completedAnalysisDistIds.has(dist.id)
                              ? 'Análisis con AI completado'
                              : 'Analizar con AI'
                            }
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-8 px-2 py-0" 
                            onClick={() => handleCreateDrafts(dist.id)} 
                            disabled={dist.sent || creatingDrafts || isCreatingDrafts || analyzingDistId !== null || Object.keys(webinarsByRole).length === 0} 
                            title={
                              dist.sent
                                ? "No se pueden crear borradores - webinar enviado"
                                : Object.keys(webinarsByRole).length === 0
                                ? "Primero analiza con AI"
                                : "Crear borradores en Outlook"
                            }
                          >
                            <Send className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            className="h-8 px-2 py-0" 
                            onClick={() => handleDelete(dist.id, dist.file_url)}
                            disabled={dist.sent}
                            title={
                              dist.sent
                                ? "No se puede eliminar - webinar enviado"
                                : "Eliminar distribución"
                            }
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showEmailEditor} onOpenChange={setShowEmailEditor}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Configurar Plantilla de Email</DialogTitle>
            </DialogHeader>
            <WebinarEmailEditor />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Webinars;