# El paquete se prepara con npm run staging:package. No compilar una demo dentro de esta imagen.
FROM node:24.19.0-alpine@sha256:d32cdf619f63fe0471182d08996dd516c6275bb5fd31ae06e55a570bd9e1ad43
ARG SOURCE_REVISION
LABEL org.opencontainers.image.revision=$SOURCE_REVISION
WORKDIR /app
COPY --chown=node:node staging/release/ ./
# El certificado del proxy de construcción es efímero y no se guarda en capas.
RUN --mount=type=secret,id=build_ca,required=true NODE_EXTRA_CA_CERTS=/run/secrets/build_ca npm ci --omit=dev --ignore-scripts --no-audit --no-fund && npm cache clean --force
USER node
ENV NODE_ENV=production HOST=0.0.0.0 PORT=3000
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD ["node","--input-type=module","-e","fetch('http://127.0.0.1:3000/health/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]
CMD ["sh","-c","node preflight.mjs && exec node dist/apps/server/main.js"]
