"use client";

import { useState } from "react";
import { Search, Mail, ShieldCheck, BadgeCheck, UserCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminUsersClient({ initialUsers }: { initialUsers: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredUsers = initialUsers.filter((u) => {
    const matchesSearch = u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* 1. Filters Header */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            placeholder="Search by name or email..." 
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            className="border rounded-md px-3 py-2 text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="ngo">NGO</option>
            <option value="donor">Donor</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* 2. Vertical List of Separated Cards */}
      <div className="flex flex-col gap-4">
        {filteredUsers.map((user) => (
          <div 
            key={user.id} 
            className="bg-white border rounded-xl p-5 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            {/* Left Section: Identity */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                {user.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div>
                <h4 className="font-bold text-gray-900 flex items-center gap-2">
                  {user.full_name}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                    user.role === 'ngo' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                    user.role === 'admin' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-blue-50 text-blue-700 border-blue-100'
                  }`}>
                    {user.role}
                  </span>
                </h4>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail size={14} className="text-gray-400" /> 
                  {user.email}
                </div>
              </div>
            </div>

            {/* Right Section: Metadata & Status */}
            <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
              <div className="flex items-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1">
                  <ShieldCheck size={14} /> Registered {new Date(user.created_at).toLocaleDateString()}
                </span>
                {user.role === 'ngo' && (
                  <span className="text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                    <BadgeCheck size={14} /> Verified NGO
                  </span>
                )}
              </div>
              <span className="text-[10px] text-gray-300 font-mono hidden md:block">
                UUID: {user.id.slice(0, 8)}...
              </span>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="bg-gray-50 border border-dashed rounded-xl p-12 text-center text-gray-500">
            No users found matching your search or filters.
          </div>
        )}
      </div>
    </div>
  );
}