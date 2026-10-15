import type { FastifyPluginAsync } from 'fastify';
import { reportParamsSchema, reportQuery } from '../../../shared/schemas/reports';
import { audit } from '../../lib/audit';
import { getCtx } from '../../lib/context';
import { parse } from '../../lib/validate';
import { buildReport, reportHtml, reportToXlsx } from '../../reports/service';

const XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

function contentDisposition(kind: 'inline' | 'attachment', filename: string, ext: string): string {
  const safe = filename.replace(/[\\/:*?"<>|\r\n]+/g, '-').replace(/\s+/g, '-').slice(0, 80);
  const ascii = `report.${ext}`;
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(`${safe}.${ext}`)}`;
}

export const reportsModule: FastifyPluginAsync = async (app) => {
  /** معاينة HTML — تُعرض داخل iframe وتُطبع مباشرة (تصدير PDF بديل عندما لا يتوفر Chromium) */
  app.get<{ Params: { type: string; format: string } }>('/reports/:type/:format', async (req, reply) => {
    const { ownerId } = getCtx(req);
    const { type, format } = parse(reportParamsSchema, req.params);
    const q = parse(reportQuery, req.query);
    const { doc, brand } = buildReport(app, ownerId, type, q);

    if (format !== 'html') audit(req, { action: 'report_exported', entityType: 'report', entityId: type, meta: { format } });

    if (format === 'html') {
      return reply
        .header('content-security-policy', "default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:; frame-ancestors 'self'")
        .type('text/html; charset=utf-8')
        .send(reportHtml(app, doc, brand));
    }
    if (format === 'xlsx') {
      const buf = await reportToXlsx(doc);
      return reply
        .header('content-disposition', contentDisposition('attachment', doc.filename, 'xlsx'))
        .type(XLSX)
        .send(buf);
    }
    const pdf = await app.pdf.render(reportHtml(app, doc, brand), { landscape: false });
    return reply
      .header('content-disposition', contentDisposition('attachment', doc.filename, 'pdf'))
      .type('application/pdf')
      .send(pdf);
  });
};

