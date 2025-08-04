'use server';

import { isAdmin } from '@/lib/auth-server';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

// Type for Vault data
export type VaultData = {
  id?: string;
  name: string;
  startsAt: Date | string;
  endsAt: Date | string;
};

// Get all vaults
export async function getAllVaults() {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return { 
        success: false, 
        message: "Unauthorized: Admin access required" 
      };
    }

    // Fetch all vaults
    const vaults = await prisma.vault.findMany({
      orderBy: { startsAt: 'asc' }
    });

    // Serialize date fields to strings to match the Vault type in the frontend
    const serializedVaults = vaults.map(vault => ({
      ...vault,
      startsAt: vault.startsAt.toISOString(),
      endsAt: vault.endsAt.toISOString(),
      createdAt: vault.createdAt.toISOString(),
      updatedAt: vault.updatedAt.toISOString()
    }));

    return { 
      success: true, 
      vaults: serializedVaults 
    };
  } catch (error) {
    //console.error('Error fetching vaults:', error);
    return { 
      success: false, 
      message: 'Failed to fetch vaults' 
    };
  }
}

// Create a new vault
export async function createVault(data: VaultData) {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return { 
        success: false, 
        message: "Unauthorized: Admin access required" 
      };
    }

    // Create the vault
    const vault = await prisma.vault.create({
      data: {
        name: data.name,
        startsAt: new Date(data.startsAt),
        endsAt: new Date(data.endsAt)
      }
    });

    // Serialize date fields to strings to match the Vault type in the frontend
    const serializedVault = {
      ...vault,
      startsAt: vault.startsAt.toISOString(),
      endsAt: vault.endsAt.toISOString(),
      createdAt: vault.createdAt.toISOString(),
      updatedAt: vault.updatedAt.toISOString()
    };

    revalidatePath('/admin/vault');
    
    return { 
      success: true, 
      vault: serializedVault 
    };
  } catch (error) {
    //console.error('Error creating vault:', error);
    return { 
      success: false, 
      message: 'Failed to create vault' 
    };
  }
}

// Update an existing vault
export async function updateVault(id: string, data: Partial<VaultData>) {
  try {
    // Verify the user is an admin using NextAuth
    const adminAccess = await isAdmin();
    if (!adminAccess) {
      return { 
        success: false, 
        message: "Unauthorized: Admin access required" 
      };
    }

    // Update the vault
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.startsAt !== undefined) updateData.startsAt = new Date(data.startsAt);
    if (data.endsAt !== undefined) updateData.endsAt = new Date(data.endsAt);

    const vault = await prisma.vault.update({
      where: { id },
      data: updateData
    });

    // Serialize date fields to strings to match the Vault type in the frontend
    const serializedVault = {
      ...vault,
      startsAt: vault.startsAt.toISOString(),
      endsAt: vault.endsAt.toISOString(),
      createdAt: vault.createdAt.toISOString(),
      updatedAt: vault.updatedAt.toISOString()
    };

    revalidatePath('/admin/vault');
    
    return { 
      success: true, 
      vault: serializedVault 
    };
  } catch (error) {
    //console.error('Error updating vault:', error);
    return { 
      success: false, 
      message: 'Failed to update vault' 
    };
  }
}
