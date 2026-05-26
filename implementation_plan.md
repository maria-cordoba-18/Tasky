# Plan de Implementación: Dashboard de Tareas Colaborativas (Offline-First)

Este plan describe la arquitectura y las decisiones técnicas para construir la aplicación móvil solicitada, cumpliendo con los estándares de un desarrollador Senior en React Native.

## Decisiones Técnicas

*   **Framework**: React Native CLI con TypeScript (tipado estricto). Elegimos React Native CLI para tener control total sobre la integración de código nativo (Java/Kotlin y Objective-C/Swift) de forma clásica, lo cual facilita la creación del `ViewManager` y el `Native Module` solicitados.
*   **Gestor de Estado**: Zustand. Seleccionado por su simplicidad, menor boilerplate comparado con Redux Toolkit y excelente integración con React.
*   **Base de Datos / Offline-First**: WatermelonDB. Es la mejor opción en el ecosistema React Native para aplicaciones offline-first debido a su diseño basado en SQLite, su paradigma reactivo (la UI se actualiza sola cuando la BD cambia) y sus capacidades de sincronización integradas.
*   **Navegación**: React Navigation. El estándar de facto en React Native.

## Arquitectura de Carpetas (Clean Architecture / Modular)

```text
src/
 ├── core/              # Configuración base, servicios, utilidades genéricas
 │   ├── api/           # Lógica de fetch a https://dummyjson.com
 │   ├── database/      # Esquema, modelos y configuración de WatermelonDB
 │   ├── sync/          # Lógica de sincronización inicial y pull-to-refresh
 │   └── store/         # Store global con Zustand
 ├── features/          # Módulos organizados por funcionalidad
 │   └── tasks/         # Feature de Tareas
 │       ├── components/# Componentes específicos de tareas (TaskList, TaskItem)
 │       ├── screens/   # Pantalla principal (Dashboard)
 │       └── tests/     # Pruebas unitarias
 ├── shared/            # Componentes reutilizables, UI genérica
 │   ├── components/    # AvatarView (Wrapper nativo), Botones, etc.
 │   └── native/        # Wrappers e interfaces para módulos nativos
 └── App.tsx            # Punto de entrada
```

## Propuesta de Implementación por Tareas

### Tarea 1: Arquitectura de Datos (Offline-First)
1.  **Esquema WatermelonDB**: Se definirá un modelo `Task` con campos `id`, `title`, `completed`, `userId`, `sync_status`.
2.  **Lectura Exclusiva**: Usaremos `@withObservables` de WatermelonDB. La UI **solo** se suscribirá a la tabla de tareas locales.
3.  **Sincronización Inicial**: Al abrir la app, la lógica de sincronización hará un fetch a `https://dummyjson.com/todos`, transformará los datos e insertará los registros faltantes en WatermelonDB.
4.  **Modificaciones Offline**: Al marcar una tarea, se actualiza localmente. Si hay conexión, se intenta hacer la petición PUT; si no, se deja pendiente en la cola local.
5.  **Pull-to-Refresh**: Se llamará de nuevo a la lógica de sincronización.

### Tarea 2: Interfaz de Usuario (UI)
*   **Dashboard**: Pantalla principal con una lista reactiva de WatermelonDB.
*   **Filtros**: El store de Zustand mantendrá el estado del filtro activo (`'ALL' | 'COMPLETED' | 'PENDING'`). El observable de la base de datos se actualizará según este estado.
*   **Feedback Visual**: Se usará LayoutAnimation o Reanimated para transiciones suaves al marcar/desmarcar tareas y colores claros de estado.

### Tarea 3: Requisito Senior (UI Nativa - `AvatarView`)
*   **Android (Kotlin)**:
    *   Crear `AvatarViewManager` heredando de `SimpleViewManager`.
    *   Exponer la prop `name` mediante `@ReactProp`.
    *   Lógica para calcular el hash del string para generar el `backgroundColor` y extraer las iniciales.
*   **iOS (Swift)**:
    *   Crear `AvatarViewManager.m` (export), `AvatarViewManager.swift` y `AvatarView.swift`.
    *   Implementar la lógica equivalente en iOS usando `UIView` circular.
*   **React Native**: Wrapper en `src/shared/components/AvatarView.tsx`.

### Tarea 4: Módulo Nativo de Cámara (`CameraModule`)
*   **Android (Kotlin)**: Crear `CameraModule` heredando de `ReactContextBaseJavaModule`. Usar `MediaStore.ACTION_IMAGE_CAPTURE`, manejar `ActivityEventListener` y Request Permissions.
*   **iOS (Swift)**: Usar `UIImagePickerController`, exponer métodos mediante `@objc`, manejar delegados e info.plist para permisos.

## Próximos Pasos (Pendiente de tu Aprobación)

1.  **¿Deseas que genere todos los archivos y el andamiaje completo del proyecto en tu directorio local usando los comandos de línea, o prefieres que provea todo el código, pruebas unitarias y el README dentro de artefactos/archivos para que tú los integres manualmente?**
2.  **¿Estás de acuerdo con el uso de React Native CLI y WatermelonDB para resolver la prueba?**

Espero tus comentarios para proceder con la ejecución técnica.
