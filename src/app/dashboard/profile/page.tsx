'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthService from '@/libs/AuthService';

const ProfilePage: React.FC = () => {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      await AuthService.updateProfile({ name });
      if (user) {
        setUser({ ...user, name });
      }
      setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Gagal memperbarui profil',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Profil Saya 👤</h1>
        <p className="mt-2 text-gray-500">
          Kelola informasi akun Anda di sini.
        </p>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {message && (
            <div
              className={`rounded-xl border p-4 text-sm font-medium ${
                message.type === 'success'
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border-red-100 bg-red-50 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Email</label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="block w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 focus:outline-none"
            />
            <p className="text-[10px] italic text-gray-400">
              Email tidak dapat diubah.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              className="block w-full rounded-xl border border-gray-300 px-4 py-3 text-sm transition-all focus:border-emerald-500 focus:outline-none focus:ring-emerald-500"
              required
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading || name === user?.name}
              className="w-full rounded-xl bg-emerald-700 py-4 text-sm font-bold text-white transition-all hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-gray-950 p-8 text-white shadow-lg">
        <h3 className="text-xl font-bold">Keamanan Akun 🔒</h3>
        <p className="mt-2 text-sm text-gray-400">
          Gunakan kata sandi yang kuat untuk menjaga keamanan akun Anda.
        </p>
        <button className="mt-6 rounded-xl border border-gray-700 bg-gray-900 px-6 py-2 text-xs font-bold text-white transition-all hover:bg-gray-800">
          Ubah Kata Sandi
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
