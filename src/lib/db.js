import { Pool } from 'pg';
import mysql from 'mysql2/promise';

let qonevoPool = null;
let makerspacePool = null;
let labsPool = null;

function cleanEnv(val) {
  if (!val) return '';
  let str = String(val).trim();
  if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
    return str.slice(1, -1);
  }
  return str;
}

// Timeout wrapper to prevent DB queries from hanging server responses
function withTimeout(promise, ms = 4000) {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Database query timed out')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
}

function getQonevoPool() {
  if (typeof window !== 'undefined') return null;

  if (!qonevoPool) {
    const host = cleanEnv(process.env.QONEVO_DB_HOST);
    const user = cleanEnv(process.env.QONEVO_DB_USER);
    const password = cleanEnv(process.env.QONEVO_DB_PASSWORD);
    const database = cleanEnv(process.env.QONEVO_DB_NAME);

    if (host && user && password && database) {
      qonevoPool = new Pool({
        host,
        port: process.env.QONEVO_DB_PORT ? parseInt(cleanEnv(process.env.QONEVO_DB_PORT), 10) : 5432,
        user,
        password,
        database,
        connectionTimeoutMillis: 3500,
        ssl: cleanEnv(process.env.QONEVO_DB_SSLMODE) === 'require' ? { rejectUnauthorized: false } : false
      });
    } else if (process.env.QONEVO_DATABASE_URL) {
      qonevoPool = new Pool({
        connectionString: cleanEnv(process.env.QONEVO_DATABASE_URL),
        connectionTimeoutMillis: 3500
      });
    }
  }

  return qonevoPool;
}

function getMakerspacePool() {
  if (typeof window !== 'undefined') return null;

  if (!makerspacePool) {
    const host = cleanEnv(process.env.MAKERSPACE_DB_HOST);
    const user = cleanEnv(process.env.MAKERSPACE_DB_USER);
    const password = cleanEnv(process.env.MAKERSPACE_DB_PASSWORD);
    const database = cleanEnv(process.env.MAKERSPACE_DB_NAME);

    if (host && user && password && database) {
      makerspacePool = mysql.createPool({
        host,
        port: process.env.MAKERSPACE_DB_PORT ? parseInt(cleanEnv(process.env.MAKERSPACE_DB_PORT), 10) : 3306,
        user,
        password,
        database,
        connectTimeout: 3500,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });
    } else if (process.env.MAKERSPACE_DATABASE_URL) {
      makerspacePool = mysql.createPool(cleanEnv(process.env.MAKERSPACE_DATABASE_URL));
    }
  }

  return makerspacePool;
}

function getLabsPool() {
  if (typeof window !== 'undefined') return null;

  if (!labsPool) {
    const host = cleanEnv(process.env.LABS_DB_HOST);
    const user = cleanEnv(process.env.LABS_DB_USER);
    const password = cleanEnv(process.env.LABS_DB_PASSWORD);
    const database = cleanEnv(process.env.LABS_DB_NAME);

    if (host && user && password && database) {
      labsPool = new Pool({
        host,
        port: process.env.LABS_DB_PORT ? parseInt(cleanEnv(process.env.LABS_DB_PORT), 10) : 5432,
        user,
        password,
        database,
        connectionTimeoutMillis: 3500,
      });
    } else if (process.env.LABS_DATABASE_URL) {
      labsPool = new Pool({
        connectionString: cleanEnv(process.env.LABS_DATABASE_URL),
        connectionTimeoutMillis: 3500
      });
    }
  }

  return labsPool;
}

/**
 * Fetch live Qonevo contact form submissions from PostgreSQL DB.
 */
export async function getQonevoContacts() {
  const pool = getQonevoPool();

  if (!pool) {
    return [];
  }

  try {
    const result = await withTimeout(pool.query('SELECT * FROM contacts ORDER BY id DESC LIMIT 200'), 3500);
    if (result && result.rows && result.rows.length > 0) {
      return result.rows.map(row => ({
        id: row.id,
        full_name: row.full_name || '',
        email: row.email || '',
        phone_number: row.phone_number || '',
        company_name: row.company_name || '',
        website_url: row.website_url || '',
        help_message: row.help_message || '',
        created_at: row.created_at || new Date().toISOString(),
        source: 'Qonevo'
      }));
    }
    return [];
  } catch (error) {
    console.warn('Qonevo DB query failed:', error.message);
    return [];
  }
}

