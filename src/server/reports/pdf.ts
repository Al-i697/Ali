// توليد PDF عبر Chromium بلا واجهة (playwright-core). الخطوط مضمّنة داخل HTML فلا حاجة لخطوط النظام.
// حمايات: بلا JavaScript، وكل طلب شبكة يُجهَض (لا data: فقط) — فلا يمكن لمحتوى مُدخَل أن يصل لشبكة الخادم (SSRF).
import fs from 'node:fs';
import path from 'node:path';
import type { Browser } from 'playwright-core';
import type { AppConfig } from '../config';
import { AppError } from '../lib/errors';

const IDLE_CLOSE_MS = 5 * 60_000;
const RENDER_TIMEOUT_MS = 45_000;
const MAX_CONCURRENT = 2;

const WELL_KNOWN = [
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/snap/bin/chromium',
  '/opt/pw-browsers/chromium',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
];

export type PdfOptions = { landscape?: boolean };

export class PdfService {
  private browser: Browser | null = null;
  private launching: Promise<Browser> | null = null;
  private idleTimer: NodeJS.Timeout | null = null;
  private active = 0;
  private waiters: (() => void)[] = [];
  private resolved: string | null | undefined;

  constructor(private readonly config: Pick<AppConfig, 'chromiumPath' | 'pdfNoSandbox'>) {}

  /** مسار Chromium إن وُجد (يُحسب مرة واحدة) */
  executablePath(): string | null {
    if (this.resolved !== undefined) return this.resolved;
    const candidates = [this.config.chromiumPath, process.env.CHROME_PATH, ...WELL_KNOWN];
    const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
    if (base && fs.existsSync(base)) {
      try {
        for (const dir of fs.readdirSync(base)) {
          if (dir.startsWith('chromium-')) candidates.push(path.join(base, dir, 'chrome-linux', 'chrome'));
        }
      } catch {
        /* تجاهل */
      }
    }
    this.resolved = candidates.find((c): c is string => Boolean(c) && fs.existsSync(c as string)) ?? null;
    return this.resolved;
  }

  get available(): boolean {
    return this.executablePath() !== null;
  }

  private async getBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) return this.browser;
    if (this.launching) return this.launching;
    const executablePath = this.executablePath();
    if (!executablePath) {
      throw new AppError(
        501,
        'PDF_UNAVAILABLE',
        'تصدير PDF المباشر غير متاح على هذا الخادم (Chromium غير مثبّت). استخدم زر الطباعة ثم «حفظ كـ PDF».',
      );
    }
    this.launching = (async () => {
      const { chromium } = await import('playwright-core');
      const args = ['--disable-gpu', '--disable-dev-shm-usage', '--font-render-hinting=none'];
      if (this.config.pdfNoSandbox) args.push('--no-sandbox');
      const browser = await chromium.launch({ executablePath, args, timeout: 30_000 });
      browser.on('disconnected', () => {
        if (this.browser === browser) this.browser = null;
      });
      this.browser = browser;
      return browser;
    })();
    try {
      return await this.launching;
    } finally {
      this.launching = null;
    }
  }

  private async acquire(): Promise<void> {
    if (this.active < MAX_CONCURRENT) {
      this.active++;
      return;
    }
    await new Promise<void>((resolve) => this.waiters.push(resolve));
    this.active++;
  }

  private release(): void {
    this.active--;
    this.waiters.shift()?.();
  }

  private scheduleIdleClose(): void {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    this.idleTimer = setTimeout(() => {
      if (this.active === 0) void this.close();
    }, IDLE_CLOSE_MS);
    this.idleTimer.unref();
  }

  /** يحوّل مستند HTML مكتفيًا بذاته إلى PDF بحجم A4 (الهوامش والترقيم من @page داخل المستند) */
  async render(html: string, options: PdfOptions = {}): Promise<Buffer> {
    await this.acquire();
    try {
      const browser = await this.getBrowser();
      const context = await browser.newContext({
        javaScriptEnabled: false,
        acceptDownloads: false,
        serviceWorkers: 'block',
      });
      try {
        await context.route('**/*', (route) => {
          const url = route.request().url();
          return url.startsWith('data:') || url === 'about:blank' ? route.continue() : route.abort();
        });
        const page = await context.newPage();
        page.setDefaultTimeout(RENDER_TIMEOUT_MS);
        await page.setContent(html, { waitUntil: 'load' });
        await page.evaluate('document.fonts && document.fonts.ready').catch(() => undefined);
        const pdf = await page.pdf({
          preferCSSPageSize: true,
          landscape: options.landscape ?? false,
          printBackground: true,
        });
        return Buffer.from(pdf);
      } finally {
        await context.close().catch(() => undefined);
      }
    } finally {
      this.release();
      this.scheduleIdleClose();
    }
  }

  async close(): Promise<void> {
    if (this.idleTimer) clearTimeout(this.idleTimer);
    const b = this.browser;
    this.browser = null;
    if (b) await b.close().catch(() => undefined);
  }
}
