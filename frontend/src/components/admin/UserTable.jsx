import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

// Admin user list row
const UserTable = ({ user, onDelete, deleting }) => (
  <tr className="border-b border-line last:border-0 transition hover:bg-ink/[0.025]">
    <td className="px-4 py-3 text-xs text-muted">{user._id}</td>
    <td className="px-4 py-3 font-serif text-base text-ink">{user.name}</td>
    <td className="px-4 py-3 text-sm text-muted">{user.email}</td>
    <td className="hidden px-4 py-3 text-sm sm:table-cell">
      {user.isAdmin ? <span className="badge">Admin</span> : <span className="text-faint">User</span>}
    </td>
    <td className="hidden px-4 py-3 text-sm text-muted md:table-cell">
      {formatDate(user.createdAt)}
    </td>
    <td className="px-4 py-3 text-right">
      <div className="flex justify-end gap-2">
        <Link
          to={`/admin/user/${user._id}/edit`}
          aria-label={`Edit ${user.name}`}
          className="border border-transparent p-2 text-muted transition hover:border-line hover:text-ink"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(user)}
          disabled={deleting}
          aria-label={`Delete ${user.name}`}
          className="border border-transparent p-2 text-muted transition hover:border-danger/40 hover:text-danger disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </td>
  </tr>
);

export default UserTable;
