
import React from "react";

type FilterState = {
  classFilter: string;
  streamFilter: string;
  status: "all" | "active" | "expired";
  search: string;
};

interface QuestionsFiltersProps {
  filter: FilterState;
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>;
  uniqueClasses: number[];
  uniqueStreams: string[];
}

export function QuestionsFilters({
  filter,
  setFilter,
  uniqueClasses,
  uniqueStreams,
}: QuestionsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <select
        className="border rounded px-2 py-1 text-xs"
        value={filter.classFilter}
        onChange={e => setFilter(f => ({ ...f, classFilter: e.target.value }))}
      >
        <option value="">All Classes</option>
        {uniqueClasses.map(cls => (
          <option key={cls} value={cls}>{cls}</option>
        ))}
      </select>
      <select
        className="border rounded px-2 py-1 text-xs"
        value={filter.streamFilter}
        onChange={e => setFilter(f => ({ ...f, streamFilter: e.target.value }))}
      >
        <option value="">All Streams</option>
        {uniqueStreams.map(s => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <select
        className="border rounded px-2 py-1 text-xs"
        value={filter.status}
        onChange={e => setFilter(f => ({ ...f, status: e.target.value as any }))}
      >
        <option value="all">All</option>
        <option value="active">Active Only</option>
        <option value="expired">Expired Only</option>
      </select>
      <input
        className="border rounded px-2 py-1 text-xs"
        type="text"
        placeholder="Search question..."
        value={filter.search}
        onChange={e => setFilter(f => ({ ...f, search: e.target.value }))}
      />
    </div>
  );
}
