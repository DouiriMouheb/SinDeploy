// src/components/Customers/CustomerTable.jsx - Customer table component
import React from "react";
import { Settings, Building2, Mail, Phone, MapPin } from "lucide-react";
import { Button } from "../common/Button";

const formatDate = (dateString) => {
  if (!dateString) return "Never";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const CustomerTable = ({ customers = [], onView, onEdit, onDelete }) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-8">
        <Building2 className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-medium text-slate-900">
          No customers
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Get started by creating a new customer.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                Projects
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {customers.map((customer) => (
              <tr
                key={customer.id}
                className="hover:bg-slate-100 transition-colors"
              >
                {/* Customer Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-900">
                        {customer.name}
                      </div>
                      {customer.description && (
                        <div className="text-sm text-slate-500 truncate max-w-xs">
                          {customer.description}
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Contact Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-1">
                    {customer.contactEmail && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Mail className="h-3 w-3 mr-1 text-slate-400" />
                        <span className="truncate max-w-xs">
                          {customer.contactEmail}
                        </span>
                      </div>
                    )}
                    {customer.contactPhone && (
                      <div className="flex items-center text-sm text-slate-600">
                        <Phone className="h-3 w-3 mr-1 text-slate-400" />
                        <span>{customer.contactPhone}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex items-center text-sm text-slate-600">
                        <MapPin className="h-3 w-3 mr-1 text-slate-400" />
                        <span className="truncate max-w-xs">
                          {customer.address}
                        </span>
                      </div>
                    )}
                    {!customer.contactEmail &&
                      !customer.contactPhone &&
                      !customer.address && (
                        <span className="text-sm text-slate-400">
                          No contact info
                        </span>
                      )}
                  </div>
                </td>

                {/* Projects */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-900">
                    {customer.workProjects?.length || 0} projects
                  </div>
                  {customer.workProjects &&
                    customer.workProjects.length > 0 && (
                      <div className="text-xs text-slate-500">
                        Latest: {customer.workProjects[0].name}
                      </div>
                    )}
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      onClick={() => onView(customer)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
