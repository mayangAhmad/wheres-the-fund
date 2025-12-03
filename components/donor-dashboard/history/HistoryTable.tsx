import { ExternalLink, FileText } from "lucide-react";
import { format } from "date-fns"; 
import StatusBadge from "./StatusBadge";
import { DonationRecord } from "./HIstoryClientView";

export default function HistoryTable({ donations }: { donations: DonationRecord[] }) {
  const explorerUrl = process.env.NEXT_PUBLIC_BLOCK_EXPLORER_URL || "http://localhost";

  if (donations.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-lg border border-gray-200 border-dashed">
        <div className="mx-auto h-12 w-12 text-gray-400">
          <FileText className="h-12 w-12" />
        </div>
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No donations found</h3>
        <p className="mt-1 text-sm text-gray-500">You haven't made any donations matching these filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Campaign
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blockchain Proof
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {donations.map((donation) => (
              <tr key={donation.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(donation.created_at), "MMM d, yyyy")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {donation.campaigns?.title || "Campaign Unavailable"}
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    ID: {donation.id.slice(0, 8)}...
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  RM {Number(donation.amount).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={donation.status || "processing"} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {donation.on_chain_tx_hash ? (
                    <a
                      href={`${explorerUrl}/tx/${donation.on_chain_tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-center text-blue-600 hover:text-blue-800 hover:underline transition-all"
                    >
                      <span className="font-mono">
                        {donation.on_chain_tx_hash.slice(0, 6)}...
                        {donation.on_chain_tx_hash.slice(-4)}
                      </span>
                      <ExternalLink className="w-3 h-3 ml-1 opacity-70 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <span className="text-gray-400 text-xs italic">
                      Pending on-chain...
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}