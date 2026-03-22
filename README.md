# Maison Moda — vitrine e-commerce (démo)

Site e-commerce moderne pour une marque mode féminine au Maroc : **Next.js 15**, **React 19**, **Tailwind CSS**, **next-intl** (français / arabe avec RTL), panier persistant (`localStorage`), filtres boutique, animations **Framer Motion**.

## Prérequis

- [Node.js](https://nodejs.org/) 18.18 ou plus récent (recommandé : LTS)

## Installation et lancement

```bash
cd SHOPENLIGNE
npm install
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) : vous serez redirigé vers la locale par défaut (`/fr`).

- Français : [http://localhost:3000/fr](http://localhost:3000/fr)
- Arabe (RTL) : [http://localhost:3000/ar](http://localhost:3000/ar)

## Scripts

| Commande      | Description                |
| ------------- | -------------------------- |
| `npm run dev` | Serveur de développement   |
| `npm run build` | Build de production      |
| `npm run start` | Lance le build en local  |
| `npm run lint`  | ESLint                   |

## Structure utile

- `src/app/[locale]/` — pages (accueil, boutique, fiche produit, panier, checkout, contact)
- `src/components/` — UI réutilisable (header, cartes produit, filtres, formulaires)
- `src/context/cart-context.tsx` — état du panier
- `src/data/products.ts` — catalogue démo (images Unsplash)
- `messages/fr.json` et `messages/ar.json` — traductions

## Notes

- Paiement et envoi des formulaires sont **simulés** (pas de backend ni de passerelle réelle).
- Les images sont chargées depuis **Unsplash** (connexion Internet requise pour les visuels).
