import type { Template } from '../types'

export type ClassTemplate = Template

export const CLASS_TEMPLATES: Record<string, ClassTemplate> = {
  demo: {
    name: 'Class Diagram (Demo)',
    description: 'Inheritance example between User, Admin, and Customer.',
    nodes: [
      {
        id: 'class-user',
        type: 'classNode',
        position: { x: 250, y: 50 },
        data: {
          name: 'User',
          properties: ['id', 'username', 'email'],
          methods: ['login', 'logout']
        }
      },
      {
        id: 'class-admin',
        type: 'classNode',
        position: { x: 80, y: 250 },
        data: {
          name: 'Admin',
          inherits: 'User',
          properties: ['permissions'],
          methods: ['deleteUser', 'banUser']
        }
      },
      {
        id: 'class-customer',
        type: 'classNode',
        position: { x: 420, y: 250 },
        data: {
          name: 'Customer',
          inherits: 'User',
          properties: ['cartId', 'balance'],
          methods: ['checkout', 'addToCart']
        }
      }
    ],
    edges: [
      {
        id: 'edge-inherits-admin',
        source: 'class-admin',
        target: 'class-user',
        type: 'smoothstep',
        label: 'INHERITS',
        style: { stroke: 'var(--accent)', strokeWidth: 2 },
        labelStyle: { fill: 'var(--accent)', fontWeight: 'bold' }
      },
      {
        id: 'edge-inherits-customer',
        source: 'class-customer',
        target: 'class-user',
        type: 'smoothstep',
        label: 'INHERITS',
        style: { stroke: 'var(--accent)', strokeWidth: 2 },
        labelStyle: { fill: 'var(--accent)', fontWeight: 'bold' }
      }
    ]
  }
}
