import CodeBlock from "@/components/blog/CodeBlock";

const MCP_ENDPOINT = "https://www.registruti.app/api/mcp";

const CONFIG_JSON = `{
  "mcpServers": {
    "registruti": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-remote",
        "${MCP_ENDPOINT}",
        "--transport",
        "http-only",
        "--header",
        "Authorization:\${AUTH_HEADER}"
      ],
      "env": {
        "AUTH_HEADER": "Bearer reg_tu_token_aca"
      }
    }
  }
}`;

/** Cuerpo del artículo. Se renderiza dentro de un contenedor `.article`. */
export default function McpArticle() {
  return (
    <>
      <p>
        Registruti tiene un servidor <strong>MCP</strong> (Model Context Protocol), el estándar que
        usan Claude y otros asistentes para conectarse a herramientas externas. Conectándolo, podés{" "}
        <strong>cargar horas y consultar tus reportes hablándole en lenguaje natural a Claude</strong>
        , sin abrir la app. Por ejemplo:
      </p>

      <blockquote>
        <p>“Cargá 2 horas de hoy para Acme, reunión de kickoff.”</p>
        <p>“¿Cuántas horas facturables llevo este mes?”</p>
        <p>“¿Qué clientes tengo cargados?”</p>
      </blockquote>

      <p>
        En esta guía vas a conectar Registruti a <strong>Claude Desktop</strong>. Toma unos 5
        minutos. Todo lo que hagas queda scopeado a <strong>tu propia cuenta</strong>: el token que
        generás identifica tu usuario y Claude solo ve y toca tus datos.
      </p>

      <h2 id="requisitos">Lo que necesitás</h2>
      <ul>
        <li>Una cuenta de Registruti (si no tenés, creala gratis primero).</li>
        <li>
          <strong>Claude Desktop</strong> instalado (Mac o Windows).
        </li>
        <li>
          <strong>Node.js</strong> instalado en tu compu — el puente de conexión corre con{" "}
          <code>npx</code>. Si no lo tenés, bajalo de{" "}
          <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
            nodejs.org
          </a>{" "}
          (versión LTS).
        </li>
      </ul>

      <h2 id="token">Paso 1 · Generar tu token</h2>
      <p>
        En Registruti, entrá a <strong>Ajustes → Conexión MCP</strong> y tocá{" "}
        <strong>Generar token</strong>. Se muestra <strong>una sola vez</strong>, así que copialo en
        el momento con el botón de copiar. Tiene esta pinta:
      </p>
      <CodeBlock code="reg_9f3a1c8e04b7…d2" />
      <p>
        Pensalo como una contraseña: cualquiera que lo tenga puede leer y cargar horas en tu cuenta.
        Podés <strong>revocarlo</strong> cuando quieras desde la misma pantalla.
      </p>

      <h2 id="config">Paso 2 · Configurar Claude Desktop</h2>
      <p>
        Claude Desktop lee los servidores MCP de un archivo llamado{" "}
        <code>claude_desktop_config.json</code>. La forma más segura de abrirlo es desde la app:{" "}
        <strong>Settings → Developer → Edit Config</strong>.
      </p>
      <p>Si preferís ir al archivo a mano, está en:</p>
      <ul>
        <li>
          <strong>Mac:</strong>{" "}
          <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>
        </li>
        <li>
          <strong>Windows:</strong>{" "}
          <code>%APPDATA%\\Claude\\claude_desktop_config.json</code>
        </li>
      </ul>

      <blockquote>
        <p>
          <strong>Ojo:</strong> en esa carpeta también hay un <code>config.json</code> (sin el
          prefijo <code>claude_desktop_</code>). Ese es el de preferencias de la app —{" "}
          <strong>no</strong> es donde va el MCP. Asegurate de editar{" "}
          <code>claude_desktop_config.json</code>.
        </p>
      </blockquote>

      <p>
        Pegá esta configuración (si el archivo ya tiene otros servidores, agregá solo la entrada{" "}
        <code>&quot;registruti&quot;</code> dentro de tu <code>&quot;mcpServers&quot;</code>
        existente):
      </p>
      <CodeBlock code={CONFIG_JSON} />

      <p>
        Reemplazá <code>reg_tu_token_aca</code> por el token que copiaste en el Paso 1 —{" "}
        <strong>dejando el prefijo</strong> <code>Bearer </code> adelante.
      </p>

      <h3>¿Por qué el token va en “env” y no en el header directo?</h3>
      <p>
        Hay un detalle conocido de Claude Desktop: come los espacios dentro de los argumentos. Como
        el header necesita el espacio de <code>&quot;Bearer &quot;</code>, lo pasamos por la variable{" "}
        <code>AUTH_HEADER</code> (que sí admite espacios) y el argumento apunta a{" "}
        <code>{"Authorization:${AUTH_HEADER}"}</code>. Así evitás un error silencioso de
        autenticación.
      </p>

      <h2 id="reiniciar">Paso 3 · Reiniciar</h2>
      <p>
        Guardá el archivo y <strong>cerrá Claude Desktop del todo</strong> (en Mac es ⌘Q, no alcanza
        con cerrar la ventana). Volvé a abrirlo: la primera vez, <code>npx</code> baja el puente{" "}
        <code>mcp-remote</code> y puede tardar unos segundos.
      </p>

      <h2 id="probar">Paso 4 · Probar</h2>
      <p>
        Buscá el ícono de herramientas 🔌 en Claude Desktop; deberías ver las 4 tools de Registruti.
        Probá con:
      </p>
      <ul>
        <li>
          <em>“¿Qué clientes tengo en Registruti?”</em>
        </li>
        <li>
          <em>“Cargá 1 hora de hoy para [tu cliente], reunión de prueba.”</em>
        </li>
        <li>
          <em>“¿Cómo vengo este mes? Mostrame las horas facturables por cliente.”</em>
        </li>
      </ul>

      <h2 id="tools">Qué le podés pedir</h2>
      <p>El servidor expone 4 herramientas:</p>
      <table>
        <thead>
          <tr>
            <th>Herramienta</th>
            <th>Qué hace</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <code>list_clients</code>
            </td>
            <td>Lista tus clientes con tarifa, moneda y color.</td>
          </tr>
          <tr>
            <td>
              <code>log_time</code>
            </td>
            <td>
              Registra una entrada de tiempo (cliente, fecha, duración libre como “1:30” o “90m”,
              descripción, facturable).
            </td>
          </tr>
          <tr>
            <td>
              <code>list_time_entries</code>
            </td>
            <td>Consulta tus entradas por rango de fechas y cliente.</td>
          </tr>
          <tr>
            <td>
              <code>report_summary</code>
            </td>
            <td>Resumen de horas y montos facturables por cliente y período.</td>
          </tr>
        </tbody>
      </table>

      <h2 id="problemas">Si algo no funciona</h2>
      <ul>
        <li>
          <strong>No aparecen las herramientas.</strong> Casi siempre es Node.js: verificá que esté
          instalado. La primera conexión también puede tardar mientras baja <code>mcp-remote</code>{" "}
          — esperá unos segundos y reiniciá otra vez.
        </li>
        <li>
          <strong>Error de conexión.</strong> Revisá que la URL sea exactamente{" "}
          <code>{MCP_ENDPOINT}</code> (con <code>www</code>) y que el token esté completo, con el{" "}
          <code>Bearer </code> adelante.
        </li>
        <li>
          <strong>Dice “no autorizado” (401).</strong> El token no es válido o fue revocado. Generá
          uno nuevo en Ajustes → Conexión MCP y actualizá el archivo.
        </li>
      </ul>

      <hr />
      <p>
        Esto es la primera versión de la integración: funciona con Claude Desktop y clientes MCP que
        aceptan un token. Estamos trabajando en el login con OAuth para sumar también Claude web y
        mobile. ¿Sugerencias o algo que no funcionó? Escribinos.
      </p>
    </>
  );
}
