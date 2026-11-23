import { useEffect } from 'react';

/** Sets the browser tab title per page (good for SEO, history and screen readers). */
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | IndSupply` : 'IndSupply | Industrial Supplies, Simplified';
  }, [title]);
}
