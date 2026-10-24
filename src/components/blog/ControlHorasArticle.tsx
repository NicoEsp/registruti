import Link from "next/link";

/**
 * Cuerpo de "Control de horas trabajadas: guía y planilla gratis".
 * Se renderiza dentro de un contenedor `.article`.
 *
 * Para "control de horas trabajadas" Google no muestra guías: muestra una
 * respuesta generada con IA y después herramientas (la calculadora de Jibble,
 * una app de Google Play, plantillas de Excel). Este post compite con lo
 * mismo que ellas (planilla para descargar, fórmulas, calculadora, ejemplo
 * completo) sin perder lo que las otras no tienen: le habla al freelancer que
 * se controla solo y cobra sus horas, no a la empresa que controla empleados.
 *
 * La planilla la genera scripts/plantillas/control-de-horas.py; el ejemplo de
 * la semana es el mismo acá, en la planilla y en el mock de la landing
 * (23:45 en total), para que las tres piezas cuenten la misma historia.
 */

const PLANILLA_URL = "/plantillas/control-de-horas-trabajadas.xlsx";

const WEEK = [
  { day: "Lunes 19", client: "Estudio Galley", task: "Auditoría de producto: revisión del onboarding", span: "9:00 – 12:30", rest: "—", hours: "3:30" },
  { day: "Lunes 19", client: "Baratie Labs", task: "Discovery: entrevistas a usuarios (2)", span: "14:00 – 16:00", rest: "—", hours: "2:00" },
  { day: "Lunes 19", client: "All Blue Ventures", task: "Sesión de mentoría", span: "17:00 – 17:45", rest: "—", hours: "0:45" },
  { day: "Martes 20", client: "Estudio Galley", task: "Auditoría: informe de hallazgos", span: "9:00 – 12:00", rest: "—", hours: "3:00" },
  { day: "Martes 20", client: "Baratie Labs", task: "Roadmap Q3: priorización", span: "15:00 – 16:30", rest: "—", hours: "1:30" },
  { day: "Miércoles 21", client: "Estudio Galley", task: "Presentación de la auditoría al equipo", span: "10:00 – 11:30", rest: "—", hours: "1:30" },
  { day: "Miércoles 21", client: "Baratie Labs", task: "Discovery: síntesis y oportunidades", span: "14:00 – 18:00", rest: "0:30", hours: "3:30" },
  { day: "Jueves 22", client: "Estudio Galley", task: "Propuesta de rediseño del checkout", span: "9:00 – 11:45", rest: "—", hours: "2:45" },
  { day: "Jueves 22", client: "Mi negocio (no facturable)", task: "Propuesta comercial para un cliente nuevo", span: "16:00 – 17:00", rest: "—", hours: "1:00" },
  { day: "Viernes 23", client: "Baratie Labs", task: "Roadmap Q3: documento final", span: "9:00 – 12:15", rest: "—", hours: "3:15" },
  { day: "Viernes 23", client: "All Blue Ventures", task: "Sesión de mentoría", span: "15:00 – 16:00", rest: "—", hours: "1:00" },
];

const WEEK_TOTALS = [
  { client: "Estudio Galley", hours: "10:45", decimal: "10,75", rate: "USD 40", amount: "USD 430,00" },
  { client: "Baratie Labs", hours: "10:15", decimal: "10,25", rate: "USD 45", amount: "USD 461,25" },
  { client: "All Blue Ventures", hours: "1:45", decimal: "1,75", rate: "USD 60", amount: "USD 105,00" },
  { client: "Mi negocio (no facturable)", hours: "1:00", decimal: "1,00", rate: "USD 0", amount: "USD 0,00" },
];

