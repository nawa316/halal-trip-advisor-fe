'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleStartPlanning = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signup');
    }
  };

  const handleAuthAction = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signup');
    }
  };

  return (
    <div className="space-y-20 py-12">
      {/* Hero Section */}
      <section
        data-aos="fade-up"
        className="relative overflow-hidden rounded-[2.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-amber-50 px-6 py-16 shadow-md md:px-12 md:py-20"
      >
        <div className="absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_60%),radial-gradient(circle_at_bottom_left,_rgba(245,158,11,0.12),_transparent_60%)]" />
        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            Solusi Wisata Halal Modern
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight text-gray-950 md:text-7xl">
            Liburan Tenang,{' '}
            <span className="text-emerald-700">Ibadah Terjaga.</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-gray-600 md:text-xl">
            Halaloka membantu Anda menyusun rute perjalanan wisata yang optimal.
            Kami mempertimbangkan waktu shalat, lokasi masjid, hingga kuliner
            halal agar perjalanan Anda tetap berkah dan menyenangkan.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <button
              onClick={handleStartPlanning}
              className="rounded-full bg-emerald-700 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-emerald-800 hover:shadow-emerald-200 active:scale-95"
            >
              {isAuthenticated ? 'Buka Planner Anda' : 'Mulai Rencanakan Trip'}
            </button>
            <a
              href="#fitur"
              className="rounded-full border border-gray-300 bg-white px-8 py-4 text-base font-bold text-gray-900 transition-all hover:bg-gray-50 active:scale-95"
            >
              Pelajari Fitur
            </a>
          </div>
        </div>
      </section>

      {/* Keunggulan/Fitur Section */}
      <section id="fitur" className="space-y-10">
        <div data-aos="fade-up" className="space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Mengapa Memilih Kami?
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Kami menggabungkan teknologi optimasi rute dengan kebutuhan religius
            Anda.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              title: 'Rute Optimal',
              description:
                'Algoritma cerdas yang menghitung urutan tempat terbaik berdasarkan rating, jarak, and jam buka.',
              icon: '📍',
            },
            {
              title: 'Waktu Shalat & Masjid',
              description:
                'Jadwal perjalanan yang otomatis menyisipkan waktu shalat dan lokasi masjid terdekat.',
              icon: '🕌',
            },
            {
              title: 'Kuliner Halal',
              description:
                'Rekomendasi tempat makan halal yang sudah terverifikasi di sepanjang rute perjalanan Anda.',
              icon: '🍱',
            },
          ].map((item, index) => (
            <article
              key={item.title}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="group rounded-3xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 text-4xl">{item.icon}</div>
              <h3 className="text-xl font-bold text-gray-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-gray-600">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Persona Section */}
      <section className="space-y-10" id="persona">
        <div data-aos="fade-right" className="max-w-2xl space-y-3">
          <p className="text-sm font-bold uppercase tracking-widest text-emerald-700">
            Didesain untuk Anda
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Solusi untuk Setiap Tipe Traveler
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Ahmad',
              role: 'Solo Traveler',
              text: 'Fokus pada kepraktisan dan ibadah yang terjaga. Ahmad butuh rute cepat dan info masjid yang akurat.',
              color: 'bg-emerald-900',
            },
            {
              name: 'Siti',
              role: 'Family Planner',
              text: 'Memprioritaskan kenyamanan keluarga. Siti butuh jadwal yang tidak terlalu padat dan ramah anak.',
              color: 'bg-amber-800',
            },
            {
              name: 'Dinda',
              role: 'Young Traveler',
              text: 'Mencari tempat hits dan populer. Dinda ingin rute yang efisien untuk mengunjungi banyak tempat aesthetic.',
              color: 'bg-gray-900',
            },
          ].map((persona, index) => (
            <article
              key={persona.name}
              data-aos="zoom-in-up"
              data-aos-delay={index * 100}
              className={`${persona.color} rounded-[2rem] p-8 text-white shadow-xl`}
            >
              <p className="text-xs font-bold uppercase tracking-[0.2em] opacity-70">
                {persona.role}
              </p>
              <h3 className="mt-4 text-3xl font-bold">{persona.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-gray-200">
                {persona.text}
              </p>
              <div className="mt-8 h-1 w-12 rounded-full bg-white/20" />
            </article>
          ))}
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="space-y-10" id="roadmap">
        <div data-aos="fade-up" className="space-y-3 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-950 md:text-4xl">
            Langkah Pengembangan
          </h2>
          <p className="mx-auto max-w-2xl text-gray-600">
            Kami terus berkembang untuk memberikan pengalaman terbaik bagi Anda.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            {
              title: 'Fondasi Utama',
              desc: 'Implementasi landing page dan sistem manajemen pengguna.',
            },
            {
              title: 'Eksplorasi Data',
              desc: 'Integrasi ribuan data destinasi wisata dan kuliner halal.',
            },
            {
              title: 'Optimasi Cerdas',
              desc: 'Peluncuran algoritma perencana rute dan integrasi waktu shalat.',
            },
            {
              title: 'Personalisasi',
              desc: 'Fitur khusus berdasarkan preferensi unik setiap traveler.',
            },
          ].map((step, index) => (
            <div
              key={step.title}
              data-aos="fade-up"
              data-aos-delay={index * 100}
              className="flex items-start gap-5 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl font-bold text-emerald-700">
                {index + 1}
              </div>
              <div>
                <h4 className="font-bold text-gray-950">{step.title}</h4>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section
        data-aos="zoom-out"
        className="rounded-[3rem] bg-emerald-800 px-8 py-16 text-center text-white md:px-12 md:py-24"
      >
        <div className="mx-auto max-w-2xl space-y-8">
          <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
            Siap Menjelajah dengan Tenang?
          </h2>
          <p className="text-lg text-emerald-100">
            Bergabunglah dengan ribuan traveler muslim lainnya dan rasakan
            kemudahan merencanakan perjalanan yang halal and efisien.
          </p>
          <div className="pt-4">
            <button
              onClick={handleAuthAction}
              className="rounded-full bg-white px-10 py-4 text-lg font-bold text-emerald-800 shadow-xl transition-all hover:bg-emerald-50 active:scale-95"
            >
              {isAuthenticated ? 'Lihat Dashboard' : 'Daftar Sekarang — Gratis'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
