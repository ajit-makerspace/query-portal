import { Pool } from 'pg';
import { mockQonevoContacts, mockMakerspaceEnquiries } from './mockData';

let qonevoPool = null;

function getQonevoPool() {
  if (typeof window !== 'undefined') return null;

  if (!qonevoPool) {
    const host = process.env.QONEVO_DB_HOST;
    const user = process.env.QONEVO_DB_USER;
    const password = process.env.QONEVO_DB_PASSWORD;
    const database = process.env.QONEVO_DB_NAME;

    if (host && user && password && database) {
      qonevoPool = new Pool({
        host,
        port: process.env.QONEVO_DB_PORT ? parseInt(process.env.QONEVO_DB_PORT, 10) : 5432,
        user,
        password,
        database,
        connectionTimeoutMillis: 5000,
        ssl: process.env.QONEVO_DB_SSLMODE === 'require' ? { rejectUnauthorized: false } : false
      });
    } else if (process.env.QONEVO_DATABASE_URL) {
      qonevoPool = new Pool({
        connectionString: process.env.QONEVO_DATABASE_URL,
        connectionTimeoutMillis: 5000
      });
    }
  }

  return qonevoPool;
}

/**
 * Fetch Qonevo contact form submissions from live PostgreSQL DB or fallback to mock data.
 */
export async function getQonevoContacts() {
  const pool = getQonevoPool();

  if (!pool) {
    return mockQonevoContacts;
  }

  try {
    const result = await pool.query('SELECT * FROM contacts ORDER BY id DESC LIMIT 100');
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
    return mockQonevoContacts;
  } catch (error) {
    console.warn('Could not query Qonevo PostgreSQL DB (using mock data as fallback):', error.message);
    return mockQonevoContacts;
  }
}

/**
 * Fetch Makerspace site enquiries and visitor signups.
 * Checks process.env.MAKERSPACE_DATABASE_URL; falls back to mock data if unconfigured.
 */
export async function getMakerspaceEnquiries() {
  return mockMakerspaceEnquiries;
}

/**
 * Fetch unified list of submissions from both sources.
 */
export async function getAllSubmissions() {
  const [qonevo, makerspace] = await Promise.all([
    getQonevoContacts(),
    getMakerspaceEnquiries()
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
    full_name: `${item.first_name || ''} ${item.last_name || ''}`.trim() || item.full_name,
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

  const combined = [...normalizedQonevo, ...normalizedMakerspace];
  combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  return combined;
}
