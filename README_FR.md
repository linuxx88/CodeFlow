# Code Flow — Visualiseur de Dépendances et Générateur de Flowcharts

Code Flow est une application web interactive moderne permettant d'analyser, de scanner et de visualiser l'architecture de votre projet (JavaScript, TypeScript, Python) sous forme de graphes interactifs et de diagrammes UML/Flowcharts.

## 🚀 Fonctionnalités Clés

- **🔍 Analyse Globale de Projet** : Scan asynchrone des fichiers en local, résolvant automatiquement les imports et dépendances pour les langages supportés.
- **📡 Flux en Temps Réel (SSE)** : Le processus de scan communique sa progression en direct au client via un protocole Server-Sent Events (SSE) optimisé.
- **🕸️ Graphe de Dépendances Interactif (React Flow)** :
  - Visualisation des liaisons entre fichiers locaux et packages externes.
  - Détection automatique et mise en évidence des **goulots d'étranglement** (fichiers fortement importés).
  - Identification mathématique des **dépendances circulaires (cycles)** via l'algorithme de Tarjan (composants fortement connexes).
  - Contrôle total du positionnement (dispositions horizontale/verticale via Dagre, espacements paramétrables).
- **📂 Explorateur de Structure** : Navigation hiérarchique dans l'arborescence des dossiers avec tailles de fichiers et possibilité de plier/déplier les répertoires.
- **📊 Diagramme de Classes UML** : Extraction automatique et affichage des classes, de l'héritage, des propriétés et des méthodes avec calcul de dimensions dynamiques.
- **🔄 Flowcharts d'Algorithmes & Structures** : Représentation visuelle des structures de contrôle (`if-then`, `while-loop`, `repeat-loop`, `try-except` Python) détectées dans le code source.
- **🔥 Friction Git & Hotspots** : Analyse de l'historique Git du projet pour identifier les fichiers subissant le plus de modifications ou écrits par le plus d'auteurs différents.
- **🎨 Design System Premium** : Support complet de 5 thèmes visuels (Sombre, Clair, Cyberpunk, Nord, Matrix) basés sur des variables CSS modernes et l'opacité dynamique `color-mix()`.

## 🛠️ Stack Technique

- **Core** : React 19, TypeScript, Vite
- **Visualisation** : [@xyflow/react](https://reactflow.dev/) (React Flow), [@dagrejs/dagre](https://github.com/dagrejs/dagre) (moteur de layout automatique)
- **Icônes** : Lucide React
- **Styles** : CSS natif haut de gamme (thèmes personnalisables, animations néon, glassmorphism)
- **Backend de Scan** : Middleware serveur de développement Vite avec streaming et mise en cache disque.

## 📦 Installation et Lancement

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure recommandée)

### Étapes d'installation
1. Clonez ce dépôt.
2. Installez les dépendances du projet :
   ```bash
   npm install
   ```

### Lancement en développement
Démarrez le serveur de développement local :
```bash
npm run dev
```
Ouvrez votre navigateur à l'adresse indiquée (généralement `http://localhost:5173`). Saisissez ensuite le chemin absolu du projet local que vous souhaitez analyser dans la barre supérieure.

### Build pour la production
Pour générer les fichiers de production optimisés dans le dossier `dist` :
```bash
npm run build
```

## 📐 Architecture & Fonctionnement

### 1. Analyseur et Résolution de Portée
Le scanner local est configuré sous forme de plugin/middleware Vite (`vite/plugins/scan-api.ts`). Durant la phase de scan, il extrait les structures de contrôle et les imports. Pour le langage Python, un système d'analyse d'indentation stricte (`baseIndent`) est implémenté afin d'associer correctement les blocs enfants sans chevauchement.

### 2. Moteur de Disposition (Layout)
L'application intègre le moteur de graphes `Dagre` pour calculer les coordonnées spatiales de chaque nœud sur le canevas React Flow. Les dimensions des nœuds de type "condition" et des diagrammes de classes UML sont calculées dynamiquement selon le nombre de propriétés et de méthodes pour éviter toute superposition visuelle lors du basculement d'orientation.

## Remerciements

Un merci tout particulier à :
- **[React Flow](https://reactflow.dev/)** pour la visualisation interactive du graphe.
- **[Dagre](https://github.com/dagrejs/dagre)** pour la disposition automatique du graphe.
- **[Lucide React](https://lucide.dev/)** pour les icônes premium.
- **[Vite](https://vitejs.dev/)** pour l'environnement de développement ultra-rapide et le middleware.
- **[Antigravity de Google DeepMind](https://github.com/google-deepmind)** pour l'assistance au développement et à la traduction de ce projet.

