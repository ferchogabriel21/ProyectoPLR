require("dotenv").config();
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 8080;

const SYSTEM_PROMPT = `
Eres Isabella Rojas, una asesora femenina, cálida, cercana, amable, clara, persuasiva y profesional que responde dudas por WhatsApp sobre el Pack Completo de Uñas de Glow Nails Academy.

Tu trabajo es responder dudas de forma NATURAL, BREVE y HUMANA, como si fueras una asesora real de belleza acompañando a una mujer que quiere aprender uñas desde casa.

IMPORTANTE:
- Nunca suenes robótica.
- Nunca respondas exactamente igual cada vez.
- Varía ligeramente las palabras y estructura.
- Mantén respuestas cálidas, claras y naturales.
- No escribas demasiado.
- Responde máximo en 1 o 2 párrafos cortos.
- Habla con seguridad, pero sin exagerar.
- Ayuda a resolver la duda y guía suavemente hacia la compra.
- Usa lenguaje simple, humano y femenino.
- Puedes usar emojis con moderación, especialmente 💅✨💕.

REGLAS:
- NO saludes.
- NO uses "Hola".
- NO hagas múltiples preguntas.
- NO hagas preguntas abiertas innecesarias.
- NO digas:
  - "¿Quieres saber más?"
  - "¿Te interesa?"
  - "¿Te gustaría?"
  - "¿Te ayudo en algo más?"
  - "¿Quieres que te cuente?"
- NO seas agresiva vendiendo.
- NO presiones.
- NO inventes información.
- NO menciones correo electrónico.
- NO digas que el producto es físico.
- NO digas que es contra entrega.
- NO digas que se entrega antes del pago.
- NO prometas ingresos garantizados.
- NO digas que va a conseguir clientas garantizadas.
- NO digas que va a vivir de las uñas en pocos días.
- NO digas que no necesita practicar.
- NO digas que el certificado es oficial.
- NO digas que el certificado es habilitante.
- NO digas que el certificado sirve como matrícula.
- NO digas que el curso habilita legalmente a trabajar.
- NO digas que reemplaza una habilitación oficial.
- NO digas que el resultado es inmediato o mágico.

INFORMACIÓN REAL DEL PRODUCTO:
- El producto se llama Pack Completo de Uñas.
- Es un producto digital.
- Pertenece a Glow Nails Academy.
- Está pensado para mujeres que quieren aprender uñas, manicuría, nail art y técnicas de belleza desde casa.
- Es apto para principiantes.
- También sirve para quienes ya tienen algo de experiencia y quieren perfeccionarse.
- Incluye acceso de por vida.
- Se puede ver desde celular, computadora o tablet.
- Las clases son grabadas en HD.
- No son clases en vivo.
- La alumna puede verlas a su ritmo y repetirlas las veces que quiera.
- El acceso se entrega por WhatsApp mediante un link de Google Drive.
- La entrega se realiza después de recibir el comprobante de pago.
- No se entrega antes del pago.
- No es contra entrega.
- El precio especial actual es de $7.800 ARS, pago único.
- No es mensual.
- No es donación.
- Es venta directa.

QUÉ INCLUYE:
- 50 clases HD pregrabadas, claras y paso a paso.
- Soft Gel.
- Manicuría y Pedicuría.
- Esmaltado Semipermanente.
- Manicura Rusa.
- Esculpidas en Acrílico.
- Kapping en Gel.
- Esculpidas en Gel.
- Esculpidas en Polygel.
- Sistema Dual / Esculpido French.
- Baby Boomer y Encapsulados.
- Retirado correcto.
- Manejo profesional del torno.
- 10 guías de técnicas avanzadas de manicuría.
- Lista completa de materiales y marcas recomendadas.
- Fichas prácticas de gastos, costos, turnos y finanzas.
- Bono especial: curso de maquillaje profesional.
- Certificado de participación.
- Asesoría personalizada.
- Acceso de por vida.
- Bonus por promoción: 10 guías de plantillas de Nail Art.
- Agenda 2026 para organizar el emprendimiento.

CERTIFICADO:
- Incluye certificado de participación.
- No es certificación oficial habilitante.
- No es título oficial.
- No es matrícula.
- No habilita legalmente a trabajar si eso depende de requisitos locales.
- Forma correcta de decirlo: "Incluye certificado de participación, no certificación oficial habilitante."

FORMAS DE PAGO:
- Transferencia.
- Mercado Pago.
- Pago Fácil o Rapipago, solo si está habilitado mediante Mercado Pago.

OBJETIVO:
Después de resolver la duda de forma amable y humana, dirige suavemente a la persona a realizar el pago para acceder al Pack Completo de Uñas.

El cierre debe sentirse natural, simple y seguro, nunca como presión de venta.

CIERRE IDEAL:
- Recordar que el precio es pago único de $7.800 ARS.
- Indicar que se entrega por WhatsApp después del comprobante.
- Preguntar de forma directa si prefiere abonar por Transferencia o Mercado Pago.
`;

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function elegirAleatoria(opciones) {
  return opciones[Math.floor(Math.random() * opciones.length)];
}

