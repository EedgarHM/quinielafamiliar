# 🚀 Cómo desplegar la Quiniela en Railway (paso a paso, para dummies)

Esta guía te lleva de cero a tener la app en internet, con una URL que puedes
compartir con todos los participantes. No necesitas saber programar.

Tiempo aproximado: **15–20 minutos**.

---

## 📋 Lo que vas a necesitar (todo gratis)

1. Una cuenta de **GitHub** (ya la tienes: el repo está en
   `https://github.com/EedgarHM/quinielafamiliar`).
2. Una cuenta de **MongoDB Atlas** (la base de datos donde se guardan los resultados).
3. Una cuenta de **Railway** (donde vivirá la app).

> No necesitas instalar nada en tu computadora. Todo es desde el navegador.

---

## PARTE 1 — Crear la base de datos (MongoDB Atlas)

Aquí se guardan los marcadores que vayas capturando.

### 1.1 Crear la cuenta y el cluster
1. Entra a **https://www.mongodb.com/cloud/atlas/register** y regístrate
   (puedes usar tu cuenta de Google).
2. Cuando te pregunte el tipo de cluster, elige el plan **gratis: "M0"**.
3. Deja la región que te sugiera y dale **Create / Create Deployment**.

### 1.2 Crear el usuario de la base de datos
Al crear el cluster, Atlas te muestra una ventana **"Connect to … / Security Quickstart"**:
1. En **"Username"** escribe un usuario, por ejemplo: `quiniela`.
2. En **"Password"** pon una contraseña **y guárdala** (la vas a necesitar).
   - ⚠️ Evita símbolos raros como `@`, `:`, `/` en la contraseña (complican la URL).
     Usa letras y números.
3. Dale **"Create Database User"**.

> Si cerraste esa ventana: ve al menú izquierdo a **Security → Database Access →
> "Add New Database User"** y créalo ahí.

### 1.3 Permitir el acceso desde internet
1. En el menú izquierdo ve a **Security → Network Access**.
2. Dale **"Add IP Address"** → **"Allow Access from Anywhere"** (te pone `0.0.0.0/0`)
   → **Confirm**.

> Esto deja que Railway se conecte. Es lo más simple para empezar.

### 1.4 Copiar la cadena de conexión (tu MONGODB_URI)
1. En el menú izquierdo dale **Database** → en tu cluster, botón **"Connect"**.
2. Elige **"Drivers"** (Node.js).
3. Copia la cadena que aparece. Se ve así:
   ```
   mongodb+srv://quiniela:<db_password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
4. **Reemplaza `<db_password>`** por la contraseña real que pusiste en el paso 1.2.

👉 **Guarda esa cadena ya lista.** Es tu `MONGODB_URI`.

---

## PARTE 2 — Desplegar la app (Railway)

### 2.1 Crear la cuenta
1. Entra a **https://railway.com** y dale **"Login"** → inicia sesión **con GitHub**.

### 2.2 Crear el proyecto desde tu repositorio
1. Dale **"New Project"**.
2. Elige **"Deploy from GitHub repo"**.
3. Si es la primera vez, Railway te pedirá **autorizar el acceso a tus repos**
   ("Configure GitHub App"). Dale permiso al repo **`quinielafamiliar`**.
4. Selecciona el repo **`EedgarHM/quinielafamiliar`**.
5. Railway detecta solo el **`Dockerfile`** y empieza a construir. (Tardará 1–3 min.)

### 2.3 Configurar las variables de entorno  ⭐ (lo más importante)
1. Entra a tu servicio (el cuadro de la app) → pestaña **"Variables"**.
2. Agrega estas variables con **"+ New Variable"**:

   | Nombre | Valor |
   |--------|-------|
   | `MONGODB_URI` | *(pega la cadena de la Parte 1.4)* |
   | `ADMIN_PASSWORD` | *(la contraseña que TÚ elijas para capturar resultados)* |
   | `MONGODB_DB` | `quiniela` *(opcional)* |

3. Railway volverá a desplegar solo al guardar las variables.

> ⚠️ La `ADMIN_PASSWORD` es la clave para entrar a capturar resultados.
> Elige una y no la compartas con los participantes (solo con quien capture).

### 2.4 Generar la URL pública
1. En tu servicio ve a **Settings → Networking** (o **"Public Networking"**).
2. Dale **"Generate Domain"**.
   - Si te pide un **puerto**, escribe **`3000`**.
3. Te dará una URL tipo `https://quinielafamiliar-production.up.railway.app`.

### 2.5 ¡Listo! Probar
1. Abre esa URL → deberías ver la tabla de la quiniela. 🎉
2. Comparte ese link con todos los participantes.

---

## PARTE 3 — Cómo capturar los resultados (tú, el admin)

1. En la app, dale al botón **"⚙️ Capturar resultados"** (arriba) o entra a
   `TU-URL/admin`.
2. Escribe tu **`ADMIN_PASSWORD`** y entra.
3. Para cada partido que ya se jugó, escribe el marcador (local – visitante) y
   dale **"Guardar"**.
4. La tabla, el podio y la barra de progreso se actualizan al instante para todos.
   - ¿Te equivocaste? Vuelve a guardar el marcador correcto, o usa la **✕** para borrarlo.

> Los resultados quedan guardados en MongoDB: aunque la app se reinicie, **no se pierden**.

---

## 🔧 Problemas comunes

- **"No autorizado" al guardar un resultado** → la `ADMIN_PASSWORD` que escribiste
  no coincide con la que pusiste en las variables de Railway. Revísala.
- **La app abre pero no guarda / se pierden los datos** → falta o está mal la
  `MONGODB_URI`, o no diste **"Allow Access from Anywhere"** en Atlas (Parte 1.3).
- **La URL muestra "Application failed to respond"** → en Networking, asegúrate de
  que el puerto sea **3000**. Espera a que el build termine (revisa la pestaña
  "Deployments").
- **Error de conexión a Mongo en los logs** → revisa que reemplazaste
  `<db_password>` por la contraseña real y que no tenga símbolos raros.

---

## 🔄 ¿Cómo actualizo la app si cambio algo?

Cada vez que se suba un cambio nuevo a GitHub (rama `main`), **Railway lo despliega
solo automáticamente**. No tienes que hacer nada más.

---

¿Dudas? El panel de Railway tiene una pestaña **"Deployments" / "Logs"** donde
puedes ver si algo falló durante el arranque.
