'use client';
import { Mail, MapPin, Phone, User, Users } from "lucide-react";

interface PicData {
  name: string;
  contact: string;
}

interface StoryProps {
  background?: string;
  problem?: string[];   // only arrays now
  solution?: string[];
  email?: string;
  phone?: string;
  location?: string;
  pics?: PicData[];
}

export default function OurStory({
  background,
  problem = [],
  solution = [],
  email,
  phone,
  location,
  pics
}: StoryProps) {

  const renderList = (items: string[]) => {
    if (items.length === 0) return null;
    if (items.length === 1 && items[0].length > 50) {
      return <p className="text-gray-600 leading-relaxed whitespace-pre-line">{items[0]}</p>;
    }
    return (
      <ul className="list-disc pl-5 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="text-gray-600 leading-relaxed pl-1">{item}</li>
        ))}
      </ul>
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full">
      <div className="w-full lg:w-2/3 space-y-8">
        {background && (
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Background</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">{background}</p>
          </section>
        )}

        {problem.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">The Problem</h3>
            {renderList(problem)}
          </section>
        )}

        {solution.length > 0 && (
          <section>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Our Solution</h3>
            {renderList(solution)}
          </section>
        )}

        {!background && problem.length === 0 && solution.length === 0 && (
          <div className="p-8 text-center bg-gray-50 rounded-xl text-gray-500 italic">
            No detailed story provided for this campaign.
          </div>
        )}
      </div>

      {/* Sidebar unchanged */}
      <div className="w-full lg:w-1/3 h-fit mb-24 p-8">
        <div className="pb-12 bg-gray-50 border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* Organization Details */}
          <div className="p-6">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-orange-600"/> Organization Details
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-gray-600">
                <Mail size={18} className="text-orange-500 flex-shrink-0"/>
                <span className="text-sm truncate" title={email}>{email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-600">
                <Phone size={18} className="text-orange-500 flex-shrink-0"/>
                <span className="text-sm">{phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-start gap-3 text-gray-600">
                <MapPin size={18} className="text-orange-500 flex-shrink-0 mt-0.5"/>
                <span className="text-sm">{location || 'No address provided'}</span>
              </div>
            </div>
          </div>

          {pics && pics.length > 0 && <div className="h-px bg-gray-200 w-full"></div>}

          {pics && pics.length > 0 && (
            <div className="p-6">
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-orange-600"/> Person In Charge
              </h4>
              <div className="space-y-4">
                {pics.map((pic, index) => (
                  <div key={index} className="flex items-start gap-3 bg-white p-3 rounded-lg border border-orange-100 shadow-sm">
                    <div className="mt-0.5 bg-orange-100 p-1.5 rounded-full">
                      <User size={14} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{pic.name}</p>
                      <p className="text-xs text-gray-600 font-mono mt-0.5">
                        {pic.contact || 'No Contact'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
