# Documentos de postitulos

Los endpoints de postitulos devuelven texto identificatorio y URL por separado.
Las URLs existentes mantienen sus nombres para conservar compatibilidad.

| Texto del enlace | Campo de URL | Texto alternativo si falta identificador |
| --- | --- | --- |
| `resolucionNumero` | `resolucion` | Ver resolución |
| `resolucionPuntajeNumero` | `resolucionPuntaje` | Ver resolución de puntaje |
| `Dictamen N.º ${dictamenNumero}` | `dictamen` | Ver dictamen |
| Ver programa | `programa` | Ver programa |
| Ver plan de estudios | `planEstudios` | Ver plan de estudios |

Los mismos campos pueden enviarse en POST/PATCH de postitulos. Los campos
`*Numero` son strings (preservan ceros, guiones y barras), no puntajes numericos.
Enviar `null` para borrar un dato; omitirlo en PATCH para conservarlo.
Programa y plan de estudios son documentos distintos. EA tiene programa;
EI tiene programa y plan de estudios proporcionados por separado.

## Renderizado sugerido en el frontend (React)

```tsx
function Documento({ numero, url, alternativa }: {
  numero?: string | null
  url?: string | null
  alternativa: string
}) {
  const texto = numero || alternativa
  // Evitar protocolos ejecutables, incluso para URLs historicas.
  const enlaceValido = (() => {
    try {
      return !!url && ['http:', 'https:'].includes(new URL(url).protocol)
    } catch {
      return false
    }
  })()
  if (!enlaceValido) return <span>{numero || 'No disponible'}</span>
  return (
    <a href={url!} target="_blank" rel="noopener noreferrer"
       aria-label={`${texto} (abre en una pestaña nueva)`}>
      {texto} ↗
    </a>
  )
}

// Ejemplo:
<Documento numero={postitulo.resolucionNumero}
  url={postitulo.resolucion} alternativa="Ver resolución" />
<Documento url={postitulo.programa} alternativa="Ver programa" />
```

Esta carpeta contiene solo el backend. Este ejemplo debe integrarse en el
frontend para que el texto y la apertura en otra pestaña se reflejen en pantalla.
