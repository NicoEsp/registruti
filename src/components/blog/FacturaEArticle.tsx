import Link from "next/link";
import SumaTusHoras from "@/components/blog/SumaTusHoras";

/**
 * Cuerpo de "Factura E para exportar servicios: cómo hacerla en ARCA".
 * Se renderiza dentro de un contenedor `.article`.
 *
 * "Factura E" tiene 1.000 búsquedas por mes en Argentina. La busca el
 * freelance que cobra en dólares a un cliente de afuera, en el momento de
 * cobrar. Mismo criterio que la guía de factura C: el bloque de horas va
 * antes del paso a paso, y la guía evita montos, topes y normas cambiarias
 * que cambian seguido.
 */
export default function FacturaEArticle() {
  return (
    <>
      <p>
        <strong>La factura E</strong> es el comprobante de exportación. Si desde Argentina le
        prestás un servicio a una empresa o persona del exterior, y ese servicio se usa afuera, es
        una exportación de servicios: se factura con una factura E, en la moneda que pactaron, sin
        IVA, y la emitís desde “Comprobantes en línea” de ARCA (ex AFIP) igual que una factura C.
        Pueden emitirla tanto monotributistas como responsables inscriptos.
      </p>
      <p>
        Esta guía cubre lo que hace falta para la primera: cuándo corresponde una E y cuándo no,
        qué datos pedirle a tu cliente, el paso a paso en ARCA con los campos que son distintos a
        una factura local (tipo de exportación, moneda, cotización, identificación del receptor) y
        los errores típicos. Si tu cliente está en Argentina, la guía que buscás es la de{" "}
        <Link href="/blog/factura-c">la factura C</Link>.
      </p>

      <SumaTusHoras
        intro="Una factura E por servicios lleva un importe en la moneda del cliente, y ese importe sale de las horas del período multiplicadas por tu tarifa en esa moneda. Tenerlo cerrado antes de entrar a ARCA evita la factura con un número y el detalle con otro."
      />

      <h2 id="cuando">Cuándo corresponde una factura E (y cuándo no)</h2>
      <ul>
        <li>
          <strong>Sí:</strong> tu cliente está radicado en el exterior y el servicio se utiliza o
          explota efectivamente afuera. Una empresa de Estados Unidos para la que diseñás, una
          startup de España a la que le programás, una agencia de México que te subcontrata.
        </li>
        <li>
          <strong>Sí, también:</strong> plataformas del exterior que te pagan por tu trabajo
          (marketplaces de freelance, por ejemplo), cuando la relación comercial es con la
          plataforma y no con el cliente final.
        </li>
        <li>
          <strong>No:</strong> un cliente argentino que te paga en dólares. Eso es una venta local
          en moneda extranjera: factura C (o A/B si sos responsable inscripto) con la cotización.
        </li>
        <li>
          <strong>No:</strong> un cliente del exterior cuyo servicio se usa en Argentina (una
          empresa extranjera que te contrata para atender su operación local). Ahí no hay
          exportación; consultalo con tu contador porque el tratamiento depende del caso.
        </li>
      </ul>

      <h2 id="antes">Lo que necesitás antes de la primera</h2>
      <ol>
        <li>
          <strong>Estar inscripto</strong> en el monotributo o como responsable inscripto, con clave
          fiscal, domicilio fiscal electrónico, el servicio Comprobantes en línea y un punto de
          venta habilitado. Es lo mismo que para una factura C; si no lo tenés, está en{" "}
          <Link href="/blog/factura-c#antes">esa guía</Link>.
        </li>
        <li>
          <strong>Los datos de tu cliente:</strong> razón social o nombre completo, domicilio, país
          y su identificación tributaria (VAT, EIN, RFC, NIF, según el país). ARCA no la exige
          siempre, pero tu cliente va a querer verla en el comprobante.
        </li>
        <li>
          <strong>Lo que pactaron:</strong> moneda, importe, período del servicio y forma de pago.
          La factura tiene que decir lo mismo que el detalle de horas que le mandaste.
        </li>
        <li>
          <strong>Una cuenta donde cobrar</strong> en esa moneda: cuenta bancaria en dólares,
          PayPal, Wise, Payoneer o lo que use tu cliente. Lo que podés hacer después con los
          dólares depende de las normas cambiarias vigentes, que cambian seguido: ese punto va con
          tu contador y tu banco, no con esta guía.
        </li>
      </ol>

      <h2 id="paso-a-paso">Cómo hacer la factura E paso a paso</h2>

      <h3 id="paso-1">1. Generar comprobantes → Factura de exportación E</h3>
      <p>
        En Comprobantes en línea, entrá a “Generar comprobantes”, elegí tu punto de venta y, como
        tipo de comprobante, <strong>Factura de Exportación E</strong>. Si no aparece en la lista,
        revisá que el punto de venta esté habilitado para facturación en línea; en algunos casos
        hay que dar de alta uno específico para exportación.
      </p>

      <h3 id="paso-2">2. Datos de emisión</h3>
      <ul>
        <li>
          <strong>Fecha del comprobante.</strong> Hoy, o dentro del margen que permite el sistema.
        </li>
        <li>
          <strong>Tipo de exportación: Servicios.</strong> Es la opción que hace que no te pida
          permiso de embarque, incoterms ni datos de aduana, que son para bienes.
        </li>
        <li>
          <strong>Período del servicio</strong> y, si corresponde, vencimiento del pago.
        </li>
        <li>
          <strong>Moneda y cotización.</strong> Elegís la moneda pactada (dólar, euro, etc.). ARCA
          toma la cotización oficial del día hábil anterior y calcula el equivalente en pesos, que
          es el que cuenta para tu monotributo o tu IVA. No inventes la cotización: la del sistema
          es la que vale.
        </li>
      </ul>

      <h3 id="paso-3">3. Datos del receptor</h3>
      <ul>
        <li>
          <strong>País</strong> del cliente. Al elegirlo, el sistema asigna la CUIT genérica que
          ARCA usa para personas y empresas de ese país: no es la identificación de tu cliente,
          es la forma en que ARCA agrupa a los receptores del exterior.
        </li>
        <li>
          <strong>ID impositivo</strong> del cliente en su país (su VAT, EIN, RFC, NIF). Es el dato
          que tu cliente necesita ver en el comprobante para su propia contabilidad; cargalo aunque
          el campo no sea obligatorio.
        </li>
        <li>
          <strong>Razón social y domicilio</strong>, tal como figuran en sus documentos.
        </li>
        <li>
          <strong>Forma de pago</strong> e <strong>idioma</strong> si el sistema lo ofrece. El
          comprobante sale en español; podés escribir la descripción del servicio en inglés para
          que el área de pagos de tu cliente lo entienda sin traducir.
        </li>
      </ul>

      <h3 id="paso-4">4. Detalle de la operación</h3>
      <p>
        Igual que en una factura local: descripción, cantidad, unidad de medida y precio unitario,
        en la moneda elegida. Para horas de trabajo, la línea que mejor funciona es “UX design
        services, October 2026, 18.75 hours” con cantidad 18,75, unidad “horas” y tu tarifa como
        precio unitario. Si el cliente paga una comisión de la plataforma de cobro, no la
        descuentes acá: la factura es por el servicio completo; la comisión es un gasto tuyo.
      </p>

      <h3 id="paso-5">5. Resumen, CAE y envío</h3>
      <p>
        Revisá moneda, importe, período e ID del cliente, y confirmá. La factura queda emitida con
        su CAE y no se puede modificar: un error se corrige con una{" "}
        <strong>Nota de crédito E</strong> y una factura nueva. Descargá el PDF y mandáselo al
        cliente junto con el detalle de horas, que es lo que suele aprobar primero.
      </p>

      <h2 id="despues">Después de emitirla</h2>
      <ul>
        <li>
          <strong>Monotributo:</strong> el equivalente en pesos (a la cotización de la factura) suma
          al total anual que define tu categoría. Un freelance que cobra en dólares puede pasarse
          del tope sin darse cuenta: llevá la cuenta mes a mes.
        </li>
        <li>
          <strong>Responsable inscripto:</strong> la exportación de servicios no genera IVA
          débito, y el tratamiento del crédito fiscal y de ingresos brutos tiene reglas propias.
          Es terreno de tu contador.
        </li>
        <li>
          <strong>El cobro:</strong> acreditá el pago en la cuenta que elegiste y marcá el período
          como pagado en tu registro de horas, para que el mes siguiente arranque de cero.
        </li>
      </ul>

      <h2 id="errores">Errores comunes</h2>
      <ul>
        <li>
          <strong>Factura C en vez de E.</strong> Es el más común y el que más cuesta corregir.
          Si el cliente está afuera y el servicio se usa afuera, es E.
        </li>
        <li>
          <strong>Importe en pesos.</strong> La factura va en la moneda pactada; el equivalente en
          pesos lo calcula el sistema con la cotización oficial.
        </li>
        <li>
          <strong>Sin la identificación del cliente.</strong> Para ARCA alcanza con el país; para el
          departamento de pagos de tu cliente, no. Cargá su ID impositivo.
        </li>
        <li>
          <strong>La factura dice una cosa y el detalle otra.</strong> Mismo período, mismas horas,
          misma moneda, mismo total. Si registrás las horas por día, esto cierra solo.
        </li>
        <li>
          <strong>Cotizar en pesos y convertir.</strong> Para un cliente del exterior la tarifa se
          fija en su mercado y en su moneda; en la{" "}
          <Link href="/cuanto-cobrar-por-hora">calculadora de cuánto cobrar por hora</Link> hay una
          sección sobre clientes del exterior.
        </li>
      </ul>

      <h2 id="invoice">La factura E y el invoice en inglés</h2>
      <p>
        A tu cliente del exterior la factura E le sirve como comprobante, pero muchas veces su
        proceso de pagos pide además un <em>invoice</em>: un documento con sus datos, los tuyos, el
        detalle del servicio, el importe en su moneda y cómo pagarte. Son dos documentos con un
        mismo total: el invoice para que aprueben el pago, la factura E para ARCA.
      </p>
      <p>
        En <Link href="/">Registruti</Link> el invoice se genera desde las horas que cargaste para
        ese cliente, en su moneda (dólar, euro, libra y 6 más), con el detalle por día, tu
        identificación fiscal, tus datos de pago (cuenta, PayPal, Wise…) y un link público para que
        lo vea sin crear cuenta. Es el documento comercial; la factura E la seguís haciendo en
        ARCA con ese total. <Link href="/invoice-de-ejemplo">Así se ve uno</Link>.
      </p>

      <p>
        <em>
          Esta guía describe el procedimiento general vigente a octubre de 2026. Las pantallas de
          ARCA, los topes del monotributo y, sobre todo, las normas sobre qué hacer con lo cobrado
          en moneda extranjera cambian seguido: confirmalos con tu contador antes de la primera
          factura.
        </em>
      </p>
    </>
  );
}
