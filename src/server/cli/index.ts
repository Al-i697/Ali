// أدوات الصيانة من سطر الأوامر:  npm run cli -- <أمر>   (أو node dist/server/cli.js <أمر> في الإنتاج)
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { eq } from 'drizzle-orm';
import { loadConfig } from '../config';
import { AppDatabase, schema } from '../db/client';
import { hashPassword } from '../lib/password';
import { decryptFile } from '../lib/crypto-file';
import { BackupService } from '../modules/backup/service';
import { createUser, findUserByEmail, listUsers } from '../modules/users/service';
import { seedDemo } from '../demo/seed';
import { installArabicZod, passwordSchema } from '../../shared/schemas';

const HELP = `
سجلي — أدوات الصيانة

الاستخدام:  npm run cli -- <أمر> [خيارات]

الأوامر:
  create-admin --email <بريد> --name <الاسم> [--password <كلمة>]   إنشاء مدير (أو ترقية مستخدم موجود)
  reset-password --email <بريد> [--password <كلمة>]                 إعادة تعيين كلمة مرور (يُطلب تغييرها عند الدخول)
  list-users                                                         عرض المستخدمين
  backup                                                             إنشاء نسخة احتياطية الآن
  restore <ملف> --yes                                                استعادة نسخة (أوقف الخادم أولًا!)
  decrypt-backup <ملف.enc> <ملف.sqlite>                              فك تشفير نسخة (يلزم BACKUP_PASSPHRASE)
  check                                                              فحص سلامة قاعدة البيانات وعدّ السجلات
  migrate                                                            تطبيق هجرات قاعدة البيانات
  seed-demo [--email <بريد>] [--password <كلمة>]                     إنشاء حساب تجريبي ببيانات وهمية (منفصل عن الحقيقي)
  purge-demo                                                         حذف كل الحسابات التجريبية وبياناتها
`;

