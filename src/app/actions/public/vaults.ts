'use server';

import prisma from '@/lib/prisma';

// Get the current active vault (where current date is between startsAt and endsAt)
export async function getCurrentVault() {
  try {
    const now = new Date();
    
    // Find a vault where the current date is between startsAt and endsAt
    const currentVault = await prisma.vault.findFirst({
      where: {
        startsAt: { lte: now },
        endsAt: { gte: now }
      }
    });
    
    return { 
      success: true, 
      vault: currentVault 
    };
  } catch (error) {
    //console.error('Error fetching current vault:', error);
    return { 
      success: false, 
      message: 'Failed to fetch current vault' 
    };
  }
}
