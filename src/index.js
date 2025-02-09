import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import BPSketch from './BPSketch';

// Get the root element from the DOM
const rootElement = document.getElementById('root');

// Create the React root and render the component
const root = createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BPSketch />
  </React.StrictMode>
);
