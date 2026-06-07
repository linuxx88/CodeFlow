# Code Flow — Dependency Visualizer and Flowchart Generator

Code Flow is a modern, interactive web application to analyze, scan, and visualize your project's architecture (JavaScript, TypeScript, Python) as interactive graphs and UML diagrams/flowcharts.

## 🚀 Key Features

- **🔍 Global Project Analysis**: Asynchronous scanning of local files, automatically resolving imports and dependencies for supported languages.
- **📡 Real-Time Streaming (SSE)**: The scanning process communicates its live progress to the client via an optimized Server-Sent Events (SSE) protocol.
- **🕸️ Interactive Dependency Graph (React Flow)**:
  - Visualization of links between local files and external packages.
  - Automatic detection and highlighting of **bottlenecks** (highly imported files).
  - Mathematical identification of **circular dependencies (cycles)** using Tarjan's algorithm (strongly connected components).
  - Full control over positioning (horizontal/vertical layouts via Dagre, adjustable spacing).
- **📂 Structure Explorer**: Hierarchical directory tree navigation with file sizes and folder expanding/collapsing.
- **📊 UML Class Diagram**: Automatic extraction and rendering of classes, inheritance, properties, and methods with dynamic dimension calculation.
- **🔄 Algorithm & Structure Flowcharts**: Visual representation of control structures (`if-then`, `while-loop`, `repeat-loop`, `try-except` in Python) detected in the source code.
- **🔥 Git Friction & Hotspots**: Analysis of the project's Git history to identify files with the most modifications or written by the most unique authors.
- **🎨 Premium Design System**: Full support for 5 visual themes (Dark, Light, Cyberpunk, Nord, Matrix) powered by modern CSS variables and `color-mix()` dynamic opacity.

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript, Vite
- **Visualization**: [@xyflow/react](https://reactflow.dev/) (React Flow), [@dagrejs/dagre](https://github.com/dagrejs/dagre) (automatic layout engine)
- **Icons**: Lucide React
- **Styles**: Premium native CSS (customizable themes, neon animations, glassmorphism)
- **Scanning Backend**: Vite development server middleware with streaming and disk caching.

## 📦 Installation and Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)

### Installation Steps
1. Clone this repository.
2. Install project dependencies:
   ```bash
   npm install
   ```

### Running in Development
Start the local development server:
```bash
npm run dev
```
Open your browser at the address shown (usually `http://localhost:5173`). Then, enter the absolute path of the local project you want to analyze in the top bar.

### Production Build
To generate optimized production files in the `dist` folder:
```bash
npm run build
```

## 📐 Architecture & Inner Workings

### 1. Analyzer and Scope Resolution
The local scanner is configured as a Vite plugin/middleware (`vite/plugins/scan-api.ts`). During the scanning phase, it extracts control structures and imports. For Python, a strict indentation parsing system (`baseIndent`) is implemented to correctly map child blocks without overlaps.

### 2. Layout Engine
The application integrates the `Dagre` graph engine to compute spatial coordinates for each node on the React Flow canvas. The sizes of "condition" nodes and UML class diagrams are dynamically calculated based on the number of properties and methods to prevent visual overlaps when switching layouts.
