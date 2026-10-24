import Link from "next/link";
import SumaTusHoras from "@/components/blog/SumaTusHoras";

/**
 * Cuerpo de "Factura C en ARCA: cómo hacerla paso a paso (monotributo)".
 * Se renderiza dentro de un contenedor `.article`.
 *
 * "Factura C" tiene 5.200 búsquedas por mes en Argentina y la hace el
 * freelance en el momento de cobrar, que es cuando necesita saber cuántas
 * horas trabajó. Por eso el bloque "antes de facturar, sumá tus horas" va
 * antes del paso a paso, no al final.
 *
 * El procedimiento describe las pantallas de Comprobantes en línea a octubre
 * de 2026. ARCA cambia nombres, topes y categorías: la guía evita montos y
 * porcentajes a propósito y manda a confirmar lo que cambia.
 */
export default function FacturaCArticle() {
  return (
    <>
      <p>
        <strong>La factura C</strong> es el comprobante que emiten los monotributistas (y los
        sujetos exentos de IVA) por lo que venden y por los servicios que prestan. No discrimina
        IVA, se emite de forma electrónica desde el sitio de ARCA (ex AFIP) con tu clave fiscal, y
        cada una recibe un CAE, el código que la valida. Si sos freelance y estás en el
        monotributo, es la factura que le hacés a todos tus clientes de Argentina, sean empresas
        responsables inscriptas, otros monotributistas o consumidores finales.
      </p>
      <p>
        Esta guía es el paso a paso completo para hacerla desde “Comprobantes en línea”: qué
        necesitás tener habilitado antes de la primera, qué poner en cada pantalla cuando lo que
        facturás son horas de trabajo, y los errores que se repiten. Si tu cliente está en el
        exterior, lo que corresponde es otra cosa:{" "}
        <Link href="/blog/factura-e-servicios-al-exterior">la factura E de exportación</Link>.
      </p>

      <SumaTusHoras
        intro="Una factura C por servicios lleva un importe, y ese importe sale de una cuenta que conviene tener cerrada antes de abrir ARCA: las horas del período por cliente, multiplicadas por la tarifa."
      />

      <h2 id="que-es">Qué es la factura C y quién la emite</h2>
      <p>
        Las letras de las facturas dicen quién le factura a quién. La <strong>A</strong> y la{" "}
        <strong>B</strong> las emiten los responsables inscriptos en IVA (la A a otros inscriptos,
        la B a consumidores finales y monotributistas). La <strong>C</strong> la emiten quienes no
        están inscriptos en IVA: monotributistas y sujetos exentos, a cualquier tipo de receptor.
        Por eso no discrimina IVA: el precio que ponés es el total que cobra el cliente.
      </p>
      <ul>
        <li>
          <strong>La emitís vos si</strong> estás en el monotributo y le vendés o prestás un
          servicio a alguien en Argentina.
        </li>
        <li>
          <strong>Tu cliente puede ser cualquiera:</strong> una empresa responsable inscripta, otro
          monotributista, un exento o un consumidor final. Lo que cambia es qué condición frente
          al IVA elegís para él y qué documento le pedís (CUIT o DNI).
        </li>
        <li>
          <strong>No la usás</strong> para un cliente del exterior que usa el servicio afuera: eso es
          exportación de servicios y va con factura E, también en Comprobantes en línea.
        </li>
      </ul>

      <h2 id="antes">Lo que necesitás tener antes de la primera</h2>
      <ol>
        <li>
          <strong>CUIT y clave fiscal.</strong> La clave la sacás con la app de ARCA desde el
          celular, con el DNI. Es la que usás para todo lo que sigue.
        </li>
        <li>
          <strong>Alta en el monotributo</strong> con tu actividad declarada y tu domicilio fiscal
          electrónico constituido. Si todavía no te diste de alta, ese es el paso previo y lo
          conviene hacer con tu contador: la categoría depende de cuánto facturás al año.
        </li>
        <li>
          <strong>El servicio “Comprobantes en línea” habilitado.</strong> Suele venir incluido;
          si no aparece en tu panel, se agrega desde “Administrador de Relaciones de Clave Fiscal”.
        </li>
        <li>
          <strong>Un punto de venta.</strong> Es el número que va adelante de cada factura (el
          “00001” de “00001-00000023”). Se crea una sola vez, desde “Administración de puntos de
          venta y domicilios”: agregás uno, le ponés un nombre, elegís como sistema la facturación
          en línea para monotributo (o “Comprobantes en línea”) y le asociás tu domicilio fiscal.
        </li>
      </ol>
      <p>
        Opcional pero recomendable: en Comprobantes en línea, “Datos adicionales del comprobante”
        te deja cargar una vez tu nombre de fantasía, el número de ingresos brutos y la fecha de
        inicio de actividades, que salen impresos en todas las facturas.
      </p>

      <h2 id="paso-a-paso">Cómo hacer la factura C paso a paso</h2>

      <h3 id="paso-1">1. Entrá a Comprobantes en línea</h3>
      <p>
        En el sitio de ARCA, ingresá con CUIT y clave fiscal, buscá “Comprobantes en línea” y
        elegí tu nombre cuando te pregunte a quién representás. Vas a ver tres opciones que
        importan: <strong>Generar comprobantes</strong>, <strong>Consultas</strong> y{" "}
        <strong>Datos adicionales del comprobante</strong>.
      </p>

      <h3 id="paso-2">2. Elegí punto de venta y tipo de comprobante</h3>
      <p>
        En “Generar comprobantes”, seleccioná tu punto de venta y, en tipo de comprobante,{" "}
        <strong>Factura C</strong>. Si querés cancelar una factura ya emitida, acá mismo está la{" "}
        <strong>Nota de crédito C</strong>; si el cliente te pagó de más o de menos, la nota de
        débito. Continuar.
      </p>

      <h3 id="paso-3">3. Datos de emisión</h3>
      <ul>
        <li>
          <strong>Fecha del comprobante.</strong> Normalmente, hoy. El sistema permite un margen de
          pocos días hacia atrás o hacia adelante; si te pasás, no deja continuar.
        </li>
        <li>
          <strong>Concepto.</strong> Productos, Servicios, o Productos y servicios. Si facturás
          horas de trabajo, es <strong>Servicios</strong>, y al elegirlo aparecen dos campos más.
        </li>
        <li>
          <strong>Período facturado</strong> (desde y hasta): el mes o las semanas que estás
          cobrando. Tiene que coincidir con el período del detalle de horas que le mandaste al
          cliente.
        </li>
        <li>
          <strong>Vencimiento para el pago.</strong> La fecha hasta la que el cliente tiene para
          pagarte, según lo que acordaron.
        </li>
        <li>
          <strong>Actividad</strong> (si tenés más de una declarada) y <strong>moneda</strong>:
          pesos, salvo que hayan pactado en otra moneda con un cliente local, en cuyo caso el
          sistema pide la cotización.
        </li>
      </ul>

      <h3 id="paso-4">4. Datos del receptor</h3>
      <ul>
        <li>
          <strong>Condición frente al IVA</strong> de tu cliente: IVA Responsable Inscripto (la
          mayoría de las empresas), Monotributista, IVA Sujeto Exento o Consumidor Final. Si no
          sabés, preguntale: una empresa te lo dice al toque, y figura en su constancia de
          inscripción.
        </li>
        <li>
          <strong>Documento.</strong> CUIT para empresas y monotributistas; DNI para un
          consumidor final. Al cargar el CUIT, el sistema completa la razón social y el domicilio
          desde el padrón. A partir de cierto monto también hay que identificar a los consumidores
          finales, así que tené el DNI a mano.
        </li>
        <li>
          <strong>Condición de venta.</strong> Contado, transferencia bancaria, cuenta corriente,
          etc. Es informativo; elegí lo que corresponda a cómo te van a pagar.
        </li>
      </ul>

      <h3 id="paso-5">5. Datos de la operación: el detalle</h3>
      <p>
        Acá va qué le cobrás. Cada línea tiene descripción, cantidad, unidad de medida, precio
        unitario y, opcionalmente, una bonificación. Para horas de trabajo hay dos formas válidas:
      </p>
      <ul>
        <li>
          <strong>Una línea por el total:</strong> descripción “Servicios de diseño UX, octubre
          2026 (18,75 horas)”, cantidad 1, unidad “unidad”, precio unitario el total.
        </li>
        <li>
          <strong>Horas como cantidad:</strong> descripción “Hora de consultoría UX, octubre 2026”,
          cantidad 18,75, unidad “horas”, precio unitario tu tarifa. El sistema multiplica.
        </li>
      </ul>
      <p>
        Las dos son correctas; la segunda hace que la factura y el detalle de horas que le mandaste
        al cliente digan exactamente lo mismo, que es lo que evita preguntas. Escribí la
        descripción como la leería el área de pagos de tu cliente: qué servicio, qué período.
        “Trabajo realizado” no le sirve a nadie.
      </p>

      <h3 id="paso-6">6. Resumen y confirmación</h3>
      <p>
        La última pantalla muestra todo junto. Revisá tres cosas antes de confirmar: el período, el
        CUIT del receptor y el total. Al confirmar, ARCA asigna el <strong>CAE</strong> y su fecha
        de vencimiento, y la factura queda emitida: no se puede editar ni borrar, solo anular con
        una nota de crédito. Descargá el PDF y mandáselo a tu cliente junto con el detalle de horas.
      </p>

      <h3 id="paso-7">7. Después: consultar, anular, controlar el tope</h3>
      <ul>
        <li>
          En <strong>Consultas</strong> podés buscar cualquier comprobante emitido por fecha o
          número y volver a bajar el PDF.
        </li>
        <li>
          Si te equivocaste, emitís una <strong>Nota de crédito C</strong> por el mismo importe,
          asociada a la factura, y hacés la factura de nuevo.
        </li>
        <li>
          Cada factura suma al total anual que define tu <strong>categoría</strong> del monotributo.
          Llevá la cuenta: la recategorización es dos veces al año, y pasarse del tope de la última
          categoría te saca del régimen.
        </li>
      </ul>

      <h2 id="errores">Errores comunes al hacer una factura C</h2>
      <ul>
        <li>
          <strong>Elegir “Productos” cuando facturás servicios.</strong> Sin el período facturado y
          el vencimiento, la factura queda mal confeccionada y a tu cliente se la pueden observar.
        </li>
        <li>
          <strong>El período no coincide con las horas.</strong> Si el detalle que mandaste dice
          “del 1 al 31 de octubre”, la factura dice lo mismo. Las horas se registran por día
          justamente para que esto cierre solo.
        </li>
        <li>
          <strong>Condición frente al IVA equivocada.</strong> Un responsable inscripto cargado como
          consumidor final te va a pedir que la anules y la hagas de nuevo.
        </li>
        <li>
          <strong>Factura C a un cliente del exterior.</strong> Si el cliente está afuera y usa el
          servicio afuera, va factura E. La C en ese caso es un problema fiscal y, además, el
          cliente suele necesitar un comprobante con sus datos y en su moneda.
        </li>
        <li>
          <strong>Facturar de memoria.</strong> Es el error que más plata cuesta: las horas que no
          anotaste el mismo día no se recuperan. En la{" "}
          <Link href="/blog/control-de-horas-trabajadas">guía de control de horas trabajadas</Link>{" "}
          está el método y una planilla gratis.
        </li>
      </ul>

      <h2 id="invoice-y-factura">La factura C y el invoice: dos documentos, un mismo total</h2>
      <p>
        La factura C es el comprobante fiscal: la emite ARCA, lleva CAE y es lo que tu cliente
        registra en su contabilidad. El <em>invoice</em> o detalle de horas es el documento
        comercial: qué hiciste, qué día, cuánto tardaste y cuánto sale, para que el cliente lo
        revise y apruebe. Lo habitual es mandar los dos: el detalle para que nadie discuta el monto,
        la factura para cobrarlo.
      </p>
      <p>
        En <Link href="/">Registruti</Link> el detalle se arma solo desde las horas que cargaste:
        elegís cliente y período, y sale el invoice en PDF con una línea por día, la tarifa, el
        total y tus datos de pago, más un link público para que el cliente lo vea sin crear cuenta.
        El invoice no reemplaza la factura C (y lo dice al pie); te da el número exacto para
        hacerla y el respaldo de dónde salió.{" "}
        <Link href="/invoice-de-ejemplo">Así se ve uno</Link>.
      </p>

      <p>
        <em>
          Esta guía describe el procedimiento general vigente a octubre de 2026. Los nombres de las
          pantallas, los topes de identificación de consumidores finales y las categorías del
          monotributo cambian: antes de tu primera factura, confirmalos en el sitio de ARCA o con tu
          contador.
        </em>
      </p>
    </>
  );
}
