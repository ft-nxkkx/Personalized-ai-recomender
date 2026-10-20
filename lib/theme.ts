/** Runs before first paint (see app/layout.tsx) so the page never flashes the wrong theme. */
export const THEME_BOOT_SCRIPT = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('pairwise.theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}d.dataset.theme=t;d.dataset.accent=localStorage.getItem('pairwise.accent')||'grape'}catch(e){}})()`;
