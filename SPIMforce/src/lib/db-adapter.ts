// src/lib/db-adapter.ts
const API_URL = 'http://localhost:3001';

export class DatabaseAdapter {

  // ==================== CONTACTS ====================
  async getContacts() {
    const res = await fetch(`${API_URL}/api/contacts`);
    if (!res.ok) throw new Error('Error obteniendo contactos');
    return res.json();
  }

  async getContact(id: string) {
    const res = await fetch(`${API_URL}/api/contacts/${id}`);
    if (!res.ok) throw new Error('Error obteniendo contacto');
    return res.json();
  }

  async createContact(contact: any) {
    const res = await fetch(`${API_URL}/api/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    if (!res.ok) throw new Error('Error creando contacto');
    return res.json();
  }

  async updateContact(id: string, contact: any) {
    // IMPORTANTE: Primero obtener el contacto actual para preservar photo_url
    const currentContact = await this.getContact(id);
    
    // Merge de los datos, preservando photo_url si no se proporciona
    const updatedData = {
      ...contact,
      photo_url: contact.photo_url !== undefined ? contact.photo_url : currentContact.photo_url
    };

    const res = await fetch(`${API_URL}/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    });
    if (!res.ok) throw new Error('Error actualizando contacto');
    return res.json();
  }

  async deleteContact(id: string) {
    const res = await fetch(`${API_URL}/api/contacts/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando contacto');
    return res.json();
  }

  async searchContacts(query: string) {
    const res = await fetch(`${API_URL}/api/contacts/search/${query}`);
    if (!res.ok) throw new Error('Error buscando contactos');
    return res.json();
  }

  // ==================== TEMPLATES ====================
  async getTemplates() {
    const res = await fetch(`${API_URL}/api/templates`);
    if (!res.ok) throw new Error('Error obteniendo templates');
    return res.json();
  }

  async getTemplate(id: string) {
    const res = await fetch(`${API_URL}/api/templates/${id}`);
    if (!res.ok) throw new Error('Error obteniendo template');
    return res.json();
  }

  async createTemplate(template: any) {
    const res = await fetch(`${API_URL}/api/templates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    if (!res.ok) throw new Error('Error creando template');
    return res.json();
  }

  async updateTemplate(id: string, template: any) {
    const res = await fetch(`${API_URL}/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    if (!res.ok) throw new Error('Error actualizando template');
    return res.json();
  }

  async deleteTemplate(id: string) {
    const res = await fetch(`${API_URL}/api/templates/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando template');
    return res.json();
  }

  // ==================== CAMPAIGNS ====================
  async getCampaigns() {
    const res = await fetch(`${API_URL}/api/campaigns`);
    if (!res.ok) throw new Error('Error obteniendo campaigns');
    return res.json();
  }

  async getCampaign(id: string) {
    const res = await fetch(`${API_URL}/api/campaigns/${id}`);
    if (!res.ok) throw new Error('Error obteniendo campaign');
    return res.json();
  }

  async createCampaign(campaign: any) {
    const res = await fetch(`${API_URL}/api/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(campaign)
    });
    if (!res.ok) throw new Error('Error creando campaign');
    return res.json();
  }
  
  async updateCampaign(id: string, data: any) {
    try {
      const response = await fetch(`${API_URL}/api/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error actualizando campaign');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error en updateCampaign:', error);
      throw error;
    }
  }

  async deleteCampaign(id: string) {
    const res = await fetch(`${API_URL}/api/campaigns/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando campaign');
    return res.json();
  }

  // ==================== SETTINGS ====================
  async getAllSettings() {
    const res = await fetch(`${API_URL}/api/settings`);
    if (!res.ok) throw new Error('Error obteniendo settings');
    return res.json();
  }

  async getSetting(key: string) {
    const res = await fetch(`${API_URL}/api/settings/${key}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Error obteniendo setting');
    }
    return res.json();
  }

  async upsertSetting(key: string, value: any) {
    const res = await fetch(`${API_URL}/api/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value })
    });
    if (!res.ok) throw new Error('Error guardando setting');
    return res.json();
  }

  async deleteSetting(key: string) {
    const res = await fetch(`${API_URL}/api/settings/${key}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando setting');
    return res.json();
  }

  // ==================== DISTRIBUTIONS ====================
  async getDistributions() {
    const res = await fetch(`${API_URL}/api/distributions`);
    if (!res.ok) throw new Error('Error obteniendo distributions');
    return res.json();
  }

  async getDistribution(id: string) {
    const res = await fetch(`${API_URL}/api/distributions/${id}`);
    if (!res.ok) throw new Error('Error obteniendo distribution');
    return res.json();
  }

  async createDistribution(distribution: any) {
    const res = await fetch(`${API_URL}/api/distributions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(distribution)
    });
    if (!res.ok) throw new Error('Error creando distribution');
    return res.json();
  }

  async updateDistribution(id: string, distribution: any) {
    const res = await fetch(`${API_URL}/api/distributions/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(distribution)
    });
    if (!res.ok) throw new Error('Error actualizando distribution');
    return res.json();
  }

  async deleteDistribution(id: string) {
    const res = await fetch(`${API_URL}/api/distributions/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando distribution');
    return res.json();
  }

  // ==================== RECOMMENDATIONS ====================
  async getRecommendations() {
    const res = await fetch(`${API_URL}/api/recommendations`);
    if (!res.ok) throw new Error('Error obteniendo recommendations');
    return res.json();
  }

  async getRecommendationsByDistribution(distributionId: string) {
    const res = await fetch(`${API_URL}/api/recommendations/distribution/${distributionId}`);
    if (!res.ok) throw new Error('Error obteniendo recommendations');
    return res.json();
  }

  async createRecommendation(recommendation: any) {
    const res = await fetch(`${API_URL}/api/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recommendation)
    });
    if (!res.ok) throw new Error('Error creando recommendation');
    return res.json();
  }

  async deleteRecommendation(id: string) {
    const res = await fetch(`${API_URL}/api/recommendations/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando recommendation');
    return res.json();
  }

  // ==================== OPPORTUNITIES ====================
  async getOpportunities() {
    const res = await fetch(`${API_URL}/api/opportunities`);
    if (!res.ok) throw new Error('Error obteniendo opportunities');
    return res.json();
  }

  async getOpportunity(id: string) {
    const res = await fetch(`${API_URL}/api/opportunities/${id}`);
    if (!res.ok) throw new Error('Error obteniendo opportunity');
    return res.json();
  }

  async createOpportunity(opportunity: any) {
    const res = await fetch(`${API_URL}/api/opportunities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity)
    });
    if (!res.ok) throw new Error('Error creando opportunity');
    return res.json();
  }

  async updateOpportunity(id: string, opportunity: any) {
    const res = await fetch(`${API_URL}/api/opportunities/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(opportunity)
    });
    if (!res.ok) throw new Error('Error actualizando opportunity');
    return res.json();
  }

  async deleteOpportunity(id: string) {
    const res = await fetch(`${API_URL}/api/opportunities/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando opportunity');
    return res.json();
  }

  // ==================== MEETINGS ====================
  async getMeetingsByOpportunity(opportunityId: string) {
    const res = await fetch(`${API_URL}/api/meetings/opportunity/${opportunityId}`);
    if (!res.ok) throw new Error('Error obteniendo meetings');
    return res.json();
  }

  async getMeetingsByContact(contactId: string) {
    const res = await fetch(`${API_URL}/api/meetings/contact/${contactId}`);
    if (!res.ok) throw new Error('Error obteniendo meetings del contacto');
    return res.json();
  }

  async getMeeting(id: string) {
    const res = await fetch(`${API_URL}/api/meetings/${id}`);
    if (!res.ok) throw new Error('Error obteniendo meeting');
    return res.json();
  }

  async createMeeting(meeting: any) {
    const res = await fetch(`${API_URL}/api/meetings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting)
    });
    if (!res.ok) throw new Error('Error creando meeting');
    return res.json();
  }

  async updateMeeting(id: string, meeting: any) {
    const res = await fetch(`${API_URL}/api/meetings/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(meeting)
    });
    if (!res.ok) throw new Error('Error actualizando meeting');
    return res.json();
  }

  async deleteMeeting(id: string) {
    const res = await fetch(`${API_URL}/api/meetings/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando meeting');
    return res.json();
  }

  // ==================== ACCOUNTS ====================
  async getAccounts() {
    const res = await fetch(`${API_URL}/api/accounts`);
    if (!res.ok) throw new Error('Error obteniendo accounts');
    return res.json();
  }

  async getAccount(id: string) {
    const res = await fetch(`${API_URL}/api/accounts/${id}`);
    if (!res.ok) throw new Error('Error obteniendo account');
    return res.json();
  }

  async createAccount(account: any) {
    const res = await fetch(`${API_URL}/api/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    if (!res.ok) throw new Error('Error creando account');
    return res.json();
  }

  async updateAccount(id: string, account: any) {
    const res = await fetch(`${API_URL}/api/accounts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account)
    });
    if (!res.ok) throw new Error('Error actualizando account');
    return res.json();
  }

  async deleteAccount(id: string) {
    const res = await fetch(`${API_URL}/api/accounts/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) throw new Error('Error eliminando account');
    return res.json();
  }

  async getAccountContacts(accountId: string) {
    const res = await fetch(`${API_URL}/api/accounts/${accountId}/contacts`);
    if (!res.ok) throw new Error('Error obteniendo contactos de la cuenta');
    return res.json();
  }

  // ==================== UTILS ====================
  async testConnection() {
    const res = await fetch(`${API_URL}/api/health`);
    if (!res.ok) throw new Error('Backend no disponible');
    return res.json();
  }
}

export const db = new DatabaseAdapter();