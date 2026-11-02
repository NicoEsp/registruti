import type { Metadata } from "next";
import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: `Cómo ${SITE_NAME} trata tus datos personales.`,
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const UPDATED = "2 de noviembre de 2026";
const CONTACT_EMAIL = "hola@registruti.app";

function ContactLink() {
  return (
    <a href={`mailto:${CONTACT_EMAIL}`} className="underline">
      {CONTACT_EMAIL}
    </a>
  );
}

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      <Link href="/" className="text-sm text-slate-500 hover:text-slate-800">
        ← Volver
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Política de Privacidad</h1>
      <p className="mt-2 text-sm text-slate-500">Última actualización: {UPDATED}</p>

      <div className="prose prose-slate mt-8 max-w-none text-sm leading-relaxed text-slate-700 [&_h2]:mt-8 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-slate-900 [&_li]:mt-1 [&_p]:mt-3 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-5">
        <p>
          En {SITE_NAME} respetamos tu privacidad. Esta política explica qué datos recopilamos, con
          qué fin y qué derechos tenés. El tratamiento se realiza conforme a la Ley 25.326 de
          Protección de Datos Personales (Argentina) y normativa aplicable.
        </p>

        <h2>1. Datos que recopilamos</h2>
        <ul>
          <li>
            <strong>De tu cuenta:</strong> dirección de email y contraseña (almacenada de forma
            cifrada por nuestro proveedor de autenticación).
          </li>
          <li>
            <strong>Que cargás vos:</strong> clientes, tarifas, horas trabajadas, descripciones,
            facturas y datos de emisor que decidas completar.
          </li>
          <li>
            <strong>Técnicos:</strong> datos mínimos de sesión necesarios para el funcionamiento.
          </li>
          <li>
            <strong>De uso:</strong> páginas visitadas y acciones dentro de la aplicación (por
            ejemplo, que se registró tiempo o se generó una factura). Mientras navegás el sitio sin
            haber iniciado sesión, esos datos son anónimos y no se asocian a ninguna persona; una
            vez que entrás a tu cuenta, quedan vinculados al identificador de tu cuenta. No
            registramos el contenido que cargás: ni los nombres de tus clientes, ni las
            descripciones de tus tareas, ni los montos que facturás. De cada carga de horas
            registramos solo su duración y si es facturable.
          </li>
          <li>
            <strong>De las apps que conectás:</strong> si conectás un asistente de IA a tu cuenta
            (ver punto 5), los datos de esa conexión.
          </li>
        </ul>

        <h2>2. Para qué los usamos</h2>
        <p>
          Para prestarte el Servicio: autenticarte, guardar tu información, generar reportes y
          facturas, y compartir facturas mediante el enlace público que vos generás. Y para medir
          el uso del producto (cuánta gente se registra, activa y factura), que es lo que nos
          permite mejorarlo. No vendemos ni cedemos tus datos a terceros con fines comerciales.
        </p>

        <h2>3. Dónde se almacenan</h2>
        <p>
          Los datos se alojan en <strong>Supabase</strong> (infraestructura sobre PostgreSQL), que
          actúa como encargado del tratamiento. El acceso está protegido con Row Level Security, de
          modo que cada usuario sólo puede acceder a su propia información.
        </p>

        <p>
          Para las estadísticas de uso utilizamos <strong>PostHog</strong>, en su región de
          Estados Unidos. Recibe el identificador de tu cuenta, tu email, la fecha en que la
          creaste, el país que hayas cargado en tu perfil y los eventos descritos en el punto 1. No
          tenemos activada la grabación de sesiones: nadie mira lo que hacés en pantalla. Si
          preferís que dejemos de registrar tu actividad, escribinos a <ContactLink /> y lo damos
          de baja para tu cuenta.
        </p>

        <p>
          La aplicación está alojada en <strong>Vercel</strong>, que procesa las visitas para
          servir el sitio y mide el tráfico de forma agregada, sin cookies.
        </p>

        <h2>4. Enlaces públicos de facturas</h2>
        <p>
          Cuando generás el enlace público de una factura, cualquiera con ese enlace puede ver su
          detalle (horas, descripciones y montos) sin necesidad de cuenta. Compartilo sólo con
          quien corresponda.
        </p>

        <h2 id="mcp">5. Conexión con asistentes de IA (MCP)</h2>
        <p>
          Desde Ajustes podés conectar tu cuenta a Claude, Cursor u otros asistentes compatibles
          con el protocolo MCP. Es opcional y solo ocurre si vos lo autorizás.
        </p>
        <ul>
          <li>
            <strong>A qué accede la app conectada:</strong> con el permiso de lectura, a tus
            clientes, horas, reportes y facturas, incluido el enlace público de cada factura. Con
            el permiso de escritura, además puede cargar y editar horas y crear clientes. Solo
            accede a los datos de tu cuenta.
          </li>
          <li>
            <strong>Qué recibimos:</strong> los datos de cada pedido que hace el asistente, por
            ejemplo el cliente, la fecha, la duración y la descripción de una carga de horas. Los
            tratamos igual que si los cargaras desde la aplicación. No recibimos tus
            conversaciones con el asistente ni otros datos de esa app. Los eventos de uso indican
            que una acción vino de un asistente y llevan lo mismo que desde la aplicación: de una
            carga de horas, su duración y si es facturable, nunca la descripción ni el cliente.
          </li>
          <li>
            <strong>Qué guardamos de la conexión:</strong> el nombre de la app y las direcciones
            de retorno que declara, los permisos que le diste y la fecha de último uso. Los tokens
            de acceso se guardan solo como hash, nunca en texto plano. Para limitar abusos en el
            registro de apps guardamos un hash con clave de la IP desde la que se registró, no la
            IP.
          </li>
          <li>
            <strong>Qué recibe la app conectada:</strong> los datos que devuelven las
            herramientas se envían al asistente que conectaste (por ejemplo, a Anthropic en el
            caso de Claude), que los trata según su propia política de privacidad.
          </li>
          <li>
            <strong>Cómo desconectar:</strong> en Ajustes, sección &quot;Conexión con Claude y
            otros asistentes&quot;, podés desconectar cualquier app y revocar tus tokens
            personales. Al desconectar borramos la autorización y sus tokens, y la app pierde el
            acceso en el momento.
          </li>
        </ul>

        <h2>6. Tus derechos</h2>
        <p>
          Podés acceder, rectificar y solicitar la eliminación de tus datos. Para eliminar tu
          cuenta y toda la información asociada, escribinos a <ContactLink />.
        </p>

        <h2>7. Conservación</h2>
        <p>
          Conservamos tus datos mientras tu cuenta esté activa. Si solicitás la baja, los
          eliminamos salvo obligación legal de conservarlos.
        </p>
        <p>
          En las conexiones con asistentes, los tokens de acceso vencen a la hora y los de
          renovación a los 60 días sin uso; los vencidos se borran automáticamente. La
          autorización de una app dura hasta que la desconectás o eliminás tu cuenta. Las apps
          que se registraron pero nunca completaron una autorización se borran a los 7 días. Los
          tokens personales no vencen: duran hasta que los revocás.
        </p>

        <h2>8. Cambios</h2>
        <p>
          Podemos actualizar esta política. Publicaremos la versión vigente en esta página con su
          fecha de actualización.
        </p>

        <h2>9. Contacto</h2>
        <p>
          Ante consultas sobre tus datos, o para reportar un problema de seguridad, escribinos a{" "}
          <ContactLink />.
        </p>
      </div>
    </main>
  );
}
