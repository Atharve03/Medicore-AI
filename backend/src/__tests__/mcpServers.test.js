jest.mock('../repositories/patient.repository');
jest.mock('../repositories/doctor.repository');
jest.mock('../repositories/labReport.repository');
jest.mock('../repositories/invoice.repository');
jest.mock('../repositories/pharmacyOrder.repository');
jest.mock('../repositories/notification.repository');
jest.mock('../modules/notification/notification.service');

const patientRepository = require('../repositories/patient.repository');
const labReportRepository = require('../repositories/labReport.repository');
const invoiceRepository = require('../repositories/invoice.repository');
const pharmacyOrderRepository = require('../repositories/pharmacyOrder.repository');
const notificationRepository = require('../repositories/notification.repository');
const notificationService = require('../modules/notification/notification.service');

const laboratoryServer = require('../mcp/servers/laboratory.mcp');
const pharmacyServer = require('../mcp/servers/pharmacy.mcp');
const billingServer = require('../mcp/servers/billing.mcp');
const notificationServer = require('../mcp/servers/notification.mcp');

afterEach(() => jest.resetAllMocks());

describe('laboratory MCP server', () => {
  it('lets a patient fetch their own latest report (the flagship AI example)', async () => {
    patientRepository.findByUserId.mockResolvedValue({ _id: 'p1' });
    labReportRepository.findLatestForPatient.mockResolvedValue({
      toClientJSON: () => ({ id: 'r1', testType: 'CBC' }),
    });

    const result = await laboratoryServer.tools.getLatestReportForPatient.handler(
      { patientId: 'p1' },
      { requestingUser: { id: 'u1', role: 'patient' } }
    );

    expect(result).toEqual({ id: 'r1', testType: 'CBC' });
    expect(labReportRepository.findLatestForPatient).toHaveBeenCalledWith('p1');
  });

  it("blocks a patient from fetching another patient's report", async () => {
    patientRepository.findByUserId.mockResolvedValue({ _id: 'p1' });

    await expect(
      laboratoryServer.tools.getLatestReportForPatient.handler(
        { patientId: 'p2' },
        { requestingUser: { id: 'u1', role: 'patient' } }
      )
    ).rejects.toThrow();
    expect(labReportRepository.findLatestForPatient).not.toHaveBeenCalled();
  });

  it('lets a doctor fetch any patients latest report', async () => {
    labReportRepository.findLatestForPatient.mockResolvedValue({
      toClientJSON: () => ({ id: 'r1' }),
    });

    const result = await laboratoryServer.tools.getLatestReportForPatient.handler(
      { patientId: 'p2' },
      { requestingUser: { id: 'doc1', role: 'doctor' } }
    );

    expect(result).toEqual({ id: 'r1' });
  });

  it('returns null when no completed report exists', async () => {
    patientRepository.findByUserId.mockResolvedValue({ _id: 'p1' });
    labReportRepository.findLatestForPatient.mockResolvedValue(null);

    const result = await laboratoryServer.tools.getLatestReportForPatient.handler(
      { patientId: 'p1' },
      { requestingUser: { id: 'u1', role: 'patient' } }
    );

    expect(result).toBeNull();
  });
});

describe('pharmacy MCP server', () => {
  it('allows admin to fetch usage stats', async () => {
    pharmacyOrderRepository.getTopDispensedMedicines.mockResolvedValue([
      { name: 'Paracetamol', totalQuantity: 100 },
    ]);

    const result = await pharmacyServer.tools.getUsageStats.handler(
      {},
      { requestingUser: { id: 'a1', role: 'admin' } }
    );

    expect(result).toEqual([{ name: 'Paracetamol', totalQuantity: 100 }]);
  });

  it('blocks a non-admin role', async () => {
    await expect(
      pharmacyServer.tools.getUsageStats.handler(
        {},
        { requestingUser: { id: 'd1', role: 'doctor' } }
      )
    ).rejects.toThrow(/cannot access pharmacy usage stats/);
  });
});

describe('billing MCP server', () => {
  it('blocks a non-admin from revenue stats', async () => {
    await expect(
      billingServer.tools.getRevenueStats.handler(
        {},
        { requestingUser: { id: 'r1', role: 'receptionist' } }
      )
    ).rejects.toThrow(/cannot access revenue stats/);
  });

  it('allows admin to fetch revenue stats', async () => {
    invoiceRepository.getRevenueStats.mockResolvedValue({ totalBilled: 1000 });

    const result = await billingServer.tools.getRevenueStats.handler(
      {},
      { requestingUser: { id: 'a1', role: 'admin' } }
    );

    expect(result).toEqual({ totalBilled: 1000 });
  });
});

describe('notification MCP server', () => {
  it('notifySelf always targets the calling user, never an arbitrary id', async () => {
    notificationService.notifyUser.mockResolvedValue({ id: 'n1' });

    await notificationServer.tools.notifySelf.handler(
      { title: 'Ready', message: 'Your summary is ready' },
      { requestingUser: { id: 'caller-1', role: 'patient' } }
    );

    expect(notificationService.notifyUser).toHaveBeenCalledWith(
      'caller-1',
      { type: 'system', title: 'Ready', message: 'Your summary is ready' },
      { email: false }
    );
  });

  it('listUnreadForCaller only ever queries the calling users own notifications', async () => {
    notificationRepository.listForUser.mockResolvedValue({ items: [] });

    await notificationServer.tools.listUnreadForCaller.handler(
      {},
      { requestingUser: { id: 'caller-1', role: 'nurse' } }
    );

    expect(notificationRepository.listForUser).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 'caller-1', isRead: false })
    );
  });
});
