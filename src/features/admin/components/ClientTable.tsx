import React, { useState } from 'react';
import { useAdminClients } from '../hooks/useAdminClients';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Skeleton } from '../../../components/ui/Skeleton';
import { formatDateBogota } from '../../../lib/format';
import { Users, Search, Mail, Phone, Calendar, RefreshCw, AlertTriangle } from 'lucide-react';

export const ClientTable: React.FC = () => {
  const { clients, loading, error, refetch } = useAdminClients();
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredClients = clients.filter((c) => {
    const nameMatch = (c.full_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const emailMatch = (c.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    return nameMatch || emailMatch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#3E2723]/10">
        <div>
          <h2 className="text-xl font-bold text-[#3E2723] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#D84315]" />
            Clientes Registrados
          </h2>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            Usuarios con cuenta en la chocolatería (excluye perfiles de administración)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-full sm:w-72">
            <Input
              placeholder="Buscar por nombre o correo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Actualizar
          </Button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-[#D84315]/10 border border-[#D84315]/30 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#D84315] font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Error al cargar clientes: {error}</span>
          </div>
          <Button size="sm" variant="outline" onClick={refetch}>
            Reintentar
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-[#3E2723]/10 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F9F6F0] border-b border-[#3E2723]/10 text-[#3E2723] uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Teléfono</th>
                  <th className="py-3.5 px-4">Rol</th>
                  <th className="py-3.5 px-4">Fecha de Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3E2723]/5">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="p-8">
                      <Skeleton variant="card" className="h-24 w-full" />
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-12 text-[#6B6B6B]">
                      No se encontraron clientes registrados.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => (
                    <tr key={client.id} className="hover:bg-[#F9F6F0]/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#3E2723]/10 text-[#3E2723] font-bold flex items-center justify-center shrink-0 text-xs">
                            {(client.full_name || 'C')[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#3E2723]">
                              {client.full_name || 'Cliente sin nombre'}
                            </p>
                            <p className="text-[10px] font-mono text-[#6B6B6B]">
                              ID: {client.id.substring(0, 12)}...
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-[#6B6B6B]">
                        {client.phone ? (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-[#558B2F]" />
                            {client.phone}
                          </span>
                        ) : (
                          <span className="italic text-[11px] text-[#6B6B6B]/60">No registrado</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge role={client.role} />
                      </td>

                      <td className="py-3.5 px-4 text-[#6B6B6B]">
                        <span className="flex items-center gap-1 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          {formatDateBogota(client.created_at)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
