import PaginaLegal, { Seccion, P, Lista, Dato } from './PaginaLegal';
import { EMPRESA } from '../datosEmpresa';

/* Politica de Tratamiento de Datos Personales.

   Redactada segun la Ley 1581 de 2012 y el Decreto 1377 de 2013, que
   obligan a publicarla a quien recoja datos personales en Colombia.
   El contenido describe lo que la tienda hace de verdad: los datos que
   pide el checkout, el registro de clientes y las valoraciones. Si esos
   flujos cambian, hay que revisar esta pagina.

   No sustituye la revision de un abogado antes de publicarla. */
export default function PoliticaDatos() {
  return (
    <PaginaLegal titulo="Política de Tratamiento de Datos Personales">

      <Seccion titulo="Responsable del tratamiento">
        <P>
          De acuerdo con la Ley 1581 de 2012 y el Decreto 1377 de 2013, el
          responsable del tratamiento de sus datos personales es:
        </P>
        <div style={{ margin: '14px 0 4px' }}>
          <Dato etiqueta="Razón social" valor={EMPRESA.nombre} />
          <Dato etiqueta="Identificación" valor={EMPRESA.identificacion} />
          <Dato etiqueta="Dirección" valor={`${EMPRESA.direccion}, ${EMPRESA.ciudad}, ${EMPRESA.pais}`} />
          <Dato etiqueta="Teléfono" valor={EMPRESA.telefono} />
          <Dato etiqueta="Correo" valor={EMPRESA.correoDatos} />
        </div>
      </Seccion>

      <Seccion titulo="Qué datos recogemos">
        <P>Recogemos únicamente los datos necesarios para vender y entregar:</P>
        <Lista items={[
          'Al hacer un pedido: nombre, correo electrónico, teléfono, dirección de entrega y ciudad.',
          'Al crear una cuenta: nombre de usuario, correo electrónico y contraseña. La contraseña se guarda cifrada y no es legible ni siquiera para nosotros.',
          'Al valorar un producto: el nombre que usted escriba y su comentario.',
          'Al escribirnos: los datos de contacto que incluya en su mensaje.',
        ]} />
        <P>
          No pedimos ni almacenamos datos de tarjetas de crédito. Los pagos en
          línea se procesan a través de la pasarela de pago, que recibe esos
          datos directamente y no los comparte con nosotros.
        </P>
      </Seccion>

      <Seccion titulo="Para qué los usamos">
        <Lista items={[
          'Procesar, preparar y entregar su pedido.',
          'Informarle del estado de su compra y responder sus consultas.',
          'Cumplir obligaciones legales, contables y tributarias.',
          'Enviarle información comercial sobre productos y promociones, únicamente si lo autoriza de forma separada.',
        ]} />
        <P>
          No usamos sus datos para fines distintos de los anteriores, ni los
          vendemos ni los cedemos a terceros con fines comerciales.
        </P>
      </Seccion>

      <Seccion titulo="Con quién los compartimos">
        <P>
          Solo con quienes hacen falta para completar su compra, y limitándonos
          a lo imprescindible:
        </P>
        <Lista items={[
          'La empresa de transporte, para entregar el pedido: nombre, dirección y teléfono.',
          'La pasarela de pago, para procesar el cobro.',
          'El proveedor de alojamiento web, donde reside la base de datos.',
          'Autoridades competentes, cuando exista una obligación legal de entregarlos.',
        ]} />
      </Seccion>

      <Seccion titulo="Sus derechos">
        <P>Como titular de los datos, usted puede en cualquier momento:</P>
        <Lista items={[
          'Conocer qué datos suyos tenemos y cómo los usamos.',
          'Actualizarlos o rectificarlos cuando sean inexactos o estén incompletos.',
          'Solicitar que los eliminemos, salvo cuando una obligación legal nos exija conservarlos.',
          'Revocar la autorización que nos dio para tratarlos.',
          'Presentar quejas ante la Superintendencia de Industria y Comercio.',
        ]} />
        <P>
          Para ejercerlos, escríbanos a <strong>{EMPRESA.correoDatos}</strong> indicando
          su nombre, su solicitud y un dato que permita identificar su pedido o
          su cuenta. Las consultas se responden en un plazo máximo de diez días
          hábiles y los reclamos en quince, prorrogables conforme a la ley.
        </P>
      </Seccion>

      <Seccion titulo="Cuánto tiempo los conservamos">
        <P>
          Los datos de una compra se conservan mientras dure la relación
          comercial y después durante el tiempo que exijan las obligaciones
          contables y tributarias. Los de una cuenta, hasta que usted solicite
          eliminarla.
        </P>
      </Seccion>

      <Seccion titulo="Seguridad">
        <P>
          El sitio funciona sobre conexión cifrada (HTTPS), las contraseñas se
          almacenan con un algoritmo de cifrado irreversible y el acceso a la
          base de datos está restringido. Ninguna medida es infalible, pero
          mantenemos las razonables para proteger su información.
        </P>
      </Seccion>

      <Seccion titulo="Cookies y almacenamiento local">
        <P>
          Este sitio no utiliza cookies de publicidad ni de seguimiento, y no
          comparte su navegación con terceros con fines comerciales.
        </P>
        <P>
          Sí usa el almacenamiento local de su navegador para que la tienda
          funcione: recordar los productos del carrito y mantener la sesión
          iniciada. Esa información se queda en su dispositivo, puede borrarla
          desde su navegador, y al hacerlo solo perderá el contenido del
          carrito.
        </P>
      </Seccion>

      <Seccion titulo="Cambios en esta política">
        <P>
          Si modificamos esta política publicaremos la nueva versión en esta
          misma página, con su fecha de actualización. Cuando el cambio afecte
          la finalidad del tratamiento, se lo comunicaremos antes de aplicarlo.
        </P>
      </Seccion>

    </PaginaLegal>
  );
}
