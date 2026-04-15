process.env.E2E_MINIMAL = '0';
process.env.ADMIN_UPLOAD_SECRET ??= 'e2e-upload-secret';
process.env.DATABASE_URL ??=
  'postgresql://app:app@127.0.0.1:5433/postgres';
