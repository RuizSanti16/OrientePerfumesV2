import { Link } from 'react-router-dom';
import PaginaLegal, { Seccion, P, Lista, Dato } from './PaginaLegal';
import { EMPRESA } from '../datosEmpresa';

/* Terminos y Condiciones de venta.

   Recoge lo que el Estatuto del Consumidor (Ley 1480 de 2011) exige
   informar en una venta a distancia: quien vende, precios, plazos de
   entrega, garantia, derecho de retracto y reversion del pago.

   Los plazos de envio y devolucion coinciden con los que ya anuncia el
   FAQ; si cambian alli, hay que cambiarlos aqui tambien. */
export default function Terminos() {
  return (
    <PaginaLegal titulo="Términos y Condiciones">

      <Seccion titulo="Quién vende">
        <div style={{ margin: '4px 0' }}>
          <Dato etiqueta="Razón social" valor={EMPRESA.nombre} />
          <Dato etiqueta="Identificación" valor={EMPRESA.identificacion} />
          <Dato etiqueta="Dirección" valor={`${EMPRESA.direccion}, ${EMPRESA.ciudad}, ${EMPRESA.pais}`} />
          <Dato etiqueta="Teléfono" valor={EMPRESA.telefono} />
          <Dato etiqueta="Correo" valor={EMPRESA.correo} />
        </div>
        <P>
          Al realizar un pedido en {EMPRESA.sitio} usted acepta estos términos.
        </P>
      </Seccion>

      <Seccion titulo="Productos y precios">
        <P>
          Todos los precios están expresados en pesos colombianos (COP) e
          incluyen los impuestos aplicables. Los costos de envío, cuando
          apliquen, se muestran antes de confirmar el pedido.
        </P>
        <P>
          Procuramos que las fotografías y descripciones sean fieles, pero el
          color puede variar ligeramente según la pantalla. Los precios y la
          disponibilidad pueden cambiar sin previo aviso; el precio que rige es
          el vigente al momento de confirmar el pedido.
        </P>
        <P>
          Si un producto queda sin existencias después de su compra, le
          avisaremos y podrá elegir entre esperar, cambiarlo o recibir el
          reembolso completo.
        </P>
      </Seccion>

      <Seccion titulo="Pedidos y pago">
        <P>
          El pedido se confirma cuando recibe el correo con su código de
          seguimiento. Puede consultar su estado en cualquier momento desde la
          sección de seguimiento, usando ese código.
        </P>
        <P>
          Nos reservamos el derecho de cancelar un pedido cuando exista un error
          evidente en el precio, sospecha de fraude o imposibilidad de verificar
          los datos de entrega. En ese caso se reembolsa la totalidad de lo
          pagado.
        </P>
      </Seccion>

      <Seccion titulo="Envíos">
        <P>
          Los plazos de entrega son estimados y empiezan a contar desde la
          confirmación del pago. Pueden verse afectados por causas ajenas a
          nosotros, como el operador logístico o condiciones de la zona de
          destino.
        </P>
        <P>
          La dirección de entrega es responsabilidad del comprador. Si el envío
          se devuelve por una dirección incorrecta o por ausencia reiterada, el
          costo del nuevo despacho corre por cuenta del comprador.
        </P>
      </Seccion>

      <Seccion titulo="Derecho de retracto">
        <P>
          En las compras a distancia usted puede retractarse dentro de los
          <strong> cinco (5) días hábiles</strong> siguientes a la entrega, sin
          necesidad de justificar su decisión, conforme al artículo 47 de la Ley
          1480 de 2011.
        </P>
        <P>
          Para ejercerlo, escríbanos a {EMPRESA.correo} dentro de ese plazo. El
          producto debe devolverse en las mismas condiciones en que lo recibió,
          sin usar y en su empaque original. Por tratarse de perfumería, un
          producto con el sello roto no puede aceptarse, ya que no es posible
          devolverlo al mercado.
        </P>
        <P>
          Recibida y verificada la devolución, se reintegra el dinero dentro de
          los treinta (30) días calendario siguientes. Los costos de transporte
          de la devolución corren por cuenta del comprador.
        </P>
      </Seccion>

      <Seccion titulo="Reversión del pago">
        <P>
          Cuando la compra se pague con tarjeta o cualquier medio electrónico,
          usted puede solicitar la reversión del pago en los casos previstos en
          el artículo 51 de la Ley 1480 de 2011: fraude, operación no
          solicitada, producto no recibido, producto distinto al pedido o
          defectuoso.
        </P>
        <P>
          La solicitud debe presentarse dentro de los cinco (5) días hábiles
          siguientes a que tenga conocimiento del hecho, ante nosotros y ante la
          entidad emisora de su medio de pago.
        </P>
      </Seccion>

      <Seccion titulo="Garantía">
        <P>
          Todos los productos cuentan con la garantía legal establecida en la
          Ley 1480 de 2011 frente a defectos de fábrica o de calidad. No cubre
          el deterioro por uso normal, el mal uso, ni la insatisfacción con la
          fragancia, que es una apreciación personal y varía con la piel de cada
          persona.
        </P>
        <Lista items={[
          'Si recibe un producto equivocado, dañado o incompleto, avísenos dentro de los cinco días siguientes a la entrega adjuntando fotografías.',
          'Verificado el caso, se repone el producto o se reembolsa el valor pagado, a su elección.',
        ]} />
      </Seccion>

      <Seccion titulo="Autenticidad">
        <P>
          Comercializamos productos originales. Cuando un producto se ofrece
          como alternativa inspirada en otra fragancia, se indica de forma
          expresa en su ficha y no se presenta como el original ni se atribuye
          a su casa perfumista.
        </P>
      </Seccion>

      <Seccion titulo="Datos personales">
        <P>
          El tratamiento de sus datos se rige por nuestra{' '}
          <Link to="/politica-de-datos" style={{ color: '#C9A84C' }}>
            Política de Tratamiento de Datos Personales
          </Link>, que forma parte de estos términos.
        </P>
      </Seccion>

      <Seccion titulo="Propiedad intelectual">
        <P>
          Los textos, fotografías, logotipos y diseño de este sitio son
          propiedad de {EMPRESA.nombre} o se usan con autorización. Las marcas
          de los productos pertenecen a sus respectivos titulares y se muestran
          únicamente con fines identificativos.
        </P>
      </Seccion>

      <Seccion titulo="Ley aplicable">
        <P>
          Estos términos se rigen por la legislación colombiana. Cualquier
          controversia se someterá a los jueces competentes de {EMPRESA.ciudad}.
          Ante una reclamación, le pedimos contactarnos primero a
          {' '}{EMPRESA.correo}: casi todo se resuelve mucho antes de llegar a
          instancias formales.
        </P>
      </Seccion>

    </PaginaLegal>
  );
}
