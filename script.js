'use strict';

/* CONFIGURAÇÃO NECESSÁRIA ANTES DE RECEBER INSCRIÇÕES
 * 1. FORM_ENDPOINT: endpoint HTTPS para registrar nome, WhatsApp, email e aceite.
 * 2. CHECKOUT_URL: endereço HTTPS da plataforma de pagamento.
 * OBS.: o redirecionamento para o grupo de WhatsApp APÓS a confirmação
 * do pagamento deve ser configurado NA PLATAFORMA DE CHECKOUT.
 * Não publique como inscrição ativa antes de configurar e testar ambos.
 */
const FORM_ENDPOINT = '';
const CHECKOUT_URL = '';

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
function isHttpsUrl(value) {
  try { return new URL(value).protocol === 'https:'; }
  catch (_) { return false; }
}

if (form && whatsApp && feedback) {
  whatsApp.addEventListener('input', () => { whatsApp.value = maskPhone(whatsApp.value); });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    feedback.textContent = '';
    if (!form.reportValidity()) return;

    const digits = whatsApp.value.replace(/\D/g, '');
    if (digits.length !== 10 && digits.length !== 11) {
      message('Informe um número de WhatsApp válido com DDD.');
      whatsApp.focus();
      return;
    }

    // Nunca afirmar que a inscrição foi enviada, nem iniciar o pagamento,
    // quando um dos serviços ainda estiver sem configuração.
    if (!isHttpsUrl(FORM_ENDPOINT) || !isHttpsUrl(CHECKOUT_URL)) {
      message('As inscrições online ainda estão sendo configuradas. Nenhum dado foi enviado.');
      return;
    }

    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    message('Enviando seus dados com segurança…', 'success');
    try {
      const data = new FormData(form);
      data.set('whatsapp', '+55' + digits);
      data.set('evento', 'Do Zero ao Palco Experience');
      data.set('consentimento', 'sim');
      data.set('versao_politica', '2026-10-17');
      const response = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        body: data,
        headers: {'Accept': 'application/json'}
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      message('Dados recebidos. Redirecionando para a página de pagamento…', 'success');
      window.location.assign(CHECKOUT_URL);
    } catch (error) {
      message('Não foi possível processar sua inscrição. Tente novamente em alguns instantes.');
      console.error('Erro ao enviar formulário:', error);
    } finally {
      submit.disabled = false;
    }
  });
}
