import React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';

const Main = () => (
  <>
    <main>
      <h1>¡Bienvenido a Gonzher: Tu Asistente Virtual para Transportistas!</h1>
      <h2>Simplificando la vida de los transportistas en cada paso del camino.</h2>
      <Link to="/login"><Button variant="contained">Inicia sesion</Button></Link>
    </main>

    <section>
      <h3>Introducción:</h3>
      <p>¡Hola que tal! Somos tu asistente virtual diseñado exclusivamente para simplificar la vida de los transportistas. Desde el inicio del viaje hasta la facturación, Gonzher está aquí para acompañarte en cada paso del camino. Con soporte para la Carta Porte 3.0, una plataforma de GPS para monitoreo 24/7 y muchas más funciones específicas para el transporte, hemos creado Gonzher pensando en tus necesidades únicas.</p>
    </section>

    <section>
      <h3>Características Destacadas:</h3>
      <ul>
        <li>
          <h4>Soporte para Carta Porte 3.0:</h4>
          <p>Gonzher ha sido diseñado para cumplir con las últimas normativas, incluido el soporte completo para la Carta Porte 3.0. Simplifica tus trámites legales y asegura el cumplimiento normativo con facilidad.</p>
        </li>
        <li>
          <h4>Plataforma de GPS para Monitoreo 24/7:</h4>
          <p>Mantén un control total sobre tu flota con nuestra plataforma de GPS integrada. Monitorea tus vehículos en tiempo real y garantiza la seguridad y eficiencia de tus operaciones.</p>
        </li>
        <li>
          <h4>Soporte en Tiempo Real:</h4>
          <p>En Gonzher, no estarás solo. Ofrecemos soporte en tiempo real para resolver tus consultas y problemas de manera rápida y eficiente.</p>
        </li>
      </ul>
    </section>

    <section>
      <h3>Explora la Documentación:</h3>
      <p>Esta documentación está diseñada para guiarte a través de todas las funciones de Gonzher. Encuentra tutoriales paso a paso, detalles sobre características específicas y consejos para optimizar tu experiencia. Ya seas un transportista experimentado o recién comenzando, estamos aquí para hacer tu vida más fácil.</p>
    </section>

    <footer>
      <p>Gracias por confiar en Gonzher para simplificar tu experiencia de facturación y transporte. Si tienes preguntas o necesitas asistencia, nuestro equipo de soporte está listo para ayudarte.</p>
      <Button variant="contained">¡Comienza Ahora!</Button>
    </footer>
  </>
);

export default Main;
