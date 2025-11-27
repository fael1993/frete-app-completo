// ============================================
// Payment Service - Processamento de Pagamentos (Stripe)
// ============================================

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Processar pagamento via Stripe
 */
export const processPayment = async ({ amount, currency, paymentMethod, paymentToken, metadata }) => {
  try {
    // Criar Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Converter para centavos
      currency: currency.toLowerCase(),
      payment_method: paymentToken,
      confirm: true,
      metadata,
      description: `Pagamento BoxFreight EU - Fatura ${metadata.invoiceId}`,
    });
    
    return {
      success: true,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
    };
  } catch (error) {
    console.error('Erro no pagamento Stripe:', error);
    throw new Error(error.message);
  }
};

/**
 * Criar sessão de checkout Stripe
 */
export const createCheckoutSession = async ({ invoiceId, amount, currency, successUrl, cancelUrl, metadata }) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: `Fatura BoxFreight EU`,
              description: `Pagamento de fatura ${invoiceId}`,
            },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata,
    });
    
    return {
      sessionId: session.id,
      url: session.url,
    };
  } catch (error) {
    console.error('Erro ao criar sessão Stripe:', error);
    throw new Error(error.message);
  }
};

/**
 * Criar conta Stripe Connect (para transportadores receberem pagamentos)
 */
export const createConnectAccount = async ({ email, country, businessType = 'individual' }) => {
  try {
    const account = await stripe.accounts.create({
      type: 'express',
      country,
      email,
      business_type: businessType,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    
    return {
      accountId: account.id,
      email: account.email,
    };
  } catch (error) {
    console.error('Erro ao criar conta Stripe Connect:', error);
    throw new Error(error.message);
  }
};

/**
 * Criar link de onboarding Stripe Connect
 */
export const createAccountLink = async ({ accountId, refreshUrl, returnUrl }) => {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: refreshUrl,
      return_url: returnUrl,
      type: 'account_onboarding',
    });
    
    return {
      url: accountLink.url,
    };
  } catch (error) {
    console.error('Erro ao criar link de onboarding:', error);
    throw new Error(error.message);
  }
};

/**
 * Transferir fundos para conta Connect
 */
export const transferToConnect = async ({ accountId, amount, currency, metadata }) => {
  try {
    const transfer = await stripe.transfers.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      destination: accountId,
      metadata,
    });
    
    return {
      transferId: transfer.id,
      amount: transfer.amount / 100,
      currency: transfer.currency.toUpperCase(),
      status: transfer.status,
    };
  } catch (error) {
    console.error('Erro ao transferir fundos:', error);
    throw new Error(error.message);
  }
};

/**
 * Reembolsar pagamento
 */
export const refundPayment = async ({ paymentIntentId, amount, reason }) => {
  try {
    const refund = await stripe.refunds.create({
      payment_intent: paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined,
      reason,
    });
    
    return {
      refundId: refund.id,
      amount: refund.amount / 100,
      currency: refund.currency.toUpperCase(),
      status: refund.status,
    };
  } catch (error) {
    console.error('Erro ao reembolsar:', error);
    throw new Error(error.message);
  }
};

/**
 * Verificar status de pagamento
 */
export const getPaymentStatus = async (paymentIntentId) => {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency.toUpperCase(),
    };
  } catch (error) {
    console.error('Erro ao verificar status:', error);
    throw new Error(error.message);
  }
};

/**
 * Webhook handler para eventos Stripe
 */
export const handleWebhook = async (event) => {
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('Pagamento bem-sucedido:', event.data.object.id);
      // Atualizar fatura no banco de dados
      break;
      
    case 'payment_intent.payment_failed':
      console.log('Pagamento falhou:', event.data.object.id);
      // Notificar utilizador
      break;
      
    case 'account.updated':
      console.log('Conta Connect atualizada:', event.data.object.id);
      // Atualizar status da conta no banco
      break;
      
    default:
      console.log('Evento não tratado:', event.type);
  }
};
