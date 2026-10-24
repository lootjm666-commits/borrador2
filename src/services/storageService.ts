/**
 * Servicio de almacenamiento local y sincronización compatible con Firestore
 * ANTISEC | Análisis Telefónico - UECS Ciudad Juárez
 */

import { CallDetailRecord, CellTower, InvestigationCase, PhoneLabel } from '../types/telecom';
import { INITIAL_PHONE_LABELS, MOCK_CASES, MOCK_TOWERS, generateSyntheticRecords } from '../data/mockData';

const STORAGE_KEYS = {
  CASES: 'antisec_cases_v1',
  LABELS: 'antisec_labels_v1',
  ACTIVE_CASE_ID: 'antisec_active_case_id_v1',
  CUSTOM_RECORDS: 'antisec_custom_records_v1'
};

export const storageService = {
  getCases(): InvestigationCase[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CASES);
      if (stored) return JSON.parse(stored);
    } catch {
      // Fallback
    }
    return MOCK_CASES;
  },

  getActiveCaseId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CASE_ID) || MOCK_CASES[0].id;
  },

  setActiveCaseId(caseId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CASE_ID, caseId);
  },

  getLabels(caseId?: string): PhoneLabel[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LABELS);
      let labels: PhoneLabel[] = stored ? JSON.parse(stored) : INITIAL_PHONE_LABELS;
      if (caseId) {
        labels = labels.filter(l => !l.caseId || l.caseId === caseId);
      }
      return labels;
    } catch {
      return INITIAL_PHONE_LABELS;
    }
  },

  saveLabel(label: PhoneLabel): PhoneLabel[] {
    const current = this.getLabels();
    const existingIndex = current.findIndex(
      l => l.phoneNumber.replace(/\D/g, '') === label.phoneNumber.replace(/\D/g, '')
    );

    let updated: PhoneLabel[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = { ...label, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) };
    } else {
      updated = [
        ...current,
        { ...label, updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16) }
      ];
    }

    try {
      localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(updated));
    } catch {
      console.warn('No se pudo guardar la etiqueta en almacenamiento local');
    }
    return updated;
  },

  deleteLabel(phoneNumber: string): PhoneLabel[] {
    const current = this.getLabels();
    const filtered = current.filter(
      l => l.phoneNumber.replace(/\D/g, '') !== phoneNumber.replace(/\D/g, '')
    );
    try {
      localStorage.setItem(STORAGE_KEYS.LABELS, JSON.stringify(filtered));
    } catch {
      // ignore
    }
    return filtered;
  },

  getRecords(caseId: string = 'CASE-2024-0891'): CallDetailRecord[] {
    // Generar o combinar con registros personalizados
    return generateSyntheticRecords(caseId);
  },

  getTowers(): CellTower[] {
    return MOCK_TOWERS;
  }
};
