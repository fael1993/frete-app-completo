// ============================================
// Invoice Service - Geração de Faturas
// ============================================

import { prisma } from '../server.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

/**
 * Gerar número de fatura único
 */
export const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  
  // Contar faturas do mês atual
  const count = await prisma.invoice.count({
    where: {
      createdAt: {
        gte: new Date(year, new Date().getMonth(), 1),
      },
    },
  });
  
  const sequence = String(count + 1).padStart(4, '0');
  return `BF${year}${month}${sequence}`;
};

/**
 * Gerar PDF da fatura
 */
export const generateInvoicePDF = async (invoice) => {
  return new Promise((resolve, reject) => {
    try {
      // Criar diretório se não existir
      const invoicesDir = path.join(process.cwd(), 'public', 'invoices');
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }
      
      const filename = `invoice-${invoice.invoiceNumber}.pdf`;
      const filepath = path.join(invoicesDir, filename);
      
      // Criar documento PDF
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);
      
      doc.pipe(stream);
      
      // Header
      doc
        .fontSize(20)
        .text('BoxFreight EU', 50, 50)
        .fontSize(10)
        .text('Plataforma de Transporte de Cargas', 50, 75)
        .text('NIF: PT123456789', 50, 90)
        .moveDown();
      
      // Número da fatura
      doc
        .fontSize(16)
        .text(`Fatura ${invoice.invoiceNumber}`, 400, 50, { align: 'right' })
        .fontSize(10)
        .text(`Data de emissão: ${new Date(invoice.issueDate).toLocaleDateString('pt-PT')}`, 400, 75, { align: 'right' })
        .text(`Data de vencimento: ${new Date(invoice.dueDate).toLocaleDateString('pt-PT')}`, 400, 90, { align: 'right' })
        .moveDown();
      
      // Linha separadora
      doc
        .moveTo(50, 130)
        .lineTo(550, 130)
        .stroke();
      
      // Dados do emissor
      doc
        .fontSize(12)
        .text('Emitido por:', 50, 150)
        .fontSize(10)
        .text(invoice.issuer.companyName || `${invoice.issuer.firstName} ${invoice.issuer.lastName}`, 50, 170)
        .text(invoice.issuer.companyAddress || '', 50, 185)
        .text(`NIF: ${invoice.issuer.fiscalNumber}`, 50, 200)
        .text(`Email: ${invoice.issuer.email}`, 50, 215);
      
      // Dados do destinatário
      doc
        .fontSize(12)
        .text('Faturado a:', 300, 150)
        .fontSize(10)
        .text(invoice.recipient.companyName || `${invoice.recipient.firstName} ${invoice.recipient.lastName}`, 300, 170)
        .text(invoice.recipient.companyAddress || '', 300, 185)
        .text(`NIF: ${invoice.recipient.fiscalNumber}`, 300, 200)
        .text(`Email: ${invoice.recipient.email}`, 300, 215);
      
      // Detalhes da carga
      doc
        .fontSize(12)
        .text('Detalhes do Serviço:', 50, 260)
        .fontSize(10)
        .text(`Carga: ${invoice.load.title}`, 50, 280)
        .text(`Rota: ${invoice.load.originCity} (${invoice.load.originCountry}) → ${invoice.load.destCity} (${invoice.load.destCountry})`, 50, 295)
        .text(`Peso: ${invoice.load.weight} kg`, 50, 310)
        .text(`Distância: ${invoice.load.distance ? `${invoice.load.distance.toFixed(0)} km` : 'N/A'}`, 50, 325);
      
      // Tabela de valores
      const tableTop = 370;
      doc
        .fontSize(12)
        .text('Descrição', 50, tableTop)
        .text('Valor', 450, tableTop, { align: 'right' });
      
      doc
        .moveTo(50, tableTop + 20)
        .lineTo(550, tableTop + 20)
        .stroke();
      
      doc
        .fontSize(10)
        .text('Serviço de transporte', 50, tableTop + 30)
        .text(`€${invoice.subtotal.toFixed(2)}`, 450, tableTop + 30, { align: 'right' })
        .text('Taxa de plataforma', 50, tableTop + 50)
        .text(`€${invoice.platformFee.toFixed(2)}`, 450, tableTop + 50, { align: 'right' })
        .text(`IVA (${invoice.vatRate}%)`, 50, tableTop + 70)
        .text(`€${invoice.vatAmount.toFixed(2)}`, 450, tableTop + 70, { align: 'right' });
      
      doc
        .moveTo(50, tableTop + 95)
        .lineTo(550, tableTop + 95)
        .stroke();
      
      doc
        .fontSize(12)
        .text('Total', 50, tableTop + 105)
        .text(`€${invoice.total.toFixed(2)}`, 450, tableTop + 105, { align: 'right' });
      
      // Status do pagamento
      const statusY = tableTop + 140;
      doc
        .fontSize(10)
        .text(`Status: ${invoice.status === 'PAID' ? 'PAGA' : 'PENDENTE'}`, 50, statusY);
      
      if (invoice.status === 'PAID' && invoice.paidAt) {
        doc.text(`Paga em: ${new Date(invoice.paidAt).toLocaleDateString('pt-PT')}`, 50, statusY + 15);
      }
      
      // Footer
      doc
        .fontSize(8)
        .text('BoxFreight EU - Plataforma de Transporte de Cargas na Europa', 50, 750, { align: 'center' })
        .text('www.boxfreight.eu | suporte@boxfreight.eu', 50, 765, { align: 'center' });
      
      doc.end();
      
      stream.on('finish', () => {
        const pdfUrl = `/invoices/${filename}`;
        resolve(pdfUrl);
      });
      
      stream.on('error', reject);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Calcular taxa de plataforma
 */
export const calculatePlatformFee = (subtotal) => {
  const feePercentage = parseFloat(process.env.PLATFORM_FEE_PERCENTAGE) || 10; // 10% padrão
  return (subtotal * feePercentage) / 100;
};

/**
 * Calcular IVA por país
 */
export const calculateVAT = (amount, country) => {
  const vatRates = {
    PT: 23, // Portugal
    ES: 21, // Espanha
    FR: 20, // França
    DE: 19, // Alemanha
    IT: 22, // Itália
    NL: 21, // Holanda
    BE: 21, // Bélgica
    // Adicionar mais países conforme necessário
  };
  
  const rate = vatRates[country] || 20; // 20% padrão UE
  return {
    rate,
    amount: (amount * rate) / 100,
  };
};

/**
 * Verificar faturas vencidas e atualizar status
 */
export const checkOverdueInvoices = async () => {
  try {
    const now = new Date();
    
    const overdueInvoices = await prisma.invoice.updateMany({
      where: {
        status: 'ISSUED',
        dueDate: {
          lt: now,
        },
      },
      data: {
        status: 'OVERDUE',
      },
    });
    
    console.log(`${overdueInvoices.count} faturas marcadas como vencidas`);
    return overdueInvoices.count;
  } catch (error) {
    console.error('Erro ao verificar faturas vencidas:', error);
    throw error;
  }
};
