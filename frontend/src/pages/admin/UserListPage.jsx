import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { listUsers, deleteUser, resetRemove } from '../../store/slices/userSlice';
import UserTable from '../../components/admin/UserTable';
import Loader from '../../components/ui/Loader';
import Message from '../../components/ui/Message';
import Meta from '../../components/ui/Meta';

const UserListPage = () => {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((s) => s.user.list);
  const remove = useSelector((s) => s.user.remove);
  const currentUser = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(listUsers());
  }, [dispatch]);

  useEffect(() => {
    if (remove.success) {
      toast.success('User deleted');
      dispatch(listUsers());
      dispatch(resetRemove());
    }
  }, [remove.success, dispatch]);

  const onDelete = (user) => {
    if (user._id === currentUser?._id) {
      toast.error('You cannot delete your own account');
      return;
    }
    if (window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) {
      dispatch(deleteUser(user._id));
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
      <Meta title="Admin — Users" />

      <div className="mb-10">
        <p className="kicker mb-4">Administration</p>
        <h1 className="font-serif text-4xl text-ink md:text-5xl">
          <em>Users</em>
        </h1>
      </div>

      {remove.error && <Message variant="error" className="mb-4">{remove.error}</Message>}
      {error && <Message variant="error" className="mb-4">{error}</Message>}

      {loading ? (
        <Loader label="Loading users…" />
      ) : (
        <div className="border border-line">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-[0.18em] text-faint">
                <th className="py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Role</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Joined</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <UserTable key={user._id} user={user} onDelete={onDelete} deleting={remove.loading} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UserListPage;
