# 🚚 BoxFreight EU

**Plataforma completa de transporte de cargas na Europa**

Sistema moderno e eficiente para conectar embarcadores e transportadores, facilitando o transporte de mercadorias por toda a União Europeia.

---

## 🌟 Funcionalidades Principais

### Para Embarcadores
- ✅ Publicar cargas com detalhes completos
- ✅ Receber e comparar propostas de transportadores
- ✅ Acompanhar entregas em tempo real
- ✅ Gestão de faturas e pagamentos
- ✅ Sistema de avaliações

### Para Transportadores
- ✅ Buscar cargas disponíveis por rota
- ✅ Enviar propostas competitivas
- ✅ Gestão de frota e veículos
- ✅ Tracking GPS de viagens
- ✅ Recebimento automático de pagamentos

### Para Administradores
- ✅ Dashboard completo de operações
- ✅ Gestão de usuários e permissões
- ✅ Monitoramento de transações
- ✅ Relatórios e analytics
- ✅ Conformidade RGPD

---

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + **Express** - API REST
- **PostgreSQL** - Banco de dados relacional
- **Prisma ORM** - Modelagem e migrations
- **JWT** - Autenticação segura
- **Stripe** - Processamento de pagamentos
- **Mapbox** - Geocoding e mapas

### Frontend
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS v4** - Estilização moderna
- **Shadcn/ui** - Componentes UI
- **React Hook Form** - Formulários
- **Zod** - Validação de dados

### Infraestrutura
- **Docker** - Containerização
- **PostgreSQL** - Banco de dados
- **Redis** - Cache e sessões
- **AWS S3** - Armazenamento de documentos
- **GitHub Actions** - CI/CD

---

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### Setup Automatizado

```bash
# Clonar repositório
git clone https://github.com/seu-usuario/boxfreight-eu.git
cd boxfreight-eu

# Executar setup automatizado
chmod +x setup.sh
./setup.sh
```

### Setup Manual

```bash
# 1. Instalar dependências
cd backend && npm install
cd .. && npm install

# 2. Configurar variáveis de ambiente
cd backend
cp .env.example .env
# Edite .env com suas configurações

# 3. Configurar banco de dados
npm run db:generate
npm run db:migrate
npm run db:seed

# 4. Iniciar aplicação
# Terminal 1 - Backend
cd backend && npm run dev

# Terminal 2 - Frontend
npm run dev
```

📚 **Documentação completa:** [QUICK_START.md](./QUICK_START.md)

---

## 🔐 Credenciais de Teste

Após executar o seed:

| Tipo | Email | Senha |
|------|-------|-------|
| **Admin** | admin@boxfreight.eu | Password123! |
| **Embarcador** | embarcador1@example.com | Password123! |
| **Transportador** | transportador1@example.com | Password123! |

---

## 📡 API Endpoints

### Autenticação
```
POST   /api/auth/register     - Registrar usuário
POST   /api/auth/login        - Login
POST   /api/auth/refresh      - Renovar token
POST   /api/auth/logout       - Logout
```

### Cargas
```
GET    /api/loads             - Listar cargas
POST   /api/loads             - Criar carga
GET    /api/loads/:id         - Detalhes da carga
PUT    /api/loads/:id         - Atualizar carga
DELETE /api/loads/:id         - Deletar carga
```

### Ofertas
```
GET    /api/offers            - Listar ofertas
POST   /api/offers            - Criar oferta
PUT    /api/offers/:id/accept - Aceitar oferta
PUT    /api/offers/:id/reject - Rejeitar oferta
```

### Viagens
```
GET    /api/trips             - Listar viagens
GET    /api/trips/:id         - Detalhes da viagem
PUT    /api/trips/:id/start   - Iniciar viagem
PUT    /api/trips/:id/complete - Completar viagem
PUT    /api/trips/:id/location - Atualizar localização
```

📖 **Documentação completa da API:** `http://localhost:3000/api/docs`

---

## 🗄️ Estrutura do Banco de Dados

```
Users (Usuários)
├── Loads (Cargas)
│   ├── Offers (Ofertas)
│   │   └── Trips (Viagens)
│   │       ├── Invoices (Faturas)
│   │       │   └── Payments (Pagamentos)
│   │       └── Ratings (Avaliações)
│   └── Documents (Documentos)
├── Vehicles (Veículos)
├── Notifications (Notificações)
└── AuditLogs (Logs de Auditoria)
```

---

## 🔒 Segurança

- ✅ Autenticação JWT com refresh tokens
- ✅ Senhas criptografadas com bcrypt
- ✅ Rate limiting em todas as rotas
- ✅ Validação de dados com Joi/Zod
- ✅ Proteção contra SQL Injection (Prisma)
- ✅ Headers de segurança (Helmet)
- ✅ CORS configurado
- ✅ Conformidade RGPD/GDPR

---

## 🌍 Internacionalização

Suporte para múltiplos idiomas:
- 🇵🇹 Português (padrão)
- 🇬🇧 Inglês
- 🇪🇸 Espanhol
- 🇫🇷 Francês
- 🇩🇪 Alemão

Moeda padrão: **EUR (€)**

---

## 🧪 Testes

```bash
# Executar testes
npm test

# Testes com coverage
npm run test:coverage

# Testes em modo watch
npm run test:watch
```

---

## 📦 Deploy

### Produção com Docker

```bash
# Build e iniciar containers
docker-compose up -d

# Verificar logs
docker-compose logs -f

# Parar containers
docker-compose down
```

### Deploy Manual

1. Configure variáveis de ambiente de produção
2. Execute migrations: `npm run db:migrate:prod`
3. Build do frontend: `npm run build`
4. Inicie o servidor: `npm start`

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 📞 Suporte

- 📧 Email: suporte@boxfreight.eu
- 🌐 Website: https://boxfreight.eu
- 📚 Documentação: https://docs.boxfreight.eu
- 💬 Discord: https://discord.gg/boxfreight

---

## 🗺️ Roadmap

### Fase 1 - MVP ✅
- [x] Sistema de autenticação
- [x] Gestão de cargas
- [x] Sistema de ofertas
- [x] Tracking de viagens
- [x] Faturas e pagamentos

### Fase 2 - Melhorias 🚧
- [ ] App mobile (React Native)
- [ ] Notificações push
- [ ] Chat em tempo real
- [ ] Integração com mais gateways de pagamento
- [ ] Sistema de leilão de cargas

### Fase 3 - Expansão 📋
- [ ] IA para otimização de rotas
- [ ] Marketplace de seguros
- [ ] Integração com ERPs
- [ ] API pública para parceiros
- [ ] Programa de fidelidade

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe BoxFreight EU

---

## 🙏 Agradecimentos

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Stripe](https://stripe.com/)
- [Mapbox](https://www.mapbox.com/)
- [Shadcn/ui](https://ui.shadcn.com/)

---

<div align="center">
  <strong>BoxFreight EU</strong> - Transporte de cargas simplificado na Europa 🚚🇪🇺
</div>
