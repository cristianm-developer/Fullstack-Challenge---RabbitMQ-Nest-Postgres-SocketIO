apps/web/src/
├── api/                             # 🌐 Configuración general de la API
│   ├── apiClient.ts                 # Instancia de Fetch/Axios (si se usa fuera de Auth Kit)
│   └── socket.ts                    # Cliente de Socket.io
├── domains/                         # 🧩 Lógica de Negocio por Dominio (DDD)
│   ├── auth/                        # 🔑 Dominio de Autenticación
│   │   ├── api/                     # Servicios HTTP directos (Login/Register)
│   │   │   ├── auth.service.ts      # Funciones puras que devuelven Promesas
│   │   ├── components/
│   │   │   ├── AuthProvider.tsx     # Wrapper para React Auth Kit
│   │   │   ├── LoginForm.tsx        # Componente de inicio de sesión (RHF/Zod)
│   │   │   └── RegisterForm.tsx     # Componente de registro (RHF/Zod)
│   │   ├── hooks/
│   │   │   └── useAuthUser.ts       # Hook para acceder al estado de Zustand/Auth Kit
│   │   └── store/
│   │       └── auth.store.ts        # Almacén de Zustand (perfil, loading, isLogged)
│   ├── tasks/                       # 📋 Dominio de Gestión de Tareas
│   │   ├── api/                     # Servicios para TanStack Query
│   │   │   ├── tasks.api.ts         # queryFn: getTasks, getTaskById
│   │   │   └── comments.api.ts      # mutationFn: createComment, getComments
│   │   ├── components/
│   │   │   ├── TaskCard.tsx
│   │   │   ├── TaskDetail.tsx       # Muestra detalle, comentarios y formulario de edición
│   │   │   ├── TaskList.tsx         # Muestra la tabla de tareas y filtros
│   │   │   └── TaskForm.tsx         # Formulario RHF/Zod para Crear/Editar Tarea
│   │   └── hooks/
│   │       ├── useTasksQuery.ts     # Wrapper de useQuery/useMutation para Tareas
│   │       └── useCommentsQuery.ts  # Wrapper de useQuery para Comentarios
├── routes/                          # 🗺️ Definición de Rutas (TanStack Router)
│   ├── __root.tsx                   # Layout principal (Auth Provider, QueryClient, Header/Footer)
│   ├── index.tsx                    # / (Página de inicio/redirigir a /tasks)
│   ├── tasks/
│   │   ├── $taskId.tsx              # /tasks/:taskId (Detalle de la tarea)
│   │   └── index.tsx                # /tasks (Lista de tareas)
│   └── auth/
│       └── login.tsx                # /auth/login (Página/Modal de Login)
├── components/                      # 🧱 Componentes Compartidos y UI
│   ├── ui/                          # Componentes de shadcn/ui (generados por la CLI)
│   │   ├── button.tsx
│   │   └── table.tsx
│   ├── Layout.tsx                   # Diseño del router root (__root)
│   └── Notificator.tsx              # Componente que usa useSocket para mostrar Toast
├── config/                          # ⚙️ Configuraciones Globales
│   ├── queryClient.ts               # Instancia y defaults del QueryClient
│   └── authKitRefresh.ts            # Lógica de createRefresh de React Auth Kit
├── lib/                             # 🛠️ Utilidades y Esquemas
│   ├── schemas/                     # Esquemas de validación de Zod
│   │   ├── taskSchema.ts
│   │   └── authSchema.ts
│   └── utils.ts                     # Funciones de utilidad (ej. 'clx' de shadcn/ui)
└── main.tsx                         # Punto de entrada (ReactDOM.createRoot, envolver con Providers)