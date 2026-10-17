'use strict';

/* CONFIGURAÇÃO DO FORMULÁRIO
 * Para receber inscrições, crie um formulário em um serviço como Formspree
 * e cole abaixo a URL POST recebida (ex.: https://formspree.io/f/XXXXXXXX).
 * Sem essa URL o formulário NÃO grava nem envia cadastros.
 */
const FORM_ENDPOINT = '';

const form = document.getElementById('registration-form');
const feedback = document.getElementById('form-feedback');
const whatsApp = document.getElementById('whatsapp');

function message(text, kind = 'error') {
  feedback.textContent = text;
  feedback.className = 'form-feedback is-' + kind;
}

function maskPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (!digits) return '';
  if (digits.length < 3) return '(' + digits;
  if (digits.length < 7) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2);
  if (digits.length <= 10) return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 6) + '-' + digits.slice(6);
  return '(' + digits.slice(0, 2) + ') ' + digits.slice(2, 7) + '-' + digits.slice(7);
}

whatsApp.addEventListener('input', () => {
  whatsApp.value = maskPhone(whatsApp.value);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  feedback.textContent = '';
  if (!form.reportValidity()) return;

  const digits = whatsApp.value.replace(/\D/g, '');
  if (digits.length !== 10 && digits.length !== 11) {
    message('Digite um WhatsApp válido com DDD.');
    whatsApp.focus();
    return;
  }
  if (!FORM_ENDPOINT) {
    message('O formulário ainda precisa ser conectado ao sistema de inscrições. Seus dados não foram enviados.');
    return;
  }

  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  submit.style.opacity = '0.65';
  message('Enviando sua solicitação…', 'success');
  try {
    const data = new FormData(form);
    data.set('whatsapp', '+55' + digits);
    data.set('evento', 'Do Zero ao Palco Experience');
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    });
    if (!response.ok) throw new Error('HTTP ' + response.status);
    message('Solicitação enviada! Nossa equipe poderá entrar em contato pelos dados informados.', 'success');
    form.reset();
  } catch (error) {
    message('Não foi possível enviar agora. Tente novamente em instantes.');
    console.error('Erro no envio do formulário:', error);
  } finally {
    submit.disabled = false;
    submit.style.opacity = '';
  }
});
