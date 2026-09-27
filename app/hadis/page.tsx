"use client"
import axios from 'axios'
import React, { useEffect, useState } from 'react'

export default function page() {
  const [hadisData, setHadisData] = useState<any>([])
  const [hadisPage, setHadisPage] = useState(1)
  const [loadingHadis, setLoadingHadis] = useState(true)

  useEffect(() => {
    const getHadis = async () => {
      try {
        const res = await axios.get(`https://api.myquran.com/v3/hadis/enc/explore?page=${hadisPage}&limit=10`)
        console.log(res.data.data)
        setHadisData(res.data.data.hadis)
      } catch (error) {
        console.error("Gagal mengambil data : ", error)
      }finally{
        setLoadingHadis(false)
      }
    }

    getHadis()
  }, [])

  return (
    <div className='min-h-screen w-full flex justify-center items-center'>

      <div className="max-w-7xl mx-auto space-y-3">

        (loadingHadis ? (
          <p>Mengambil data hadis...</p>
        ) : (

 <div className='p-4 rounded-md border border-gray-300 bg-white'>
          <div className="space-x-3">
            <div className='text-xs px-3 py-1 rounded-full bg-yellow-200 inline-block'>
            Sahih
          </div>
          <div className='text-xs px-3 py-1 rounded-full bg-orange-200 inline-block'>
            Diriwayatkan oleh Bukhari
          </div>
          </div>
          <p>عن السَّائب بن يزيد رضي الله عنهما قال: «حُجَّ بي مع رسول الله صلى الله عليه وسلم في حجة الوداع، وأنا ابن سبع سنين».</p>
          <p>"Dari As-Saib bin Zaid -raḍiyallāhu 'anhumā, ia berkata, \"Aku diajak menunaikan haji bersama Rasulullah -ṣallallāhu 'alaihi wa sallam- ketika haji wada' saat aku berusia tujuh tahun"</p>
        </div>
        ))
       
        
      </div>
      


    </div>
  )
}
