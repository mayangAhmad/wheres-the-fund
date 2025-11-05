// app/ngo/dashboard/ngo-dashboard-content.tsx
"use client";

import { User } from "@supabase/supabase-js";
import { useState, FormEvent } from 'react'; // Import React hooks

interface DashboardContentProps {
  user: User;
}

// Define a type for the API response
interface CreateCampaignResponse {
    success: boolean;
    campaignId?: string;
    txHash?: string;
    error?: string;
}

export default function NgoDashboardContent({ user }: DashboardContentProps) {
  // --- ADD STATE FOR THE FORM ---
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // --- ADD THE SUBMIT HANDLER ---
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoading(true);
      setError(null);

      try {
          // This is the fetch call you had, now
          // triggered by the user's action.
          const response = await fetch('/api/campaigns/create', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title }),
          });

          const data: CreateCampaignResponse = await response.json();

          if (!response.ok || !data.success) {
              throw new Error(data.error || 'Failed to create campaign');
          }

          console.log('Success:', data);
          alert(`Campaign created successfully! ID: ${data.campaignId}`);
          setTitle(''); // Clear the form
          
          // You might want to refresh a list of campaigns here
          
      } catch (err: unknown) {
          if (err instanceof Error) {
              setError(err.message);
          } else {
              setError('An unexpected error occurred');
          }
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ngo Dashboard</h1>
        <p>Welcome, {user.email}!</p>
      </div>

      <hr />

      {/* --- ADD THE CREATE CAMPAIGN FORM HERE --- */}
      <div className="max-w-md">
        <h2 className="text-xl font-semibold">Create a New Campaign</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium">
              Campaign Title
            </label>
            <input
              id="title"
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-black" // Added text-black for visibility
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Save the Rainforest"
              disabled={loading}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Campaign'}
          </button>
          
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>

    </div>
  );
}