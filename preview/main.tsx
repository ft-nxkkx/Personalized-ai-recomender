// Standalone preview entry: renders the same app without Next so it can ship as one HTML file.
import '@fontsource-variable/archivo/wdth.css';
import '@fontsource/gochi-hand';
import '@fontsource/instrument-serif/latin-400-italic.css';
import { createRoot } from 'react-dom/client';
import { PairwiseApp } from '@/components/PairwiseApp';

createRoot(document.getElementById('root')!).render(<PairwiseApp />);
