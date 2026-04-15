import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';
import { Link } from 'react-router-dom';

const BellIcon = ({ hasUnread }) => (
  <div className="relative inline-flex">
    <svg className="w-7 h-7 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
    {hasUnread && (
      <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
    )}
  </div>
);

const TypeIcon = ({ type }) => {
  if (type === 'add_newborn') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
    </svg>
  );
  if (type === 'delete_member') return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  );
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
};

// Detail row helper
function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-semibold text-gray-800 mt-0.5">{value}</span>
    </div>
  );
}

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('readNotifIds') || '[]')); }
    catch { return new Set(); }
  });
  const [filter, setFilter] = useState('all');
  // Track expanded cards for member detail view
  const [expandedIds, setExpandedIds] = useState(new Set());

  const saveReadIds = (ids) => {
    localStorage.setItem('readNotifIds', JSON.stringify([...ids]));
  };

  const markAsRead = (id) => {
    setReadIds(prev => {
      const next = new Set(prev);
      next.add(id);
      saveReadIds(next);
      return next;
    });
  };

  const markAllRead = () => {
    const next = new Set(notifications.map(n => n._id));
    setReadIds(next);
    saveReadIds(next);
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const fetchNotifications = () => {
    apiFetch('/api/admin/notifications')
      .then(data => { setNotifications(data); setLoading(false); })
      .catch(err => { console.error("Fetch error:", err); setLoading(false); });
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleStatusUpdate = async (id, status) => {
    if (!window.confirm(`Are you sure you want to ${status} this request?`)) return;
    try {
      await apiFetch(`/api/admin/requests/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      fetchNotifications();
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  const unreadCount = notifications.filter(n => !readIds.has(n._id)).length;
  const readCount = notifications.filter(n => readIds.has(n._id)).length;

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !readIds.has(n._id);
    if (filter === 'read') return readIds.has(n._id);
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-700 rounded-full animate-spin" />
        <p className="text-gray-400 text-sm font-medium">Loading notifications...</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <BellIcon hasUnread={unreadCount > 0} />
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Notifications</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">User Change Requests</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:border-gray-400 px-3 py-1.5 rounded-lg transition duration-200"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: notifications.length },
          { label: "Unread", value: unreadCount },
          { label: "Read", value: readCount },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <p className="text-2xl font-extrabold text-gray-900">{value}</p>
            <p className="text-xs font-semibold text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {['all', 'unread', 'read'].map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 text-sm font-semibold border-b-2 capitalize transition duration-150 -mb-px
              ${filter === tab
                ? 'border-gray-800 text-gray-900'
                : 'border-transparent text-gray-400 hover:text-gray-600'}`}
          >
            {tab}
            {tab === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-gray-200 rounded-2xl">
            <BellIcon hasUnread={false} />
            <p className="mt-3 text-gray-400 text-sm font-medium">
              No {filter !== 'all' ? filter : ''} notifications found.
            </p>
          </div>
        ) : (
          filtered.map((note) => {
            const isRead = readIds.has(note._id);
            const isExpanded = expandedIds.has(note._id);
            const displayHHID = note.householdId?.householdId || "N/A";
            const typeLabel = note.type?.replace(/_/g, ' ') || 'request';
            const isAddNewborn = note.type === 'add_newborn';
            const isDeleteMember = note.type === 'delete_member';

            // Find the member to be deleted from the populated householdId
            const memberToDelete = isDeleteMember && note.householdId?.members
              ? note.householdId.members[note.memberIndex]
              : null;

            return (
              <div
                key={note._id}
                onClick={() => markAsRead(note._id)}
                className={`relative bg-white rounded-2xl border transition duration-200 cursor-default overflow-hidden
                  ${isRead ? 'border-gray-200' : 'border-gray-400 shadow-sm'}`}
              >
                {/* Colored top bar by type */}
                <div className={`h-1 w-full ${isAddNewborn ? 'bg-emerald-400' : isDeleteMember ? 'bg-rose-400' : 'bg-blue-400'}`} />

                <div className="p-5">
                  {/* Unread dot */}
                  {!isRead && (
                    <span className="absolute top-6 right-5 w-2 h-2 rounded-full bg-red-500" />
                  )}

                  {/* Top row */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white
                      ${isAddNewborn ? 'bg-emerald-500' : isDeleteMember ? 'bg-rose-500' : 'bg-blue-500'}`}>
                      <TypeIcon type={note.type} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wide
                          ${isAddNewborn ? 'bg-emerald-100 text-emerald-700' : isDeleteMember ? 'bg-rose-100 text-rose-700' : 'bg-blue-100 text-blue-700'}`}>
                          {typeLabel}
                        </span>
                        {!isRead && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-black bg-red-500 text-white">
                            New
                          </span>
                        )}
                      </div>
                      <h3 className="font-black text-gray-900 mt-1">
                        Household:{' '}
                        <span className="font-mono text-sm">{displayHHID}</span>
                      </h3>
                      <p className="text-gray-400 text-xs font-medium mt-0.5">
                        <span className="font-semibold text-gray-600">{note.user?.name || 'Unknown User'}</span>
                        {note.user?.email && (
                          <span className="ml-1 text-blue-500">({note.user.email})</span>
                        )}
                        {' · '}
                        {new Date(note.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Note */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-4 text-sm text-gray-600">
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wide block mb-1">
                      Reason / Note
                    </span>
                    {note.note || "No note provided."}
                  </div>

                  {/* ── ADD NEWBORN: Full details ── */}
                  {isAddNewborn && note.newbornData && (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 overflow-hidden mb-4">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-100 border-b border-emerald-200">
                        <span className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                          👶 New Member to Add
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleExpand(note._id); }}
                          className="text-emerald-600 text-xs font-bold hover:text-emerald-800 transition"
                        >
                          {isExpanded ? '▲ Hide' : '▼ Show details'}
                        </button>
                      </div>

                      {/* Always show name + gender */}
                      <div className="px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-3">
                        <DetailRow label="Full Name" value={note.newbornData.fullName || note.newbornData.name} />
                        <DetailRow label="Gender" value={note.newbornData.gender} />
                        {isExpanded && (
                          <>
                            <DetailRow label="Date of Birth" value={note.newbornData.dob} />
                            <DetailRow label="Relation" value={note.newbornData.relation} />
                            <DetailRow label="Age" value={note.newbornData.age !== undefined ? `${note.newbornData.age} yrs` : null} />
                            <DetailRow label="Education" value={note.newbornData.education} />
                            <DetailRow label="Occupation" value={note.newbornData.occupation} />
                            <DetailRow label="Marital Status" value={note.newbornData.maritalStatus} />
                            {note.newbornData.disability && (
                              <div className="col-span-2">
                                <span className="text-[10px] font-bold text-gray-400 uppercase">Disability</span>
                                <p className="text-sm font-semibold text-amber-700 mt-0.5">
                                  ⚠ {note.newbornData.disabilityDetail || 'Yes'}
                                </p>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ── DELETE MEMBER: Show the actual member being removed ── */}
                  {isDeleteMember && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 overflow-hidden mb-4">
                      <div className="flex items-center justify-between px-4 py-2.5 bg-rose-100 border-b border-rose-200">
                        <span className="text-xs font-black text-rose-800 uppercase tracking-wide">
                          ⚠ Member Requested for Removal
                        </span>
                        {memberToDelete && (
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleExpand(note._id); }}
                            className="text-rose-600 text-xs font-bold hover:text-rose-800 transition"
                          >
                            {isExpanded ? '▲ Hide' : '▼ Show details'}
                          </button>
                        )}
                      </div>

                      <div className="px-4 py-3">
                        {memberToDelete ? (
                          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                            <DetailRow label="Full Name" value={memberToDelete.name} />
                            <DetailRow label="Gender" value={memberToDelete.gender} />
                            {isExpanded && (
                              <>
                                <DetailRow label="Age" value={memberToDelete.age !== undefined ? `${memberToDelete.age} yrs` : null} />
                                <DetailRow label="Occupation" value={memberToDelete.occupation} />
                                <DetailRow label="Education" value={memberToDelete.education} />
                                <DetailRow label="Marital Status" value={memberToDelete.maritalStatus} />
                                <DetailRow label="Citizenship ID" value={memberToDelete.citizenshipId} />
                                {memberToDelete.disability && (
                                  <div className="col-span-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Disability</span>
                                    <p className="text-sm font-semibold text-amber-700 mt-0.5">
                                      ⚠ {memberToDelete.disabilityDetail || 'Yes'}
                                    </p>
                                  </div>
                                )}
                                {memberToDelete.photo && (
                                  <div className="col-span-2">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Photo</span>
                                    <img
                                      src={memberToDelete.photo}
                                      alt={memberToDelete.name}
                                      className="h-28 w-28 rounded-xl object-cover border-2 border-rose-200"
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="text-sm text-gray-600">
                            <span className="font-bold">Member Index:</span> {note.memberIndex ?? 'N/A'}
                            <p className="text-xs text-gray-400 mt-1">
                              Member data not available — view the full form for details.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap pt-1">
                    <Link
                      to={`/admin/households/${displayHHID}`}
                      onClick={(e) => e.stopPropagation()}
                      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 hover:border-gray-400 transition duration-200"
                    >
                      View Full Form
                    </Link>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(note._id, 'approved'); }}
                      className={`px-4 py-2 rounded-xl text-sm font-black text-white transition duration-200
                        ${isAddNewborn ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-800 hover:bg-gray-700'}`}
                    >
                      ✓ Approve
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleStatusUpdate(note._id, 'rejected'); }}
                      className="border border-rose-300 text-rose-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-rose-50 transition duration-200"
                    >
                      ✗ Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}