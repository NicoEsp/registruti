import Link from "next/link";

/**
 * Cuerpo de "Las 6 mejores alternativas a Toggl Track en 2026".
 * Se renderiza dentro de un contenedor `.article`.
 */
export default function TogglAlternativasArticle() {
  return (
    <>
      <p>
        Toggl Track es probablemente el time tracker más conocido del mundo, y con razón: el
        cronómetro es excelente y la app está muy pulida. Pero si sos freelancer, hay tres motivos
        por los que quizás estés buscando otra cosa:
      </p>
      <ul>
        <li>
          <strong>El precio real no es gratis.</strong> El plan Free existe, pero lo que un
          freelancer necesita para cobrar —tarifas facturables por cliente y proyecto— arranca en el
          plan Starter: <strong>USD 9 por usuario por mes</strong> con facturación anual (unos USD
          108 al año), o alrededor de USD 11 si pagás mes a mes.
        </li>
        <li>
          <strong>Está solo en inglés.</strong> No hay versión en español de la interfaz, y para
          muchos freelancers de Latinoamérica y España eso suma fricción todos los días.
        </li>
        <li>
          <strong>Está pensado para equipos.</strong> Permisos, auditoría, tracking de equipo,
          integraciones corporativas: funciones que una empresa valora y un freelancer paga sin
          usar.
        </li>
      </ul>
      <p>
        En esta guía comparamos <strong>6 alternativas a Toggl Track</strong> — con precios
        verificados a julio de 2026 — para que elijas según lo que vos necesitás, no según lo que la
        herramienta quiere venderte.
      </p>

      <blockquote>
        <p>
          <strong>Transparencia primero:</strong> este blog es de Registruti, y Registruti aparece
          en la lista. Para compensar el sesgo, en cada herramienta te decimos también qué hace
          mejor que nosotros y cuándo te conviene elegirla.
        </p>
      </blockquote>

      <h2 id="tabla-resumen">Las 6 alternativas, en una tabla</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Herramienta</th>
              <th>Precio para facturar horas</th>
              <th>Español</th>
              <th>Facturas incluidas</th>
              <th>Ideal para</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Registruti</strong>
              </td>
              <td>Gratis (lifetime access con pago único opcional)</td>
              <td>Sí, 100%</td>
              <td>Sí, con PDF y link público</td>
              <td>Freelancers que facturan por hora</td>
            </tr>
            <tr>
              <td>
                <strong>Clockify</strong>
              </td>
              <td>Desde USD 6,99/usuario/mes (Standard, con facturación)</td>
              <td>Parcial</td>
              <td>En planes pagos</td>
              <td>Equipos que quieren empezar gratis</td>
            </tr>
            <tr>
              <td>
                <strong>TrackingTime</strong>
              </td>
              <td>Desde USD 5/usuario/mes (Starter)</td>
              <td>Sí</td>
              <td>No (exporta reportes)</td>
              <td>Equipos chicos en LatAm</td>
            </tr>
            <tr>
              <td>
                <strong>Everhour</strong>
              </td>
              <td>USD 8,50/usuario/mes con mínimo 5 usuarios (~USD 42,50/mes)</td>
              <td>No</td>
              <td>Sí, en plan pago</td>
              <td>Equipos que viven en Asana/Jira</td>
            </tr>
            <tr>
              <td>
                <strong>Harvest</strong>
              </td>
              <td>Gratis 1 usuario / 2 proyectos; pago desde USD 9/usuario/mes + cargos por uso</td>
              <td>No</td>
              <td>Sí</td>
              <td>Agencias con presupuestos por proyecto</td>
            </tr>
            <tr>
              <td>
                <strong>Planilla de cálculo</strong>
              </td>
              <td>Gratis</td>
              <td>Depende de vos</td>
              <td>Manual</td>
              <td>Quien recién arranca y tiene 1 cliente</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <em>
          Precios a julio de 2026, según los sitios oficiales de cada herramienta. Pueden cambiar;
          verificalos antes de contratar.
        </em>
      </p>

      <h2 id="registruti">1. Registruti — la alternativa gratis y en español para freelancers</h2>
      <p>
        <a href="https://registruti.app">Registruti</a> ataca exactamente el hueco que Toggl deja:
        el freelancer hispanohablante que trackea horas <strong>para cobrarlas</strong>. Todo lo que
        en Toggl requiere el plan Starter acá está desde el primer día: tarifa por hora por cliente,
        montos facturables en reportes y generación de facturas.
      </p>
      <ul>
        <li>
          <strong>Tarifa y moneda por cliente:</strong> le cobrás en pesos a un cliente local y en
          dólares a uno del exterior. Hay 9 monedas: ARS, USD, EUR, UYU, BRL, CLP, COP, MXN y GBP.
        </li>
        <li>
          <strong>De horas a factura en un clic:</strong> elegís cliente y período y la factura se
          arma sola desde tus horas, con numeración automática, estados (borrador → enviada →
          pagada) y PDF.
        </li>
        <li>
          <strong>Link público por factura:</strong> tu cliente ve el detalle de horas y montos
          desde un link, sin crear cuenta. Menos idas y vueltas por mail.
        </li>
        <li>
          <strong>100% en español</strong> (y con voseo, sin traducciones a medias).
        </li>
        <li>
          <strong>Precio:</strong> gratis hasta 3 clientes activos y 4 facturas; el desbloqueo total
          es un <strong>pago único</strong> de por vida, no una suscripción mensual.
        </li>
      </ul>
      <p>
        <strong>Dónde pierde contra Toggl:</strong> no tiene cronómetro corriendo en segundo plano
        (cargás bloques de 15 minutos a 8 horas) ni apps nativas de iOS/Android — es web, usable
        desde el celular. Si tu flujo depende de un timer siempre encendido, mirá Toggl o Clockify.
      </p>
      <p>
        <strong>Elegila si:</strong> sos freelancer o consultor, facturás por hora a varios clientes
        y querés pasar de las horas a la factura sin pagar USD 100+ por año.{" "}
        <Link href="/alternativa-toggl-track">Acá está la comparación completa contra Toggl</Link>.
      </p>

      <h2 id="clockify">2. Clockify — el plan gratis más generoso para equipos</h2>
      <p>
        Clockify se hizo famoso por una promesa simple: cronómetro y usuarios{" "}
        <strong>ilimitados gratis</strong>. Si lo único que querés es medir tiempo, es difícil de
        superar.
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> free ilimitado en usuarios y proyectos, apps para todas las
          plataformas, timer con detección de inactividad y Pomodoro.
        </li>
        <li>
          <strong>Contras:</strong> lo que un freelancer necesita para cobrar está en los planes
          pagos: la facturación llega con el plan Standard (USD 6,99/usuario/mes, o USD 5,49 con
          pago anual). La interfaz está traducida al español solo parcialmente y la app está cada
          vez más orientada a gestión de equipos (GPS, capturas de pantalla, aprobaciones).
        </li>
      </ul>
      <p>
        <strong>Elegila si:</strong> tenés un equipo chico que solo necesita medir tiempo gratis, o
        no te molesta pagar mensualidad para facturar.
      </p>

      <h2 id="trackingtime">3. TrackingTime — hecha en Latinoamérica, con foco en equipos</h2>
      <p>
        TrackingTime nació en Buenos Aires y es de las pocas herramientas de la categoría con sitio
        e interfaz <strong>en español</strong>. Tiene un free con usuarios ilimitados y planes pagos
        accesibles (Starter USD 5/usuario/mes, Pro USD 7).
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> español real, buen free, integraciones con Asana, Trello, Notion y
          más, vista de agenda tipo calendario.
        </li>
        <li>
          <strong>Contras:</strong> no genera facturas — trackea y reporta, pero el paso “convertí
          esto en una factura para tu cliente” lo terminás haciendo a mano en otro lado. El producto
          apunta cada vez más a gestión de equipos y asistencia.
        </li>
      </ul>
      <p>
        <strong>Elegila si:</strong> coordinás un equipo chico, querés español y no necesitás
        facturación integrada.
      </p>

      <h2 id="everhour">4. Everhour — para equipos que viven en Asana o Jira</h2>
      <p>
        La gracia de Everhour es que se incrusta dentro de tu herramienta de proyectos: ves el timer
        adentro de Asana, Jira, ClickUp o Trello. Para equipos que ya trabajan ahí, es una
        experiencia muy fluida.
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> integraciones nativas profundas, presupuestos por proyecto,
          facturación incluida en el plan pago.
        </li>
        <li>
          <strong>Contras (grande para freelancers):</strong> el plan Team cuesta USD
          8,50/usuario/mes <strong>con un mínimo de 5 usuarios</strong>: aunque trabajes solo, pagás
          unos USD 42,50 por mes (~USD 510 al año). El free (hasta 5 usuarios) no incluye las
          integraciones, que son justamente el diferencial. Solo en inglés.
        </li>
      </ul>
      <p>
        <strong>Elegila si:</strong> son un equipo de 5+ personas trabajando dentro de Asana/Jira.
        Para un freelancer solo, el mínimo de asientos la hace carísima.
      </p>

      <h2 id="harvest">5. Harvest — la veterana de agencias, ahora con precios por uso</h2>
      <p>
        Harvest existe desde 2006 y su fuerte siempre fue el combo tiempo + gastos + facturación
        para agencias. En 2026 cambió su modelo de precios: además del costo por asiento (desde USD
        9/usuario/mes anual), sumó <strong>cargos por volumen de uso</strong> (facturas enviadas,
        proyectos, clientes), lo que hizo el costo final menos predecible.
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> facturación madura con cobro online (Stripe/PayPal), reportes de
          rentabilidad por proyecto, años de solidez.
        </li>
        <li>
          <strong>Contras:</strong> el free es casi una demo (1 usuario, 2 proyectos), está solo en
          inglés, y el nuevo esquema de precios con cargos por uso puede escalar rápido.
        </li>
      </ul>
      <p>
        <strong>Elegila si:</strong> manejás una agencia con presupuestos por proyecto y cobro
        online, y el costo te cierra.
      </p>

      <h2 id="planilla">6. Una planilla de cálculo — gratis, hasta que te queda chica</h2>
      <p>
        Seamos honestos: la alternativa a Toggl más usada del mundo es Google Sheets o Excel. Y para
        arrancar, funciona: una fila por bloque de trabajo con fecha, cliente, descripción, horas y
        tarifa.
      </p>
      <ul>
        <li>
          <strong>Pros:</strong> gratis, infinitamente flexible, cero curva si ya usás planillas.
        </li>
        <li>
          <strong>Contras:</strong> todo es manual: los totales, el armado de la factura, el control
          de qué horas ya facturaste y cuáles no. Con 2 o 3 clientes empieza a fallar el sistema — y
          las horas que no anotaste en el momento son plata que no cobrás.
        </li>
      </ul>
      <p>
        <strong>Elegila si:</strong> tenés un solo cliente y pocas horas por semana. Cuando la
        planilla empiece a doler, en{" "}
        <Link href="/blog/control-de-horas-trabajadas">
          esta guía de control de horas trabajadas
        </Link>{" "}
        contamos cómo migrar a un sistema sin fricción.
      </p>

      <h2 id="cual-elegir">¿Cuál elegir? Decisión en 30 segundos</h2>
      <ul>
        <li>
          <strong>Facturás por hora a varios clientes y querés gratis + español:</strong>{" "}
          Registruti.
        </li>
        <li>
          <strong>Solo querés un cronómetro gratis e ilimitado:</strong> Clockify.
        </li>
        <li>
          <strong>Equipo chico en LatAm, sin facturación:</strong> TrackingTime.
        </li>
        <li>
          <strong>Equipo de 5+ dentro de Asana/Jira:</strong> Everhour.
        </li>
        <li>
          <strong>Agencia con facturación y cobro online:</strong> Harvest.
        </li>
        <li>
          <strong>Un cliente, pocas horas:</strong> planilla (por ahora).
        </li>
      </ul>
      <p>
        ¿Y si ninguna te convence? Toggl Track sigue siendo un gran producto: si el cronómetro
        automático y las apps nativas son tu prioridad y el precio no te molesta, quedate. La mejor
        herramienta es la que usás todos los días.
      </p>
      <p>
        Si querés profundizar en la comparación puntual contra Toggl —precios año a año, tabla
        completa y cómo migrar—, está acá:{" "}
        <Link href="/alternativa-toggl-track">Registruti como alternativa a Toggl Track</Link>. Y si
        estás evaluando la categoría completa, mirá{" "}
        <Link href="/blog/mejores-time-trackers-freelancers">
          los mejores time trackers para freelancers en 2026
        </Link>
        .
      </p>
    </>
  );
}
