"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getAllVaults, createVault, updateVault } from "@/app/actions/admin/vaults";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

// Vault type definition
type Vault = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  createdAt: string;
  updatedAt: string;
};

export default function VaultPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVault, setEditingVault] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  // Form data for new/edit vault
  const [formData, setFormData] = useState({
    name: '',
    startsAt: '',
    endsAt: ''
  });

  // Redirect non-admin users
  useEffect(() => {
    if (isAuthenticated && !user?.isAdmin) {
      router.push('/');
    }
  }, [isAuthenticated, user, router]);

  // Fetch vaults
  useEffect(() => {
    const fetchVaults = async () => {
      if (!isAuthenticated || !user?.isAdmin) return;

      setLoading(true);
      
      try {
        const result = await getAllVaults();
        if (result.success && result.vaults) {
          setVaults(result.vaults);
        } else {
          setActionMessage({
            type: 'error',
            text: result.message || 'Failed to fetch vaults'
          });
        }
      } catch (error) {
        //console.error("Error fetching vaults:", error);
        setActionMessage({
          type: 'error',
          text: 'An error occurred while fetching vaults'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVaults();
  }, [isAuthenticated, user?.isAdmin]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Format date for input
  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDThh:mm
  };

  // Check if vault is currently active (current date is between start and end date)
  const isVaultActive = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission for new vault
  const handleAddVault = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createVault(formData);
      
      if (result.success && result.vault) {
        setVaults([...vaults, result.vault]);
        setShowAddForm(false);
        setFormData({
          name: '',
          startsAt: '',
          endsAt: ''
        });
        setActionMessage({
          type: 'success',
          text: 'Vault created successfully'
        });
      } else {
        setActionMessage({
          type: 'error',
          text: result.message || 'Failed to create vault'
        });
      }
    } catch (error) {
      //console.error("Error creating vault:", error);
      setActionMessage({
        type: 'error',
        text: 'An error occurred while creating the vault'
      });
    }
  };

  // Handle form submission for editing vault
  const handleUpdateVault = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingVault) return;
    
    try {
      const result = await updateVault(editingVault, formData);
      
      if (result.success && result.vault) {
        setVaults(vaults.map(vault => 
          vault.id === editingVault ? result.vault : vault
        ));
        setEditingVault(null);
        setFormData({
          name: '',
          startsAt: '',
          endsAt: ''
        });
        setActionMessage({
          type: 'success',
          text: 'Vault updated successfully'
        });
      } else {
        setActionMessage({
          type: 'error',
          text: result.message || 'Failed to update vault'
        });
      }
    } catch (error) {
      //console.error("Error updating vault:", error);
      setActionMessage({
        type: 'error',
        text: 'An error occurred while updating the vault'
      });
    }
  };

  // Start editing a vault
  const startEditing = (vault: Vault) => {
    setEditingVault(vault.id);
    setFormData({
      name: vault.name,
      startsAt: formatDateForInput(vault.startsAt),
      endsAt: formatDateForInput(vault.endsAt)
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingVault(null);
    setFormData({
      name: '',
      startsAt: '',
      endsAt: ''
    });
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Vault Management</h1>
          <p className="text-foreground/70 mt-1">Manage time vaults for content access</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <Button 
            onClick={() => setShowAddForm(!showAddForm)}
            variant="primary"
          >
            {showAddForm ? 'Cancel' : 'Add New Vault'}
          </Button>
        </div>
      </div>

      {/* Action message */}
      {actionMessage && (
        <div className={`p-4 mb-6 rounded-lg ${actionMessage.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {actionMessage.text}
          <Button 
            className="float-right" 
            onClick={() => setActionMessage(null)}
            variant="ghost"
            size="sm"
          >
            &times;
          </Button>
        </div>
      )}

      {/* Add/Edit Form */}
      {(showAddForm || editingVault) && (
        <div className="bg-background p-6 rounded-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingVault ? 'Edit Vault' : 'Add New Vault'}
          </h2>
          <form onSubmit={editingVault ? handleUpdateVault : handleAddVault}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-foreground mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="startsAt"
                  value={formData.startsAt}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="endsAt"
                  value={formData.endsAt}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-border rounded-lg bg-background text-foreground"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                onClick={editingVault ? cancelEditing : () => setShowAddForm(false)}
                variant="ghost"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {editingVault ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-foreground/20 border-t-primary"></div>
          <p className="mt-2 text-foreground/70">Loading vaults...</p>
        </div>
      ) : (
        <>
          {/* Vaults table */}
          {vaults.length > 0 ? (
            <div className="modern-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border">
                  <thead>
                    <tr>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">
                        Name
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">
                        Start Date
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">
                        End Date
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">
                        Created
                      </th>
                      <th className="px-4 py-3.5 text-left text-sm font-semibold text-foreground/70">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {vaults.map((vault) => (
                      <tr 
                        key={vault.id}
                      >
                        <td className="px-4 py-4">
                          <div className="text-sm font-medium text-foreground">
                            {vault.name}
                            {isVaultActive(vault.startsAt, vault.endsAt) && 
                              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                                Active
                              </span>
                            }
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-foreground/70">{formatDate(vault.startsAt)}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-foreground/70">{formatDate(vault.endsAt)}</div>
                        </td>
                        <td className="px-4 py-4 text-sm text-foreground/70">
                          {formatDate(vault.createdAt)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => startEditing(vault)}
                              variant="ghost"
                              size="icon"
                              className="text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 p-1.5"
                              title="Edit Vault"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-background rounded-lg shadow-md border border-border">
              <svg className="mx-auto h-12 w-12 text-foreground/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m-8-4l8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-foreground">No vaults found</h3>
              <p className="mt-2 text-sm text-foreground/70">
                Create a new vault to get started.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
