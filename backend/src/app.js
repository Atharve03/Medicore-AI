const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');

const env = require('./config/env');
const logger = require('./config/logger');
const { apiLimiter } = require('./middlewares/rateLimiter');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');
const healthRoute = require('./routes/health.route');
const { registerAll: registerMcpServers } = require('./mcp/servers');

// Registered once here (not in server.js) so any context that requires
// this module — the running server, or a test file using supertest —
// gets the same MCP servers available, without double-registering.
registerMcpServers();

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(mongoSanitize());

// --- Static uploads ---
app.use('/uploads', express.static(path.resolve(process.cwd(), env.uploads.dir)));

// --- Request logging ---
app.use(
  morgan(env.nodeEnv === 'development' ? 'dev' : 'combined', {
    stream: { write: (message) => logger.info(message.trim()) },
  })
);

// --- Rate limiting (applied to all /api routes) ---
app.use('/api', apiLimiter);

// --- Routes ---
app.use('/api/v1/health', healthRoute);
app.use('/api/v1/auth', require('./modules/auth/auth.routes'));
app.use('/api/v1/admin', require('./modules/admin/admin.routes'));
app.use('/api/v1/patients', require('./modules/patient/patient.routes'));
app.use('/api/v1/doctors', require('./modules/doctor/doctor.routes'));
app.use('/api/v1/appointments', require('./modules/appointment/appointment.routes'));
app.use('/api/v1/medical-records', require('./modules/medicalRecord/medicalRecord.routes'));
app.use('/api/v1/prescriptions', require('./modules/prescription/prescription.routes'));
app.use('/api/v1/lab', require('./modules/laboratory/laboratory.routes'));
app.use('/api/v1/pharmacy', require('./modules/pharmacy/pharmacy.routes'));
app.use('/api/v1/billing', require('./modules/billing/billing.routes'));
app.use('/api/v1/inventory', require('./modules/inventory/inventory.routes'));
app.use('/api/v1/admissions', require('./modules/admission/admission.routes'));
app.use('/api/v1/notifications', require('./modules/notification/notification.routes'));
app.use('/api/v1/mcp', require('./mcp/mcp.routes'));
app.use('/api/v1/ai', require('./modules/ai/ai.routes'));
app.use('/api/v1/rag', require('./modules/rag/rag.routes'));

// All 15 backend business modules, plus the 12 MCP servers (Phase 21),
// are now mounted. AI integration (Phase 22) and Analytics (Phase 23)
// build on top of this.

// --- 404 + centralized error handling (must stay last) ---
app.use(notFound);
app.use(errorHandler);

module.exports = app;
