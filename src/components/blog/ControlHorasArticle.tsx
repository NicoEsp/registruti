import Link from "next/link";

/**
 * Cuerpo de "Cómo llevar el control de horas trabajadas: guía para freelancers".
 * Se renderiza dentro de un contenedor `.article`.
 */
export default function ControlHorasArticle() {
  return (
    <>
      <p>
        Si trabajás por tu cuenta y cobrás por hora (o estimás proyectos en base a horas), el
        control de horas trabajadas no es burocracia: <strong>es la diferencia entre cobrar lo que
        trabajaste y cobrar lo que te acordás</strong>. Y la memoria siempre juega en contra: los
        mails “rápidos”, la llamada de 40 minutos, el bug que apareció un sábado — todo eso se
        evapora si no queda anotado.
      </p>
      <p>
        Esta guía es el método completo: qué anotar, cada cuánto, con qué herramienta, y cómo
        convertir esas horas en facturas. Sin teoría de productividad — solo lo que funciona cuando
        el tiempo es literalmente tu inventario.
      </p>

      <h2 id="por-que">Por qué llevar registro de horas (aunque cobres por proyecto)</h2>
      <ul>
        <li>
          <strong>Cobrás más.</strong> Los estudios sobre freelancers coinciden en algo intuitivo:
          quien registra sus horas el mismo día factura más que quien reconstruye la semana el
          viernes. El trabajo chico no registrado —revisiones, llamadas, idas y vueltas— es
          típicamente entre un 10% y un 20% del total.
        </li>
        <li>
          <strong>Estimás mejor.</strong> Después de un mes de registro sabés cuánto te lleva
          <em> de verdad</em> una landing, una migración o una sesión de consultoría. Tus
          presupuestos dejan de ser adivinanzas.
        </li>
        <li>
          <strong>Discutís menos.</strong> Cuando el cliente pregunta “¿por qué esta factura?”, un
          detalle de horas con fechas y descripciones cierra la conversación antes de que empiece.
        </li>
        <li>
          <strong>Descubrís qué cliente te conviene.</strong> Horas por cliente ÷ plata por cliente
          = tu tarifa efectiva real. A veces el cliente “grande” es el que peor paga la hora.
        </li>
      </ul>

      <h2 id="metodo">El método: 5 reglas</h2>

      <h3 id="regla-1">1. Registrá el mismo día, siempre</h3>
      <p>
        La regla de oro. No hace falta un cronómetro corriendo mientras trabajás: alcanza con cerrar
        el día cargando tus bloques. Lo que sí es innegociable es <strong>no dejarlo para mañana</strong>:
        la precisión de tu memoria sobre el día de hoy es alta; sobre el martes pasado, casi nula.
        Ponete un ancla — al cerrar la compu, con el último café — y que sea un hábito de 2 minutos.
      </p>

      <h3 id="regla-2">2. Usá bloques de 15 minutos</h3>
      <p>
        Registrar al minuto es falsa precisión y fricción real. El estándar de la industria (y el
        que usan los estudios jurídicos y contables hace décadas) es el cuarto de hora: una llamada
        de 20 minutos se registra como 0:30 o 0:15, decidilo con un criterio fijo y listo. Los
        bloques hacen que cargar sea rápido y que los reportes cierren en números redondos.
      </p>

      <h3 id="regla-3">3. Escribí descripciones que tu cliente pueda leer</h3>
      <p>
        La descripción de cada entrada tiene doble función: tu memoria y el detalle de la factura.
        La fórmula que funciona: <strong>verbo + entregable concreto</strong>.
      </p>
      <ul>
        <li>
          ❌ “trabajo en el proyecto” — no le dice nada a nadie.
        </li>
        <li>
          ✅ “Diseño de la pantalla de checkout — primera versión” — tu cliente lo lee en la factura
          y entiende qué pagó.
        </li>
      </ul>

      <h3 id="regla-4">4. Etiquetá cliente y facturable en el momento</h3>
      <p>
        Cada entrada necesita dos datos más: <strong>de qué cliente es</strong> y{" "}
        <strong>si es facturable o no</strong>. Las horas no facturables (tu web, propuestas,
        administración) también se registran: son las que te muestran tu tarifa efectiva real y
        cuánto te cuesta conseguir cada proyecto.
      </p>

      <h3 id="regla-5">5. Cerrá la semana con una revisión de 5 minutos</h3>
      <p>
        El viernes (o el lunes a la mañana), mirá el total semanal: ¿están todos los días con carga?
        ¿Hay algún día en cero que sabés que trabajaste? ¿El reparto entre clientes coincide con lo
        pactado? Esta revisión corta es la que garantiza que a fin de mes la factura salga en un
        clic y sin sorpresas.
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
        las facturé?” que la planilla no responde sola. Si estás en ese punto, compará opciones en{" "}
        <Link href="/blog/mejores-time-trackers-freelancers">
          nuestra guía de los mejores time trackers para freelancers
        </Link>
        .
      </p>

      <h2 id="a-factura">De las horas a la factura (el paso que casi todos hacen a mano)</h2>
      <p>
        El registro de horas tiene un objetivo final: <strong>cobrar</strong>. El proceso completo
        es: horas registradas → reporte del período por cliente → factura con el detalle → cliente
        que la recibe y la entiende. En la mayoría de las herramientas, los últimos dos pasos son
        manuales: exportás un reporte, lo pegás en una plantilla de factura, revisás que los números
        cierren.
      </p>
      <p>
        En <a href="https://registruti.app">Registruti</a> ese camino es un clic: elegís cliente y
        período, y la factura se arma desde tus horas con numeración automática, PDF y un link
        público donde tu cliente ve cada hora con su descripción — sin crear cuenta. Es gratis y en
        español; la hicimos exactamente para este flujo (y sí, este blog es nuestro — sesgo
        declarado).
      </p>

      <h2 id="errores">Errores comunes (y cómo evitarlos)</h2>
      <ul>
        <li>
          <strong>Reconstruir la semana el viernes.</strong> Es el error #1 y el más caro. Solución:
          ancla diaria de 2 minutos.
        </li>
        <li>
          <strong>No registrar el trabajo “chico”.</strong> Mails, llamadas, revisiones: 15 minutos
          acá y allá son horas a fin de mes. Si fue para el cliente, se anota.
        </li>
        <li>
          <strong>Descripciones crípticas.</strong> “ajustes” no le sirve a tu yo del futuro ni a tu
          cliente. Verbo + entregable.
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
        <li>Elegí la herramienta (planilla o app — decidido en 2 minutos, sin parálisis).</li>
        <li>Cargá tus clientes con su tarifa por hora y su moneda.</li>
        <li>Registrá lo que hiciste hoy, en bloques de 15 minutos, con verbo + entregable.</li>
        <li>Definí tu ancla diaria (ej.: al cerrar la compu).</li>
        <li>Agendá la revisión semanal de 5 minutos.</li>
      </ol>
      <p>
        En un mes vas a tener algo que hoy no tenés: datos reales sobre tu trabajo. Y la próxima
        factura va a salir de un reporte, no de tu memoria.
      </p>
    </>
  );
}
