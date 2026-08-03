# Arquitectura

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| Framework | |
| Lenguaje | TypeScript (strict mode) |
| Navegación | |
| Estado global | |
| Persistencia | |
| Estilos | |
| Testing | |
| Build | |

> Completar stack. Si es móvil Expo, ver dependencias en `06-build-environment.md`.

---

## Dependencias técnicas

> Referencia obligatoria: `06-build-environment.md`. El manifiesto de dependencias debe estar completo **antes** de generar código.

### Reglas WIKA de dependencias

1. Instalar con `npx expo install <paquete>` (proyectos Expo)
2. Usar prefijo `~` en versiones Expo/RN — **prohibido `^`**
3. Ejecutar `npx expo install --fix` al finalizar cada iteración
4. Validar con `npx expo-doctor` — 0 errores bloqueantes

### Manifiesto del proyecto

| Paquete | Versión | Capa | Obligatorio |
|---------|---------|------|-------------|
| | | | |

### Plugins nativos (app.json)

```json
{
  "expo": {
    "plugins": []
  }
}
```

---

## Perfil de build

| Perfil | Target esta iteración | Pipeline |
|--------|----------------------|----------|
| DEV (Expo Go) | [ ] | `npx expo start` |
| BUILD (APK/IPA local) | [ ] | `prebuild` + Gradle/Xcode |
| RELEASE (EAS) | [ ] | `eas build` |

---

## Estructura del proyecto

```text
bby app/
├── idea/
├── iterations/v1/
│   ├── app/              # Pantallas (Expo Router)
│   ├── src/
│   │   ├── components/
│   │   ├── stores/
│   │   ├── hooks/
│   │   ├── types/
│   │   └── utils/
│   ├── assets/
│   ├── app.json
│   ├── package.json
│   └── tsconfig.json
├── review.md
└── final/
```

---

## Componentes principales

<!-- Describir módulos y responsabilidades -->

---

## Flujo de datos

<!-- Describir flujos principales -->

---

## Decisiones técnicas

| Decisión | Elección | Justificación |
|----------|----------|---------------|
| | | |

---

## Toolchain nativo (si aplica)

Ver `06-build-environment.md` para:

- JDK 17, Kotlin 1.9.25, Android SDK 35
- Configuración `expo-build-properties`
- Gates de verificación de build
