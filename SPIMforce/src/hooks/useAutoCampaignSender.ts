import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/db-adapter';

interface Campaign {
  id: string;
  contact_id: string;
  template_id: string | null;
  start_campaign: boolean;
  emails_sent: number;
  has_replied: boolean;
  email_incorrect?: boolean;
  email_1_date: string | null;
  email_2_date: string | null;
  email_3_date: string | null;
  email_4_date: string | null;
  email_5_date: string | null;
  contacts: {
    first_name: string;
    last_name: string;
    email: string;
    organization: string;
  };
}

export function useAutoCampaignSender() {
  const { toast } = useToast();
  const location = useLocation();
  const [isSending, setIsSending] = useState(false);

  const sendEmail = async (campaign: Campaign, emailNumber: number) => {
    try {
      if (campaign.emails_sent >= emailNumber) {
        console.log(`Email ${emailNumber} ya fue enviado para campaña ${campaign.id}`);
        return;
      }

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

      const template = await db.getTemplate(campaign.template_id);

      if (!template) {
        console.error('Template no encontrado. ID:', campaign.template_id);
        throw new Error('Template not found');
      }

      const currentYear = new Date().getFullYear().toString();
      const nextYear = (new Date().getFullYear() + 1).toString();

      let subject = template[`email_${emailNumber}_subject`];
      subject = subject.replace(/{{Nombre}}/g, campaign.contacts.first_name || '');
      subject = subject.replace(/{{ano}}/g, currentYear);
      subject = subject.replace(/{{anoSiguiente}}/g, nextYear);
      subject = subject.replace(/{{compania}}/g, campaign.contacts.organization || '');

      let body = template[`email_${emailNumber}_html`];
      body = body.replace(/{{Nombre}}/g, campaign.contacts.first_name || '');
      body = body.replace(/{{nombreAE}}/g, accountManagerName);
      body = body.replace(/{{compania}}/g, campaign.contacts.organization || '');
      body = body.replace(/{{ano}}/g, currentYear);
      body = body.replace(/{{anoSiguiente}}/g, nextYear);
      
      if (signature) {
        body = body + '<br/><br/>' + signature;
      }

      const attachmentsFromTemplate = template[`email_${emailNumber}_attachments`] || [];
      const processedAttachments = [];
      
      for (const attachment of attachmentsFromTemplate) {
        try {
          if (attachment.url) {
            const response = await fetch(attachment.url);
            if (!response.ok) {
              throw new Error(`Error descargando archivo: ${response.status}`);
            }
            
            const blob = await response.blob();
            
            const base64 = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.readAsDataURL(blob);
              reader.onload = () => {
                const result = reader.result as string;
                const base64Data = result.split(',')[1];
                resolve(base64Data);
              };
              reader.onerror = reject;
            });
            
            processedAttachments.push({
              filename: attachment.name,
              content: base64
            });
          }
        } catch (error) {
          console.error(`Error procesando adjunto ${attachment.name}:`, error);
        }
      }

      await fetch('http://localhost:3002/api/draft-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          to: campaign.contacts.email,
          contactEmail: campaign.contacts.email,
          subject,
          body,
          attachments: processedAttachments
        }),
      });

      await db.updateCampaign(campaign.id, { emails_sent: emailNumber });
      console.log(`✅ Email ${emailNumber} enviado para ${campaign.contacts.first_name} ${campaign.contacts.last_name}`);
    } catch (error) {
      console.error('Error enviando email:', error);
      throw error;
    }
  };

  const autoSendDailyEmails = async () => {
    if (isSending) {
      console.log('Ya hay un envío en curso, saltando...');
      return;
    }

    try {
      setIsSending(true);
      console.log('Verificando emails para enviar...');
      
      const campaigns: Campaign[] = await db.getCampaigns();
      const today = new Date();
      const localDate = today.toLocaleDateString('en-CA');
      let emailsSent = 0;

      for (const campaign of campaigns) {
        if (!campaign.start_campaign) continue;

        for (let i = 1; i <= 5; i++) {
          const dateField = `email_${i}_date` as keyof Campaign;
          const emailDate = campaign[dateField];
          const emailDateOnly = emailDate ? String(emailDate).split('T')[0] : null;

          if (emailDateOnly && emailDateOnly <= localDate && campaign.emails_sent < i) {
            console.log(`Auto-enviando email ${i} para campaña ${campaign.id}`);
            console.log(`Fecha original: ${emailDateOnly}, Fecha actual: ${localDate}`);
            console.log(`Emails enviados antes: ${campaign.emails_sent}`);
            
            await sendEmail(campaign, i);
            emailsSent++;
            
            if (emailDateOnly < localDate) {
              console.log(`Email ${i} estaba atrasado, actualizando fechas...`);
              
              const updatedDates: any = {};
              updatedDates[`email_${i}_date`] = localDate;
              
              const baseDate = new Date(localDate);
              baseDate.setHours(0, 0, 0, 0);
              
              for (let j = i + 1; j <= 5; j++) {
                baseDate.setDate(baseDate.getDate() + 3);
                const year = baseDate.getFullYear();
                const month = String(baseDate.getMonth() + 1).padStart(2, '0');
                const day = String(baseDate.getDate()).padStart(2, '0');
                updatedDates[`email_${j}_date`] = `${year}-${month}-${day}`;
              }
              
              console.log('Fechas actualizadas:', updatedDates);
              await db.updateCampaign(campaign.id, updatedDates);
            }
            
            break;
          }
        }
      }

      if (emailsSent > 0) {
        window.dispatchEvent(new CustomEvent('campaignsUpdated'));
        console.log(`✅ ${emailsSent} email(s) enviado(s), evento disparado`);
      } else {
        console.log(`No hay emails  de campañas para enviar hoy`);
      }
    } catch (e) {
      console.log('Auto send completed with error:', e);
    } finally {
      setIsSending(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      autoSendDailyEmails();
    }, 1000);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return { isSending };
}