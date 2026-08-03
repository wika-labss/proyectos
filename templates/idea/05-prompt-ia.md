# Prompt IA

## Instrucciones para el agente

Genera la aplicación basada en la documentación del proyecto. El código debe generarse en `iterations/vN/`.

---

## Reglas de generación

1. Seguir arquitectura en `03-architecture.md`
2. Seguir dependencias en `06-build-environment.md` — **manifiesto completo obligatorio**
3. Implementar funcionalidades de `02-features.md` por prioridad
4. Respetar diseño de `04-design.md`
5. Código limpio, TypeScript strict, sin `any`

---

## Dependencias técnicas (obligatorio)

Antes de entregar código:

```bash
npx expo install --fix          # Si proyecto Expo
npx expo-doctor                 # 0 errores
```

### Checklist de package.json

- [ ] Todas las deps `expo-*` listadas en `06-build-environment.md`
- [ ] `expo-asset` incluido
- [ ] `expo-build-properties` incluido (si build nativo)
- [ ] Versiones con `~`, no `^`
- [ ] `app.json` incluye plugins de `06-build-environment.md`

---

## Gates de verificación (bloqueantes)

La iteración **no se considera completa** sin pasar:

| # | Gate | Comando |
|---|------|---------|
| 1 | Dependencias | `npx expo-doctor` → 0 errores |
| 2 | TypeScript | `npx tsc --noEmit` → exit 0 |
| 3 | Metro | `npx expo start` → arranca |
| 4 | Prebuild | `npx expo prebuild --platform android` → sin errores *(si BUILD)* |
| 5 | APK | `./gradlew assembleDebug` → BUILD SUCCESSFUL *(si BUILD)* |

---

## Restricciones adicionales

<!-- Restricciones específicas del proyecto -->

---

## Resultado esperado

```text
iterations/vN/
├── app/
├── src/
├── assets/
├── app.json
├── package.json
└── tsconfig.json
```

---

## Criterios de aceptación

### Funcionales

- [ ] <!-- criterio funcional -->

### Técnicos (WIKA — obligatorios)

- [ ] `npx expo-doctor` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] Dependencias alineadas con `06-build-environment.md`
- [ ] Perfil de build declarado cumplido (DEV / BUILD / RELEASE)

### Build nativo (si perfil BUILD)

- [ ] `expo-build-properties` configurado en app.json
- [ ] Kotlin 1.9.25 fijado
- [ ] APK debug compila sin errores

---

## Orden de implementación sugerido

1. Configuración (`package.json`, `app.json`, `tsconfig.json`) — según `06-build-environment.md`
2. Tipos y constantes
3. Lógica de negocio / stores
4. Componentes UI
5. Pantallas
6. **`npx expo install --fix` + `npx expo-doctor`**
7. Verificar gates de build
