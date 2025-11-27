// ============================================
// Email Service - Envio de Emails
// ============================================

import nodemailer from 'nodemailer';

// Configurar transporter (usar Resend, SendGrid ou SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.resend.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Enviar email genérico
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'BoxFreight EU <noreply@boxfreight.eu>',
      to,
      subject,
      html,
      text,
    });
    
    console.log('Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

/**
 * Email de boas-vindas
 */
export const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚚 Bem-vindo ao BoxFreight EU!</h1>
        </div>
        <div class="content">
          <p>Olá ${user.firstName},</p>
          <p>Obrigado por se registar na BoxFreight EU, a plataforma líder de transporte de cargas na Europa.</p>
          <p>A sua conta foi criada com sucesso. Para começar a usar a plataforma, por favor verifique o seu email clicando no botão abaixo:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${user.id}" class="button">Verificar Email</a>
          <p>Se tiver alguma dúvida, não hesite em contactar-nos.</p>
          <p>Boas viagens!<br>Equipa BoxFreight EU</p>
        </div>
        <div class="footer">
          <p>© 2024 BoxFreight EU. Todos os direitos reservados.</p>
          <p>Este email foi enviado para ${user.email}</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Bem-vindo ao BoxFreight EU! 🚚',
    html,
  });
};

/**
 * Email de nova proposta (para embarcador)
 */
export const sendNewOfferEmail = async (shipper, offer, load) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #667eea; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .offer-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>💼 Nova Proposta Recebida!</h2>
        </div>
        <div class="content">
          <p>Olá ${shipper.firstName},</p>
          <p>Recebeu uma nova proposta para a sua carga:</p>
          <div class="offer-details">
            <h3>${load.title}</h3>
            <p><strong>Rota:</strong> ${load.originCity} → ${load.destCity}</p>
            <p><strong>Preço proposto:</strong> €${offer.price.toFixed(2)}</p>
            <p><strong>Transportador:</strong> ${offer.carrier.companyName || `${offer.carrier.firstName} ${offer.carrier.lastName}`}</p>
            <p><strong>Avaliação:</strong> ⭐ ${offer.carrier.rating.toFixed(1)} (${offer.carrier.totalRatings} avaliações)</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/loads/${load.id}" class="button">Ver Proposta</a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: shipper.email,
    subject: `Nova proposta para "${load.title}"`,
    html,
  });
};

/**
 * Email de proposta aceite (para transportador)
 */
export const sendOfferAcceptedEmail = async (carrier, load) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>✅ Proposta Aceite!</h2>
        </div>
        <div class="content">
          <p>Olá ${carrier.firstName},</p>
          <p>Parabéns! A sua proposta foi aceite:</p>
          <h3>${load.title}</h3>
          <p><strong>Rota:</strong> ${load.originCity} → ${load.destCity}</p>
          <p><strong>Recolha:</strong> ${new Date(load.pickupDate).toLocaleDateString('pt-PT')}</p>
          <p><strong>Entrega:</strong> ${new Date(load.deliveryDate).toLocaleDateString('pt-PT')}</p>
          <a href="${process.env.FRONTEND_URL}/trips" class="button">Ver Viagem</a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: carrier.email,
    subject: `Proposta aceite: ${load.title}`,
    html,
  });
};

/**
 * Email de reset de password
 */
export const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
        .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔒 Reset de Password</h2>
        </div>
        <div class="content">
          <p>Olá ${user.firstName},</p>
          <p>Recebemos um pedido para redefinir a password da sua conta BoxFreight EU.</p>
          <p>Clique no botão abaixo para criar uma nova password:</p>
          <a href="${resetUrl}" class="button">Redefinir Password</a>
          <div class="warning">
            <p><strong>⚠️ Importante:</strong></p>
            <p>Este link expira em 1 hora.</p>
            <p>Se não solicitou este reset, ignore este email.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: user.email,
    subject: 'Reset de Password - BoxFreight EU',
    html,
  });
};

/**
 * Email de fatura emitida
 */
export const sendInvoiceEmail = async (recipient, invoice) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #3b82f6; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; }
        .invoice-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📄 Nova Fatura Emitida</h2>
        </div>
        <div class="content">
          <p>Olá ${recipient.firstName},</p>
          <p>Foi emitida uma nova fatura:</p>
          <div class="invoice-details">
            <p><strong>Número:</strong> ${invoice.invoiceNumber}</p>
            <p><strong>Data de emissão:</strong> ${new Date(invoice.issueDate).toLocaleDateString('pt-PT')}</p>
            <p><strong>Data de vencimento:</strong> ${new Date(invoice.dueDate).toLocaleDateString('pt-PT')}</p>
            <p><strong>Valor total:</strong> €${invoice.total.toFixed(2)}</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/invoices/${invoice.id}" class="button">Ver Fatura</a>
        </div>
      </div>
    </body>
    </html>
  `;
  
  return sendEmail({
    to: recipient.email,
    subject: `Fatura ${invoice.invoiceNumber} - BoxFreight EU`,
    html,
  });
};
