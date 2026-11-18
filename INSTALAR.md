# Entreno: cómo instalarla en tu iPhone

Entreno es una **web app (PWA)**. Se instala desde Safari, sin App Store ni Xcode, no caduca y funciona sin conexión. Tus datos (entrenos, comidas, peso) **se guardan solo en tu iPhone**.

**Tu app ya está publicada en:** <https://brunomendezlopez10-coder.github.io/entreno/>
(repositorio: <https://github.com/brunomendezlopez10-coder/entreno>). Puedes saltar directamente al paso 2.

---

## 1. Publicar la app en GitHub Pages (ya hecho; por si algún día hay que repetirlo)

1. Crea una cuenta gratuita en <https://github.com/signup> (si ya tienes una, inicia sesión).
2. Pulsa **+ → New repository**.
   - Nombre: `entreno`
   - Elige **Public** (GitHub Pages gratis necesita un repositorio público; tu código será visible, pero **tus datos no**, porque nunca salen del iPhone).
   - Pulsa **Create repository**.
3. En la página del repositorio pulsa **uploading an existing file**.
4. Abre la carpeta **Aplicaciones → Entreno** en Finder y **arrastra** al navegador estos archivos y la carpeta `icons`:
   `index.html`, `app.js`, `plan.js`, `foods.js`, `study.js`, `anim.js`, `style.css`, `sw.js`, `manifest.webmanifest`, carpeta `icons`
   (no hace falta subir `INSTALAR.md`, `tools` ni `.claude`).
5. Pulsa **Commit changes**.
6. Ve a **Settings → Pages**. En *Build and deployment* elige:
   - Source: **Deploy from a branch**
   - Branch: **main** y carpeta **/ (root)** → **Save**.
7. Espera 1–2 minutos y recarga esa página. Aparecerá tu dirección, del tipo:
   `https://TU-USUARIO.github.io/entreno/`

## 2. Instalarla en el iPhone 15 Pro

1. Abre esa dirección en **Safari** (tiene que ser Safari).
2. Pulsa el botón **Compartir** (el cuadrado con la flecha hacia arriba).
3. Baja y pulsa **Añadir a pantalla de inicio**. Activa **Abrir como app web** si aparece, y pulsa **Añadir**.
4. Abre **Entreno** desde el icono naranja de la pantalla de inicio (no desde Safari): así va a pantalla completa y funciona sin conexión.

## 3. Qué tiene la app

| Pestaña | Qué hace |
|---|---|
| **Hoy** | El plan del día: Empuje / Tirón / Pierna ×2 + brazos y core el domingo (≈30 min, superseries). Toca un ejercicio para ver una viñeta animada de cómo se hace. Sugiere cuándo subir carga según tu última sesión. Desde aquí también: **Mis rutinas personalizadas** y **⚙️ Ajustes**. |
| **Entreno en curso** | Apunta el peso y las reps de cada serie y márcala con ✓. El descanso empieza solo al acabar cada superserie y suena un pitido al terminar. |
| **Historial** | Todos tus entrenos, con duración, series y volumen. |
| **Nutrición** | Tus calorías y macros del día frente a tu objetivo. Tiene un buscador con más de 100 alimentos (sin conexión) y búsqueda de productos de marca en Open Food Facts (necesita internet). |
| **Progreso** | Peso corporal con media de 7 días, ritmo semanal y consejo; cintura y brazo; gráficos por ejercicio (1RM estimado, carga, reps y volumen). |
| **Estudio** | Qué dice la ciencia sobre ganar músculo rápido y sobre los mejores alimentos, con las referencias. |

**Primer paso al abrirla:** ve a **Hoy → ⚙️ Ajustes** y pon tu sexo, edad, altura, peso, actividad y objetivo. Con eso se calculan tus calorías y tu proteína.

## 4. Copias de seguridad

Los datos viven en el iPhone. Si borras la app de la pantalla de inicio, **se borran también**. De vez en cuando ve a **Ajustes → Exportar datos** y guarda el archivo en *Archivos* o en iCloud Drive. Para recuperarlo, usa **Importar copia**.

## 5. Actualizar la app más adelante

Si cambias algún archivo:
1. En `sw.js`, cambia `entreno-v1` por `entreno-v2` (luego v3, etc.).
2. Súbelos desde la Terminal, en la carpeta de la app:
   `cd /Applications/Entreno && git add -A && git commit -m "Actualización" && git push`
   (o en github.com con **Add file → Upload files**).
3. Abre la app en el iPhone con internet y ciérrala y ábrela una o dos veces para que se actualice. Tus datos no se pierden.

## Probarla en el Mac

En Terminal, desde la carpeta de la app:

```bash
cd /Applications/Entreno && python3 -m http.server 8787
```

Después abre <http://localhost:8787> en el navegador.
