import React from 'react';
import { useState } from 'react';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import FlashcardPreview from '@/components/FlashcardPreview';
import { motion } from 'framer-motion';

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 via-white to-gray-100 font-sans text-gray-900">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="grid grid-cols-1 gap-6 px-10 py-20 lg:grid-cols-3">
        {/* Left Section */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-lg lg:col-span-2">
          {/* Preview flashcards */}
          <section className="dark:white h-100 px-6 py-16 text-center">
            <h2 className="mb-10 text-3xl font-bold text-amber-600">Flashcards</h2>
            <div className="flex flex-wrap justify-center gap-6">
              <FlashcardPreview />
            </div>
          </section>
          <div className="mt-6 flex justify-center gap-4 pb-5">
            <button
              onClick={prevCard}
              className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
            >
              Previous
            </button>
            <button
              onClick={nextCard}
              className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600"
            >
              Next
            </button>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex flex-col gap-6">
          <div className="rounded-3xl bg-green-100 p-6 shadow-md"></div>

          <div className="rounded-3xl bg-gray-900 p-6 text-white shadow-md"></div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