/**
 * Fetch live Makerspace site enquiries from MariaDB DB.
 */
export async function getMakerspaceEnquiries() {
  const pool = getMakerspacePool();

  if (!pool) {
    return [];
  }

  try {
    const [rows] = await withTimeout(pool.query("SELECT * FROM enquiries ORDER BY id DESC LIMIT 200"), 3500);
    if (rows && rows.length > 0) {
      return rows.map(row => ({
        id: row.id,
        first_name: row.first_name || '',
        last_name: row.last_name || '',
        full_name: `${row.first_name || ''} ${row.last_name || ''}`.trim(),
        email: row.email || '',
        phone: row.phone || '',
        role: row.role || '',
        institution: row.institution || '',
        organization_type: row.organization_type || '',
        location: row.location || '',
        students: row.students || '',
        solution_interest: row.solution_interest || '',
        implementation_time: row.implementation_time || '',
        comment: row.comment || '',
        created_at: row.created_at || new Date().toISOString(),
        source: 'Makerspace Site'
      }));
    }
    return [];
  } catch (error) {
    console.warn('Makerspace DB query failed:', error.message);
    return [];
  }
}

/**
 * Fetch live Labs site submissions from PostgreSQL database 'advertisment'.
 */
export async function getLabsSubmissions() {
  const pgPool = getLabsPool();

  if (!pgPool) {
    return [];
  }

  try {
    const result = await withTimeout(pgPool.query('SELECT * FROM enquiries ORDER BY created_at DESC LIMIT 200'), 3500);
    if (result && result.rows && result.rows.length > 0) {
      return result.rows.map(row => ({
        id: row.id,
        full_name: row.name || row.full_name || '',
        email: row.email || '',
        phone: row.phone || row.phone_number || '',
        institution: row.institution || '',
        city: row.city || '',
        designation: row.designation || row.role || '',
        message: row.message || row.comment || '',
        status: row.status || '',
        source_form: row.source || '',
        created_at: row.created_at || new Date().toISOString(),
        source: 'Labs Site'
      }));
    }
    return [];
  } catch (error) {
    console.warn('Labs DB query failed:', error.message);
    return [];
  }
}

/**
 * Fetch unified list of submissions from all live database sources.
 */
export async function getAllSubmissions() {
  const [qonevo, makerspace, labs] = await Promise.all([
    getQonevoContacts(),
    getMakerspaceEnquiries(),
    getLabsSubmissions()
  ]);

  const normalizedQonevo = qonevo.map(item => ({
    id: `qonevo-${item.id}`,
    original_id: item.id,
    source: 'Qonevo',
    full_name: item.full_name,
    email: item.email,
    phone: item.phone_number,
    company_or_institution: item.company_name,
    website_or_type: item.website_url,
    message: item.help_message,
    role: 'N/A',
    location: 'N/A',
    created_at: item.created_at,
    raw: item
  }));

  const normalizedMakerspace = makerspace.map(item => ({
    id: `makerspace-${item.id}`,
    original_id: item.id,
    source: 'Makerspace Site',
    full_name: item.full_name || `${item.first_name || ''} ${item.last_name || ''}`.trim(),
    email: item.email,
    phone: item.phone,
    company_or_institution: item.institution,
    website_or_type: item.organization_type,
    message: item.comment,
    role: item.role,
    location: item.location,
    created_at: item.created_at,
    raw: item
  }));

  const normalizedLabs = labs.map(item => ({
    id: `labs-${item.id}`,
    original_id: item.id,
    source: 'Labs Site',
    full_name: item.full_name,
    email: item.email,
    phone: item.phone,
    company_or_institution: item.institution,
    website_or_type: item.city ? `City: ${item.city}` : 'Innovation Lab',
    message: item.message,
    role: item.designation || 'N/A',
    location: item.city || 'N/A',
    created_at: item.created_at,
    raw: item
  }));

  const combined = [...normalizedQonevo, ...normalizedMakerspace, ...normalizedLabs];
  combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return combined;
}
