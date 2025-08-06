import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the messages directory path
    const messagesDir = path.join(process.cwd(), 'messages');
    
    // Check if the directory exists
    if (!fs.existsSync(messagesDir)) {
      return NextResponse.json({ error: 'Messages directory not found' }, { status: 404 });
    }
    
    // Read all directories in the messages folder
    // Each directory represents an available locale
    const locales = fs.readdirSync(messagesDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    return NextResponse.json(locales);
  } catch (error) {
    console.error('Error fetching available locales:', error);
    return NextResponse.json({ error: 'Failed to fetch available locales' }, { status: 500 });
  }
}
