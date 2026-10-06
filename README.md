# UNIQUE By VL — site web

Site statique multilingue (anglais, français, tchèque) avec un espace d'administration.

- **Le site** : Astro, compilé en pages HTML statiques, hébergé gratuitement sur Cloudflare Pages.
- **L'admin** : Sveltia CMS, à l'adresse `/admin/`. VL s'y connecte avec son compte GitHub, modifie, publie.
- **Le contenu** : des fichiers JSON dans `content/`, chacun contenant les trois langues. Les photos vont dans `public/uploads/`.
- **Chaque publication** depuis l'admin enregistre les fichiers dans ce dépôt ; Cloudflare reconstruit le site en une à deux minutes.

---

## Mise en route — une seule fois

### 1. Déposer le projet sur GitHub

Le dépôt `uniquebyvl` doit exister, **privé et vide**.

**Avec git (recommandé)** — dans un terminal, depuis le dossier qui contient ce README :

```bash
git init
git add .
git commit -m "Site UNIQUE By VL"
git branch -M main
git remote add origin https://github.com/COMPTE-GITHUB/uniquebyvl.git
git push -u origin main
```

**Sans terminal** — sur la page du dépôt, *uploading an existing file*. GitHub limite à 100 fichiers par envoi, il faut donc deux envois :
1. glisser le dossier `content`, puis *Commit changes* ;
2. *Add file → Upload files*, glisser tout le reste (`src`, `public`, `package.json`, `package-lock.json`, `astro.config.mjs`, `README.md`), puis *Commit changes*.

### 2. Brancher Cloudflare Pages

Cloudflare → **Workers & Pages** → **Create** → onglet **Pages** → **Connect to Git** → autoriser GitHub → choisir `uniquebyvl`.

| Réglage | Valeur |
|---|---|
| Production branch | `main` |
| Framework preset | `Astro` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Variable d'environnement | `NODE_VERSION` = `22.12.0` |

**Save and Deploy.** Deux minutes plus tard, le site est en ligne sur `https://uniquebyvl.pages.dev` (ou un nom proche, affiché par Cloudflare).

> Si l'adresse attribuée n'est pas exactement `uniquebyvl.pages.dev`, la reporter dans `astro.config.mjs` (`site:`), `public/admin/config.yml` (`site_url`, `display_url`) et `public/robots.txt`.

### 3. Fermer le site pendant le remplissage

Par défaut, la protection Cloudflare ne couvre que les aperçus, pas l'adresse principale. Il faut donc l'étendre :

1. Cloudflare → **Workers & Pages** → le projet → **Settings** → **Enable access policy**. Si Cloudflare demande de choisir une offre Zero Trust, prendre **Free**.
2. Cliquer **Manage** sur la règle créée → dans **Access → Applications**, ouvrir l'application du projet → **Configure**.
3. Dans **Public hostname**, **effacer l'astérisque `*`** du champ *Subdomain*, puis enregistrer. (Si une erreur apparaît, changer légèrement l'*Application name*.)
4. Dans la règle (*Policy*), autoriser les e-mails de VL et le vôtre.

Désormais, tout visiteur de `uniquebyvl.pages.dev` doit recevoir un code par e-mail avant d'entrer. Seules les adresses autorisées en reçoivent un.

### 4. Déployer l'authentificateur de l'admin

L'admin a besoin d'un petit service pour la connexion GitHub.

1. Ouvrir <https://github.com/sveltia/sveltia-cms-auth> et cliquer **Deploy to Cloudflare Workers**. Noter l'adresse obtenue, du type `https://sveltia-cms-auth.XXXX.workers.dev`.
2. Sur GitHub (compte de VL) : **Settings → Developer settings → OAuth Apps → New OAuth App**
   - Application name : `UNIQUE By VL admin`
   - Homepage URL : `https://uniquebyvl.pages.dev`
   - Authorization callback URL : `https://sveltia-cms-auth.XXXX.workers.dev/callback`
   - **Register**, puis **Generate a new client secret**. Noter le *Client ID* et le *Client secret*.
3. Cloudflare → le Worker `sveltia-cms-auth` → **Settings → Variables and Secrets** :
   - `GITHUB_CLIENT_ID` = le Client ID
   - `GITHUB_CLIENT_SECRET` = le Client secret, **type Secret**
   - `ALLOWED_DOMAINS` = `uniquebyvl.pages.dev` (ajouter le vrai domaine au lancement, séparé par une virgule)

### 5. Renseigner deux lignes dans la configuration de l'admin

Dans `public/admin/config.yml` :

```yaml
repo: COMPTE-GITHUB/uniquebyvl
base_url: https://sveltia-cms-auth.XXXX.workers.dev
```

Enregistrer (directement sur GitHub avec l'icône crayon, ou via git). Cloudflare republie le site.

### 6. Tester l'admin

Ouvrir `https://uniquebyvl.pages.dev/admin/` → **Sign in with GitHub** → autoriser. Les rubriques apparaissent. Modifier une virgule dans une pièce, publier, attendre deux minutes, recharger le site.

### 7. Brancher les formulaires

1. Créer un compte sur un service de formulaires compatible (par exemple Formspree) **avec l'e-mail de VL**, créer un formulaire, copier son adresse (`https://formspree.io/f/xxxxxxx`).
2. Admin → **Site settings** → **Form address** → coller → **Publish**.
3. Envoyer un message test depuis la page Contact et vérifier qu'il arrive.

Tant que ce champ est vide, les formulaires affichent « Le formulaire n'est pas encore branché » au lieu d'envoyer.

---

## Jour du lancement

1. Admin → **Site settings** : vérifier e-mail, téléphone, **IČO**, adresse. Cocher **Let Google index the site**.
2. Remplacer ou supprimer **tout le contenu d'exemple** : prix, histoires des pièces, événements, cours, points de vente, `IČO [TO FILL]` dans les pages légales.
3. Faire relire les pages légales (surtout en tchèque) par un juriste.
4. Cloudflare → projet → **Custom domains** → ajouter `uniquebyvl.com` (ou `.cz`). HTTPS est automatique.
5. Reporter le domaine dans `astro.config.mjs`, `public/admin/config.yml`, `public/robots.txt`, et dans `ALLOWED_DOMAINS` du Worker.
6. Retirer la restriction d'accès Cloudflare.
7. Tester : une commande complète, une réservation de cours, un paiement réel de quelques couronnes puis remboursé.
8. Déclarer le site dans Google Search Console (`/sitemap.xml`), créer la fiche Google Business de l'atelier.

---

## Où est quoi

| Dossier / fichier | Contenu |
|---|---|
| `content/pieces/` | les pièces de la collection |
| `content/categories/`, `content/subcategories/` | filtres de la collection |
| `content/seasons/` | collections passées |
| `content/events/` | « Upcoming » de la page d'accueil (disparaissent après leur date) |
| `content/classes/` | dates de cours (disparaissent après leur date) |
| `content/workshops/` | workshops passés |
| `content/formats/` | types de workshop (menu du formulaire) |
| `content/custom/` | tableau des prix sur-mesure (et menu du formulaire) |
| `content/stockists/` | points de vente |
| `content/legal/` | conditions, livraison, retours, confidentialité |
| `content/pages/` | textes des pages |
| `content/settings/site.json` | e-mail, réseaux, logo, police, formulaire, indexation |
| `src/i18n/ui.json` | petits libellés d'interface (boutons, champs) dans les trois langues |
| `public/uploads/` | photos |
| `public/admin/config.yml` | définition de l'admin |

## Travailler en local (facultatif)

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # vérifie que tout compile
```
