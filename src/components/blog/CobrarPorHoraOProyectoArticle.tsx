import Link from "next/link";

/**
 * Cuerpo de "¿Cobrar por hora o por proyecto? Cómo decidir y cotizar cada uno".
 * Se renderiza dentro de un contenedor `.article`.
 *
 * Es el satélite de /cuanto-cobrar-por-hora: la calculadora resuelve la
 * tarifa, este post la pregunta que viene después. Los dos terminan en el
 * mismo lugar: registrar las horas, sea cual sea el modelo de cobro.
 */
export default function CobrarPorHoraOProyectoArticle() {
  return (
    <>
      <p>
        Es la pregunta que viene justo después de{" "}
        <Link href="/cuanto-cobrar-por-hora">cuánto cobrar por hora</Link>: ya tenés un número, ¿y
        ahora se lo cobrás al cliente por hora o le pasás un precio cerrado? La respuesta corta es{" "}
        <strong>las dos cosas, según el trabajo</strong>. La larga es esta guía: cuándo conviene
        cada modelo, cómo cotizar un proyecto sin regalar horas, qué hacer con el trabajo que se
        sale del alcance y cómo se factura cada uno.
      </p>
      <p>
        Un aviso antes de arrancar: elijas lo que elijas, vas a necesitar dos cosas. Tu tarifa por
        hora, porque es la base de cualquier cotización aunque el cliente nunca la vea. Y tus horas
        registradas, porque sin ellas no sabés si un proyecto fue negocio o beneficencia.
      </p>

      <h2 id="respuesta-corta">La respuesta corta</h2>
      <ul>
        <li>
          <strong>Por hora</strong> cuando el alcance es abierto o cambia seguido: soporte,
          mantenimiento, consultoría, horas a demanda, o un cliente nuevo con el que todavía no
          sabés cuánto lleva lo que pide.
        </li>
        <li>
          <strong>Por proyecto</strong> cuando el alcance está cerrado por escrito y ya hiciste ese
          tipo de trabajo antes, así que podés estimar las horas con un margen de error razonable.
        </li>
        <li>
          <strong>Retainer mensual</strong> cuando hay trabajo recurrente todos los meses: un monto
          fijo por una cantidad de horas o de entregables, con un tope claro.
        </li>
      </ul>

      <h2 id="por-hora">Cobrar por hora: cuándo conviene y cuándo no</h2>
      <p>
        Cobrar por hora es el modelo más simple y el que menos riesgo te deja a vos: trabajás,
        registrás, facturás lo registrado.
      </p>
      <p>
        <strong>A favor:</strong>
      </p>
      <ul>
        <li>
          El riesgo de estimar mal es del cliente, no tuyo. Si algo lleva el doble, cobrás el doble.
        </li>
        <li>Cada cambio de alcance se cobra solo: no hay que renegociar, solo registrar.</li>
        <li>
          Es fácil de justificar. Un detalle de horas con fecha y descripción cierra la mayoría de
          las discusiones antes de que empiecen.
        </li>
      </ul>
      <p>
        <strong>En contra:</strong>
      </p>
      <ul>
        <li>
          Castiga tu eficiencia. Cuanto más rápido resolvés algo, menos cobrás por resolverlo, y
          con los años te volvés cada vez más rápido.
        </li>
        <li>
          Tu ingreso tiene techo: horas facturables por tarifa, y las horas facturables de un día
          son entre 4 y 6, no 8.
        </li>
        <li>
          El cliente mira el reloj. Cada mail y cada llamada es una decisión de gasto para él, y
          eso desgasta la relación.
        </li>
      </ul>
      <p>
        <strong>La condición para que funcione</strong> es registrar las horas el mismo día, con
        una descripción que el cliente pueda leer en la factura. Si reconstruís la semana el
        viernes, subfacturás entre un 10% y un 20% sin darte cuenta: el mail “rápido”, la llamada
        de 40 minutos y la revisión del sábado no aparecen. Cómo hacerlo sin que se te escape nada
        está en{" "}
        <Link href="/blog/control-de-horas-trabajadas">la guía de control de horas trabajadas</Link>
        .
      </p>

      <h2 id="por-proyecto">Cobrar por proyecto: cuándo conviene y cuándo no</h2>
      <p>
        Cobrar por proyecto (o precio cerrado) invierte el riesgo: el cliente sabe exactamente
        cuánto va a pagar, y vos asumís la diferencia si estimaste mal.
      </p>
      <p>
        <strong>A favor:</strong>
      </p>
      <ul>
        <li>
          Cobrás por el resultado, no por el tiempo. Si lo resolvés en la mitad de las horas, la
          ganancia es tuya.
        </li>
        <li>
          Se vende más fácil: “la landing cuesta 1.200” es una decisión; “cobro 35 la hora y
          calculo que son unas 30 horas” es una negociación.
        </li>
        <li>
          Desacopla tu ingreso de tus horas, que es la única forma de crecer sin trabajar más.
        </li>
      </ul>
      <p>
        <strong>En contra:</strong>
      </p>
      <ul>
        <li>
          El riesgo de estimar mal es tuyo. Y todos estimamos mal para el mismo lado: de menos.
        </li>
        <li>
          El alcance se estira solo si no está por escrito. “Un cambio chico más” es la frase que
          más plata les hizo perder a los freelancers.
        </li>
        <li>
          Necesitás experiencia previa en ese tipo de trabajo. Cotizar cerrado algo que nunca
          hiciste es apostar, no cotizar.
        </li>
      </ul>
      <p>
        <strong>La condición para que funcione</strong> es que el alcance esté definido por escrito
        antes de arrancar (qué incluye, qué no, cuántas rondas de revisión) y que puedas estimar las
        horas con un margen de error de más o menos un 20%. Si no podés, todavía no es un proyecto:
        es trabajo por hora.
      </p>

      <h2 id="como-cotizar">Cómo cotizar un proyecto sin regalar horas</h2>
      <p>
        El precio de un proyecto no se inventa mirando lo que cobra la competencia: se construye
        desde tu tarifa por hora. Cinco pasos:
      </p>
      <ol>
        <li>
          <strong>Desglosá el trabajo en etapas y estimá las horas de cada una.</strong> Nadie
          estima bien en bloque: “una landing, 20 horas” es un deseo. “Relevamiento 3, wireframe 4,
          diseño 8, desarrollo 10, ajustes 5” es una estimación, y además te muestra dónde está el
          riesgo.
        </li>
        <li>
          <strong>Multiplicá por tu tarifa por hora.</strong> La que te dio{" "}
          <Link href="/cuanto-cobrar-por-hora">la calculadora</Link>, no la que te parece que el
          cliente va a aceptar. Si el número te da miedo, el problema es la tarifa o el cliente, no
          la cuenta.
        </li>
        <li>
          <strong>Sumá un colchón de riesgo.</strong> Entre un 15% y un 30% según cuánta
          incertidumbre haya: más si el cliente es nuevo, si el brief es vago o si dependés de
          terceros (contenido que tiene que mandar el cliente, accesos, aprobaciones).
        </li>
        <li>
          <strong>Escribí el alcance.</strong> Qué incluye, qué no, cuántas rondas de revisión, qué
          pasa con lo que se pide por fuera (se cotiza aparte, a tu tarifa por hora) y qué necesitás
          del cliente y para cuándo. Una página alcanza. Sin esa página, el colchón no alcanza
          nunca.
        </li>
        <li>
          <strong>Cobrá por hitos.</strong> Un anticipo antes de empezar (entre el 30% y el 50%),
          pagos por entrega y el saldo al cierre. Un proyecto que se cobra todo al final es un
          préstamo sin interés que le hacés al cliente.
        </li>
      </ol>
      <p>
        <strong>Ejemplo:</strong> una landing estimada en 30 horas a una tarifa de USD 35 son USD
        1.050. Con un 20% de colchón, USD 1.260. Si al terminar el registro de horas dice 24, tu
        tarifa efectiva fue de USD 52,50: el proyecto salió bien. Si dice 45, fue de USD 28: por
        debajo de tu tarifa, y la próxima cotización de una landing arranca de 45 horas, no de 30.
      </p>
      <p>Ese último párrafo es la razón por la que existe la sección siguiente.</p>

      <h2 id="trackea-igual">Trackeá las horas aunque cobres por proyecto</h2>
      <p>
        Es el error más común de quien pasa a precio cerrado: como el cliente no ve las horas, deja
        de registrarlas. Y pierde lo único que hace que la próxima cotización sea mejor que esta.
      </p>
      <ul>
        <li>
          <strong>Tarifa efectiva real.</strong> Precio del proyecto dividido por las horas reales.
          Es el único número que te dice si el proyecto fue negocio, y te lo dice por cliente: a
          veces el “grande” es el que peor paga la hora.
        </li>
        <li>
          <strong>Estimaciones que mejoran.</strong> Después de tres landings registradas sabés
          cuánto te lleva una landing. Sin registro, la cuarta la cotizás igual de mal que la
          primera.
        </li>
        <li>
          <strong>Respaldo cuando el alcance se estira.</strong> “Llevamos 12 horas en cambios que
          no estaban en el alcance” es una conversación con datos. Sin registro es una sensación.
        </li>
      </ul>
      <p>
        En <a href="https://registruti.app">Registruti</a> las horas se cargan igual sea cual sea
        el modelo: cada entrada con su cliente, su descripción y su duración en bloques de 15
        minutos. El reporte por cliente te muestra las horas y el monto a tu tarifa, y la
        comparación contra lo que cotizaste sale sola. (Sí, este blog es nuestro: sesgo declarado.)
      </p>

      <h2 id="retainer">El tercer modelo: retainer mensual</h2>
      <p>
        Cuando un cliente te necesita todos los meses (mantenimiento, contenido, soporte, horas de
        consultoría), el retainer es lo mejor para los dos: un monto fijo mensual por una cantidad
        de horas o de entregables. Para vos es ingreso previsible; para el cliente, un costo
        previsible y prioridad en tu agenda.
      </p>
      <p>Tres reglas para que no se convierta en “horas ilimitadas por precio fijo”:</p>
      <ul>
        <li>
          <strong>Tope explícito.</strong> “Hasta 20 horas por mes” o “hasta 4 piezas por mes”. Lo
          que pasa el tope se cobra a tu tarifa por hora.
        </li>
        <li>
          <strong>Las horas no usadas no se acumulan</strong> (o se acumulan un mes, máximo). Si el
          cliente no usa sus horas, es su decisión, no un crédito.
        </li>
        <li>
          <strong>Registro mensual visible.</strong> Un reporte de horas al cierre de cada mes evita
          la sensación de “¿y por qué te estoy pagando?” en los meses tranquilos.
        </li>
      </ul>

      <h2 id="facturar">Cómo se factura cada modelo</h2>
      <ul>
        <li>
          <strong>Por hora:</strong> la factura lleva el detalle de horas (fecha, descripción,
          duración), la tarifa y el total. Es lo que hace que el cliente entienda qué pagó. En
          Registruti elegís cliente y período y la factura se arma desde las horas registradas, con
          un link público para que el cliente vea el detalle sin crear cuenta.
        </li>
        <li>
          <strong>Por proyecto:</strong> una factura por hito, con la descripción del entregable y
          el monto acordado. El detalle de horas no va en la factura, pero lo tenés registrado como
          respaldo interno.
        </li>
        <li>
          <strong>Retainer:</strong> una factura fija por mes, más una factura aparte (por hora) por
          lo que haya pasado el tope.
        </li>
      </ul>

      <h2 id="decision">Decisión en 30 segundos</h2>
      <ul>
        <li>
          <strong>¿El alcance está cerrado por escrito y ya lo hiciste antes?</strong> Por
          proyecto, con colchón e hitos.
        </li>
        <li>
          <strong>¿El alcance es abierto, cambia seguido o es un cliente nuevo?</strong> Por hora,
          con registro diario.
        </li>
        <li>
          <strong>¿Es todos los meses?</strong> Retainer con tope.
        </li>
        <li>
          <strong>¿No tenés tarifa por hora todavía?</strong> Ninguno de los tres funciona sin
          ella: <Link href="/cuanto-cobrar-por-hora">calculala primero</Link>.
        </li>
      </ul>
      <p>
        Y en los tres casos, la misma regla: las horas se registran igual. Es lo que separa a un
        freelancer que cobra lo que trabaja de uno que cobra lo que se acuerda.
      </p>
    </>
  );
}
