import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'sonner'
import type { Apartment, ApartmentStatus } from '@/types/database'
import AdminHeader from '@/components/AdminHeader'
import SummaryCards from '@/components/SummaryCards'
import InventoryTable from '@/components/InventoryTable'
import { Search, X } from 'lucide-react'

export default function AdminDashboard() {
  const [statusFilter, setStatusFilter] = useState<ApartmentStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: apartments = [], isLoading } = useQuery({
    queryKey: ['pullman_suites'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pullman_suites')
        .select('*')
        .order('floor', { ascending: true })
        .order('unit_number', { ascending: true })

      if (error) throw error
      return data as Apartment[]
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApartmentStatus }) => {
      const { error } = await supabase
        .from('pullman_suites')
        .update({ status, updated_by: user?.email })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pullman_suites'] })
      toast.success('Status updated')
    },
    onError: () => {
      toast.error('Failed to update status')
    },
  })

  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      const { error } = await supabase
        .from('pullman_suites')
        .update({ notes, updated_by: user?.email })
        .eq('id', id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pullman_suites'] })
      toast.success('Notes saved')
    },
    onError: () => {
      toast.error('Failed to save notes')
    },
  })

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: ApartmentStatus }) => {
      const { error } = await supabase
        .from('pullman_suites')
        .update({ status, updated_by: user?.email })
        .in('id', ids)

      if (error) throw error
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['pullman_suites'] })
      toast.success(`${variables.ids.length} units updated to ${variables.status}`)
      setSelectedIds(new Set())
    },
    onError: () => {
      toast.error('Failed to update units')
    },
  })

  // Filter by status
  let filteredApartments =
    statusFilter === 'all'
      ? apartments
      : apartments.filter((apt) => apt.status === statusFilter)

  // Filter by search query (unit ID like "28-A" or floor number)
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim()
    filteredApartments = filteredApartments.filter((apt) => {
      const unitId = `${apt.floor}-${apt.unit_number}`.toLowerCase()
      return unitId.includes(query) || apt.floor.toString().includes(query)
    })
  }

  const handleSelectAll = () => {
    if (selectedIds.size === filteredApartments.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredApartments.map((apt) => apt.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSet = new Set(selectedIds)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setSelectedIds(newSet)
  }

  const handleBulkStatusChange = (status: ApartmentStatus) => {
    if (selectedIds.size === 0) return
    bulkUpdateMutation.mutate({ ids: Array.from(selectedIds), status })
  }

  const counts = {
    available: apartments.filter((a) => a.status === 'available').length,
    reserved: apartments.filter((a) => a.status === 'reserved').length,
    sold: apartments.filter((a) => a.status === 'sold').length,
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <main className="max-w-7xl mx-auto px-4 py-6">
        <SummaryCards
          counts={counts}
          activeFilter={statusFilter}
          onFilterClick={setStatusFilter}
        />

        {/* Search and Bulk Actions Bar */}
        <div className="flex items-center justify-between gap-4 mb-4">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="text"
              placeholder="Search unit (e.g. 28-A)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-surface border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-background rounded"
              >
                <X className="w-3.5 h-3.5 text-text-muted" />
              </button>
            )}
          </div>

          {/* Bulk Actions */}
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-1.5">
              <span className="text-sm text-primary font-medium">
                {selectedIds.size} selected
              </span>
              <div className="w-px h-4 bg-primary/20" />
              <button
                onClick={() => handleBulkStatusChange('available')}
                className="px-2 py-1 text-xs bg-status-available/10 text-status-available rounded hover:bg-status-available/20"
              >
                Available
              </button>
              <button
                onClick={() => handleBulkStatusChange('reserved')}
                className="px-2 py-1 text-xs bg-status-limited/10 text-status-limited rounded hover:bg-status-limited/20"
              >
                Reserved
              </button>
              <button
                onClick={() => handleBulkStatusChange('sold')}
                className="px-2 py-1 text-xs bg-status-sold/10 text-status-sold rounded hover:bg-status-sold/20"
              >
                Sold
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="px-2 py-1 text-xs text-text-muted hover:text-text-primary"
              >
                Clear
              </button>
            </div>
          )}

          {/* Results count */}
          <span className="text-sm text-text-muted">
            {filteredApartments.length} units
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <InventoryTable
            apartments={filteredApartments}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
            onNotesChange={(id, notes) => updateNotesMutation.mutate({ id, notes })}
          />
        )}
      </main>
    </div>
  )
}
