import Link from "next/link";

/**
 * Cuerpo de "Los mejores time trackers para freelancers en 2026".
 * Se renderiza dentro de un contenedor `.article`.
 */
export default function TimeTrackersArticle() {
  return (
    <>
      <p>
        Buscar “mejor time tracker” en Google devuelve listas de 15 herramientas que terminan
        recomendando lo mismo para todos. La realidad es más simple:{" "}
        <strong>el mejor time tracker depende de para qué lo necesitás</strong>. No es lo mismo
        medir tu productividad personal que registrar horas para facturarle a tres clientes en dos
        monedas distintas.
      </p>
      <p>
        Esta guía está pensada para <strong>freelancers y consultores independientes</strong>.
        Primero definimos qué tiene que tener un time tracker para trabajo freelance; después, cuál
        conviene en cada caso de uso, con precios verificados a julio de 2026.
      </p>

      <h2 id="que-mirar">Qué tiene que tener un time tracker para freelancers</h2>
      <p>Cinco criterios separan un juguete de una herramienta de trabajo:</p>
      <ol>
        <li>
          <strong>Registro sin fricción.</strong> Si cargar una hora te lleva más de 10 segundos, en
          dos semanas dejás de hacerlo. El formato (cronómetro vs. carga manual) importa menos que
          la constancia: lo que no se anota, no se cobra.
        </li>
        <li>
          <strong>Tarifa por cliente, no global.</strong> Un freelancer real cobra distinto a cada
          cliente, a veces en monedas distintas. Si la herramienta solo permite una tarifa única, ya
          te quedó chica.
        </li>
        <li>
          <strong>Reportes que respondan “¿cuánto facturo este mes?”</strong> Horas por cliente por
          período, en plata, no solo en tiempo.
        </li>
        <li>
          <strong>El paso a la factura.</strong> El objetivo final del tracking freelance es cobrar.
          Si la herramienta no genera la factura, ese trabajo manual queda para vos, todos los
          meses.
        </li>
        <li>
          <strong>Precio real para una persona.</strong> Muchos planes “desde USD X por usuario” se
          diseñaron para equipos: mínimos de asientos, funciones clave detrás del plan caro. Mirá lo
          que pagarías vos, solo, por año.
        </li>
      </ol>

      <h2 id="para-facturar">El mejor para facturar tus horas: Registruti</h2>
      <p>
        <a href="https://registruti.app">Registruti</a> (sí, esta guía es de su blog — sesgo
        declarado) está construida alrededor del criterio 4: el flujo termina en la factura, no en
        el reporte. Cargás tu semana en bloques de 15 minutos, cada cliente tiene su tarifa y su
        moneda (9 disponibles, de ARS a GBP), y la factura del período se genera sola: numeración
        automática, PDF y un <strong>link público</strong> para que tu cliente vea el detalle de
        horas sin crear cuenta.
      </p>
      <p>
        Es <strong>100% en español</strong> y <strong>gratis</strong> hasta 3 clientes activos y 4
        facturas; el desbloqueo completo es un pago único de por vida, no otra suscripción. Lo que
        no tiene: cronómetro en tiempo real ni apps nativas — si necesitás eso, seguí leyendo.
      </p>

      <h2 id="cronometro">El mejor cronómetro automático: Toggl Track</h2>
      <p>
        Si tu flujo es “aprieto play cuando empiezo y stop cuando termino”, Toggl Track sigue siendo
        el estándar: timer en un clic desde el navegador, el escritorio o el celular, detección de
        inactividad y recordatorios. El plan Free (hasta 5 usuarios) alcanza para medir tiempo.
      </p>
      <p>
        El “pero” para freelancers: <strong>las tarifas facturables arrancan en el plan Starter
        (USD 9/usuario/mes anual)</strong>, la interfaz está solo en inglés y no genera facturas.
        Escribimos{" "}
        <Link href="/alternativa-toggl-track">una comparación completa Registruti vs. Toggl</Link> y{" "}
        <Link href="/blog/mejores-alternativas-toggl-track">
          una guía de alternativas a Toggl Track
        </Link>{" "}
        si estás evaluando ese camino.
      </p>

      <h2 id="gratis-equipos">El mejor gratis para medir sin límite: Clockify</h2>
      <p>
        Clockify ofrece cronómetro, proyectos y usuarios ilimitados gratis, con apps para todo. Como
        “reloj” es imbatible en precio. Para cobrar tus horas, en cambio, aparecen los planes pagos:
        la facturación llega con el plan Standard (USD 6,99/usuario/mes) y buena parte del roadmap
        apunta a monitoreo de equipos (GPS, capturas, aprobaciones) más que al freelancer
        individual.
      </p>

      <h2 id="proyectos">El mejor con presupuestos por proyecto: Everhour o Harvest</h2>
      <p>
        Si trabajás por proyecto cerrado más que por hora suelta, hay dos opciones sólidas — ambas
        en inglés y pensadas para equipos:
      </p>
      <ul>
        <li>
          <strong>Everhour</strong> se integra dentro de Asana, Jira, ClickUp o Trello y maneja
          presupuestos por proyecto. Ojo el precio para una persona: USD 8,50/usuario/mes{" "}
          <strong>con mínimo de 5 usuarios</strong> — unos USD 510 al año aunque trabajes solo.
        </li>
        <li>
          <strong>Harvest</strong> combina tiempo, gastos y facturación con cobro online; es la
          preferida histórica de agencias. En 2026 pasó a un modelo de precio por asiento (desde USD
          9/usuario/mes) <em>más</em> cargos por uso, y el free es de 1 usuario y 2 proyectos.
        </li>
      </ul>

      <h2 id="espanol">El mejor en español: Registruti o TrackingTime</h2>
      <p>
        Si el idioma es un requisito y no una preferencia, la lista se achica muchísimo — la mayoría
        de la categoría está solo en inglés:
      </p>
      <ul>
        <li>
          <strong>Registruti</strong>: 100% en español, enfocada en el freelancer que factura.
          Gratis para arrancar.
        </li>
        <li>
          <strong>TrackingTime</strong>: nacida en Buenos Aires, con interfaz en español y buen plan
          free para equipos chicos. No genera facturas, pero trackea y reporta muy bien (Starter USD
          5/usuario/mes).
        </li>
      </ul>

      <h2 id="tabla">La comparación en una tabla</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Time tracker</th>
              <th>Gratis para 1 persona</th>
              <th>Tarifas por cliente</th>
              <th>Facturas</th>
              <th>Español</th>
              <th>Cronómetro</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Registruti</strong>
              </td>
              <td>Sí (3 clientes, 4 facturas)</td>
              <td>Sí, con moneda propia</td>
              <td>Sí, PDF + link público</td>
              <td>Sí</td>
              <td>No (bloques de 15 min)</td>
            </tr>
            <tr>
              <td>
                <strong>Toggl Track</strong>
              </td>
              <td>Sí (sin tarifas)</td>
              <td>Desde Starter (USD 9/mes)</td>
              <td>No</td>
              <td>No</td>
              <td>Sí, excelente</td>
            </tr>
            <tr>
              <td>
                <strong>Clockify</strong>
              </td>
              <td>Sí (sin facturación)</td>
              <td>En planes pagos</td>
              <td>Desde Standard (USD 6,99/mes)</td>
              <td>Parcial</td>
              <td>Sí</td>
            </tr>
            <tr>
              <td>
                <strong>TrackingTime</strong>
              </td>
              <td>Sí</td>
              <td>En planes pagos</td>
              <td>No</td>
              <td>Sí</td>
              <td>Sí</td>
            </tr>
            <tr>
              <td>
                <strong>Everhour</strong>
              </td>
              <td>Limitado (sin integraciones)</td>
              <td>Sí, en plan Team</td>
              <td>Sí, en plan Team (mín. 5 usuarios)</td>
              <td>No</td>
              <td>Sí</td>
            </tr>
            <tr>
              <td>
                <strong>Harvest</strong>
              </td>
              <td>1 usuario, 2 proyectos</td>
              <td>Sí</td>
              <td>Sí, con cobro online</td>
              <td>No</td>
              <td>Sí</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <em>Precios y condiciones a julio de 2026, según los sitios oficiales.</em>
      </p>

      <h2 id="errores">Tres errores al elegir time tracker</h2>
      <ul>
        <li>
          <strong>Elegir por el cronómetro y no por el cobro.</strong> El timer es la parte
          divertida; la factura es la que paga el alquiler. Evaluá el flujo completo: horas →
          reporte → factura → cliente.
        </li>
        <li>
          <strong>Mirar el “desde USD X” y no tu caso.</strong> Mínimos de usuarios, funciones clave
          en el plan caro, cargos por uso: calculá qué pagarías vos en un año real.
        </li>
        <li>
          <strong>Sobredimensionar.</strong> Si no tenés equipo, no necesitás permisos, aprobaciones
          ni GPS. Cada función que no usás es interfaz que te estorba y precio que subsidiás.
        </li>
      </ul>

      <p>
        ¿Todavía no llevás registro de tus horas? Antes de elegir herramienta, el hábito:{" "}
        <Link href="/blog/control-de-horas-trabajadas">
          cómo llevar el control de horas trabajadas sin que se te escape nada
        </Link>
        .
      </p>
    </>
  );
}
