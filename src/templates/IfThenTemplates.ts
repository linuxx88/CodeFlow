import type { Node, Edge } from '@xyflow/react'
import { Position } from '@xyflow/react'

export interface Template {
  name: string
  description: string
  nodes: Node[]
  edges: Edge[]
}

export const TEMPLATES: Record<string, Template> = {
  auth: {
    name: 'Authentification Utilisateur',
    description: 'Flux de vérification de session et droits administrateurs.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Accès à l\'application', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'check-login',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'Utilisateur connecté ?', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'show-login',
        type: 'customNode',
        position: { x: 480, y: 240 },
        data: { label: 'Afficher formulaire de connexion', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'check-admin',
        type: 'customNode',
        position: { x: 50, y: 240 },
        data: { label: 'Rôle = Administrateur ?', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'admin-panel',
        type: 'customNode',
        position: { x: -60, y: 380 },
        data: { label: 'Ouvrir Panneau d\'Administration', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'dashboard',
        type: 'customNode',
        position: { x: 160, y: 380 },
        data: { label: 'Ouvrir Tableau de bord standard', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-1',
        source: 'start',
        target: 'check-login',
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-2',
        source: 'check-login',
        target: 'check-admin',
        label: 'OUI',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-3',
        source: 'check-login',
        target: 'show-login',
        label: 'NON',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      },
      {
        id: 'e-4',
        source: 'check-admin',
        target: 'admin-panel',
        label: 'OUI',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-5',
        source: 'check-admin',
        target: 'dashboard',
        label: 'NON',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      }
    ]
  },
  payment: {
    name: 'Paiement Panier',
    description: 'Processus d\'achat et vérification de solde / stock.',
    nodes: [
      {
        id: 'start',
        type: 'customNode',
        position: { x: 250, y: 20 },
        data: { label: 'Validation du Panier', type: 'start' },
        sourcePosition: Position.Bottom
      },
      {
        id: 'check-stock',
        type: 'customNode',
        position: { x: 250, y: 120 },
        data: { label: 'Articles en stock ?', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'err-stock',
        type: 'customNode',
        position: { x: 480, y: 240 },
        data: { label: 'Afficher erreur "Rupture de Stock"', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'check-funds',
        type: 'customNode',
        position: { x: 50, y: 240 },
        data: { label: 'Solde suffisant ?', type: 'condition' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'pay-ok',
        type: 'customNode',
        position: { x: -60, y: 380 },
        data: { label: 'Valider commande & Envoyer email', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      },
      {
        id: 'pay-fail',
        type: 'customNode',
        position: { x: 160, y: 380 },
        data: { label: 'Afficher erreur "Solde insuffisant"', type: 'action' },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top
      }
    ],
    edges: [
      {
        id: 'e-1',
        source: 'start',
        target: 'check-stock',
        type: 'smoothstep',
        animated: true,
        style: { stroke: 'var(--accent)' }
      },
      {
        id: 'e-2',
        source: 'check-stock',
        target: 'check-funds',
        label: 'OUI',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-3',
        source: 'check-stock',
        target: 'err-stock',
        label: 'NON',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      },
      {
        id: 'e-4',
        source: 'check-funds',
        target: 'pay-ok',
        label: 'OUI',
        type: 'smoothstep',
        style: { stroke: '#10b981', strokeWidth: 2 },
        labelStyle: { fill: '#10b981', fontWeight: 'bold' }
      },
      {
        id: 'e-5',
        source: 'check-funds',
        target: 'pay-fail',
        label: 'NON',
        type: 'smoothstep',
        style: { stroke: '#f43f5e', strokeWidth: 2 },
        labelStyle: { fill: '#f43f5e', fontWeight: 'bold' }
      }
    ]
  }
}
