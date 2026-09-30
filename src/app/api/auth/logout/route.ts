import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'সফলভাবে লগআউট হয়েছে' });
  response.cookies.delete('poultry_session_token');
  return response;
}