function generatePassword(): string {
  const alphabet = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = randomBytes(16);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

async function main() {
  installArabicZod();
  const [command, ...rest] = process.argv.slice(2);
  const { values, positionals } = parseArgs({
    args: rest,
    allowPositionals: true,
    options: {
      email: { type: 'string' },
      name: { type: 'string' },
      password: { type: 'string' },
      yes: { type: 'boolean' },
    },
  });
  if (!command || command === 'help' || command === '--help') {
    console.log(HELP);
    return;
  }

  const config = loadConfig();
  const db = AppDatabase.open(config.databaseFile);
  const backupLog = { info: (o: object, m?: string) => console.log(m ?? '', o), error: (o: object, m?: string) => console.error(m ?? '', o) };

  const migrate = () => {
    const pending = db.pendingMigrations(config.migrationsDir);
    if (pending > 0 && db.hasUserData()) {
      console.log(`⏳ ${pending} هجرة معلّقة — نسخة احتياطية قبل الترقية…`);
    }
    db.migrate(config.migrationsDir);
  };

  try {
    switch (command) {
      case 'migrate': {
        const pending = db.pendingMigrations(config.migrationsDir);
        if (pending > 0 && db.hasUserData()) {
          const b = await new BackupService(db, config, backupLog).create('pre-migration');
          console.log('✔ نسخة احتياطية قبل الترقية:', b.name);
        }
        db.migrate(config.migrationsDir);
        console.log('✔ قاعدة البيانات محدّثة');
        break;
      }

      case 'create-admin': {
        migrate();
        if (!values.email || !values.name) throw new Error('يلزم --email و --name');
        const password = values.password ?? generatePassword();
        const ok = passwordSchema.safeParse(password);
        if (!ok.success) throw new Error(ok.error.issues[0]!.message);
        const existing = findUserByEmail(db.orm, values.email);
        if (existing) {
          db.orm.update(schema.users).set({ role: 'admin', status: 'active' }).where(eq(schema.users.id, existing.id)).run();
          console.log(`✔ رُقّي المستخدم ${existing.email} إلى مدير`);
        } else {
          await createUser(db.orm, config.scrypt, { email: values.email, fullName: values.name, password, role: 'admin' });
          console.log(`✔ أُنشئ المدير ${values.email}`);
          if (!values.password) console.log(`  كلمة المرور المؤقتة: ${password}   (غيّرها بعد الدخول)`);
        }
        break;
      }

      case 'reset-password': {
        if (!values.email) throw new Error('يلزم --email');
        const user = findUserByEmail(db.orm, values.email);
        if (!user) throw new Error('المستخدم غير موجود');
        const password = values.password ?? generatePassword();
        const ok = passwordSchema.safeParse(password);
        if (!ok.success) throw new Error(ok.error.issues[0]!.message);
        db.orm
          .update(schema.users)
          .set({ passwordHash: await hashPassword(password, config.scrypt), mustChangePassword: true, failedLogins: 0, lockedUntil: null })
          .where(eq(schema.users.id, user.id))
          .run();
        db.orm.delete(schema.sessions).where(eq(schema.sessions.userId, user.id)).run();
        console.log(`✔ أُعيد تعيين كلمة مرور ${user.email}`);
        if (!values.password) console.log(`  كلمة المرور المؤقتة: ${password}`);
        break;
      }

      case 'list-users': {
        migrate();
        for (const u of listUsers(db.orm)) console.log(`${u.role.padEnd(8)} ${u.status.padEnd(9)} ${u.email}${u.isDemo ? '  [تجريبي]' : ''}`);
        break;
      }

      case 'backup': {
        migrate();
        const b = await new BackupService(db, config, backupLog).create('manual');
        console.log('✔ تم إنشاء النسخة الاحتياطية:', path.join(config.backupDir, b.name));
        break;
      }

      case 'restore': {
        const file = positionals[0];
        if (!file) throw new Error('حدّد ملف النسخة الاحتياطية');
        if (!values.yes) throw new Error('الاستعادة تستبدل كل البيانات الحالية. أضف --yes للتأكيد (بعد إيقاف الخادم)');
        const svc = new BackupService(db, config, backupLog);
        const res = await svc.restoreFrom(path.resolve(file));
        console.log(`✔ تمت الاستعادة (${res.users} مستخدم). نسخة أمان من الحالة السابقة: ${res.safety}`);
        break;
      }

      case 'decrypt-backup': {
        const [src, dest] = positionals;
        if (!src || !dest) throw new Error('الاستخدام: decrypt-backup <ملف.enc> <ملف.sqlite>');
        if (!config.backupPassphrase) throw new Error('اضبط BACKUP_PASSPHRASE');
        await decryptFile(path.resolve(src), path.resolve(dest), config.backupPassphrase);
        console.log('✔ فُكّ التشفير →', dest);
        break;
      }

      case 'check': {
        migrate();
        console.log('سلامة القاعدة:', db.integrityCheck());
        for (const t of ['users', 'academic_years', 'sections', 'students', 'lesson_plans', 'assessments', 'assessment_results', 'tasks']) {
          const n = (db.sqlite.prepare(`select count(*) c from ${t}`).get() as { c: number }).c;
          console.log(`  ${t.padEnd(20)} ${n}`);
        }
        console.log('ملف القاعدة:', config.databaseFile, `(${(fs.statSync(config.databaseFile).size / 1024).toFixed(0)} KB)`);
        break;
      }

      case 'seed-demo': {
        migrate();
        const email = values.email ?? 'demo@sijilli.local';
        if (findUserByEmail(db.orm, email)) throw new Error(`الحساب ${email} موجود. نفّذ purge-demo أولًا`);
        const password = values.password ?? generatePassword();
        const ok = passwordSchema.safeParse(password);
        if (!ok.success) throw new Error(ok.error.issues[0]!.message);
        await seedDemo(db.orm, { email, password, scrypt: config.scrypt, timezone: config.timezone });
        console.log('✔ أُنشئ الحساب التجريبي (بيانات وهمية للتوضيح فقط):');
        console.log(`  البريد: ${email}`);
        console.log(`  كلمة المرور: ${password}`);
        break;
      }

      case 'purge-demo': {
        const demo = db.orm.select().from(schema.users).where(eq(schema.users.isDemo, true)).all();
        for (const u of demo) db.orm.delete(schema.users).where(eq(schema.users.id, u.id)).run();
        console.log(`✔ حُذف ${demo.length} حساب تجريبي مع كل بياناته`);
        break;
      }

      default:
        console.log(HELP);
        process.exitCode = 1;
    }
  } finally {
    db.close();
  }
}

main().catch((err) => {
  console.error('✘', err instanceof Error ? err.message : err);
  process.exit(1);
});
