import {getRequestConfig} from 'next-intl/server';
import fs from 'fs';
import path from 'path';
import {cookies} from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookie or default to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get('NEXT_LOCALE')?.value || 'en';
  
  const messagesDirectory = path.join(process.cwd(), 'messages', locale);
  const messageFiles = fs.readdirSync(messagesDirectory);
  
  const messages: Record<string, any> = {};
  for (const file of messageFiles) {
    if (file.endsWith('.json')) {
      const namespace = file.replace('.json', '');
      messages[namespace] = (await import(`../../messages/${locale}/${file}`)).default;
    }
  }
  
  return {
    locale,
    messages
  };
});