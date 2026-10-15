# سجلي — صورة إنتاج (Node 22 + Chromium لتصدير PDF).
# البناء:   docker build -t sijilli .
# التشغيل:  docker run -d --name sijilli -p 127.0.0.1:3000:3000 -v sijilli-data:/data sijilli
# مهم: مجلد /data يحوي القاعدة والنسخ الاحتياطية — احفظه على قرص دائم (volume) وانسخه خارج الخادم.

# ───────── مرحلة البناء ─────────
FROM node:22-bookworm-slim AS build
WORKDIR /app
# أدوات البناء احتياطًا إن لم تتوفر ثنائيات better-sqlite3 الجاهزة لمعمارية الجهاز
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

# ───────── مرحلة التشغيل ─────────
FROM node:22-bookworm-slim AS runtime
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATA_DIR=/data \
    CHROMIUM_PATH=/usr/bin/chromium \
    PDF_NO_SANDBOX=true
# Chromium لتوليد PDF. الخطوط العربية مضمّنة داخل التقارير نفسها فلا حاجة لخطوط النظام.
RUN apt-get update && apt-get install -y --no-install-recommends chromium ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
RUN mkdir -p /data && chown -R node:node /data
USER node
VOLUME ["/data"]
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server/index.js"]
