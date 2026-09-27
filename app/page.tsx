import Image from "next/image";
import Link from "next/link";

export default function Home() {
  const data = [
    {
      title: "Al-Qur'an",
      subtitle: "Kitab Suci Al-Qur'an Online",
      icon: "/icon-alquran.png",
      href: "/alquran",
    },
    {
      title: "Doa-Doa",
      subtitle: "Doa-Doa Harian dan Sholat",
      icon: "/icon-doa.png",
      href: "/doa",
    },
    {
      title: "Hadis",
      subtitle: "Kumpulan Hadis-Hadis Shohih",
      icon: "/icon-hadist.png",
      href: "/hadis",
    },
    {
      title: "Wudhu",
      subtitle: "Tatacara bersuci dengan benar",
      icon: "/icon-wudhu.png",
      href: "/wudhu",
    },
    {
      title: "Sholat",
      subtitle: "Tatacara sholat dengan benar",
      icon: "/icon-sholat.png",
      href: "/sholat",
    },
    {
      title: "Kitab Fiqih",
      subtitle: "Kumpulan kitab fiqih dasar",
      icon: "/icon-fiqih.png",
      href: "/alquran",
    },
    {
      title: "Jadwal Sholat",
      subtitle: "Waktu sholat berdasarkan lokasi",
      icon: "/icon-jadwalsholat-1.png",
      href: "/jadwal-sholat",
    },
    {
      title: "Tafsir Al-Qur'an",
      subtitle: "Tafsir Al-Qur'an Online",
      icon: "/icon-tafsir.png",
      href: "/tafsir",
    },
    {
      title: "Asmaul Husna",
      subtitle: "99 Nama-Nama Allah SWT",
      icon: "/icon-asmaulhusna2.png",
      href: "/asmaul-husna",
    },
  ];
  return (
    <>
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="grid grid-cols-3 gap-3">
          {data.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className="p-6 flex items-center justify-center rounded-md bg-white border border-gray-200 text-2xl font-semibold transition-all duration-300 hover:shadow-xl"
            >
              <div>
                <Image
                  src={item.icon}
                  alt="Icon Al-Quran"
                  width={120}
                  height={120}
                  className="mx-auto"
                />
                <div className="text-center">
                  <h3>{item.title}</h3>
                  <p className="text-xs text-slate-400 font-normal">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
