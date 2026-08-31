import { NextResponse } from 'next/server';
import { getQonevoContacts } from '@/lib/db';

export async function GET() {
  try {
    const data = await getQonevoContacts();
    return NextResponse.json({ success: true, count: data.length, data });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
