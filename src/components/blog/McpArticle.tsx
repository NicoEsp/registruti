import CodeBlock from "@/components/blog/CodeBlock";
import { MCP_ENDPOINT } from "@/lib/mcp/config";

// OJO: tiene que ser el dominio canónico (apex, sin `www`), el mismo que expone
// Ajustes. En Vercel, www.registruti.app redirige al apex, y ese redirect es
// cross-origin: `fetch` —el que usan todos los clientes MCP— borra el header
// `Authorization` al seguirlo (lo pide la spec de Fetch). La request llega sin
// token, el server responde 401 y el cliente muestra un error de conexión. Por
// eso se toma de la config del MCP (la misma que anuncia el server) y no se
// escribe a mano: así no puede volver a divergir.

const CLAUDE_CODE_COMMAND = `claude mcp add --transport http --scope user registruti ${MCP_ENDPOINT}`;

const CURSOR_JSON = `{
  "mcpServers": {
    "registruti": {
      "url": "${MCP_ENDPOINT}"
    }
  }
}`;

const TOKEN_CONFIG_JSON = `{
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
        La conexión es <strong>de un clic</strong>: pegás la URL del servidor en tu cliente, te pide
        autorizar el acceso con tu cuenta de Registruti y listo. No hay que instalar nada ni copiar
        tokens. Funciona en <strong>Claude</strong> (web, escritorio y celular),{" "}
        <strong>Claude Code</strong>, <strong>Cursor</strong> y cualquier otro cliente MCP que
        soporte servidores remotos con OAuth. Todo lo que hagas queda scopeado a{" "}
        <strong>tu propia cuenta</strong>: el asistente solo ve y toca tus datos, y podés cortar el
        acceso cuando quieras.
      </p>

      <h2 id="requisitos">Lo que necesitás</h2>
      <ul>
        <li>Una cuenta de Registruti (si no tenés, creala gratis primero).</li>
        <li>
          Un cliente MCP: la app de Claude (en un plan que incluya conectores personalizados),
          Claude Code, Cursor u otro.
        </li>
        <li>
          La URL del servidor, que es siempre la misma: <code>{MCP_ENDPOINT}</code> (también la
          ves en <strong>Ajustes → Conexión con Claude</strong>).
        </li>
      </ul>

      <h2 id="claude">Opción 1 · Claude (web, escritorio o celular)</h2>
      <ol>
        <li>
          En Claude, abrí <strong>Ajustes → Conectores</strong> y tocá{" "}
          <strong>Agregar conector personalizado</strong>.
        </li>
        <li>
          Nombre: <code>Registruti</code>. URL: <code>{MCP_ENDPOINT}</code>. Los campos de OAuth
          Client ID y Client Secret se dejan vacíos. Guardá.
        </li>
        <li>
          Tocá <strong>Conectar</strong>. Se abre Registruti: si no tenés sesión, entrás con Google
          y volvés solo a la pantalla de autorización. Ahí ves qué permisos pide Claude (ver tus
          clientes, horas y reportes; cargar horas). Tocá <strong>Autorizar</strong>.
        </li>
        <li>
          Volvés a Claude con el conector activo. En un chat nuevo, abrí el menú de herramientas,
          asegurate de que Registruti esté habilitado y probá: <em>“¿Qué clientes tengo en
          Registruti?”</em>.
        </li>
      </ol>
      <p>
        Como el conector queda ligado a tu cuenta de Claude, lo tenés en la web, en la app de
        escritorio y en el celular sin repetir nada.
      </p>

      <h2 id="claude-code">Opción 2 · Claude Code</h2>
      <p>Un comando en la terminal:</p>
      <CodeBlock code={CLAUDE_CODE_COMMAND} />
      <p>
        Después, dentro de una sesión, escribí <code>/mcp</code>, elegí <strong>registruti</strong>{" "}
        y <strong>Authenticate</strong>: se abre el browser con la pantalla de autorización de
        Registruti. El <code>--scope user</code> lo deja disponible en todos tus proyectos.
      </p>

      <h2 id="cursor">Opción 3 · Cursor y otros clientes con OAuth</h2>
      <p>
        En Cursor, agregá un servidor MCP remoto desde{" "}
        <strong>Settings → MCP → Add new MCP server</strong>, o pegá esto en tu{" "}
        <code>mcp.json</code>:
      </p>
      <CodeBlock code={CURSOR_JSON} />
      <p>
        Al guardar, el servidor aparece como pendiente de login: hacé clic y autorizá en el
        browser. La idea es la misma en cualquier cliente que soporte servidores MCP remotos con
        OAuth: apuntás a <code>{MCP_ENDPOINT}</code> y autorizás.
      </p>

      <h2 id="token">Opción 4 · Token manual, para clientes sin OAuth</h2>
      <p>
        Algunos clientes no saben autorizar solos: por ejemplo el archivo{" "}
        <code>claude_desktop_config.json</code> de Claude Desktop, que solo levanta servidores
        locales, o un script tuyo. Para esos casos generás un{" "}
        <strong>token personal</strong> en <strong>Ajustes → Conexión con Claude → Tokens
        personales</strong> (se muestra una sola vez; tratalo como una contraseña) y lo mandás en
        el header <code>Authorization: Bearer &lt;token&gt;</code>.
      </p>
      <p>
        Para Claude Desktop vía archivo de configuración hace falta{" "}
        <a href="https://nodejs.org" target="_blank" rel="noopener noreferrer">
          Node.js
        </a>{" "}
        (el puente <code>mcp-remote</code> corre con <code>npx</code>). Abrí el archivo desde{" "}
        <strong>Settings → Developer → Edit Config</strong> y agregá:
      </p>
      <CodeBlock code={TOKEN_CONFIG_JSON} />
      <p>
        Reemplazá <code>reg_tu_token_aca</code> por tu token, dejando el prefijo{" "}
        <code>Bearer </code>. El header va por la variable <code>AUTH_HEADER</code> porque Claude
        Desktop se come los espacios de los argumentos. Después cerrá Claude Desktop del todo (en
        Mac es ⌘Q) y volvé a abrirlo. Si tenés la opción de conectores personalizados, preferí la
        Opción 1: es más simple y los tokens se renuevan solos.
      </p>

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
      <p>
        “Hoy”, “esta semana” o “este mes” se interpretan en la zona horaria del país de tu perfil
        (Ajustes), así que cargar horas a la noche no las manda al día siguiente.
      </p>

      <h2 id="permisos">Permisos, seguridad y cómo desconectar</h2>
      <ul>
        <li>
          Al autorizar, la app recibe dos permisos: <strong>ver</strong> tus clientes, horas y
          reportes, y <strong>cargar horas</strong>. Nada más: no puede borrar entradas, tocar
          facturas ni ver otras cuentas.
        </li>
        <li>
          Los accesos autorizados vencen cada hora y se renuevan solos; no tenés que hacer nada.
        </li>
        <li>
          Para cortar el acceso, andá a <strong>Ajustes → Conexión con Claude → Apps
          conectadas</strong> y tocá <strong>Desconectar</strong>. También podés quitar el conector
          desde el propio cliente. Los tokens personales se revocan desde la misma pantalla.
        </li>
      </ul>

      <h2 id="problemas">Si algo no funciona</h2>
      <ul>
        <li>
          <strong>El cliente dice que no pudo conectar.</strong> Revisá que la URL sea exactamente{" "}
          <code>{MCP_ENDPOINT}</code>: <strong>sin <code>www</code></strong> y sin barra al final.
          El <code>www</code> redirige al dominio principal y ese salto borra la autorización, así
          que la conexión falla aunque todo lo demás esté bien.
        </li>
        <li>
          <strong>Se abrió Registruti pero volví al tracker en vez de a la autorización.</strong>{" "}
          Pasa si la sesión venció en el medio. Volvé al cliente y tocá <strong>Conectar</strong> de
          nuevo: ahora que ya estás logueado, la pantalla de autorización aparece directo.
        </li>
        <li>
          <strong>No aparecen las herramientas en el chat.</strong> En Claude, abrí el menú de
          herramientas del chat y habilitá Registruti. Si conectaste por archivo de configuración,
          verificá que Node.js esté instalado y reiniciá Claude Desktop.
        </li>
        <li>
          <strong>Dice “no autorizado” (401) con un token manual.</strong> Primero la URL (el{" "}
          <code>www</code> de arriba). Si está bien, el token fue revocado: generá uno nuevo en
          Ajustes y actualizá el archivo.
        </li>
        <li>
          <strong>Me pide autorizar de nuevo.</strong> Pasa si desconectaste la app desde Ajustes o
          si no la usaste en más de dos meses. Autorizá otra vez y listo.
        </li>
      </ul>

      <hr />
      <p>
        MCP es un estándar abierto, así que esto no depende de Claude: cualquier asistente que lo
        implemente puede hablar con Registruti. ¿Sugerencias o algo que no funcionó? Escribinos a{" "}
        <a href="mailto:hola@registruti.app">hola@registruti.app</a>.
      </p>
    </>
  );
}
