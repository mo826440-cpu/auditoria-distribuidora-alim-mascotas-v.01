# Generar prompts para análisis FODA (ChatGPT u otra IA)

La auditoría incluye **dos botones** que generan un **prompt ideal** con los datos cargados para que puedas pegarlo en ChatGPT u otra IA y obtener un análisis FODA con recomendaciones. Luego **pegás la respuesta** en el campo de análisis correspondiente en la misma pantalla.

---

## Cómo funciona

1. **Completá los datos** de la sección correspondiente:
   - Para el **FODA de la encuesta**: todos los ítems de la **Encuesta de satisfacción del cliente** (y opcionalmente las preguntas clave).
   - Para el **análisis final**: todos los ítems de la **Evaluación del cliente**.

2. **Generar el prompt**
   - **"Generar prompt para FODA (encuesta)"**: se habilita cuando la encuesta está completa. Al hacer clic, se arma un texto con los datos de la auditoría + encuesta + preguntas clave y una instrucción para que la IA genere un FODA y recomendaciones.
   - **"Generar prompt para análisis final"**: se habilita cuando la evaluación está completa. Genera un prompt con los datos de la auditoría + evaluación y la instrucción para el análisis final FODA.

3. **Copiá el prompt**
   - Se abre un modal con el texto. Usá **"Copiar al portapapeles"** o seleccioná todo y copiá manualmente.

4. **Pegalo en ChatGPT (u otra IA)**
   - Abrí [chat.openai.com](https://chat.openai.com) u otra herramienta, pegá el prompt y enviá. La IA te devolverá un análisis FODA con recomendaciones.

5. **Registrá el resultado en la auditoría**
   - Copiá la respuesta de la IA y pegala en el campo correspondiente:
     - Si usaste el prompt de **encuesta** → campo **"Análisis FODA (encuesta de satisfacción)"**.
     - Si usaste el prompt de **evaluación** → campo **"Análisis final"**.

6. **Guardá la auditoría** cuando corresponda.

---

## Ventajas de este flujo

- No hace falta configurar API keys en el proyecto.
- Podés usar ChatGPT, Claude, u otra IA que prefieras.
- Revisás y editás el texto antes de guardarlo en la auditoría.
- Los prompts incluyen todos los datos necesarios para un análisis coherente con la auditoría.

---

## ¿Querés usar la API de OpenAI desde la app?

Si en el futuro querés que la app llame a la IA desde el servidor y cargue el análisis automáticamente, podés configurar `OPENAI_API_KEY` en `.env.local` y usar el endpoint `/api/auditorias/analizar-ia` (o reincorporar el botón que lo llamaba). La documentación para obtener la API key en OpenAI Platform sigue siendo útil para ese caso.
