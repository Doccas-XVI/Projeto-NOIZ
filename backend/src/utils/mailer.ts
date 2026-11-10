import { env } from '@/config/env';

/**
 * Envio de e-mail via API REST do Resend (https://resend.com) usando o
 * fetch nativo do Node 20 — sem dependência extra.
 * Sem EMAIL_API_KEY (ex: desenvolvimento), o e-mail não é enviado: o
 * conteúdo é impresso no console para você copiar o link manualmente.
 */
export async function sendMail(to: string, subject: string, html: string, text: string) {
  if (!env.EMAIL_API_KEY) {
    console.info(`\n📧 [DEV] E-mail para ${to}\nAssunto: ${subject}\n${text}\n`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.EMAIL_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html, text }),
  });

  if (!response.ok) {
    // Não propagamos o erro: a rota de "esqueci a senha" responde sempre
    // igual (evita enumeração de contas). Só registramos para diagnóstico.
    console.error('Falha ao enviar e-mail:', response.status, await response.text());
  }
}

export function passwordResetEmail(link: string) {
  return {
    subject: 'NOIZ — redefinição de senha',
    text: `Recebemos um pedido para redefinir sua senha. Acesse: ${link}\nO link expira em 30 minutos. Se não foi você, ignore este e-mail.`,
    html: `<div style="font-family:sans-serif;background:#0B0B0D;color:#fff;padding:32px">
      <h1 style="color:#D6FF3F;margin:0 0 16px">NOIZ</h1>
      <p>Recebemos um pedido para redefinir sua senha.</p>
      <p><a href="${link}" style="background:#D6FF3F;color:#000;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:700">Redefinir senha</a></p>
      <p style="color:#8A8A93;font-size:13px">O link expira em 30 minutos. Se não foi você, ignore este e-mail.</p>
    </div>`,
  };
}
