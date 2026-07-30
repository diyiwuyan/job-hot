'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/components/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

// ── Types ───────────────────────────────────────────────────
interface AccountUser {
  user_id: string;
  email: string;
  nickname?: string | null;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed: boolean;
  admin_role: string | null;
  page_view_count: number;
  last_active_at: string | null;
}

type SortField = 'email' | 'nickname' | 'created_at' | 'last_sign_in_at' | 'page_view_count' | 'admin_role';
type SortDir = 'asc' | 'desc';

// ── Helpers ─────────────────────────────────────────────────
function fmtDateTime(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN') + ' ' + d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function roleName(role: string | null): string {
  if (role === 'super_admin') return '超级管理员';
  if (role === 'admin') return '管理员';
  return '普通用户';
}

function roleClass(role: string | null): string {
  if (role === 'super_admin') return 'admin-role-super_admin';
  if (role === 'admin') return 'admin-role-admin';
  return '';
}

function getNickname(user: AccountUser): string {
  return user.nickname?.trim() || user.email.split('@')[0] || '未命名';
}

// ── Main Page ───────────────────────────────────────────────
export default function AccountsPage() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, role, loading: adminLoading } = useAdmin();

  const [users, setUsers] = useState<AccountUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Search & sort
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  // Add account modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNickname, setNewNickname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Edit nickname modal
  const [editingNickname, setEditingNickname] = useState<AccountUser | null>(null);
  const [nicknameDraft, setNicknameDraft] = useState('');

  // Password reset modal
  const [passwordUser, setPasswordUser] = useState<AccountUser | null>(null);
  const [passwordDraft, setPasswordDraft] = useState('');

  // Confirm modal
  const [confirmAction, setConfirmAction] = useState<{
    type: 'set_admin' | 'remove_admin' | 'delete_user';
    userId: string;
    email: string;
  } | null>(null);

  // ── Fetch user list via RPC ────────────────────────────────
  const fetchUsers = useCallback(async () => {
    if (!supabase || !isAdmin) return;
    setLoading(true);
    setError('');

    const { data, error: err } = await supabase.rpc('admin_list_users_safe');

    if (err) {
      setError(`加载用户列表失败: ${err.message}`);
      setUsers([]);
    } else {
      setUsers((data ?? []) as AccountUser[]);
    }
    setLoading(false);
  }, [isAdmin]);

  useEffect(() => {
    if (adminLoading || !isAdmin) return;
    const timer = window.setTimeout(() => {
      fetchUsers();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [adminLoading, isAdmin, fetchUsers]);

  // ── Sort & filter ──────────────────────────────────────────
  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return '';
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  };

  const filteredUsers = users
    .filter(u => {
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      return u.email.toLowerCase().includes(q) || getNickname(u).toLowerCase().includes(q) || roleName(u.admin_role).includes(q);
    })
    .sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortField) {
        case 'email':
          return dir * a.email.localeCompare(b.email);
        case 'nickname':
          return dir * getNickname(a).localeCompare(getNickname(b));
        case 'created_at':
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        case 'last_sign_in_at':
          return dir * ((a.last_sign_in_at ? new Date(a.last_sign_in_at).getTime() : 0) - (b.last_sign_in_at ? new Date(b.last_sign_in_at).getTime() : 0));
        case 'page_view_count':
          return dir * (a.page_view_count - b.page_view_count);
        case 'admin_role': {
          const rank = (r: string | null) => r === 'super_admin' ? 2 : r === 'admin' ? 1 : 0;
          return dir * (rank(a.admin_role) - rank(b.admin_role));
        }
        default:
          return 0;
      }
    });

  // ── Actions ────────────────────────────────────────────────
  async function setAdminRole(userId: string) {
    if (!supabase) return;
    setActionLoading(userId);
    setError('');
    setSuccess('');

    const { data, error: err } = await supabase.rpc('admin_set_role', {
      target_user_id: userId,
      target_role: 'admin',
    });

    if (err) {
      setError(`设置管理员失败: ${err.message}`);
    } else {
      setSuccess(`已设置为管理员 (${data})`);
      fetchUsers();
    }
    setActionLoading(null);
    setConfirmAction(null);
  }

  async function removeAdminRole(userId: string) {
    if (!supabase) return;
    setActionLoading(userId);
    setError('');
    setSuccess('');

    const { data, error: err } = await supabase.rpc('admin_set_role', {
      target_user_id: userId,
      target_role: null,
    });

    if (err) {
      setError(`移除管理员失败: ${err.message}`);
    } else {
      setSuccess(`已移除管理员权限 (${data})`);
      fetchUsers();
    }
    setActionLoading(null);
    setConfirmAction(null);
  }

  async function deleteUser(userId: string) {
    if (!supabase) return;
    setActionLoading(userId);
    setError('');
    setSuccess('');

    const { error: err } = await supabase.rpc('admin_delete_user', {
      target_user_id: userId,
    });

    if (err) {
      setError(`删除用户失败: ${err.message}`);
    } else {
      setSuccess('用户已删除');
      fetchUsers();
    }
    setActionLoading(null);
    setConfirmAction(null);
  }

  async function updateNickname(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !editingNickname) return;
    const nextNickname = nicknameDraft.trim();
    if (!nextNickname) {
      setError('昵称不能为空');
      return;
    }

    setActionLoading(editingNickname.user_id);
    setError('');
    setSuccess('');

    const { error: err } = await supabase.rpc('admin_update_user_nickname', {
      target_user_id: editingNickname.user_id,
      target_nickname: nextNickname,
    });

    if (err) {
      setError(`修改昵称失败: ${err.message}`);
    } else {
      setSuccess(`已更新 ${editingNickname.email} 的昵称`);
      setEditingNickname(null);
      setNicknameDraft('');
      fetchUsers();
    }
    setActionLoading(null);
  }

  async function updatePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !passwordUser) return;
    const nextPassword = passwordDraft.trim();
    if (nextPassword.length < 6) {
      setError('新密码至少需要 6 位');
      return;
    }

    setActionLoading(passwordUser.user_id);
    setError('');
    setSuccess('');

    const { error: err } = await supabase.rpc('admin_set_user_password', {
      target_user_id: passwordUser.user_id,
      new_password: nextPassword,
    });

    if (err) {
      setError(`重置密码失败: ${err.message}`);
    } else {
      setSuccess(`已重置 ${passwordUser.email} 的密码`);
      setPasswordUser(null);
      setPasswordDraft('');
    }
    setActionLoading(null);
  }

  // ── Add account ──────────────────────────────────────────────
  async function handleAddAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !newEmail.trim() || !newNickname.trim()) return;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail.trim())) {
      setError('请输入有效的邮箱地址');
      return;
    }

    if (!newNickname.trim()) {
      setError('昵称为必填项');
      return;
    }

    setAddLoading(true);
    setError('');
    setSuccess('');

    // Use Supabase auth.signUp to create a new user
    const password = newPassword.trim() || (Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2));
    const { error: signUpErr } = await supabase.auth.signUp({
      email: newEmail.trim(),
      password,
      options: {
        // Skip email confirmation for admin-created accounts
        data: { created_by_admin: true, nickname: newNickname.trim() },
      },
    });

    if (signUpErr) {
      setError(`添加账号失败: ${signUpErr.message}`);
    } else {
      setSuccess(`账号 ${newEmail.trim()} 已创建成功${newPassword.trim() ? '' : '（随机密码，用户需通过重置密码登录）'}`);
      setNewNickname('');
      setNewEmail('');
      setNewPassword('');
      setShowAddModal(false);
      fetchUsers();
    }
    setAddLoading(false);
  }

  // ── Auth guards ────────────────────────────────────────────
  if (authLoading || adminLoading) {
    return (
      <div className="page admin-page">
        <div className="admin-loading">验证权限中...</div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="page admin-page">
        <div className="admin-auth-guard">
          <h2>权限不足</h2>
          <p>需要管理员权限才能访问此页面。</p>
          <Link href="/login" className="btn">去登录</Link>
        </div>
      </div>
    );
  }

  const isSuperAdmin = role === 'super_admin';

  // ── Render ─────────────────────────────────────────────────
  return (
    <div className="page admin-page">
      <div className="admin-header">
        <div>
          <h1>账号管理</h1>
          <p>管理注册用户 · 共 {users.length} 个账号</p>
        </div>
        <div className="admin-header-actions">
          {isSuperAdmin && (
            <button type="button" className="btn" onClick={() => setShowAddModal(true)}>
              + 添加账号
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
            {loading ? '加载中...' : '刷新'}
          </button>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="admin-msg admin-msg-error">{error}</div>}
      {success && <div className="admin-msg admin-msg-success">{success}</div>}

      {/* Search bar */}
      <div className="admin-section">
        <div className="admin-search-bar">
          <input
            type="text"
            className="field"
            placeholder="搜索邮箱、昵称或角色..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && (
            <span className="admin-search-count">
              {filteredUsers.length} / {users.length}
            </span>
          )}
        </div>
      </div>

      {/* User table */}
      <div className="admin-section">
        {loading ? (
          <div className="admin-loading">加载用户数据中...</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="admin-th-sort" onClick={() => handleSort('email')}>
                    邮箱{sortIndicator('email')}
                  </th>
                  <th className="admin-th-sort" onClick={() => handleSort('nickname')}>
                    昵称{sortIndicator('nickname')}
                  </th>
                  <th className="admin-th-sort" onClick={() => handleSort('admin_role')}>
                    角色{sortIndicator('admin_role')}
                  </th>
                  <th className="admin-th-sort" onClick={() => handleSort('created_at')}>
                    注册时间{sortIndicator('created_at')}
                  </th>
                  <th className="admin-th-sort" onClick={() => handleSort('last_sign_in_at')}>
                    最后登录{sortIndicator('last_sign_in_at')}
                  </th>
                  <th className="admin-th-sort" onClick={() => handleSort('page_view_count')}>
                    访问次数{sortIndicator('page_view_count')}
                  </th>
                  {isSuperAdmin && <th>操作</th>}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={isSuperAdmin ? 7 : 6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      {search ? '没有匹配的用户' : '暂无注册用户'}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => {
                    const isCurrentUser = u.user_id === user.id;
                    const isProcessing = actionLoading === u.user_id;
                    return (
                      <tr key={u.user_id} className={isCurrentUser ? 'admin-row-self' : ''}>
                        <td>
                          {u.email}
                          {isCurrentUser && <span className="admin-you-badge">（你）</span>}
                        </td>
                        <td>{getNickname(u)}</td>
                        <td>
                          <span className={`admin-role-badge ${roleClass(u.admin_role)}`}>
                            {roleName(u.admin_role)}
                          </span>
                        </td>
                        <td>{fmtDateTime(u.created_at)}</td>
                        <td>{fmtDateTime(u.last_sign_in_at)}</td>
                        <td>{u.page_view_count}</td>
                        {isSuperAdmin && (
                          <td className="admin-actions-cell">
                            {isProcessing ? (
                              <span className="admin-text-muted">处理中...</span>
                            ) : (
                              <div className="admin-btn-group">
                                <button
                                  type="button"
                                  className="btn-sm btn-secondary"
                                  onClick={() => {
                                    setEditingNickname(u);
                                    setNicknameDraft(getNickname(u));
                                  }}
                                >
                                  改昵称
                                </button>
                                <button
                                  type="button"
                                  className="btn-sm btn-secondary"
                                  onClick={() => {
                                    setPasswordUser(u);
                                    setPasswordDraft('');
                                  }}
                                >
                                  重置密码
                                </button>
                                {isCurrentUser || u.admin_role === 'super_admin' ? (
                                  <span className="admin-text-muted">权限不可改</span>
                                ) : u.admin_role === 'admin' ? (
                                  <button
                                    type="button"
                                    className="btn-sm btn-secondary"
                                    onClick={() => setConfirmAction({ type: 'remove_admin', userId: u.user_id, email: u.email })}
                                  >
                                    取消管理员
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn-sm"
                                    onClick={() => setConfirmAction({ type: 'set_admin', userId: u.user_id, email: u.email })}
                                  >
                                    设为管理员
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn-sm btn-danger"
                                  onClick={() => setConfirmAction({ type: 'delete_user', userId: u.user_id, email: u.email })}
                                >
                                  删除
                                </button>
                              </div>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      {confirmAction && (
        <div className="admin-modal-overlay" onClick={() => setConfirmAction(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal-title">
              {confirmAction.type === 'set_admin' && '设置管理员'}
              {confirmAction.type === 'remove_admin' && '取消管理员'}
              {confirmAction.type === 'delete_user' && '删除用户'}
            </h3>
            <p className="admin-modal-text">
              {confirmAction.type === 'set_admin' && `确定将 ${confirmAction.email} 设为管理员？该用户将可以访问管理后台。`}
              {confirmAction.type === 'remove_admin' && `确定取消 ${confirmAction.email} 的管理员权限？`}
              {confirmAction.type === 'delete_user' && `确定删除用户 ${confirmAction.email} 吗？此操作不可恢复，该用户的所有数据将被清除。`}
            </p>
            <div className="admin-modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmAction(null)}>
                取消
              </button>
              <button
                type="button"
                className={`btn ${confirmAction.type === 'delete_user' ? 'btn-danger' : ''}`}
                onClick={() => {
                  if (confirmAction.type === 'set_admin') setAdminRole(confirmAction.userId);
                  if (confirmAction.type === 'remove_admin') removeAdminRole(confirmAction.userId);
                  if (confirmAction.type === 'delete_user') deleteUser(confirmAction.userId);
                }}
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add account modal */}
      {showAddModal && (
        <div className="admin-modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal-title">添加账号</h3>
            <form onSubmit={handleAddAccount}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  昵称 <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="field"
                  placeholder="例如：小仙"
                  value={newNickname}
                  onChange={e => setNewNickname(e.target.value)}
                  required
                  autoFocus
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  邮箱地址 <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="email"
                  className="field"
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  required
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  初始密码（留空则随机生成）
                </label>
                <input
                  type="text"
                  className="field"
                  placeholder="留空自动生成随机密码"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  style={{ width: '100%' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                  如留空，用户需通过「忘记密码」功能自行设置密码
                </p>
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  取消
                </button>
                <button type="submit" className="btn" disabled={addLoading || !newEmail.trim() || !newNickname.trim()}>
                  {addLoading ? '创建中...' : '创建账号'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit nickname modal */}
      {editingNickname && (
        <div className="admin-modal-overlay" onClick={() => setEditingNickname(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal-title">修改昵称</h3>
            <p className="admin-modal-text">{editingNickname.email}</p>
            <form onSubmit={updateNickname}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  昵称 <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="field"
                  value={nicknameDraft}
                  onChange={e => setNicknameDraft(e.target.value)}
                  required
                  autoFocus
                  style={{ width: '100%' }}
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditingNickname(null)}>
                  取消
                </button>
                <button type="submit" className="btn" disabled={!nicknameDraft.trim() || actionLoading === editingNickname.user_id}>
                  {actionLoading === editingNickname.user_id ? '保存中...' : '保存昵称'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password reset modal */}
      {passwordUser && (
        <div className="admin-modal-overlay" onClick={() => setPasswordUser(null)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <h3 className="admin-modal-title">重置密码</h3>
            <p className="admin-modal-text">
              Supabase Auth 不保存明文原密码，后台无法查看旧密码。你可以为 {passwordUser.email} 设置一个新密码。
            </p>
            <form onSubmit={updatePassword}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                  新密码 <span style={{ color: 'var(--accent)' }}>*</span>
                </label>
                <input
                  type="text"
                  className="field"
                  placeholder="至少 6 位"
                  value={passwordDraft}
                  onChange={e => setPasswordDraft(e.target.value)}
                  required
                  autoFocus
                  style={{ width: '100%' }}
                />
              </div>
              <div className="admin-modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setPasswordUser(null)}>
                  取消
                </button>
                <button type="submit" className="btn" disabled={passwordDraft.trim().length < 6 || actionLoading === passwordUser.user_id}>
                  {actionLoading === passwordUser.user_id ? '重置中...' : '确认重置'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