export default function ControlHorasArticle() {
  return (
    <>
      <p>
        <strong>El control de horas trabajadas</strong> es anotar, cada día, cuándo empezaste,
        cuándo terminaste, cuánto descansaste y para qué cliente fue cada bloque, y sumar eso por
        día, por semana y por cliente. Para un freelance que cobra por hora es, literalmente, la
        base de la factura; para el que cobra por proyecto, la única forma de saber si el proyecto
        fue negocio.
      </p>
      <p>
        Esta guía trae las tres cosas que hacen falta para llevarlo sin que se te escape nada: una{" "}
        <a href="#planilla">planilla gratis</a> para Excel y Google Sheets con las fórmulas
        armadas, el <a href="#excel">cálculo explicado paso a paso</a> (incluida la cuenta de los
        minutos, que es donde todo el mundo se equivoca) y el <a href="#metodo">método</a> para
        que el registro no se abandone a la segunda semana. Al final, un{" "}
        <a href="#ejemplo">ejemplo completo</a> de una semana registrada que termina en la
        factura.
      </p>

      <h2 id="planilla">La planilla gratis para descargar (Excel y Google Sheets)</h2>
      <div className="not-prose rounded-2xl border border-indigo-100 bg-indigo-50/50 p-5 sm:p-6">
        <p className="text-base font-semibold text-slate-900">
          Planilla de control de horas trabajadas
        </p>
        <p className="mt-1 text-sm text-slate-600">
          Una fila por bloque de trabajo: fecha, cliente, tarea, entrada, salida y descanso. Las
          horas en hh:mm y en decimal, la tarifa del cliente y el importe se calculan solos. Una
          hoja de clientes con su tarifa y su moneda, y un resumen por cliente y por rango de
          fechas. Viene con la semana de ejemplo de este artículo cargada.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <a
            href={PLANILLA_URL}
            download
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md hover:from-indigo-700 hover:to-indigo-600"
          >
            Descargar la planilla (.xlsx)
          </a>
          <span className="text-xs text-slate-500">Gratis, sin registro. 41 KB.</span>
        </div>
      </div>
      <p>
        <strong>Para usarla en Google Sheets:</strong> subí el archivo a Google Drive, abrilo con
        Google Sheets y elegí <em>Archivo → Guardar como hoja de cálculo de Google</em>. Las
        fórmulas funcionan igual (son las mismas en Excel, Sheets, LibreOffice y Numbers).
      </p>
      <p>Qué tiene adentro:</p>
      <ul>
        <li>
          <strong>Hoja Horas:</strong> fecha, cliente, tarea, entrada, salida, descanso y si es
          facturable. Las columnas grises se calculan solas: horas en hh:mm, horas en decimal,
          tarifa del cliente e importe. 400 filas listas, con filtros.
        </li>
        <li>
          <strong>Hoja Clientes:</strong> cada cliente con su tarifa por hora y su moneda. La hoja
          Horas la busca por el nombre, así que no tenés que escribir la tarifa en cada fila.
        </li>
        <li>
          <strong>Hoja Resumen:</strong> horas, horas facturables e importe por cliente, el total,
          y un bloque “entre dos fechas” para ver una semana, un mes o el período de una factura.
        </li>
      </ul>

      <h2 id="excel">Cómo calcular las horas trabajadas en Excel (o en Google Sheets)</h2>
      <p>
        Si preferís armar tu propia planilla, estas son las cuatro fórmulas que importan. Excel
        guarda las horas como fracción de un día (12:00 es 0,5), y de ahí salen las dos reglas de
        oro: <strong>las celdas de hora van en formato de hora</strong>, y{" "}
        <strong>para pasar a decimal se multiplica por 24</strong>.
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>A</th>
              <th>B</th>
              <th>C</th>
              <th>D</th>
              <th>E</th>
              <th>F</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>1</strong>
              </td>
              <td>Fecha</td>
              <td>Entrada</td>
              <td>Salida</td>
              <td>Descanso</td>
              <td>Horas</td>
              <td>Decimal</td>
            </tr>
            <tr>
              <td>
                <strong>2</strong>
              </td>
              <td>19/10/2026</td>
              <td>9:00</td>
              <td>17:30</td>
              <td>0:45</td>
              <td>
                <code>=C2-B2-D2</code>
              </td>
              <td>
                <code>=E2*24</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>3</strong>
              </td>
              <td>20/10/2026</td>
              <td>22:00</td>
              <td>2:00</td>
              <td>0:00</td>
              <td>
                <code>=MOD(C3-B3;1)-D3</code>
              </td>
              <td>
                <code>=E3*24</code>
              </td>
            </tr>
            <tr>
              <td>
                <strong>4</strong>
              </td>
              <td>
                <strong>Total</strong>
              </td>
              <td></td>
              <td></td>
              <td></td>
              <td>
                <code>=SUMA(E2:E3)</code>
              </td>
              <td>
                <code>=E4*24</code>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <ol>
        <li>
          <strong>Horas de un día:</strong> <code>=salida-entrada-descanso</code>, con las tres
          celdas en formato de hora. La fila 2 da <strong>7:45</strong>.
        </li>
        <li>
          <strong>Turnos que pasan la medianoche:</strong> <code>=MOD(salida-entrada;1)-descanso</code>
          . Sin el <code>MOD</code>, de 22:00 a 2:00 da un número negativo; con él, da{" "}
          <strong>4:00</strong>. (En Excel en inglés o en Google Sheets, los argumentos se separan
          con coma en vez de punto y coma.)
        </li>
        <li>
          <strong>Total del período:</strong> <code>=SUMA()</code> sobre la columna de horas, y a
          la celda del total le ponés el formato personalizado <code>[h]:mm</code>. Los corchetes
          son lo que permite que un total pase de 24 horas: sin ellos, 38:45 se muestra como
          14:45.
        </li>
        <li>
          <strong>A decimal, para multiplicar por la tarifa:</strong> <code>=horas*24</code>. 7:45
          se convierte en <strong>7,75</strong>, y <code>=7,75*tarifa</code> es el importe. El error
          clásico es escribir 7,45 como si fueran 7 horas y 45 minutos: en decimal, 7,45 son 7
          horas y 27 minutos, y a 40 por hora la diferencia son 12 por día.
        </li>
      </ol>
      <p>
        Si no querés armar nada, la planilla de arriba ya trae estas fórmulas, más la búsqueda de
        la tarifa por cliente y el resumen.
      </p>

      <div className="not-prose flex flex-wrap gap-3">
        <Link
          href="/calculadora-de-horas-trabajadas"
          className="rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-md hover:from-indigo-700 hover:to-indigo-600"
        >
          Calculadora de horas trabajadas →
        </Link>
        <Link
          href="/cuanto-cobrar-por-hora"
          className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 no-underline hover:bg-slate-50"
        >
          ¿Cuánto cobrar por hora? →
        </Link>
      </div>
      <p>
        La primera suma la semana con entrada, salida y descansos, y te devuelve el total en hh:mm,
        en decimal y en plata. La segunda es para el otro número de la cuenta: la tarifa.
      </p>

      <h2 id="por-que">Por qué llevar registro de horas (aunque cobres por proyecto)</h2>
      <ul>
        <li>
          <strong>Cobrás más.</strong> Quien registra sus horas el mismo día factura más que quien
          reconstruye la semana el viernes. El trabajo chico no registrado (revisiones, llamadas,
          idas y vueltas) es típicamente entre un 10% y un 20% del total.
        </li>
        <li>
          <strong>Estimás mejor.</strong> Después de un mes de registro sabés cuánto te lleva{" "}
          <em>de verdad</em> una landing, una migración o una sesión de consultoría. Tus
          presupuestos dejan de ser adivinanzas.
        </li>
        <li>
          <strong>Discutís menos.</strong> Cuando el cliente pregunta “¿por qué esta factura?”, un
          detalle de horas con fechas y descripciones cierra la conversación antes de que empiece.
        </li>
        <li>
          <strong>Descubrís qué cliente te conviene.</strong> Plata por cliente dividido horas por
          cliente es tu tarifa efectiva real. A veces el cliente “grande” es el que peor paga la
          hora.
        </li>
      </ul>
      <p>
        ¿Todavía no definiste el modelo de cobro? En la guía sobre{" "}
        <Link href="/blog/cobrar-por-hora-o-por-proyecto">cobrar por hora o por proyecto</Link>{" "}
        está cuándo conviene cada uno y cómo cotizar un proyecto sin regalar horas. En los dos
        casos, las horas se registran igual.
      </p>

      <h2 id="metodo">El método: 5 reglas</h2>

      <h3 id="regla-1">1. Registrá el mismo día, siempre</h3>
      <p>
        La regla de oro. No hace falta un cronómetro corriendo mientras trabajás: alcanza con cerrar
        el día cargando tus bloques. Lo que sí es innegociable es{" "}
        <strong>no dejarlo para mañana</strong>: la precisión de tu memoria sobre el día de hoy es
        alta; sobre el martes pasado, casi nula. Ponete un ancla (al cerrar la compu, con el último
        café) y que sea un hábito de 2 minutos.
      </p>

      <h3 id="regla-2">2. Usá bloques de 15 minutos</h3>
      <p>
        Registrar al minuto es falsa precisión y fricción real. El estándar de la industria (el que
        usan los estudios jurídicos y contables hace décadas) es el cuarto de hora: una llamada de
        20 minutos se registra como 0:30 o 0:15, decidilo con un criterio fijo y listo. Los bloques
        hacen que cargar sea rápido, que los decimales se sumen de memoria (0,25, 0,50, 0,75) y que
        los reportes cierren en números redondos.
      </p>

      <h3 id="regla-3">3. Escribí descripciones que tu cliente pueda leer</h3>
      <p>
        La descripción de cada entrada tiene doble función: tu memoria y el detalle de la factura.
        La fórmula que funciona: <strong>verbo + entregable concreto</strong>.
      </p>
      <ul>
        <li>❌ “trabajo en el proyecto”: no le dice nada a nadie.</li>
        <li>
          ✅ “Diseño de la pantalla de checkout, primera versión”: tu cliente lo lee en la factura
          y entiende qué pagó.
        </li>
      </ul>

      <h3 id="regla-4">4. Etiquetá cliente y facturable en el momento</h3>
      <p>
        Cada entrada necesita dos datos más: <strong>de qué cliente es</strong> y{" "}
        <strong>si es facturable o no</strong>. Las horas no facturables (tu web, propuestas,
        administración) también se registran: son las que te muestran tu tarifa efectiva real y
        cuánto te cuesta conseguir cada proyecto. En la planilla, eso es el cliente “Mi negocio”
        con tarifa cero.
      </p>

      <h3 id="regla-5">5. Cerrá la semana con una revisión de 5 minutos</h3>
      <p>
        El viernes (o el lunes a la mañana), mirá el total semanal: ¿están todos los días con carga?
        ¿Hay algún día en cero que sabés que trabajaste? ¿El reparto entre clientes coincide con lo
        pactado? Esta revisión corta es la que garantiza que a fin de mes la factura salga en un
        clic y sin sorpresas.
      </p>

      <h2 id="ejemplo">Ejemplo completo: una semana registrada, de las horas a la factura</h2>
      <p>
        Una diseñadora UX freelance con tres clientes. Así queda su semana del 19 al 23 de octubre
        en la planilla (es el ejemplo que viene cargado):
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Día</th>
              <th>Cliente</th>
              <th>Tarea</th>
              <th>Entrada – salida</th>
              <th>Descanso</th>
              <th>Horas</th>
            </tr>
          </thead>
          <tbody>
            {WEEK.map((row, i) => (
              <tr key={i}>
                <td>{row.day}</td>
                <td>{row.client}</td>
                <td>{row.task}</td>
                <td style={{ whiteSpace: "nowrap" }}>{row.span}</td>
                <td>{row.rest}</td>
                <td>
                  <strong>{row.hours}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p>
        Total de la semana: <strong>23:45</strong>, de las cuales <strong>22:45</strong> son
        facturables. Por día, las horas trabajadas son 6:15, 4:30, 5:00, 3:45 y 4:15: un promedio
        de 4:45 por día, y de 4:33 facturables, dentro del rango normal de un freelance a tiempo
        completo. Agrupado por cliente, con la tarifa de cada uno, queda así (la hoja Resumen de la
        planilla hace esa suma sola: horas, horas facturables e importe por cliente):
      </p>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Horas</th>
              <th>Decimal</th>
              <th>Tarifa</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            {WEEK_TOTALS.map((row) => (
              <tr key={row.client}>
                <td>{row.client}</td>
                <td>{row.hours}</td>
                <td>{row.decimal}</td>
                <td>{row.rate}</td>
                <td>
                  <strong>{row.amount}</strong>
                </td>
              </tr>
            ))}
            <tr>
              <td>
                <strong>Total facturable</strong>
              </td>
              <td>
                <strong>22:45</strong>
              </td>
              <td>
                <strong>22,75</strong>
              </td>
              <td></td>
              <td>
                <strong>USD 996,25</strong>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        Y así termina: a fin de mes, las cuatro semanas de Estudio Galley se convierten en una
        factura con el detalle por día, la tarifa y el total, que el cliente puede verificar línea
        por línea.{" "}
        <Link href="/invoice-de-ejemplo">Este es el invoice de ejemplo</Link> que genera
        Registruti con exactamente esos datos: cada fila es una entrada de horas como las de la
        tabla de arriba. Con la planilla, ese último paso lo hacés a mano: copiás las filas del
        cliente a una plantilla de factura y revisás que los números cierren.
      </p>

      <h2 id="herramienta">¿Planilla o app? Elegí según tu momento</h2>
      <div className="overflow-x-auto">
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Planilla (Sheets/Excel)</th>
              <th>App de time tracking</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>Costo</strong>
              </td>
              <td>Gratis</td>
              <td>Gratis a ~USD 10/mes según la herramienta</td>
            </tr>
            <tr>
              <td>
                <strong>Carga diaria</strong>
              </td>
              <td>Manual, fácil de abandonar</td>
              <td>Segundos, pensada para el hábito</td>
            </tr>
            <tr>
              <td>
                <strong>Totales por cliente y período</strong>
              </td>
              <td>Fórmulas que mantenés vos</td>
              <td>Automáticos</td>
            </tr>
            <tr>
              <td>
                <strong>Tarifas y monedas distintas</strong>
              </td>
              <td>Se complica rápido</td>
              <td>Por cliente, sin cuentas aparte</td>
            </tr>
            <tr>
              <td>
                <strong>Factura</strong>
              </td>
              <td>La armás a mano cada vez</td>
              <td>Se genera desde las horas</td>
            </tr>
            <tr>
              <td>
                <strong>Control de qué ya facturaste</strong>
              </td>
              <td>Columna extra y disciplina</td>
              <td>Automático por estado</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        La planilla es un gran punto de partida con un solo cliente. El límite aparece con el
        segundo y el tercero: tarifas distintas, monedas distintas, y la pregunta “¿estas horas ya
        las facturé?” que la planilla no responde sola.
      </p>
      <p>
        El paso siguiente no tiene por qué costar plata. <Link href="/">Registruti</Link> es el
        software gratis para control de horas trabajadas pensado para este flujo: cada cliente con
        su tarifa y su moneda, las horas en una vista semanal en bloques de 15 minutos, los
        reportes por cliente y período, y el invoice en PDF generado desde esas horas, con un link
        público para que tu cliente vea el detalle sin crear cuenta. El plan gratis incluye hasta 3
        clientes activos y 4 invoices, y está en español de punta a punta (sí, este blog es nuestro:
        sesgo declarado). Si querés comparar con otras opciones, en la{" "}
        <Link href="/blog/mejores-time-trackers-freelancers">
          guía de los mejores time trackers para freelancers
        </Link>{" "}
        están todas, incluidas las que tienen cronómetro.
      </p>

      <h2 id="errores">Errores comunes (y cómo evitarlos)</h2>
      <ul>
        <li>
          <strong>Reconstruir la semana el viernes.</strong> Es el error más caro. Solución: ancla
          diaria de 2 minutos.
        </li>
        <li>
          <strong>No registrar el trabajo “chico”.</strong> Mails, llamadas, revisiones: 15 minutos
          acá y allá son horas a fin de mes. Si fue para el cliente, se anota.
        </li>
        <li>
          <strong>Confundir 7,45 con 7:45.</strong> Los minutos se dividen por 60 antes de
          multiplicar por la tarifa. La columna “decimal” de la planilla existe para esto.
        </li>
        <li>
          <strong>Descripciones crípticas.</strong> “ajustes” no le sirve a tu yo del futuro ni a
          tu cliente. Verbo + entregable.
        </li>
        <li>
          <strong>Mezclar todo en una sola tarifa.</strong> Cada cliente con su tarifa y su moneda;
          si no, el reporte miente.
        </li>
        <li>
          <strong>Herramienta sobredimensionada.</strong> Si el sistema exige configurar proyectos,
          etiquetas, categorías y aprobaciones, lo abandonás en dos semanas. Elegí lo mínimo que
          cierre el ciclo horas → factura.
        </li>
      </ul>

      <h2 id="empezar">Empezá hoy: checklist de 10 minutos</h2>
      <ol>
        <li>
          Elegí la herramienta: <a href="#planilla">la planilla</a> o la app. Decidido en 2
          minutos, sin parálisis.
        </li>
        <li>
          Cargá tus clientes con su tarifa por hora y su moneda. Si todavía no tenés tarifa,{" "}
          <Link href="/cuanto-cobrar-por-hora">calculá cuánto cobrar por hora</Link> antes de
          cargar el primero: son dos minutos y evita arrancar con un número inventado.
        </li>
        <li>Registrá lo que hiciste hoy, en bloques de 15 minutos, con verbo + entregable.</li>
        <li>Definí tu ancla diaria (por ejemplo, al cerrar la compu).</li>
        <li>Agendá la revisión semanal de 5 minutos.</li>
      </ol>
      <p>
        En un mes vas a tener algo que hoy no tenés: datos reales sobre tu trabajo. Y la próxima
        factura va a salir de un reporte, no de tu memoria.
      </p>
    </>
  );
}