function limpiarRespuesta(texto) {
  texto = String(texto || "").trim();

  texto = texto
    .replace(/^¡?\s*hola\s*[😊🙏❤✨🌿💅💕,\.\!]*\s*/gi, "")
    .replace(/^gracias por preguntar\s*[😊🙏❤✨🌿💅💕,\.\!]*\s*/gi, "")
    .replace(/^buenos días\s*[😊🙏❤✨🌿💅💕,\.\!]*\s*/gi, "")
    .replace(/^buenos dias\s*[😊🙏❤✨🌿💅💕,\.\!]*\s*/gi, "")
    .replace(/^buenas tardes\s*[😊🙏❤✨🌿💅💕,\.\!]*\s*/gi, "")
    .replace(/^buenas noches\s*[😊🙏❤✨🌿💅💕,\.\!]*\s*/gi, "");

  texto = texto
    .replace(/¿[^?]*(quieres|querés|te interesa|te gustaría|te gustaria|te cuento|te explico|te ayudo|puedo ayudarte|hay algo más|hay algo mas|te parece|te comparto|te paso)[^?]*\?/gi, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return texto;
}

function cierrePago() {
  const cierres = [
    `\n\n💅 El Pack Completo de Uñas está en precio especial de $7.800 ARS, pago único. Se entrega por WhatsApp apenas envías el comprobante ✨\n¿Prefieres abonar por Transferencia o Mercado Pago?`,
    `\n\n✨ Para acceder hoy, el valor es de $7.800 ARS por pago único. Después del comprobante te envío el link completo por WhatsApp 💕\n¿Te paso los datos para Transferencia o Mercado Pago?`,
    `\n\n💕 Si deseas avanzar, puedes abonar $7.800 ARS por única vez y recibes el acceso completo por WhatsApp después de enviar el comprobante.\n¿Prefieres Transferencia o Mercado Pago?`,
  ];

  return elegirAleatoria(cierres);
}

function agregarCierre(texto) {
  const limpio = limpiarRespuesta(texto);

  if (!limpio) {
    return cierrePago();
  }

  return `${limpio}${cierrePago()}`;
}

function respuestaDirecta(textoNormalizado) {
  if (
    textoNormalizado.includes("incluye") ||
    textoNormalizado.includes("contiene") ||
    textoNormalizado.includes("trae") ||
    textoNormalizado.includes("pack") ||
    textoNormalizado.includes("curso") ||
    textoNormalizado.includes("clases") ||
    textoNormalizado.includes("tecnicas") ||
    textoNormalizado.includes("contenido") ||
    textoNormalizado.includes("bono") ||
    textoNormalizado.includes("bonus")
  ) {
    const respuestasIncluye = [
      `El pack es bastante completo 💅 Incluye 50 clases HD paso a paso, técnicas como Soft Gel, semipermanente, manicura rusa, acrílico, gel, polygel, kapping, Baby Boomer, encapsulados, torno y retirado correcto.\n\nTambién trae guías avanzadas, lista de materiales, fichas de costos y turnos, curso de maquillaje, certificado de participación, asesoría, acceso de por vida, plantillas de Nail Art y agenda 2026.`,
      `Incluye todo un recorrido para aprender desde casa y practicar a tu ritmo ✨ Son 50 clases HD, guías en PDF, lista de materiales, técnicas de manicuría, pedicuría, esculpidas, torno, Nail Art, fichas para organizar costos y turnos, más el bono de maquillaje profesional.`,
      `Vas a encontrar clases grabadas, guías y materiales complementarios para aprender paso a paso 💕 Incluye técnicas de uñas, Nail Art, lista de materiales, fichas para organizar el emprendimiento, asesoría personalizada, certificado de participación y acceso de por vida.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasIncluye));
  }

  if (
    textoNormalizado.includes("principiante") ||
    textoNormalizado.includes("principiantes") ||
    textoNormalizado.includes("desde cero") ||
    textoNormalizado.includes("empezando") ||
    textoNormalizado.includes("empezar") ||
    textoNormalizado.includes("experiencia") ||
    textoNormalizado.includes("nunca hice") ||
    textoNormalizado.includes("no se nada") ||
    textoNormalizado.includes("no sé nada")
  ) {
    const respuestasPrincipiante = [
      `Sí, está pensado para mujeres que quieren aprender desde casa, incluso si empiezan desde cero 💅 Las clases son paso a paso y puedes repetirlas todas las veces que necesites.`,
      `Sí, puedes empezar aunque no tengas experiencia ✨ La idea es que aprendas a tu ritmo, primero entendiendo las bases y después avanzando con técnicas más completas.`,
      `Claro, sirve para principiantes 💕 No necesitas saber antes. El material está organizado para que puedas mirar, practicar y volver a ver cada clase cuando lo necesites.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasPrincipiante));
  }

  if (
    textoNormalizado.includes("certificado") ||
    textoNormalizado.includes("certificacion") ||
    textoNormalizado.includes("diploma") ||
    textoNormalizado.includes("titulo") ||
    textoNormalizado.includes("oficial") ||
    textoNormalizado.includes("habilitante") ||
    textoNormalizado.includes("matricula") ||
    textoNormalizado.includes("matrícula")
  ) {
    const respuestasCertificado = [
      `Sí, incluye certificado de participación ✨ Es importante aclarar que no es una certificación oficial habilitante, ni reemplaza una matrícula o habilitación profesional.`,
      `El pack incluye certificado de participación 💅 No es un título oficial ni una certificación habilitante. Sirve como constancia de participación en la formación online.`,
      `Sí, vas a recibir certificado de participación 💕 No se presenta como certificación oficial ni habilitación estatal, porque eso depende de las normas de cada lugar.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasCertificado));
  }

  if (
    textoNormalizado.includes("envio") ||
    textoNormalizado.includes("enviar") ||
    textoNormalizado.includes("entrega") ||
    textoNormalizado.includes("entregan") ||
    textoNormalizado.includes("recibir") ||
    textoNormalizado.includes("recibo") ||
    textoNormalizado.includes("llega") ||
    textoNormalizado.includes("link") ||
    textoNormalizado.includes("drive") ||
    textoNormalizado.includes("google drive") ||
    textoNormalizado.includes("whatsapp") ||
    textoNormalizado.includes("archivo") ||
    textoNormalizado.includes("descargar") ||
    textoNormalizado.includes("digital") ||
    textoNormalizado.includes("fisico") ||
    textoNormalizado.includes("físico")
  ) {
    const respuestasEntrega = [
      `El pack es 100% digital 💅 Después de realizar el pago y enviar el comprobante, recibes el acceso completo por WhatsApp mediante un link de Google Drive.`,
      `La entrega se hace por WhatsApp ✨ Una vez que envías el comprobante de pago, te pasamos el link de Google Drive con todos los videos, guías y materiales.`,
      `No es físico ni contra entrega 💕 Es un material digital. Apenas se confirma el comprobante, recibes el acceso completo por WhatsApp para entrar desde tu celular, compu o tablet.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasEntrega));
  }

  if (
    textoNormalizado.includes("cuanto") ||
    textoNormalizado.includes("cuánto") ||
    textoNormalizado.includes("cuesta") ||
    textoNormalizado.includes("precio") ||
    textoNormalizado.includes("costo") ||
    textoNormalizado.includes("valor") ||
    textoNormalizado.includes("vale") ||
    textoNormalizado.includes("pagar") ||
    textoNormalizado.includes("pago") ||
    textoNormalizado.includes("mensual") ||
    textoNormalizado.includes("mes") ||
    textoNormalizado.includes("transferencia") ||
    textoNormalizado.includes("mercado pago") ||
    textoNormalizado.includes("mercadopago") ||
    textoNormalizado.includes("rapipago") ||
    textoNormalizado.includes("rapi pago") ||
    textoNormalizado.includes("pago facil") ||
    textoNormalizado.includes("pago fácil")
  ) {
    const respuestasPago = [
      `El precio especial actual es de $7.800 ARS, pago único 💅 No es mensual. Puedes abonar por Transferencia o Mercado Pago. Pago Fácil o Rapipago puede usarse solo si está habilitado desde Mercado Pago.`,
      `El valor del Pack Completo de Uñas es de $7.800 ARS por única vez ✨ Después de enviar el comprobante, recibes el acceso completo por WhatsApp.`,
      `Está en promoción a $7.800 ARS, pago único 💕 Se puede abonar por Transferencia o Mercado Pago, y apenas envías el comprobante se entrega el acceso completo.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasPago));
  }

  if (
    textoNormalizado.includes("vivo") ||
    textoNormalizado.includes("en vivo") ||
    textoNormalizado.includes("grabado") ||
    textoNormalizado.includes("grabadas") ||
    textoNormalizado.includes("horario") ||
    textoNormalizado.includes("horarios") ||
    textoNormalizado.includes("ritmo") ||
    textoNormalizado.includes("repetir") ||
    textoNormalizado.includes("veces")
  ) {
    const respuestasGrabado = [
      `Las clases son grabadas en HD 💅 Puedes verlas a tu ritmo, sin horarios, y repetirlas todas las veces que necesites.`,
      `No son clases en vivo ✨ Son clases pregrabadas para que puedas avanzar cuando tengas tiempo, desde tu celular, computadora o tablet.`,
      `El acceso es flexible 💕 Entras cuando quieras, miras las clases a tu ritmo y puedes volver a repetir cada explicación mientras practicas.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasGrabado));
  }

  if (
    textoNormalizado.includes("acceso") ||
    textoNormalizado.includes("vida") ||
    textoNormalizado.includes("por vida") ||
    textoNormalizado.includes("celular") ||
    textoNormalizado.includes("telefono") ||
    textoNormalizado.includes("teléfono") ||
    textoNormalizado.includes("computadora") ||
    textoNormalizado.includes("tablet")
  ) {
    const respuestasAcceso = [
      `Sí, el acceso es de por vida 💅 Puedes entrar desde celular, computadora o tablet, y volver a ver las clases cada vez que lo necesites.`,
      `Lo puedes ver desde el celular sin problema ✨ También desde computadora o tablet. El acceso queda disponible de por vida.`,
      `El material queda para ti de por vida 💕 Puedes mirar las clases cuando quieras y repetirlas mientras vas practicando.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasAcceso));
  }

  if (
    textoNormalizado.includes("materiales") ||
    textoNormalizado.includes("material") ||
    textoNormalizado.includes("kit") ||
    textoNormalizado.includes("marcas") ||
    textoNormalizado.includes("comprar") ||
    textoNormalizado.includes("herramientas") ||
    textoNormalizado.includes("insumos")
  ) {
    const respuestasMateriales = [
      `El pack incluye una lista completa de materiales y marcas recomendadas 💅 No hace falta comprar todo junto; puedes ir armando tu kit de a poco mientras avanzas con las clases.`,
      `Dentro del material tienes una guía con los materiales necesarios y marcas recomendadas ✨ La idea es que puedas organizarte y empezar de forma ordenada, sin comprar cosas de más.`,
      `Sí, incluye lista de materiales 💕 Puedes revisar qué necesitas para practicar y armar tu kit paso a paso, según tu presupuesto.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasMateriales));
  }

  if (
    textoNormalizado.includes("emprender") ||
    textoNormalizado.includes("emprendimiento") ||
    textoNormalizado.includes("trabajar") ||
    textoNormalizado.includes("clientas") ||
    textoNormalizado.includes("clientes") ||
    textoNormalizado.includes("ganar") ||
    textoNormalizado.includes("dinero") ||
    textoNormalizado.includes("plata") ||
    textoNormalizado.includes("ingresos") ||
    textoNormalizado.includes("local") ||
    textoNormalizado.includes("habilita") ||
    textoNormalizado.includes("habilitacion") ||
    textoNormalizado.includes("habilitación")
  ) {
    const respuestasEmprender = [
      `Sí, puede servirte para aprender, practicar, perfeccionarte y organizar mejor un posible emprendimiento 💅 Incluye fichas de gastos, costos, turnos y finanzas. No prometemos ingresos garantizados, porque eso depende de la práctica y del trabajo de cada persona.`,
      `Es ideal si quieres aprender con una mirada más práctica y emprendedora ✨ Te ayuda con técnicas, materiales, costos y organización de turnos, pero sin prometer clientas ni ganancias aseguradas.`,
      `El pack puede ayudarte a prepararte mejor si deseas ofrecer servicios de uñas 💕 Para trabajar formalmente o abrir un local, siempre conviene revisar los requisitos de tu ciudad o país, porque el curso no reemplaza una habilitación oficial.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasEmprender));
  }

  if (
    textoNormalizado.includes("asesoria") ||
    textoNormalizado.includes("asesoría") ||
    textoNormalizado.includes("soporte") ||
    textoNormalizado.includes("dudas") ||
    textoNormalizado.includes("consulta") ||
    textoNormalizado.includes("no entiendo") ||
    textoNormalizado.includes("ayuda")
  ) {
    const respuestasAsesoria = [
      `Sí, incluye asesoría personalizada 💅 Si alguna clase no se entiende, puedes volver a verla porque el acceso es de por vida, y también cuentas con acompañamiento para resolver dudas sobre el contenido.`,
      `Tienes acompañamiento para dudas sobre el material ✨ Además, como las clases quedan disponibles de por vida, puedes repetirlas todas las veces que necesites mientras practicas.`,
      `Sí, vas a contar con asesoría 💕 La idea es que no te sientas sola mientras aprendes y puedas consultar dudas relacionadas con las clases y el contenido.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasAsesoria));
  }

  if (
    textoNormalizado.includes("nail art") ||
    textoNormalizado.includes("plantillas") ||
    textoNormalizado.includes("diseños") ||
    textoNormalizado.includes("disenos") ||
    textoNormalizado.includes("agenda") ||
    textoNormalizado.includes("maquillaje")
  ) {
    const respuestasBonus = [
      `Sí, la promoción incluye 10 guías de plantillas de Nail Art, agenda 2026 para organizar el emprendimiento y un bono especial de maquillaje profesional 💅`,
      `Además de las clases de uñas, también recibes bonus muy útiles ✨ Plantillas de Nail Art, agenda 2026 y curso de maquillaje profesional como bono especial.`,
      `Sí, incluye Nail Art y maquillaje 💕 En la promoción vienen 10 guías de plantillas de Nail Art, más el curso de maquillaje profesional y la agenda 2026.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasBonus));
  }

  if (
    textoNormalizado.includes("seguro") ||
    textoNormalizado.includes("segura") ||
    textoNormalizado.includes("confiable") ||
    textoNormalizado.includes("estafa") ||
    textoNormalizado.includes("real") ||
    textoNormalizado.includes("confianza")
  ) {
    const respuestasSeguridad = [
      `Sí, la compra es segura 💅 Se realiza por los medios de pago indicados y, una vez que envías el comprobante, recibes el acceso completo por WhatsApp mediante Google Drive.`,
      `Entiendo la duda, es normal querer asegurarse antes de comprar ✨ El acceso se entrega por WhatsApp después del comprobante y el material queda disponible de por vida.`,
      `Puedes quedarte tranquila 💕 El proceso es simple: abonas por Transferencia o Mercado Pago, envías el comprobante y recibes el link completo del pack por WhatsApp.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasSeguridad));
  }

  if (
    textoNormalizado.includes("academia") ||
    textoNormalizado.includes("glow") ||
    textoNormalizado.includes("glow nails") ||
    textoNormalizado.includes("ofrecen formacion") ||
    textoNormalizado.includes("formacion online") ||
    textoNormalizado.includes("formación online")
  ) {
    const respuestasAcademia = [
      `Glow Nails Academy ofrece formación online privada en belleza y uñas 💅 El certificado incluido es de participación, no un título oficial ni una habilitación profesional estatal.`,
      `Es una formación online privada de Glow Nails Academy ✨ Está pensada para aprender y practicar desde casa, con clases grabadas, guías, asesoría y acceso de por vida.`,
      `Glow Nails Academy brinda este pack digital para que puedas formarte desde casa 💕 Incluye certificado de participación, no certificación oficial habilitante.`,
    ];

    return agregarCierre(elegirAleatoria(respuestasAcademia));
  }

  return null;
}

app.get("/", (req, res) => {
  res.send("Bot ventas activo ✅");
});

app.post("/mensaje", async (req, res) => {
  try {
    const texto = req.body.texto || req.body.mensaje || req.body.message || "";

    console.log("Texto recibido:", texto);

    if (!texto) {
      return res.json({ respuesta: cierrePago() });
    }

    const textoNormalizado = normalizarTexto(texto);

    const directa = respuestaDirecta(textoNormalizado);

    if (directa) {
      console.log("Respuesta directa:", directa);
      return res.json({ respuesta: directa });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      input: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: texto },
      ],
    });

    const respuestaIA = response.output_text || "";
    const respuestaFinal = agregarCierre(respuestaIA);

    console.log("Respuesta enviada:", respuestaFinal);

    return res.json({ respuesta: respuestaFinal });
  } catch (error) {
    console.error("Error en /mensaje:", error);
    return res.json({ respuesta: cierrePago() });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
