# Frontend Explanation

## Application Flow

1. **/etc/nginx/sites-available/KIDS25-Team7** - Nginx is a web server, which uses this file to serve the front end:
```
server {
    # port 80 used by rstudio
    listen 8080;
    server_name _;
    root /var/www/KIDS25-Team7/frontend/dist;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```
Requests on port 8080 are directed to the listed path (`/var/www...`), and then index.html is served. The Nginx service is run through `systemctl`; use commands like start, stop, restart, and status to manage it (_e.g.,_ `sudo systemctl restart nginx`). Any changes to this file require the service to be restarted.

2. **index.html** - Nginx serves this file to the browser, which contains two critical elements: 
   - `<div id="root"></div>` is a placeholder, used to inject the entire application.
   - `<script type="module" src="/src/main.tsx"></script>` runs the `main.tsx` script, which is our primary entry point into the React app .
3. **main.tsx** - JavaScript entry point that:
   - Mounts the React app to the root div
   - Wraps the entire app with essential providers:
     - `StrictMode` forcing re-renders during development to catch bugs
     - `BrowserRouter` for client-side routing
     - `QueryClientProvider` for API state management
   - Imports Bootstrap CSS for styling
   - Imports and renders `Router`
4. **router.tsx** - Final point of the core architecture. Currently just calls the `Home` component, but eventually can be used to direct different URLs to different pages/components, _e.g._,
```  
<Routes>
    <Route path="/" element={<Home />} />
    <Route path="/compounds/:id" element={<CompoundDetail />} />
</Routes>
  ```

## API Architecture

This frontend uses two libraries, Axios and Tanstack Query, for managing API requests to other servers.

- **api.service.ts**: Boilerplate HTTP wrapper around Axios
  - Axios handles the actual low level network communication
  - Configures base URL and headers
  - Provides typed methods for GET, POST, PUT, DELETE
  - All API calls go through this single service, ultimately called with _e.g._, `ApiService.get('/compounds')`. 
  - This file should not need editing or maintenance

- **useApi.ts**: Custom hooks for each API call using Tanstack Query
  - Tanstack Query handles promises/async calls, loading states, caching, and state management 
  - All desired API calls will get their own hook using Tanstack's `useQuery`, or `useMutation` if we're creating/changing something on the server
  - Example: `useGetCompounds()` fetches compound data with built-in state management

## File Organization

```
frontend/
├── src/
│   ├── api/                # API layer
│   │   ├── api.service.ts  # Axios wrapper
│   │   └── useApi.ts       # React Query hooks
|   ├── components          # Core or components reused in multiple pages
|   ├── css                 # CSS files for app
│   ├── pages/              # Page components
│   │   └── Home.tsx        # Home page
│   ├── types/              # TypeScript definitions
│   │   └── types.ts        # Shared interfaces
│   ├── router.tsx          # Route definitions
│   └── main.tsx            # App entry & providers
├── public/
│   ├── db.json             # Mock API data
│   └── routes.json         # JSON Server routing rules
└── index.html              # HTML entry point
```

## Development Workflow

0. **Initial installation**:
```
git clone https://github.com/stjude-biohackathon/KIDS25-Team7.git
cd KIDS25-Team7/frontend
npm install
```
1. **Start development**: `npm run start` launches both Vite and JSON Server; `npm run dev` starts just Vite, and `npm run mock-server` runs just JSON Server.
2. **API calls flow**:
   - Component calls `useGetCompounds()`
   - Hook calls `ApiService.get('/compounds')`
   - Axios makes HTTP request to `/api/compounds`
   - Vite proxy forwards to `http://localhost:3000/compounds`
   - JSON Server returns data from `db.json`
   - Data flows back through the chain with automatic state management

## Adding New Features

### To add a new API endpoint:
1. Add mock data to `public/db.json`
2. Define TypeScript interface in `types/types.ts` for the expected returned data
3. Create Tanstack Query hook in `useApi.ts`
4. Use the hook in your component

### To add a new page:
1. Create component in `pages/` directory
2. Add route in `router.tsx`
3. Use existing hooks or create new ones for data